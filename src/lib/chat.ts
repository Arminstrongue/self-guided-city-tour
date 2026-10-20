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

export type ChatMsg = { id: string; text: string; ref: { kind: "story"; id: string; text: string } | null; at: string; mine: boolean; read: boolean };
const toMsg = (me: string, m: schema.Message): ChatMsg => {
  let ref: ChatMsg["ref"] = null;
  const r = m.ref?.match(/^story:([0-9a-f-]{36}):([\s\S]*)$/);
  if (r) ref = { kind: "story", id: r[1], text: r[2] };
  return { id: m.id, text: m.text, ref, at: m.createdAt.toISOString(), mine: m.sender === me, read: Boolean(m.readAt) };
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
      last: { text: r.ref?.startsWith("story:") && !r.text ? "↩︎" : r.text, at: new Date(r.created_at).toISOString(), mine: r.sender === me, read: Boolean(r.read_at) }
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
  return {
    peer: pub(p), canSend: await canChat(me, p.email), more,
    messages: list.map((m) => toMsg(me, m)), seenUntil: seen?.at.toISOString() ?? null
  };
}

export async function send(me: string, handle: string, text: string, ref: string | null = null) {
  const p = await profileByHandle(handle);
  if (!p) return { error: "not_found" as const };
  if (!(await canChat(me, p.email))) return { error: "not_allowed" as const };
  const t = text.trim().slice(0, MAX_TEXT);
  if (!t && !ref) return { error: "empty" as const };
  if (isHateful(t)) return { error: "offensive" as const };
  const d = await db();
  const [m] = await d.insert(schema.messages).values({ pair: pairOf(me, p.email), sender: me, recipient: p.email, text: t, ref }).returning();
  // Entrega instantânea: ao destinatário e aos outros separadores/dispositivos de quem enviou.
  const mine = await handleOf(me);
  if (mine) await publish(p.email, { t: "msg", peer: mine, m: toMsg(p.email, m) });
  await publish(me, { t: "msg", peer: p.handle, m: toMsg(me, m) });
  await notify(p.email, me, ref ? "story_reply" : "message", { text: t || "↩︎" }).catch(() => null);
  return { message: toMsg(me, m) };
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
  await d.delete(schema.messages).where(or(eq(schema.messages.sender, email), eq(schema.messages.recipient, email)));
  await d.delete(schema.chatCleared).where(or(eq(schema.chatCleared.email, email), eq(schema.chatCleared.peer, email)));
}
