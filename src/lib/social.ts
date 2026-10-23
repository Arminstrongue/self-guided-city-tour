/**
 * Rede social da carteira (fase 1): perfil público por @nome, seguir (com pedido quando o perfil é privado),
 * pesquisa de viajantes, bloqueios e denúncias. O email nunca é mostrado a outros viajantes.
 */
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { notify } from "./notify";

export const HANDLE_RE = /^[a-z0-9._]{3,24}$/;
const RESERVED = new Set(["admin", "support", "help", "selfguided", "selfguidedcitytour", "hellotravell", "hellotravel", "voybu", "voybuapp", "official", "staff", "guide", "guides", "wallet", "api"]);
export const validHandle = (h: string) => HANDLE_RE.test(h) && !RESERVED.has(h) && !/^[._]|[._]$|\.\./.test(h);
export const THEMES = ["auto", "light", "dark"] as const;
export const ACCENTS = ["blue", "purple", "green", "orange", "pink", "teal"] as const;

export type PublicProfile = { handle: string; name: string; bio: string; photo: string | null; isPrivate: boolean };
export type Relation = "self" | "none" | "requested" | "following" | "blocked";
const pub = (p: schema.TravellerProfile): PublicProfile => ({ handle: p.handle, name: p.name, bio: p.bio, photo: p.photo, isPrivate: p.isPrivate });

export async function myProfile(email: string) {
  const d = await db();
  const [p] = await d.select().from(schema.travellerProfiles).where(eq(schema.travellerProfiles.email, email)).limit(1);
  return p ?? null;
}
export async function profileByHandle(handle: string) {
  const d = await db();
  const [p] = await d.select().from(schema.travellerProfiles).where(eq(schema.travellerProfiles.handle, handle.toLowerCase())).limit(1);
  return p ?? null;
}
export async function handleTaken(handle: string, exceptEmail?: string) {
  const p = await profileByHandle(handle);
  return Boolean(p && p.email !== exceptEmail);
}

export async function saveProfile(email: string, v: { handle: string; name: string; bio: string; photo: string | null; isPrivate: boolean; theme?: string; accent?: string; cities?: string[]; lessOf?: string[] }) {
  const d = await db();
  const set = { ...v, updatedAt: new Date() };
  const isNew = !(await myProfile(email));
  await d.insert(schema.travellerProfiles).values({ email, ...v }).onConflictDoUpdate({ target: schema.travellerProfiles.email, set });
  if (isNew) await (await import("./official")).followOfficial(email).catch(() => null);
  // Ao passar a público, os pedidos pendentes ficam aceites.
  if (!v.isPrivate) await d.update(schema.follows).set({ status: "accepted" }).where(and(eq(schema.follows.followee, email), eq(schema.follows.status, "pending")));
}
export async function savePrefsOnly(email: string, v: Partial<{ theme: string; accent: string; cities: string[]; lessOf: string[] }>) {
  const d = await db();
  await d.update(schema.travellerProfiles).set({ ...v, updatedAt: new Date() }).where(eq(schema.travellerProfiles.email, email));
}
export async function deleteProfile(email: string) {
  const d = await db();
  await (await import("./posts")).purgeUser(email);
  await (await import("./chat")).purgeChats(email);
  await (await import("./notify")).purgeNotifs(email);
  await d.delete(schema.follows).where(or(eq(schema.follows.follower, email), eq(schema.follows.followee, email)));
  await d.delete(schema.travellerProfiles).where(eq(schema.travellerProfiles.email, email));
}

export async function isBlocked(a: string, b: string) {
  const d = await db();
  const r = await d.select({ x: schema.blocks.blocker }).from(schema.blocks)
    .where(or(and(eq(schema.blocks.blocker, a), eq(schema.blocks.blocked, b)), and(eq(schema.blocks.blocker, b), eq(schema.blocks.blocked, a)))).limit(1);
  return r.length > 0;
}

