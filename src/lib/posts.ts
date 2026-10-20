/**
 * Rede social da carteira (fase 2): publicações com foto, histórias de 24 h, gostos, comentários e feeds por cidade.
 * Regras de privacidade:
 *  - só viajantes com sessão iniciada veem conteúdo;
 *  - perfil privado → só seguidores aceites veem as publicações e histórias;
 *  - bloqueios escondem tudo nos dois sentidos;
 *  - só comenta quem segue o autor ou é seguido por ele (e o próprio autor).
 */
import { and, desc, eq, gt, inArray, isNull, lt, lte, or, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { myProfile, type PublicProfile } from "./social";
import { dropPostNotifs, notify } from "./notify";
import { OFFICIAL_EMAIL } from "./official";
import { moderate } from "./moderation";

export const STORY_HOURS = 24;
export const PAGE = 12;
export const MAX_ACTIVE_STORIES = 10;
export const STORY_BGS = ["sunset", "ocean", "forest", "night", "rose", "sand"] as const;

export type PostItem = {
  id: string; kind: "post" | "story"; handle: string; text: string; photo: boolean; city: string | null; tag: string | null; bg: string | null;
  at: string; expiresAt: string | null; likes: number; liked: boolean; comments: number; mine: boolean; canComment: boolean;
  video: "processing" | "ready" | "failed" | null; duration: number | null;
  photos: number; saved: boolean;
};
export type FeedPage = { posts: PostItem[]; authors: Record<string, PublicProfile>; next: string | null };

/** Colunas leves para os feeds: sem as fotos (vêm por URL), só se existem e quantas. */
const P = schema.posts;
const LITE = {
  id: P.id, author: P.author, kind: P.kind, text: P.text, city: P.city, tag: P.tag, bg: P.bg, createdAt: P.createdAt, expiresAt: P.expiresAt,
  video: P.video, videoStatus: P.videoStatus, duration: P.duration,
  photo: sql<string | null>`case when ${P.photo} is null then null else '1' end`,
  nExtra: sql<number>`coalesce(jsonb_array_length(${P.extra}), 0)::int`
};
type Lite = { id: string; author: string; kind: "post" | "story"; text: string; city: string | null; tag: string | null; bg: string | null; createdAt: Date; expiresAt: Date | null; video: string | null; videoStatus: "processing" | "ready" | "failed" | null; duration: number | null; photo: string | null; nExtra: number };
const lite = (p: schema.Post): Lite => ({ ...p, photo: p.photo ? "1" : null, nExtra: p.extra?.length ?? 0 });

const pub = (p: schema.TravellerProfile): PublicProfile => ({ handle: p.handle, name: p.name, bio: p.bio, photo: p.photo, isPrivate: p.isPrivate });

/** Quem sigo, quem me segue e quem está bloqueado (nos dois sentidos). */
async function circle(me: string) {
  const d = await db();
  const [f, b] = await Promise.all([
    d.select().from(schema.follows).where(and(or(eq(schema.follows.follower, me), eq(schema.follows.followee, me)), eq(schema.follows.status, "accepted"))),
    d.select().from(schema.blocks).where(or(eq(schema.blocks.blocker, me), eq(schema.blocks.blocked, me)))
  ]);
  return {
    following: new Set(f.filter((x) => x.follower === me).map((x) => x.followee)),
    followers: new Set(f.filter((x) => x.followee === me).map((x) => x.follower)),
    blocked: new Set(b.map((x) => (x.blocker === me ? x.blocked : x.blocker)))
  };
}
type Circle = Awaited<ReturnType<typeof circle>>;
const canSee = (me: string, author: schema.TravellerProfile, c: Circle) =>
  !c.blocked.has(author.email) && (author.email === me || !author.isPrivate || c.following.has(author.email));
const canComment = (me: string, author: string, c: Circle) =>
  !c.blocked.has(author) && (author === me || c.following.has(author) || c.followers.has(author));

/** Junta autores, gostos e comentários a uma lista de publicações. */
async function hydrate(me: string, rows: Lite[], c: Circle, more = false): Promise<FeedPage> {
  const d = await db();
  const ids = rows.map((r) => r.id);
  const emails = [...new Set(rows.map((r) => r.author))];
  const [profs, likes, mineL, coms, savedL] = ids.length ? await Promise.all([
    d.select().from(schema.travellerProfiles).where(inArray(schema.travellerProfiles.email, emails)),
    d.select({ id: schema.postLikes.postId, n: sql<number>`count(*)::int` }).from(schema.postLikes).where(inArray(schema.postLikes.postId, ids)).groupBy(schema.postLikes.postId),
    d.select({ id: schema.postLikes.postId }).from(schema.postLikes).where(and(inArray(schema.postLikes.postId, ids), eq(schema.postLikes.email, me))),
    d.select({ id: schema.postComments.postId, n: sql<number>`count(*)::int` }).from(schema.postComments).where(inArray(schema.postComments.postId, ids)).groupBy(schema.postComments.postId),
    d.select({ id: schema.postSaves.postId }).from(schema.postSaves).where(and(inArray(schema.postSaves.postId, ids), eq(schema.postSaves.email, me)))
  ]) : [[], [], [], [], []];
  const byEmail = new Map(profs.map((p) => [p.email, p]));
  // Publicações com 3+ denúncias abertas ficam escondidas (exceto ao autor) até a equipa rever.
  const flagged = ids.length ? new Set((await d.select({ id: schema.reports.postId, n: sql<number>`count(*)::int` }).from(schema.reports)
    .where(and(inArray(schema.reports.postId, ids), eq(schema.reports.status, "open"))).groupBy(schema.reports.postId)).filter((r) => r.n >= 3).map((r) => r.id)) : new Set<string | null>();
  const authors: Record<string, PublicProfile> = {};
  const posts: PostItem[] = [];
  for (const r of rows) {
    const a = byEmail.get(r.author);
    if (!a || (flagged.has(r.id) && r.author !== me)) continue;
    authors[a.handle] = pub(a);
    posts.push({
      id: r.id, kind: r.kind, handle: a.handle, text: r.text, photo: Boolean(r.photo), city: r.city, tag: r.tag, bg: r.bg,
      at: r.createdAt.toISOString(), expiresAt: r.expiresAt?.toISOString() ?? null,
      likes: likes.find((x) => x.id === r.id)?.n ?? 0, liked: mineL.some((x) => x.id === r.id), comments: coms.find((x) => x.id === r.id)?.n ?? 0,
      mine: r.author === me, canComment: canComment(me, r.author, c),
      video: r.video ? (r.videoStatus ?? "processing") : null, duration: r.duration ?? null,
      photos: (r.photo ? 1 : 0) + (r.nExtra ?? 0), saved: savedL.some((x) => x.id === r.id)
    });
  }
  return { posts, authors, next: more && rows.length ? rows[rows.length - 1].createdAt.toISOString() : null };
}

/** Apaga histórias expiradas (e os respetivos gostos e comentários). */
export async function purgeExpired() {
  const d = await db();
  const old = await d.select({ id: schema.posts.id }).from(schema.posts).where(lte(schema.posts.expiresAt, new Date())).limit(500);
  if (!old.length) return 0;
  const ids = old.map((o) => o.id);
  await d.delete(schema.postLikes).where(inArray(schema.postLikes.postId, ids));
  await d.delete(schema.postComments).where(inArray(schema.postComments.postId, ids));
  await d.delete(schema.posts).where(inArray(schema.posts.id, ids));
  return ids.length;
}

export type NewPost = { kind: "post" | "story"; text: string; photo: string | null; extra?: string[]; city: string | null; tag: string | null; bg: string | null };
export async function createPost(me: string, v: NewPost) {
  if (!(await myProfile(me))) return { error: "no_profile" as const };
  const mod = moderate(v.text);
  if (!mod.ok) return { error: "offensive" as const };
  v = { ...v, text: mod.text };
  if (!v.photo && !v.text.trim()) return { error: "empty" as const };
  const d = await db();
  await purgeExpired();
  if (v.kind === "story") {
    const [{ n }] = await d.select({ n: sql<number>`count(*)::int` }).from(schema.posts).where(and(eq(schema.posts.author, me), eq(schema.posts.kind, "story")));
    if (n >= MAX_ACTIVE_STORIES) return { error: "too_many" as const };
  }
  const expiresAt = v.kind === "story" ? new Date(Date.now() + STORY_HOURS * 3600_000) : null;
  const extra = v.kind === "post" && v.photo && v.extra?.length ? v.extra.slice(0, 5) : null;
  const [r] = await d.insert(schema.posts).values({ author: me, kind: v.kind, text: v.text.trim(), photo: v.photo, extra, city: v.city, tag: v.tag, bg: v.kind === "story" ? v.bg : null, expiresAt }).returning({ id: schema.posts.id });
  await notifyMentions(me, r.id, v.text).catch(() => null);
  return { id: r.id };
}

/** Vídeos ainda em conversão (ou falhados) só aparecem ao autor. */
const videoOk = (me: string) => or(isNull(schema.posts.video), eq(schema.posts.videoStatus, "ready"), eq(schema.posts.author, me));
const before = (b?: string | null) => (b && !Number.isNaN(Date.parse(b)) ? lt(schema.posts.createdAt, new Date(b)) : undefined);

/** Feed "A seguir": as minhas publicações e as de quem sigo, das mais recentes para as mais antigas. */
export async function feedFollowing(me: string, cursor?: string | null): Promise<FeedPage> {
  const c = await circle(me);
  // A conta oficial entra sempre no feed (dicas das cidades), para ninguém ver o feed vazio.
  const authors = [...new Set([me, ...c.following, OFFICIAL_EMAIL])].filter((e) => !c.blocked.has(e));
  const d = await db();
  const rows = await d.select(LITE).from(schema.posts)
    .where(and(eq(schema.posts.kind, "post"), inArray(schema.posts.author, authors), videoOk(me), before(cursor)))
    .orderBy(desc(schema.posts.createdAt)).limit(PAGE + 1);
  return hydrate(me, rows.slice(0, PAGE), c, rows.length > PAGE);
}

/**
 * Feed de uma cidade: publicações de perfis públicos e de quem sigo nessa cidade.
 * O algoritmo do viajante esconde os interesses marcados como "ver menos" (exceto de quem segue).
 */
export async function feedCity(me: string, city: string, cursor?: string | null): Promise<FeedPage> {
  const c = await circle(me);
  const prof = await myProfile(me);
  const less = new Set(prof?.lessOf ?? []);
  const d = await db();
  const visible = or(eq(schema.travellerProfiles.isPrivate, false), inArray(schema.posts.author, [me, ...c.following]));
  const rows: Lite[] = await d.select(LITE).from(schema.posts)
    .innerJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.posts.author))
    .where(and(eq(schema.posts.kind, "post"), eq(schema.posts.city, city), visible, videoOk(me), before(cursor)))
    .orderBy(desc(schema.posts.createdAt)).limit(PAGE * 2 + 1);
  const all = rows.slice(0, PAGE * 2);
  const ok = (r: Lite) => !c.blocked.has(r.author) && !(r.tag && less.has(r.tag) && r.author !== me && !c.following.has(r.author));
  const page: Lite[] = [];
  let scanned = 0;
  for (const r of all) { scanned++; if (ok(r)) { page.push(r); if (page.length === PAGE) break; } }
  const out = await hydrate(me, page, c, false);
  const hasMore = scanned < all.length || rows.length > PAGE * 2;
  // O cursor é a última linha lida (mesmo escondida), para não repetir nem saltar publicações.
  return { ...out, next: hasMore && scanned ? all[scanned - 1].createdAt.toISOString() : null };
}

