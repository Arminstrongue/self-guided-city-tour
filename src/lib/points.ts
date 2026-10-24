/**
 * Pontos e níveis: quem visita mais cidades e lugares sobe no ranking e ganha prémios.
 * Os pontos calculam-se a partir do que já existe (check-ins, memórias, passes, publicações, comentários, convites),
 * por isso não há "saldo" que se possa adulterar. Cidades só declaradas à mão valem menos e não contam para prémios.
 */
import { createHash } from "node:crypto";
import { and, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";
import { db, schema } from "./db";
import type { PgColumn } from "drizzle-orm/pg-core";
import { COUNTRY, cityName } from "@/data/cities";
import { LOCALES } from "@/i18n/core";
import { loadCities } from "./content";

export const PTS = { city: 100, declaredCity: 25, country: 50, stop: 10, gps: 10, postDay: 5, commentDay: 3, friendJoined: 20, friendPaid: 50, journey: 15, km: 2 } as const;
export const DECLARED_CAP = 20;
export const LEVEL_AT = [0, 200, 600, 1500, 3000, 6000, 12000] as const;
/** Prémios por marcos de pontos (crédito descontado automaticamente no passe seguinte). */
export const REWARDS = [{ at: 1000, cents: 100 }, { at: 2500, cents: 200 }, { at: 5000, cents: 300 }, { at: 10000, cents: 500 }] as const;

export type BadgeId = "first-city" | "cities-5" | "cities-10" | "all-cities" | "countries-3" | "countries-10" | "stops-10" | "stops-50" | "gps-10" | "storyteller" | "commenter" | "connector" | "ambassador";
export const BADGES: { id: BadgeId; icon: string }[] = [
  { id: "first-city", icon: "📍" }, { id: "cities-5", icon: "🧭" }, { id: "cities-10", icon: "✈️" }, { id: "all-cities", icon: "👑" },
  { id: "countries-3", icon: "🗺️" }, { id: "countries-10", icon: "🌍" }, { id: "stops-10", icon: "👣" }, { id: "stops-50", icon: "🏛️" },
  { id: "gps-10", icon: "📡" }, { id: "storyteller", icon: "📸" }, { id: "commenter", icon: "💬" }, { id: "connector", icon: "🤝" }, { id: "ambassador", icon: "🎁" }
];

type Raw = { cities: Set<string>; declared: Map<string, string>; stops: number; gps: number; postDays: number; commentDays: number; joined: number; paid: number; journeys: number; km: number; steps: number };
const blank = (): Raw => ({ cities: new Set(), declared: new Map(), stops: 0, gps: 0, postDays: 0, commentDays: 0, joined: 0, paid: 0, journeys: 0, km: 0, steps: 0 });

/** Junta tudo o que conta, para um conjunto de pessoas (ou todas). `since` = só o que aconteceu desde essa data (ranking do mês). */
async function gather(emails: string[] | null, since?: Date): Promise<Map<string, Raw>> {
  const d = await db();
  const m = new Map<string, Raw>();
  const get = (e: string) => { let r = m.get(e); if (!r) { r = blank(); m.set(e, r); } return r; };
  const who = (col: PgColumn) => (emails ? inArray(col, emails.length ? emails : ["~"]) : undefined);
  const after = (col: PgColumn) => (since ? gte(col, since) : undefined);

  const [chk, mem, acc, posts, coms, inv, paid, jr] = await Promise.all([
    d.select({ e: schema.checkins.email, city: schema.checkins.city, stop: schema.checkins.stop, v: schema.checkins.verified }).from(schema.checkins).where(and(who(schema.checkins.email), after(schema.checkins.createdAt))),
    d.selectDistinct({ e: schema.travellerMemories.email, city: schema.travellerMemories.city }).from(schema.travellerMemories).where(and(who(schema.travellerMemories.email), after(schema.travellerMemories.takenAt))),
    d.selectDistinct({ e: schema.accesses.email, city: schema.accesses.city }).from(schema.accesses).where(and(who(schema.accesses.email), isNotNull(schema.accesses.city), after(schema.accesses.createdAt))),
    d.select({ e: schema.posts.author, n: sql<number>`count(distinct date(${schema.posts.createdAt}))::int` }).from(schema.posts).where(and(who(schema.posts.author), eq(schema.posts.kind, "post"), after(schema.posts.createdAt))).groupBy(schema.posts.author),
    d.select({ e: schema.placeComments.author, n: sql<number>`count(distinct date(${schema.placeComments.createdAt}))::int` }).from(schema.placeComments).where(and(who(schema.placeComments.author), eq(schema.placeComments.hidden, false), after(schema.placeComments.createdAt))).groupBy(schema.placeComments.author),
    d.select({ e: schema.invites.inviter, n: sql<number>`count(*)::int` }).from(schema.invites).where(and(who(schema.invites.inviter), isNotNull(schema.invites.joinedAt), since ? gte(schema.invites.joinedAt, since) : undefined)).groupBy(schema.invites.inviter),
    d.select({ e: schema.referralCredits.email, n: sql<number>`count(*)::int` }).from(schema.referralCredits).where(and(who(schema.referralCredits.email), eq(schema.referralCredits.kind, "earned"), after(schema.referralCredits.createdAt))).groupBy(schema.referralCredits.email),
    d.select({ e: schema.journeys.email, city: schema.journeys.city, km: schema.journeys.km, steps: schema.journeys.steps }).from(schema.journeys).where(and(who(schema.journeys.email), after(schema.journeys.createdAt)))
  ]);
  for (const j of jr) { const r = get(j.e); r.journeys++; r.km += j.km; r.steps += j.steps; if (j.city) r.cities.add(j.city); }
  for (const c of chk) { const r = get(c.e); r.cities.add(c.city); if (c.stop) { r.stops++; if (c.v) r.gps++; } }
  for (const x of mem) get(x.e).cities.add(x.city);
  for (const x of acc) if (x.city) get(x.e).cities.add(x.city);
  for (const x of posts) get(x.e).postDays = x.n;
  for (const x of coms) get(x.e).commentDays = x.n;
  for (const x of inv) get(x.e).joined = x.n;
  for (const x of paid) get(x.e).paid = x.n;
  if (!since) {
    const prefs = await d.select({ e: schema.travellerPrefs.email, v: schema.travellerPrefs.visited }).from(schema.travellerPrefs).where(who(schema.travellerPrefs.email));
    for (const p of prefs) for (const v of p.v ?? []) if (!v.want && v.name) get(p.e).declared.set(v.name.trim().toLowerCase(), v.country ?? "");
  }
  return m;
}

let namesCache: Map<string, string> | null = null; // nome (qualquer língua, minúsculas) → id da cidade
async function cityNames() {
  if (namesCache) return namesCache;
  const m = new Map<string, string>();
  for (const c of await loadCities({ includeInactive: true })) for (const l of LOCALES) m.set(cityName(c, l).toLowerCase(), c.id);
  return (namesCache = m);
}

export type Score = {
  points: number; rewardPoints: number; level: number; nextAt: number | null; levelAt: number;
  cities: number; countries: number; stops: number; gps: number; badges: BadgeId[]; progress: Record<BadgeId, [number, number]>;
  breakdown: { k: "cities" | "declared" | "countries" | "stops" | "gps" | "posts" | "comments" | "friends" | "paid" | "journeys" | "km"; n: number; pts: number }[];
  km: number; steps: number;
};

export async function scoreOf(r: Raw, totalCities: number): Promise<Score> {
  const names = await cityNames();
  // Uma cidade declarada à mão que já está confirmada (passe, check-in, memória) não conta duas vezes.
  const declared = [...r.declared.entries()].filter(([n]) => { const id = names.get(n); return !id || !r.cities.has(id); });
  const countries = new Set<string>([...r.cities].map((c) => COUNTRY[c] ?? "").filter(Boolean));
  for (const [, cc] of declared) if (cc) countries.add(cc.toUpperCase());
  const decl = Math.min(declared.length, DECLARED_CAP);
  const breakdown: Score["breakdown"] = [
    { k: "cities", n: r.cities.size, pts: r.cities.size * PTS.city },
    { k: "declared", n: decl, pts: decl * PTS.declaredCity },
    { k: "countries", n: countries.size, pts: countries.size * PTS.country },
    { k: "stops", n: r.stops, pts: r.stops * PTS.stop },
    { k: "gps", n: r.gps, pts: r.gps * PTS.gps },
    { k: "posts", n: r.postDays, pts: r.postDays * PTS.postDay },
    { k: "comments", n: r.commentDays, pts: r.commentDays * PTS.commentDay },
    { k: "friends", n: r.joined, pts: r.joined * PTS.friendJoined },
    { k: "paid", n: r.paid, pts: r.paid * PTS.friendPaid },
    { k: "journeys", n: r.journeys, pts: r.journeys * PTS.journey },
    { k: "km", n: Math.floor(r.km), pts: Math.floor(r.km) * PTS.km }
  ];
  const points = breakdown.reduce((a, b) => a + b.pts, 0);
  const rewardPoints = points - breakdown[1].pts;
  const level = LEVEL_AT.filter((n) => points >= n).length - 1;
  const allCities = r.cities.size + decl;
  const b: BadgeId[] = [];
  if (allCities >= 1) b.push("first-city");
  if (allCities >= 5) b.push("cities-5");
  if (allCities >= 10) b.push("cities-10");
  if (totalCities > 0 && r.cities.size >= totalCities) b.push("all-cities");
  if (countries.size >= 3) b.push("countries-3");
  if (countries.size >= 10) b.push("countries-10");
  if (r.stops >= 10) b.push("stops-10");
  if (r.stops >= 50) b.push("stops-50");
  if (r.gps >= 10) b.push("gps-10");
  if (r.postDays >= 10) b.push("storyteller");
  if (r.commentDays >= 10) b.push("commenter");
  if (r.joined >= 3) b.push("connector");
  if (r.paid >= 1) b.push("ambassador");
  // Progresso de cada medalha (atual / meta) para mostrar quanto falta.
  const progress: Record<BadgeId, [number, number]> = {
    "first-city": [allCities, 1], "cities-5": [allCities, 5], "cities-10": [allCities, 10], "all-cities": [r.cities.size, Math.max(1, totalCities)],
    "countries-3": [countries.size, 3], "countries-10": [countries.size, 10], "stops-10": [r.stops, 10], "stops-50": [r.stops, 50],
    "gps-10": [r.gps, 10], storyteller: [r.postDays, 10], commenter: [r.commentDays, 10], connector: [r.joined, 3], ambassador: [r.paid, 1]
  };
  return { points, rewardPoints, level, levelAt: LEVEL_AT[level], nextAt: LEVEL_AT[level + 1] ?? null, cities: allCities, countries: countries.size, stops: r.stops, gps: r.gps, badges: b, breakdown, progress, km: Math.round(r.km * 10) / 10, steps: r.steps };
}

const totalCities = async () => (await loadCities()).length;

export async function myScore(email: string) {
  const raw = (await gather([email])).get(email) ?? blank();
  const s = await scoreOf(raw, await totalCities());
  const claimed = await claimRewards(email, s.rewardPoints);
  return { ...s, rewards: REWARDS.map((r) => ({ ...r, got: s.rewardPoints >= r.at })), newRewards: claimed };
}

const uuidOf = (k: string) => { const h = createHash("sha256").update(k).digest("hex"); return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`; };
/** Dá o crédito dos marcos atingidos (uma vez por marco). Devolve os novos. */
export async function claimRewards(email: string, rewardPoints: number) {
  const d = await db();
  const out: number[] = [];
  for (const r of REWARDS) {
    if (rewardPoints < r.at) continue;
    const ins = await d.insert(schema.referralCredits).values({ email, amountCents: r.cents, kind: "reward", accessId: uuidOf(`reward:${email}:${r.at}`) }).onConflictDoNothing().returning({ id: schema.referralCredits.id });
    if (ins.length) out.push(r.cents);
  }
  return out;
}

/** Check-in numa cidade ou paragem. verified quando o GPS mostra que a pessoa está a menos de 400 m. */
export async function checkIn(email: string, city: string, stop: string, pos?: { lat: number; lng: number } | null) {
  const c = (await loadCities()).find((x) => x.id === city);
  if (!c) return { error: "unknown" as const };
  const s = stop ? c.stops.find((x) => x.id === stop) : null;
  if (stop && !s) return { error: "unknown" as const };
  const near = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371e3, r = Math.PI / 180, dl = (b.lat - a.lat) * r, dg = (b.lng - a.lng) * r;
    const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dg / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  const verified = Boolean(pos && (s ? near(pos, s) < 400 : c.stops.some((x) => near(pos, x) < 3000)));
  const d = await db();
  const ins = await d.insert(schema.checkins).values({ email, city, stop, verified }).onConflictDoNothing().returning({ id: schema.checkins.id });
  if (!ins.length && verified) await d.update(schema.checkins).set({ verified: true }).where(and(eq(schema.checkins.email, email), eq(schema.checkins.city, city), eq(schema.checkins.stop, stop)));
  return { ok: true as const, isNew: ins.length > 0, verified, pts: ins.length ? (stop ? PTS.stop : 0) + (verified && stop ? PTS.gps : 0) : 0 };
}
export async function undoCheckIn(email: string, city: string, stop: string) {
  const d = await db();
  await d.delete(schema.checkins).where(and(eq(schema.checkins.email, email), eq(schema.checkins.city, city), eq(schema.checkins.stop, stop)));
}
export async function myCheckins(email: string, city: string) {
  const d = await db();
  return (await d.select({ stop: schema.checkins.stop, v: schema.checkins.verified }).from(schema.checkins).where(and(eq(schema.checkins.email, email), eq(schema.checkins.city, city))));
}

/* ---------- Ranking ---------- */
type Row = { handle: string; name: string; photo: string | null; points: number; cities: number; countries: number; level: number; me: boolean };
const lbCache = new Map<string, { at: number; rows: (Row & { email: string })[] }>();

async function rowsFor(emails: string[] | null, since?: Date) {
  const d = await db();
  const raw = await gather(emails, since);
  const profs = await d.select({ email: schema.travellerProfiles.email, handle: schema.travellerProfiles.handle, name: schema.travellerProfiles.name, photo: schema.travellerProfiles.photo, isPrivate: schema.travellerProfiles.isPrivate })
    .from(schema.travellerProfiles).where(emails ? inArray(schema.travellerProfiles.email, emails.length ? emails : ["~"]) : undefined);
  const total = await totalCities();
  const rows: (Row & { email: string; isPrivate: boolean })[] = [];
  for (const p of profs) {
    const s = await scoreOf(raw.get(p.email) ?? blank(), total);
    if (s.points <= 0) continue;
    rows.push({ email: p.email, handle: p.handle, name: p.name, photo: p.photo, points: s.points, cities: s.cities, countries: s.countries, level: s.level, me: false, isPrivate: p.isPrivate });
  }
  return rows.sort((a, b) => b.points - a.points || b.cities - a.cities || a.handle.localeCompare(b.handle));
}

export async function leaderboard(me: string, scope: "global" | "friends", period: "all" | "month") {
  const since = period === "month" ? new Date(new Date().getFullYear(), new Date().getMonth(), 1) : undefined;
  let rows: (Row & { email: string; isPrivate?: boolean })[];
  if (scope === "friends") {
    const d = await db();
    const f = await d.select({ e: schema.follows.followee }).from(schema.follows).where(and(eq(schema.follows.follower, me), eq(schema.follows.status, "accepted")));
    rows = await rowsFor([me, ...f.map((x) => x.e)], since);
  } else {
    const key = `global:${period}`;
    const hit = lbCache.get(key);
    if (hit && Date.now() - hit.at < 5 * 60_000) rows = hit.rows;
    else { rows = (await rowsFor(null, since)); lbCache.set(key, { at: Date.now(), rows }); }
    // Perfis privados não aparecem no ranking global (só o próprio vê a sua posição).
    rows = rows.filter((r) => !r.isPrivate || r.email === me);
  }
  const rank = rows.findIndex((r) => r.email === me);
  const strip = (r: Row & { email: string }, i: number) => ({ rank: i + 1, handle: r.handle, name: r.name, photo: r.photo, points: r.points, cities: r.cities, countries: r.countries, level: r.level, me: r.email === me });
  const top = rows.slice(0, 30).map(strip);
  return { top, mine: rank >= 30 ? strip(rows[rank], rank) : null, total: rows.length };
}

/** RGPD: ao apagar a conta. */
export async function purgePoints(email: string) {
  const d = await db();
  await d.delete(schema.checkins).where(eq(schema.checkins.email, email));
  await d.delete(schema.journeys).where(eq(schema.journeys.email, email));
  await d.delete(schema.placeComments).where(eq(schema.placeComments.author, email));
}
