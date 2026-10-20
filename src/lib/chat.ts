/**
 * Rede social da carteira (fase 3): conversas privadas.
 * Só entre viajantes com perfil que se seguem num dos sentidos (seguidor aceite ou a seguir), sem bloqueios.
 * O email nunca sai do servidor: o cliente só conhece o @nome.
 */
import { and, desc, eq, gt, inArray, isNull, lt, ne, or, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { isBlocked, profileByHandle, type PublicProfile } from "./social";
import { publish } from "./live";
import { isHateful } from "./moderation";
import { notify, settingsOf } from "./notify";

export const MAX_TEXT = 1000;
const pairOf = (a: string, b: string) => [a, b].sort().join("|");
const pub = (p: schema.TravellerProfile): PublicProfile => ({ handle: p.handle, name: p.name, bio: p.bio, photo: p.photo, isPrivate: p.isPrivate });

export type ChatRef = { kind: "story" | "post"; id: string; text: string } | { kind: "loc"; lat: number; lng: number };
export type ChatMsg = {
  id: string; text: string; ref: ChatRef | null; at: string; mine: boolean; read: boolean;
  photo: boolean; audio: boolean; reply: { id: string; text: string; mine: boolean } | null; reactions: { e: string; n: number; mine: boolean }[];
};
function parseRef(ref: string | null): ChatRef | null {
  const r = ref?.match(/^(story|post):([0-9a-f-]{36}):([\s\S]*)$/);
  if (r) return { kind: r[1] as "story" | "post", id: r[2], text: r[3] };
  const l = ref?.match(/^loc:(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)$/);
  if (l) return { kind: "loc", lat: Number(l[1]), lng: Number(l[2]) };
  return null;
}
const excerpt = (m: schema.Message) => (m.text || (m.photo ? "📷" : m.audio ? "🎤" : m.ref?.startsWith("loc:") ? "📍" : "↩︎")).slice(0, 80);
const toMsg = (me: string, m: schema.Message, x: { reply?: schema.Message | null; reactions?: { emoji: string; email: string }[] } = {}): ChatMsg => {
  const rx = new Map<string, { n: number; mine: boolean }>();
  for (const r of x.reactions ?? []) { const c = rx.get(r.emoji) ?? { n: 0, mine: false }; rx.set(r.emoji, { n: c.n + 1, mine: c.mine || r.email === me }); }
  return {
    id: m.id, text: m.text, ref: parseRef(m.ref), at: m.createdAt.toISOString(), mine: m.sender === me, read: Boolean(m.readAt),
    photo: Boolean(m.photo), audio: Boolean(m.audio),
    reply: x.reply ? { id: x.reply.id, text: excerpt(x.reply), mine: x.reply.sender === me } : null,
    reactions: [...rx.entries()].map(([e, v]) => ({ e, ...v }))
  };
};

/** Pode conversar: os dois têm perfil, um segue o outro (aceite) e não há bloqueio. */
export async function canChat(me: string, other: string) {
  if (me === other) return false;
  const d = await db();
  const [mine, f] = await Promise.all([
    d.select({ e: schema.travellerProfiles.email }).from(schema.travellerProfiles).where(eq(schema.travellerProfiles.email, me)).limit(1),
    d.select({ x: schema.follows.follower }).from(schema.follows).where(and(eq(schema.follows.status, "accepted"),
      or(and(eq(schema.follows.follower, me), eq(schema.follows.followee, other)), and(eq(schema.follows.follower, other), eq(schema.follows.followee, me))))).limit(1)
  ]);
  if (!mine.length || !f.length) return false;
  if (await isBlocked(me, other)) return false;
  // Preferência de quem recebe: todos do círculo, só quem ele segue, ou ninguém.
  const { dmPolicy } = await settingsOf(other);
  if (dmPolicy === "none") return false;
  if (dmPolicy === "following") {
    const g = await d.select({ x: schema.follows.follower }).from(schema.follows)
      .where(and(eq(schema.follows.follower, other), eq(schema.follows.followee, me), eq(schema.follows.status, "accepted"))).limit(1);
    return g.length > 0;
  }
  return true;
}

async function clearedBefore(me: string, peer: string) {
  const d = await db();
  const [c] = await d.select().from(schema.chatCleared).where(and(eq(schema.chatCleared.email, me), eq(schema.chatCleared.peer, peer))).limit(1);
  return c?.before ?? null;
}

/** Caixa de entrada: uma linha por conversa, com a última mensagem e as não lidas. */
export async function inbox(me: string) {
  const d = await db();
  const last = await d.execute(sql`
    select distinct on (m.pair) m.pair, m.sender, m.recipient, m.text, m.ref, m.created_at, m.read_at
    from messages m
    left join chat_cleared c on c.email = ${me} and c.peer = (case when m.sender = ${me} then m.recipient else m.sender end)
    where (m.sender = ${me} or m.recipient = ${me}) and (c.before is null or m.created_at > c.before)
    order by m.pair, m.created_at desc`);
  type Row = { pair: string; sender: string; recipient: string; text: string; ref: string | null; created_at: string | Date; read_at: string | Date | null };
  const rows = ((last as unknown as { rows?: Row[] }).rows ?? (last as unknown as Row[])) as Row[];
  if (!rows.length) return { threads: [] };
  const peers = rows.map((r) => (r.sender === me ? r.recipient : r.sender));
  const [profs, unread, blocked] = await Promise.all([
    d.select().from(schema.travellerProfiles).where(inArray(schema.travellerProfiles.email, peers)),
    d.select({ s: schema.messages.sender, n: sql<number>`count(*)::int` }).from(schema.messages)
      .where(and(eq(schema.messages.recipient, me), isNull(schema.messages.readAt))).groupBy(schema.messages.sender),
    d.select().from(schema.blocks).where(or(eq(schema.blocks.blocker, me), eq(schema.blocks.blocked, me)))
  ]);
  const hidden = new Set(blocked.map((b) => (b.blocker === me ? b.blocked : b.blocker)));
  const threads = rows.map((r) => {
    const peer = r.sender === me ? r.recipient : r.sender;
    const p = profs.find((x) => x.email === peer);
    if (!p || hidden.has(peer)) return null;
    return {
      peer: pub(p), unread: unread.find((u) => u.s === peer)?.n ?? 0,
      last: { text: r.text || (r.ref?.startsWith("loc:") ? "📍" : r.ref?.startsWith("post:") ? "🔗" : r.ref?.startsWith("story:") ? "↩︎" : "📎"), at: new Date(r.created_at).toISOString(), mine: r.sender === me, read: Boolean(r.read_at) }
    };
  }).filter(Boolean) as { peer: PublicProfile; unread: number; last: { text: string; at: string; mine: boolean; read: boolean } }[];
  threads.sort((a, b) => b.last.at.localeCompare(a.last.at));
  return { threads };
}

export async function unreadCount(me: string) {
  const d = await db();
  const [{ n }] = await d.select({ n: sql<number>`count(distinct ${schema.messages.sender})::int` }).from(schema.messages)
    .where(and(eq(schema.messages.recipient, me), isNull(schema.messages.readAt)));
  return n;
}

/**
 * Uma conversa: mensagens (as 50 mais recentes, ou só as novas depois de `after`, ou antigas antes de `before`).
 * Marca como lidas as mensagens recebidas.
 */
export async function thread(me: string, handle: string, opts: { after?: string | null; before?: string | null } = {}) {
  const p = await profileByHandle(handle);
  if (!p || p.email === me || (await isBlocked(me, p.email))) return null;
  const d = await db();
  const pair = pairOf(me, p.email);
  const cleared = await clearedBefore(me, p.email);
  const conds = [eq(schema.messages.pair, pair)];
  if (cleared) conds.push(gt(schema.messages.createdAt, cleared));
  const after = opts.after && !Number.isNaN(Date.parse(opts.after)) ? new Date(opts.after) : null;
  const before = opts.before && !Number.isNaN(Date.parse(opts.before)) ? new Date(opts.before) : null;
  if (after) conds.push(gt(schema.messages.createdAt, after));
  if (before) conds.push(lt(schema.messages.createdAt, before));
  const rows = await d.select().from(schema.messages).where(and(...conds)).orderBy(desc(schema.messages.createdAt)).limit(51);
  const more = !after && rows.length > 50;
  const list = rows.slice(0, 50).reverse();
  const now = new Date();
  const readNow = await d.update(schema.messages).set({ readAt: now }).where(and(eq(schema.messages.pair, pair), eq(schema.messages.recipient, me), isNull(schema.messages.readAt))).returning({ id: schema.messages.id });
  if (readNow.length) { const h = await handleOf(me); if (h) await publish(p.email, { t: "read", peer: h, at: now.toISOString() }); }
  // Até onde o outro já leu (para o "Visto").
  const [seen] = await d.select({ at: schema.messages.createdAt }).from(schema.messages)
    .where(and(eq(schema.messages.pair, pair), eq(schema.messages.sender, me), sql`${schema.messages.readAt} is not null`))
    .orderBy(desc(schema.messages.createdAt)).limit(1);
  const ids = list.map((m) => m.id);
  const replyIds = [...new Set(list.map((m) => m.replyTo).filter((x): x is string => Boolean(x)))];
  const [replies, reacts] = await Promise.all([
    replyIds.length ? d.select().from(schema.messages).where(and(inArray(schema.messages.id, replyIds), eq(schema.messages.pair, pair))) : Promise.resolve([]),
    ids.length ? d.select().from(schema.messageReactions).where(inArray(schema.messageReactions.messageId, ids)) : Promise.resolve([])
  ]);
  return {
    peer: pub(p), canSend: await canChat(me, p.email), more,
    messages: list.map((m) => toMsg(me, m, { reply: replies.find((x) => x.id === m.replyTo) ?? null, reactions: reacts.filter((x) => x.messageId === m.id) })),
    seenUntil: seen?.at.toISOString() ?? null
  };
}

export type SendExtra = { photo?: string | null; audio?: string | null; replyTo?: string | null; id?: string };
export async function send(me: string, handle: string, text: string, ref: string | null = null, x: SendExtra = {}) {
  const p = await profileByHandle(handle);
  if (!p) return { error: "not_found" as const };
  if (!(await canChat(me, p.email))) return { error: "not_allowed" as const };
  const t = text.trim().slice(0, MAX_TEXT);
  if (!t && !ref && !x.photo && !x.audio) return { error: "empty" as const };
  if (isHateful(t)) return { error: "offensive" as const };
  const d = await db();
  const pair = pairOf(me, p.email);
  const reply = x.replyTo && /^[0-9a-f-]{36}$/.test(x.replyTo)
    ? (await d.select().from(schema.messages).where(and(eq(schema.messages.id, x.replyTo), eq(schema.messages.pair, pair))).limit(1))[0] ?? null : null;
  const [m] = await d.insert(schema.messages).values({ ...(x.id ? { id: x.id } : {}), pair, sender: me, recipient: p.email, text: t, ref, photo: x.photo ?? null, audio: x.audio ?? null, replyTo: reply?.id ?? null }).returning();
  // Entrega instantânea: ao destinatário e aos outros separadores/dispositivos de quem enviou.
  const mine = await handleOf(me);
  if (mine) await publish(p.email, { t: "msg", peer: mine, m: toMsg(p.email, m, { reply }) });
  await publish(me, { t: "msg", peer: p.handle, m: toMsg(me, m, { reply }) });
  await notify(p.email, me, ref?.startsWith("story:") ? "story_reply" : "message", { text: excerpt(m) }).catch(() => null);
  return { message: toMsg(me, m, { reply }) };
}

/** Partilhar uma publicação numa conversa (só se quem envia a puder ver). */
export async function sharePost(me: string, handle: string, postId: string, text = "") {
  const { getPost } = await import("./posts");
  const pg = await getPost(me, postId);
  const post = pg?.posts[0];
  if (!post) return { error: "not_found" as const };
  const ex = `@${post.handle}: ${post.text || (post.video ? "🎬" : post.photos ? "📷" : "")}`.slice(0, 80);
  return send(me, handle, text, `post:${post.id}:${ex}`);
}

/** Reagir a uma mensagem (um emoji por pessoa; o mesmo outra vez tira). */
export async function react(me: string, messageId: string, emoji: string | null) {
  if (!/^[0-9a-f-]{36}$/.test(messageId)) return null;
  const d = await db();
  const [m] = await d.select().from(schema.messages).where(eq(schema.messages.id, messageId)).limit(1);
  if (!m || (m.sender !== me && m.recipient !== me)) return null;
  const peer = m.sender === me ? m.recipient : m.sender;
  if (await isBlocked(me, peer)) return null;
  if (emoji) await d.insert(schema.messageReactions).values({ messageId, email: me, emoji }).onConflictDoUpdate({ target: [schema.messageReactions.messageId, schema.messageReactions.email], set: { emoji, createdAt: new Date() } });
  else await d.delete(schema.messageReactions).where(and(eq(schema.messageReactions.messageId, messageId), eq(schema.messageReactions.email, me)));
  const reactions = await d.select().from(schema.messageReactions).where(eq(schema.messageReactions.messageId, messageId));
  const [mine, other] = await Promise.all([handleOf(me), handleOf(peer)]);
  const forMe = toMsg(me, m, { reactions }).reactions, forPeer = toMsg(peer, m, { reactions }).reactions;
  if (mine) await publish(peer, { t: "react", peer: mine, id: messageId, reactions: forPeer });
  if (other) await publish(me, { t: "react", peer: other, id: messageId, reactions: forMe });
  return forMe;
}

/** Ficheiro de uma mensagem (foto ou voz), só para quem está na conversa. */
export async function messageMedia(me: string, id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const d = await db();
  const [m] = await d.select({ photo: schema.messages.photo, audio: schema.messages.audio, sender: schema.messages.sender, recipient: schema.messages.recipient }).from(schema.messages).where(eq(schema.messages.id, id)).limit(1);
  if (!m || (m.sender !== me && m.recipient !== me)) return null;
  return { photo: m.photo, audio: m.audio };
}

/** Resposta a uma história: só se a história ainda existir e o viajante a puder ver. */
export async function replyToStory(me: string, storyId: string, text: string) {
  if (!/^[0-9a-f-]{36}$/.test(storyId)) return { error: "not_found" as const };
  const { getPost } = await import("./posts");
  const s = await getPost(me, storyId);
  const story = s?.posts[0];
  if (!story || story.kind !== "story" || story.mine) return { error: "not_found" as const };
  const excerpt = (story.text || (story.photo ? "📷" : "")).slice(0, 80);
  return send(me, story.handle, text, `story:${story.id}:${excerpt}`);
}

/** Anular o envio de uma mensagem minha. */
export async function unsend(me: string, id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  const d = await db();
  const [m] = await d.delete(schema.messages).where(and(eq(schema.messages.id, id), eq(schema.messages.sender, me))).returning();
  if (!m) return;
  await d.delete(schema.messageReactions).where(eq(schema.messageReactions.messageId, id));
  if (m.audio) await (await import("./voice")).deleteVoice([m.audio]);
  const [mine, peer] = await Promise.all([handleOf(me), handleOf(m.recipient)]);
  if (mine) await publish(m.recipient, { t: "unsend", peer: mine, id });
  if (peer) await publish(me, { t: "unsend", peer, id });
}

/** "A escrever…": avisa o outro viajante (sem guardar nada). */
export async function typing(me: string, handle: string) {
  const p = await profileByHandle(handle);
  if (!p || !(await canChat(me, p.email))) return;
  const mine = await handleOf(me);
  if (mine) await publish(p.email, { t: "typing", peer: mine });
}

async function handleOf(email: string) {
  const d = await db();
  const [r] = await d.select({ h: schema.travellerProfiles.handle }).from(schema.travellerProfiles).where(eq(schema.travellerProfiles.email, email)).limit(1);
  return r?.h ?? null;
}

/** Apagar a conversa só para mim. */
export async function clearThread(me: string, handle: string) {
  const p = await profileByHandle(handle);
  if (!p) return;
  const d = await db();
  const now = new Date();
  await d.insert(schema.chatCleared).values({ email: me, peer: p.email, before: now })
    .onConflictDoUpdate({ target: [schema.chatCleared.email, schema.chatCleared.peer], set: { before: now } });
  await d.update(schema.messages).set({ readAt: now }).where(and(eq(schema.messages.recipient, me), eq(schema.messages.sender, p.email), isNull(schema.messages.readAt)));
}

/** Pessoas com quem pode começar uma conversa (seguidores e a seguir). */
export async function contacts(me: string) {
  const d = await db();
  const f = await d.select().from(schema.follows).where(and(eq(schema.follows.status, "accepted"), or(eq(schema.follows.follower, me), eq(schema.follows.followee, me))));
  const emails = [...new Set(f.map((x) => (x.follower === me ? x.followee : x.follower)))].filter((e) => e !== me);
  if (!emails.length) return [];
  const blocked = await d.select().from(schema.blocks).where(or(eq(schema.blocks.blocker, me), eq(schema.blocks.blocked, me)));
  const hidden = new Set(blocked.map((b) => (b.blocker === me ? b.blocked : b.blocker)));
  const profs = await d.select().from(schema.travellerProfiles).where(and(inArray(schema.travellerProfiles.email, emails), ne(schema.travellerProfiles.email, me)));
  return profs.filter((p) => !hidden.has(p.email)).map(pub).sort((a, b) => a.name.localeCompare(b.name));
}

/** Ao apagar o perfil: todas as conversas do viajante. */
export async function purgeChats(email: string) {
  const d = await db();
  const gone = await d.select({ id: schema.messages.id, audio: schema.messages.audio }).from(schema.messages).where(or(eq(schema.messages.sender, email), eq(schema.messages.recipient, email)));
  if (gone.length) await d.delete(schema.messageReactions).where(inArray(schema.messageReactions.messageId, gone.map((g) => g.id)));
  await (await import("./voice")).deleteVoice(gone.map((g) => g.audio).filter((a): a is string => Boolean(a)));
  await d.delete(schema.messages).where(or(eq(schema.messages.sender, email), eq(schema.messages.recipient, email)));
  await d.delete(schema.chatCleared).where(or(eq(schema.chatCleared.email, email), eq(schema.chatCleared.peer, email)));
}