/** Publicações de um perfil (grelha), se o puder ver. */
export async function userPosts(me: string, handle: string, cursor?: string | null): Promise<FeedPage | null> {
  const d = await db();
  const [a] = await d.select().from(schema.travellerProfiles).where(eq(schema.travellerProfiles.handle, handle.toLowerCase())).limit(1);
  if (!a) return null;
  const c = await circle(me);
  if (!canSee(me, a, c)) return null;
  const rows = await d.select(LITE).from(schema.posts).where(and(eq(schema.posts.author, a.email), eq(schema.posts.kind, "post"), videoOk(me), before(cursor)))
    .orderBy(desc(schema.posts.createdAt)).limit(PAGE * 2 + 1);
  return hydrate(me, rows.slice(0, PAGE * 2), c, rows.length > PAGE * 2);
}

/** Histórias ativas: as minhas primeiro, depois as de quem sigo (mais recentes primeiro). */
export async function stories(me: string, onlyHandle?: string) {
  const c = await circle(me);
  const d = await db();
  let authors = [me, ...c.following].filter((e) => !c.blocked.has(e));
  if (onlyHandle) {
    const [a] = await d.select().from(schema.travellerProfiles).where(eq(schema.travellerProfiles.handle, onlyHandle.toLowerCase())).limit(1);
    if (!a || !canSee(me, a, c)) return { rings: [], authors: {} };
    authors = [a.email];
  }
  const rows = await d.select(LITE).from(schema.posts)
    .where(and(eq(schema.posts.kind, "story"), inArray(schema.posts.author, authors), gt(schema.posts.expiresAt, new Date())))
    .orderBy(schema.posts.createdAt).limit(300);
  const page = await hydrate(me, rows, c);
  const groups = new Map<string, PostItem[]>();
  for (const p of page.posts) groups.set(p.handle, [...(groups.get(p.handle) ?? []), p]);
  const rings = [...groups.entries()].map(([handle, items]) => ({ handle, items, mine: items[0].mine, last: items[items.length - 1].at }))
    .sort((a, b) => (a.mine !== b.mine ? (a.mine ? -1 : 1) : b.last.localeCompare(a.last)));
  return { rings, authors: page.authors };
}

