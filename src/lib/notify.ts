/**
 * Notificações: centro de notificações na carteira, push no telemóvel (Web Push) e preferências por tipo.
 * O push só é enviado quando o viajante não tem a app aberta (presença) e se o tipo estiver ligado.
 */
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { env } from "./env";
import { isOnline, publish } from "./live";
import { achievementText } from "./achievement-text";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/core";

/** Tipo de notificação → preferência que a controla. */
const PREF: Record<string, keyof schema.NotifPrefs> = {
  like: "like", comment: "comment", follow: "follow", request: "follow", accepted: "follow",
  message: "message", story_reply: "story_reply", video_ready: "video", invite_joined: "follow", mention: "comment", split: "message"
};

/* ---------- Definições da conta ---------- */
export async function settingsOf(email: string) {
  const d = await db();
  const [s] = await d.select().from(schema.accountSettings).where(eq(schema.accountSettings.email, email)).limit(1);
  return { dmPolicy: s?.dmPolicy ?? "circle", notif: s?.notif ?? {}, lang: s?.lang ?? "en", sessionsAfter: s?.sessionsAfter ?? null } as
    { dmPolicy: "circle" | "following" | "none"; notif: schema.NotifPrefs; lang: string; sessionsAfter: Date | null };
}
export async function saveSettings(email: string, v: Partial<{ dmPolicy: "circle" | "following" | "none"; notif: schema.NotifPrefs; lang: string; sessionsAfter: Date }>) {
  const d = await db();
  const set = { ...v, updatedAt: new Date() };
  await d.insert(schema.accountSettings).values({ email, ...v }).onConflictDoUpdate({ target: schema.accountSettings.email, set });
}
const wants = (prefs: schema.NotifPrefs, type: string) => prefs[PREF[type] ?? "like"] !== false; // ligado por defeito

/* ---------- Push (Web Push / VAPID) ---------- */
export const pushEnabled = () => Boolean(env.vapidPublic && env.vapidPrivate);
async function webpush() {
  const wp = (await import("web-push")).default;
  wp.setVapidDetails(env.vapidSubject, env.vapidPublic, env.vapidPrivate);
  return wp;
}
export async function saveSub(email: string, s: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  const d = await db();
  await d.insert(schema.pushSubs).values({ email, endpoint: s.endpoint, p256dh: s.keys.p256dh, auth: s.keys.auth })
    .onConflictDoUpdate({ target: schema.pushSubs.endpoint, set: { email, p256dh: s.keys.p256dh, auth: s.keys.auth } });
}
export async function removeSub(endpoint: string, email?: string) {
  const d = await db();
  // Pedido de um viajante: só apaga a subscrição dele. Sem email: limpeza de subscrições expiradas.
  await d.delete(schema.pushSubs).where(email ? and(eq(schema.pushSubs.endpoint, endpoint), eq(schema.pushSubs.email, email)) : eq(schema.pushSubs.endpoint, endpoint));
}
export async function sendPush(email: string, p: { title: string; body: string; url: string; tag?: string }) {
  if (!pushEnabled()) return 0;
  const d = await db();
  const subs = await d.select().from(schema.pushSubs).where(eq(schema.pushSubs.email, email)).limit(10);
  if (!subs.length) return 0;
  const wp = await webpush();
  let sent = 0;
  await Promise.all(subs.map(async (s) => {
    try {
      await wp.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(p), { TTL: 3600 * 12, urgency: "high" });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await removeSub(s.endpoint); // subscrição expirada
    }
  }));
  return sent;
}

/* ---------- Textos (o push vai na língua do site, com fallback em inglês) ---------- */
const TXT: Record<string, Record<string, string>> = {
  en: { like: "{n} liked your post", like_story: "{n} liked your story", comment: "{n} commented: {x}", follow: "{n} started following you", request: "{n} wants to follow you",
    accepted: "{n} accepted your follow request", story_reply: "{n} replied to your story: {x}", video_ready: "Your video is ready to watch", invite_joined: "{n} joined from your invite", mention: "{n} mentioned you: {x}", split: "{n} added you to split costs: {x}", message: "{x}" },
  pt: { like: "{n} gostou da sua publicação", like_story: "{n} gostou da sua história", comment: "{n} comentou: {x}", follow: "{n} começou a segui-lo", request: "{n} quer segui-lo",
    accepted: "{n} aceitou o seu pedido", story_reply: "{n} respondeu à sua história: {x}", video_ready: "O seu vídeo está pronto", invite_joined: "{n} entrou com o seu convite", mention: "{n} mencionou-o: {x}", split: "{n} juntou-o às despesas: {x}", message: "{x}" }
};
export const notifText = (type: string, name: string, x: string, lang = "en") =>
  ((TXT[lang] ?? TXT.en)[type] ?? TXT.en[type] ?? "").replace("{n}", name).replace("{x}", x);

/**
 * Regista e entrega uma notificação.
 * - "message" não entra no centro (tem o próprio selo nas mensagens), só push.
 * - Gostos repetidos do mesmo viajante na mesma publicação não duplicam.
 */