export async function relation(me: string | null, other: string): Promise<Relation> {
  if (!me) return "none";
  if (me === other) return "self";
  if (await isBlocked(me, other)) return "blocked";
  const d = await db();
  const [f] = await d.select().from(schema.follows).where(and(eq(schema.follows.follower, me), eq(schema.follows.followee, other))).limit(1);
  return !f ? "none" : f.status === "accepted" ? "following" : "requested";
}

export async function counts(email: string) {
  const d = await db();
  const [r] = await d.select({
    followers: sql<number>`count(*) filter (where ${schema.follows.followee} = ${email} and ${schema.follows.status} = 'accepted')::int`,
    following: sql<number>`count(*) filter (where ${schema.follows.follower} = ${email} and ${schema.follows.status} = 'accepted')::int`,
    requests: sql<number>`count(*) filter (where ${schema.follows.followee} = ${email} and ${schema.follows.status} = 'pending')::int`
  }).from(schema.follows).where(or(eq(schema.follows.followee, email), eq(schema.follows.follower, email)));
  return { followers: r?.followers ?? 0, following: r?.following ?? 0, requests: r?.requests ?? 0 };
}

/** Perfil visto por outra pessoa: o conteúdo (cidades visitadas) só aparece a seguidores aceites ou se o perfil for público. */
export async function viewProfile(me: string | null, handle: string) {
  const p = await profileByHandle(handle);
  if (!p) return null;
  const rel = await relation(me, p.email);
  if (rel === "blocked") return null;
  const c = await counts(p.email);
  const canSee = rel === "self" || rel === "following" || !p.isPrivate;
  let visited: { name: string; country: string }[] = [];
  if (canSee) {
    const d = await db();
    const [pr] = await d.select({ v: schema.travellerPrefs.visited }).from(schema.travellerPrefs).where(eq(schema.travellerPrefs.email, p.email)).limit(1);
    visited = (pr?.v ?? []).filter((x) => !x.want).map((x) => ({ name: x.name, country: x.country })).slice(0, 200);
  }
  let followsMe = false;
  if (me && rel !== "self") {
    const d = await db();
    followsMe = (await d.select({ x: schema.follows.follower }).from(schema.follows).where(and(eq(schema.follows.follower, p.email), eq(schema.follows.followee, me), eq(schema.follows.status, "accepted"))).limit(1)).length > 0;
  }
  return { profile: pub(p), relation: rel, followers: c.followers, following: c.following, canSee, visited, cities: canSee ? p.cities : [], canMessage: rel === "following" || followsMe };
}

export async function follow(me: string, handle: string) {
  const p = await profileByHandle(handle);
  if (!p || p.email === me || (await isBlocked(me, p.email))) return null;
  if (!(await myProfile(me))) return "no_profile" as const;
  const d = await db();
  const status = p.isPrivate ? "pending" : "accepted";
  const ins = await d.insert(schema.follows).values({ follower: me, followee: p.email, status }).onConflictDoNothing().returning({ f: schema.follows.follower });
  if (ins.length) await notify(p.email, me, status === "pending" ? "request" : "follow").catch(() => null);
  return status;
}
export async function unfollow(me: string, handle: string) {
  const p = await profileByHandle(handle);
  if (!p) return;
  const d = await db();
  await d.delete(schema.follows).where(and(eq(schema.follows.follower, me), eq(schema.follows.followee, p.email)));
}
/** Aceitar/recusar um pedido, ou remover um seguidor. */
export async function answerRequest(me: string, handle: string, accept: boolean) {
  const p = await profileByHandle(handle);
  if (!p) return;
  const d = await db();
  const where = and(eq(schema.follows.follower, p.email), eq(schema.follows.followee, me));
  const reqNotif = and(eq(schema.notifications.email, me), eq(schema.notifications.actor, p.email), eq(schema.notifications.type, "request"));
  if (accept) {
    const up = await d.update(schema.follows).set({ status: "accepted" }).where(and(where, eq(schema.follows.status, "pending"))).returning({ f: schema.follows.follower });
    if (up.length) await notify(p.email, me, "accepted").catch(() => null);
    // O pedido passa a "começou a seguir-te" (deixa de pedir "Aceitar").
    await d.update(schema.notifications).set({ type: "follow" }).where(reqNotif);
  } else {
    await d.delete(schema.follows).where(where);
    await d.delete(schema.notifications).where(reqNotif);
  }
}