/** Uma publicação, se o viajante a puder ver (ou null). */
async function visiblePost(me: string, id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const d = await db();
  const [r] = await d.select({ p: schema.posts, a: schema.travellerProfiles }).from(schema.posts)
    .innerJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.posts.author))
    .where(and(eq(schema.posts.id, id), or(isNull(schema.posts.expiresAt), gt(schema.posts.expiresAt, new Date())))).limit(1);
  if (!r) return null;
  const c = await circle(me);
  if (!canSee(me, r.a, c)) return null;
  if (r.p.video && r.p.videoStatus !== "ready" && r.p.author !== me) return null;
  return { post: r.p, author: r.a, circle: c };
}

/** Ficheiro de vídeo de uma publicação, se o viajante a puder ver. */
export async function videoOf(me: string, id: string) {
  const v = await visiblePost(me, id);
  return v?.post.video && v.post.videoStatus === "ready" ? v.post.id : null;
}

/** Nova publicação em vídeo: fica "a processar" até o ffmpeg terminar. */
export async function createVideoPost(me: string, v: { text: string; city: string | null; tag: string | null }) {
  if (!(await myProfile(me))) return { error: "no_profile" as const };
  const mod = moderate(v.text);
  if (!mod.ok) return { error: "offensive" as const };
  v = { ...v, text: mod.text };
  const d = await db();
  const [{ n }] = await d.select({ n: sql<number>`count(*)::int` }).from(schema.posts)
    .where(and(eq(schema.posts.author, me), eq(schema.posts.videoStatus, "processing")));
  if (n >= 3) return { error: "busy" as const };
  const [r] = await d.insert(schema.posts).values({ author: me, kind: "post", text: v.text.trim(), city: v.city, tag: v.tag, video: "pending", videoStatus: "processing" }).returning({ id: schema.posts.id });
  await d.update(schema.posts).set({ video: r.id }).where(eq(schema.posts.id, r.id));
  return { id: r.id };
}