export async function notify(to: string, actor: string, type: schema.NotificationType | "message", o: { postId?: string | null; text?: string; storyLike?: boolean; lang?: string } = {}) {
  if (to === actor && type !== "video_ready") return;
  const d = await db();
  const blocked = await d.select({ x: schema.blocks.blocker }).from(schema.blocks)
    .where(sql`(${schema.blocks.blocker} = ${to} and ${schema.blocks.blocked} = ${actor}) or (${schema.blocks.blocker} = ${actor} and ${schema.blocks.blocked} = ${to})`).limit(1);
  if (blocked.length) return;
  const text = (o.text ?? "").slice(0, 140);
  if (type !== "message") {
    if (type === "like" && o.postId) {
      const dup = await d.select({ id: schema.notifications.id }).from(schema.notifications)
        .where(and(eq(schema.notifications.email, to), eq(schema.notifications.actor, actor), eq(schema.notifications.type, "like"), eq(schema.notifications.postId, o.postId))).limit(1);
      if (dup.length) return;
    }
    await d.insert(schema.notifications).values({ email: to, actor, type, postId: o.postId ?? null, text });
    await publish(to, { t: "notif" });
  }
  const st = await settingsOf(to);
  if (!wants(st.notif, type) || !pushEnabled() || (await isOnline(to))) return;
  const [a] = await d.select({ name: schema.travellerProfiles.name, handle: schema.travellerProfiles.handle }).from(schema.travellerProfiles).where(eq(schema.travellerProfiles.email, actor)).limit(1);
  const name = a?.name ?? "";
  const lang = o.lang ?? st.lang ?? "en";
  const body = type === "achievement" ? achievementText(text, getDict((isLocale(lang) ? lang : "en") as Locale))
    : notifText(type === "like" && o.storyLike ? "like_story" : type, name, text, lang);
  const url = type === "message" || type === "story_reply" ? `/${lang}/wallet#chat:${a?.handle ?? ""}`
    : type === "follow" || type === "request" || type === "accepted" || type === "invite_joined" ? `/${lang}/u/${a?.handle ?? ""}`
    : type === "split" ? `/${lang}/wallet#split:${o.postId ?? ""}`
    : type === "achievement" ? `/${lang}/wallet#points`
    : `/${lang}/wallet#notifs`;
  await sendPush(to, { title: type === "message" ? name : "VOYBU", body, url, tag: type === "message" ? `chat-${a?.handle}` : type });
}

/* ---------- Centro de notificações ---------- */
export async function listNotifs(email: string) {
  const d = await db();
  const rows = await d.select({ n: schema.notifications, a: schema.travellerProfiles, p: { id: schema.posts.id, photo: sql<boolean>`${schema.posts.photo} is not null`, kind: schema.posts.kind } })
    .from(schema.notifications)
    .leftJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.notifications.actor))
    .leftJoin(schema.posts, eq(schema.posts.id, schema.notifications.postId))
    .where(eq(schema.notifications.email, email)).orderBy(desc(schema.notifications.createdAt)).limit(80);
  // Estado real das relações: um pedido já respondido deixa de pedir "Aceitar" (e não se repete).
  const [toMe, fromMe] = await Promise.all([
    d.select({ e: schema.follows.follower, s: schema.follows.status }).from(schema.follows).where(eq(schema.follows.followee, email)),
    d.select({ e: schema.follows.followee, s: schema.follows.status }).from(schema.follows).where(eq(schema.follows.follower, email))
  ]);
  const inRel = new Map(toMe.map((x) => [x.e, x.s]));
  const outRel = new Map(fromMe.map((x) => [x.e, x.s]));
  const seen = new Set<string>();
  const out = [];
  for (const { n, a, p } of rows) {
    if (!a) continue;
    let type = n.type;
    if (type === "request" || type === "follow") {
      const st = inRel.get(n.actor);
      if (type === "request" && st === "accepted") type = "follow";   // já aceite: passa a "começou a seguir-te"
      else if (type === "request" && st !== "pending") continue;      // recusado ou cancelado
      const k = `${type}:${n.actor}`;
      if (seen.has(k)) continue;                                      // um só por pessoa
      seen.add(k);
    }
    const rel = outRel.get(n.actor);
    out.push({
      id: n.id, type, text: n.text, at: n.createdAt.toISOString(), read: Boolean(n.readAt),
      actor: { handle: a.handle, name: a.name, bio: a.bio, photo: a.photo, isPrivate: a.isPrivate },
      post: p?.id ? { id: p.id, photo: p.photo, kind: p.kind } : null,
      split: n.type === "split" ? n.postId : null,
      // Para "seguir de volta": se eu já sigo (ou pedi para seguir) quem fez a ação.
      me: rel === "accepted" ? "following" as const : rel === "pending" ? "requested" as const : "none" as const
    });
  }
  return out;
}
export async function unreadNotifs(email: string) {
  const d = await db();
  const [{ n }] = await d.select({ n: sql<number>`count(*)::int` }).from(schema.notifications).where(and(eq(schema.notifications.email, email), isNull(schema.notifications.readAt)));
  return n;
}
export async function markNotifsRead(email: string) {
  const d = await db();
  await d.update(schema.notifications).set({ readAt: new Date() }).where(and(eq(schema.notifications.email, email), isNull(schema.notifications.readAt)));
}
export async function purgeNotifs(email: string) {
  const d = await db();
  await d.delete(schema.notifications).where(sql`${schema.notifications.email} = ${email} or ${schema.notifications.actor} = ${email}`);
  await d.delete(schema.pushSubs).where(eq(schema.pushSubs.email, email));
  await d.delete(schema.livePresence).where(eq(schema.livePresence.email, email));
}
export async function dropPostNotifs(postIds: string[]) {
  if (!postIds.length) return;
  const d = await db();
  await d.delete(schema.notifications).where(inArray(schema.notifications.postId, postIds));
}