async function profilesFor(emails: string[]) {
  if (!emails.length) return [];
  const d = await db();
  return (await d.select().from(schema.travellerProfiles).where(inArray(schema.travellerProfiles.email, emails))).map(pub);
}
export async function lists(me: string) {
  const d = await db();
  const rows = await d.select().from(schema.follows).where(or(eq(schema.follows.follower, me), eq(schema.follows.followee, me))).orderBy(desc(schema.follows.createdAt)).limit(500);
  const pick = (f: (r: typeof rows[number]) => boolean, k: "follower" | "followee") => rows.filter(f).map((r) => r[k]);
  const [followers, following, requests] = await Promise.all([
    profilesFor(pick((r) => r.followee === me && r.status === "accepted", "follower")),
    profilesFor(pick((r) => r.follower === me && r.status === "accepted", "followee")),
    profilesFor(pick((r) => r.followee === me && r.status === "pending", "follower"))
  ]);
  return { followers, following, requests };
}

/** Pesquisa por @nome ou nome; sem perfis bloqueados. Sugestões: viajantes que seguem as mesmas cidades. */
export async function search(me: string | null, q: string, myCities: string[] = []) {
  const d = await db();
  const term = q.trim().replace(/^@/, "").toLowerCase().replace(/[%_\\]/g, "");
  const blocked = me ? (await d.select().from(schema.blocks).where(or(eq(schema.blocks.blocker, me), eq(schema.blocks.blocked, me)))).map((b) => (b.blocker === me ? b.blocked : b.blocker)) : [];
  let rows: schema.TravellerProfile[];
  if (term.length >= 2) {
    rows = await d.select().from(schema.travellerProfiles)
      .where(or(ilike(schema.travellerProfiles.handle, `${term}%`), ilike(schema.travellerProfiles.name, `%${term}%`))).limit(30);
  } else {
    rows = await d.select().from(schema.travellerProfiles).orderBy(desc(schema.travellerProfiles.updatedAt)).limit(60);
    if (myCities.length) rows.sort((a, b) => b.cities.filter((c) => myCities.includes(c)).length - a.cities.filter((c) => myCities.includes(c)).length);
  }
  rows = rows.filter((r) => r.email !== me && !blocked.includes(r.email));
  // Sugestões: a conta oficial primeiro.
  if (term.length < 2) rows.sort((a, b) => Number(b.handle === "voybu") - Number(a.handle === "voybu"));
  rows = rows.slice(0, 20);
  const rels = me ? await d.select().from(schema.follows).where(and(eq(schema.follows.follower, me), inArray(schema.follows.followee, rows.map((r) => r.email).concat("~")))) : [];
  return rows.map((r) => {
    const f = rels.find((x) => x.followee === r.email);
    return { ...pub(r), relation: (!f ? "none" : f.status === "accepted" ? "following" : "requested") as Relation, shared: r.cities.filter((c) => myCities.includes(c)).length };
  });
}

export async function block(me: string, handle: string) {
  const p = await profileByHandle(handle);
  if (!p || p.email === me) return;
  const d = await db();
  await d.insert(schema.blocks).values({ blocker: me, blocked: p.email }).onConflictDoNothing();
  await d.delete(schema.follows).where(or(and(eq(schema.follows.follower, me), eq(schema.follows.followee, p.email)), and(eq(schema.follows.follower, p.email), eq(schema.follows.followee, me))));
}
export async function unblock(me: string, handle: string) {
  const p = await profileByHandle(handle);
  if (!p) return;
  const d = await db();
  await d.delete(schema.blocks).where(and(eq(schema.blocks.blocker, me), eq(schema.blocks.blocked, p.email)));
}
export async function report(me: string, handle: string, reason: string, note: string) {
  const p = await profileByHandle(handle);
  if (!p) return;
  const d = await db();
  await d.insert(schema.reports).values({ reporter: me, target: p.email, reason, note });
}