/**
 * Feed de vídeos (estilo TikTok).
 * "following": de quem sigo (e meus). "foryou": públicos + quem sigo, sem os temas "ver menos",
 * com os temas preferidos e os mais gostados primeiro dentro de cada página.
 */
export async function feedVideos(me: string, scope: "foryou" | "following", cursor?: string | null, onlyHandle?: string): Promise<FeedPage> {
  const c = await circle(me);
  const d = await db();
  const prof = await myProfile(me);
  const less = new Set(prof?.lessOf ?? []);
  const [prefs] = await d.select({ h: schema.travellerPrefs.hobbies }).from(schema.travellerPrefs).where(eq(schema.travellerPrefs.email, me)).limit(1);
  const more = new Set(prefs?.h ?? []);
  const conds = [eq(schema.posts.kind, "post"), eq(schema.posts.videoStatus, "ready"), before(cursor)];
  if (onlyHandle) conds.push(eq(schema.travellerProfiles.handle, onlyHandle.toLowerCase()));
  if (scope === "following" || onlyHandle) conds.push(or(inArray(schema.posts.author, [me, ...c.following]), onlyHandle ? eq(schema.travellerProfiles.isPrivate, false) : undefined)!);
  else conds.push(or(eq(schema.travellerProfiles.isPrivate, false), inArray(schema.posts.author, [me, ...c.following]))!);
  const rows: Lite[] = await d.select(LITE).from(schema.posts)
    .innerJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.posts.author))
    .where(and(...conds)).orderBy(desc(schema.posts.createdAt)).limit(PAGE + 1);
  const page = rows.slice(0, PAGE);
  const shown = page.filter((r) => !c.blocked.has(r.author) && !(scope === "foryou" && !onlyHandle && r.tag && less.has(r.tag) && !c.following.has(r.author)));
  const out = await hydrate(me, shown, c);
  if (scope === "foryou" && !onlyHandle) {
    const score = (p: PostItem) => (p.tag && more.has(p.tag) ? 3 : 0) + Math.log2(1 + p.likes) - (Date.now() - Date.parse(p.at)) / 86_400_000 / 3;
    out.posts.sort((a, b) => score(b) - score(a));
  }
  return { ...out, next: rows.length > PAGE ? page[page.length - 1].createdAt.toISOString() : null };
}

export async function getPost(me: string, id: string) {
  const v = await visiblePost(me, id);
  if (!v) return null;
  return hydrate(me, [lite(v.post)], v.circle);
}

export async function photoOf(me: string, id: string, i = 0) {
  const v = await visiblePost(me, id);
  if (!v) return null;
  return i === 0 ? v.post.photo : v.post.extra?.[i - 1] ?? null;
}

/* ---------- @menções e #hashtags ---------- */
export const mentionsIn = (text: string) => [...new Set([...text.matchAll(/(^|[^\w@])@([a-z0-9._]{3,24})/gi)].map((m) => m[2].toLowerCase()))].slice(0, 10);
/** Avisa quem foi mencionado (se puder ver a publicação). */
async function notifyMentions(me: string, postId: string, text: string) {
  const hs = mentionsIn(text);
  if (!hs.length) return;
  const d = await db();
  const ps = await d.select({ email: schema.travellerProfiles.email }).from(schema.travellerProfiles).where(inArray(schema.travellerProfiles.handle, hs));
  for (const p of ps) {
    if (p.email === me) continue;
    if (await visiblePost(p.email, postId)) await notify(p.email, me, "mention", { postId, text });
  }
}
/** Publicações com uma #hashtag (as que o viajante pode ver). */
export async function tagPosts(me: string, tag: string, cursor?: string | null): Promise<FeedPage> {
  const t = tag.toLowerCase().replace(/[^\p{L}\p{N}_]/gu, "").slice(0, 40);
  if (!t) return { posts: [], authors: {}, next: null };
  const c = await circle(me);
  const d = await db();
  const re = new RegExp(`#${t}(?![\\p{L}\\p{N}_])`, "iu");
  const rows: Lite[] = (await d.select(LITE).from(schema.posts)
    .innerJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.posts.author))
    .where(and(eq(schema.posts.kind, "post"), sql`${schema.posts.text} ilike ${`%#${t}%`}`, or(eq(schema.travellerProfiles.isPrivate, false), inArray(schema.posts.author, [me, ...c.following])), videoOk(me), before(cursor)))
    .orderBy(desc(schema.posts.createdAt)).limit(PAGE + 1));
  const page = rows.slice(0, PAGE).filter((r) => re.test(r.text) && !c.blocked.has(r.author));
  const out = await hydrate(me, page, c);
  return { ...out, next: rows.length > PAGE ? rows[PAGE - 1].createdAt.toISOString() : null };
}

/* ---------- Guardados ---------- */
export async function save(me: string, id: string, on: boolean) {
  const v = await visiblePost(me, id);
  if (!v) return null;
  const d = await db();
  if (on) await d.insert(schema.postSaves).values({ postId: id, email: me }).onConflictDoNothing();
  else await d.delete(schema.postSaves).where(and(eq(schema.postSaves.postId, id), eq(schema.postSaves.email, me)));
  return { saved: on };
}
export async function savedPosts(me: string, cursor?: string | null): Promise<FeedPage> {
  const c = await circle(me);
  const d = await db();
  const rows = await d.select({ ...LITE, savedAt: schema.postSaves.createdAt }).from(schema.postSaves)
    .innerJoin(schema.posts, eq(schema.posts.id, schema.postSaves.postId))
    .innerJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.posts.author))
    .where(and(eq(schema.postSaves.email, me), cursor && !Number.isNaN(Date.parse(cursor)) ? lt(schema.postSaves.createdAt, new Date(cursor)) : undefined,
      or(eq(schema.travellerProfiles.isPrivate, false), inArray(schema.posts.author, [me, ...c.following]))))
    .orderBy(desc(schema.postSaves.createdAt)).limit(PAGE * 2 + 1);
  const out = await hydrate(me, rows.slice(0, PAGE * 2).filter((r) => !c.blocked.has(r.author)), c);
  return { ...out, next: rows.length > PAGE * 2 ? rows[PAGE * 2 - 1].savedAt.toISOString() : null };
}

export async function like(me: string, id: string, on: boolean) {
  const v = await visiblePost(me, id);
  if (!v) return null;
  const d = await db();
  if (on) {
    const ins = await d.insert(schema.postLikes).values({ postId: id, email: me }).onConflictDoNothing().returning({ p: schema.postLikes.postId });
    if (ins.length) await notify(v.post.author, me, "like", { postId: id, storyLike: v.post.kind === "story" }).catch(() => null);
  } else {
    await d.delete(schema.postLikes).where(and(eq(schema.postLikes.postId, id), eq(schema.postLikes.email, me)));
    await d.delete(schema.notifications).where(and(eq(schema.notifications.postId, id), eq(schema.notifications.actor, me), eq(schema.notifications.type, "like")));
  }
  const [{ n }] = await d.select({ n: sql<number>`count(*)::int` }).from(schema.postLikes).where(eq(schema.postLikes.postId, id));
  return { likes: n, liked: on };
}

export async function comments(me: string, id: string) {
  const v = await visiblePost(me, id);
  if (!v) return null;
  const d = await db();
  const rows = await d.select({ c: schema.postComments, a: schema.travellerProfiles }).from(schema.postComments)
    .innerJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.postComments.author))
    .where(eq(schema.postComments.postId, id)).orderBy(schema.postComments.createdAt).limit(200);
  return {
    canComment: canComment(me, v.post.author, v.circle),
    comments: rows.filter((r) => !v.circle.blocked.has(r.c.author)).map((r) => ({
      id: r.c.id, text: r.c.text, at: r.c.createdAt.toISOString(), author: pub(r.a),
      canDelete: r.c.author === me || v.post.author === me
    }))
  };
}

export async function addComment(me: string, id: string, text: string) {
  const v = await visiblePost(me, id);
  if (!v) return { error: "not_found" as const };
  if (!(await myProfile(me))) return { error: "no_profile" as const };
  if (!canComment(me, v.post.author, v.circle)) return { error: "not_allowed" as const };
  const mod = moderate(text);
  if (!mod.ok) return { error: "offensive" as const };
  text = mod.text;
  const d = await db();
  const [r] = await d.insert(schema.postComments).values({ postId: id, author: me, text: text.trim() }).returning({ id: schema.postComments.id });
  await notifyMentions(me, id, text).catch(() => null);
  await notify(v.post.author, me, "comment", { postId: id, text: text.trim() }).catch(() => null);
  return { id: r.id };
}

/** Apaga um comentário: o autor do comentário ou o autor da publicação. */
export async function deleteComment(me: string, commentId: string) {
  if (!/^[0-9a-f-]{36}$/.test(commentId)) return;
  const d = await db();
  const [r] = await d.select({ c: schema.postComments, author: schema.posts.author }).from(schema.postComments)
    .innerJoin(schema.posts, eq(schema.posts.id, schema.postComments.postId)).where(eq(schema.postComments.id, commentId)).limit(1);
  if (!r || (r.c.author !== me && r.author !== me)) return;
  await d.delete(schema.postComments).where(eq(schema.postComments.id, commentId));
}

export async function removePost(id: string, onlyAuthor?: string) {
  const d = await db();
  const where = onlyAuthor ? and(eq(schema.posts.id, id), eq(schema.posts.author, onlyAuthor)) : eq(schema.posts.id, id);
  const gone = await d.delete(schema.posts).where(where).returning({ id: schema.posts.id, video: schema.posts.video });
  if (!gone.length) return false;
  if (gone[0].video) await (await import("./video")).deleteVideoFiles([id]);
  await d.delete(schema.postLikes).where(eq(schema.postLikes.postId, id));
  await d.delete(schema.postComments).where(eq(schema.postComments.postId, id));
  await d.delete(schema.postSaves).where(eq(schema.postSaves.postId, id));
  await dropPostNotifs([id]);
  return true;
}

export async function reportPost(me: string, id: string, reason: string, note: string) {
  const v = await visiblePost(me, id);
  if (!v || v.post.author === me) return;
  const d = await db();
  await d.insert(schema.reports).values({ reporter: me, target: v.post.author, postId: id, reason, note });
}

/** Ao apagar o perfil: publicações, histórias, gostos e comentários do viajante. */
export async function purgeUser(email: string) {
  const d = await db();
  const mine = (await d.select({ id: schema.posts.id }).from(schema.posts).where(eq(schema.posts.author, email))).map((r) => r.id);
  if (mine.length) {
    await d.delete(schema.postLikes).where(inArray(schema.postLikes.postId, mine));
    await d.delete(schema.postComments).where(inArray(schema.postComments.postId, mine));
    await d.delete(schema.posts).where(inArray(schema.posts.id, mine));
    await dropPostNotifs(mine);
    await (await import("./video")).deleteVideoFiles(mine);
  }
  await d.delete(schema.postLikes).where(eq(schema.postLikes.email, email));
  await d.delete(schema.postComments).where(eq(schema.postComments.author, email));
  await d.delete(schema.postSaves).where(or(eq(schema.postSaves.email, email), mine.length ? inArray(schema.postSaves.postId, mine) : undefined));
}

/** Número de publicações (para o perfil). */
export async function postCount(email: string) {
  const d = await db();
  const [{ n }] = await d.select({ n: sql<number>`count(*)::int` }).from(schema.posts).where(and(eq(schema.posts.author, email), eq(schema.posts.kind, "post")));
  return n;
}
