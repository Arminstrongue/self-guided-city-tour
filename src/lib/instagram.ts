/**
 * Instagram (API oficial da Meta), só leitura: seguidores, publicações, interação e comentários por responder.
 * Configuração no .env do servidor (a chave nunca sai do servidor):
 *   IG_ACCESS_TOKEN=…            chave de acesso (conta Profissional)
 *   IG_USER_ID=…                 opcional: id da conta Instagram ligada a uma Página do Facebook (usa graph.facebook.com);
 *                                sem ele usa a "API do Instagram com início de sessão do Instagram" (graph.instagram.com/me).
 * Sem IG_ACCESS_TOKEN, tudo isto fica desligado sem erros.
 */
import { desc, eq, and, lte } from "drizzle-orm";
import { db, schema } from "./db";
import type { Result } from "./monitor";

const V = "v21.0";
export type IgMedia = { id: string; caption?: string; permalink?: string; timestamp?: string; like_count?: number; comments_count?: number; media_type?: string };
export type IgComment = { id: string; text: string; username?: string; timestamp?: string; media: string; permalink?: string };
export type IgSnapshot = { username: string; followers: number; posts: number; media: IgMedia[]; unanswered: IgComment[] };

export const igEnabled = () => Boolean(process.env.IG_ACCESS_TOKEN);

function base() {
  const id = process.env.IG_USER_ID;
  return id ? { root: `https://graph.facebook.com/${V}`, me: id } : { root: "https://graph.instagram.com", me: "me" };
}

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  const { root } = base();
  const q = new URLSearchParams({ ...params, access_token: process.env.IG_ACCESS_TOKEN ?? "" });
  const res = await fetch(`${root}/${path}?${q}`, { cache: "no-store", signal: AbortSignal.timeout(20_000) });
  const j = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number } } & T;
  if (!res.ok || j.error) throw new Error(j.error?.code === 190 ? "chave de acesso do Instagram expirada ou inválida" : (j.error?.message ?? `HTTP ${res.status}`).slice(0, 200));
  return j;
}

/** Comentários sem resposta da conta (os mais recentes primeiro), nas últimas publicações com comentários. */
export function unansweredOf(comments: { id: string; text: string; username?: string; timestamp?: string; replies?: { data?: { username?: string }[] } }[], own: string, media: string, permalink?: string): IgComment[] {
  return comments
    .filter((c) => c.username !== own && !(c.replies?.data ?? []).some((r) => r.username === own))
    .map((c) => ({ id: c.id, text: c.text.slice(0, 280), username: c.username, timestamp: c.timestamp, media, permalink }));
}

export async function fetchSnapshot(): Promise<IgSnapshot> {
  const { me } = base();
  const acc = await get<{ username: string; followers_count?: number; media_count?: number }>(me, { fields: "username,followers_count,media_count" });
  const m = await get<{ data: IgMedia[] }>(`${me}/media`, { fields: "id,caption,permalink,timestamp,like_count,comments_count,media_type", limit: "12" });
  const unanswered: IgComment[] = [];
  for (const x of m.data.filter((x) => (x.comments_count ?? 0) > 0).slice(0, 6)) {
    const c = await get<{ data: { id: string; text: string; username?: string; timestamp?: string; replies?: { data?: { username?: string }[] } }[] }>(`${x.id}/comments`, { fields: "id,text,username,timestamp,replies{username}", limit: "50" }).catch(() => ({ data: [] }));
    unanswered.push(...unansweredOf(c.data, acc.username, x.id, x.permalink));
  }
  return { username: acc.username, followers: acc.followers_count ?? 0, posts: acc.media_count ?? 0, media: m.data, unanswered: unanswered.slice(0, 30) };
}

let last: { at: number; result: Result } | null = null;

/** Verificação para o monitor: no máximo uma chamada à API por hora; guarda uma fotografia por dia. */
export async function instagramCheck(): Promise<Result | null> {
  if (!igEnabled()) return null;
  if (last && Date.now() - last.at < 3600_000) return last.result;
  const t0 = Date.now();
  let result: Result;
  try {
    const s = await fetchSnapshot();
    result = { name: "instagram", ok: true, ms: Date.now() - t0, status: s.followers, error: "" };
    const d = await db();
    const today = new Date().toISOString().slice(0, 10);
    const [prev] = await d.select().from(schema.socialSnapshots).where(eq(schema.socialSnapshots.network, "instagram")).orderBy(desc(schema.socialSnapshots.at)).limit(1);
    const data = { media: s.media, unanswered: s.unanswered } as Record<string, unknown>;
    if (prev && prev.at.toISOString().slice(0, 10) === today) {
      await d.update(schema.socialSnapshots).set({ followers: s.followers, posts: s.posts, data, account: s.username, at: new Date() }).where(eq(schema.socialSnapshots.id, prev.id));
    } else {
      await d.insert(schema.socialSnapshots).values({ network: "instagram", account: s.username, followers: s.followers, posts: s.posts, data });
    }
  } catch (e) {
    result = { name: "instagram", ok: false, ms: Date.now() - t0, status: 0, error: String((e as Error).message ?? e) };
  }
  last = { at: Date.now(), result };
  return result;
}

/** Linhas para o resumo diário: seguidores (e variação em 7 dias), última publicação, comentários por responder, melhor publicação. */
export async function instagramSummary(now = new Date()): Promise<string[]> {
  if (!igEnabled()) return [];
  const d = await db();
  const [cur] = await d.select().from(schema.socialSnapshots).where(eq(schema.socialSnapshots.network, "instagram")).orderBy(desc(schema.socialSnapshots.at)).limit(1);
  if (!cur) return ["Instagram: ainda sem dados (verifique a chave de acesso)."];
  const [old] = await d.select().from(schema.socialSnapshots).where(and(eq(schema.socialSnapshots.network, "instagram"), lte(schema.socialSnapshots.at, new Date(now.getTime() - 7 * 86400_000)))).orderBy(desc(schema.socialSnapshots.at)).limit(1);
  const data = cur.data as { media?: IgMedia[]; unanswered?: IgComment[] };
  return summaryLines(cur.account, cur.followers, old?.followers, data.media ?? [], data.unanswered ?? [], now);
}

export function summaryLines(account: string, followers: number, followers7d: number | undefined, media: IgMedia[], unanswered: IgComment[], now: Date): string[] {
  const out: string[] = [];
  const delta = followers7d === undefined ? "" : ` (${followers - followers7d >= 0 ? "+" : ""}${followers - followers7d} em 7 dias)`;
  out.push(`Instagram @${account}: ${followers} seguidores${delta}`);
  const lastPost = media[0]?.timestamp ? new Date(media[0].timestamp) : null;
  if (lastPost) {
    const days = Math.floor((now.getTime() - lastPost.getTime()) / 86400_000);
    out.push(days >= 7 ? `⚠ Instagram: sem publicações há ${days} dias — publique uma novidade da app` : `Instagram: última publicação há ${days} dia(s)`);
  } else out.push("⚠ Instagram: ainda sem publicações");
  if (unanswered.length) out.push(`⚠ Instagram: ${unanswered.length} comentário(s) por responder`);
  const week = media.filter((m) => m.timestamp && now.getTime() - new Date(m.timestamp).getTime() < 7 * 86400_000);
  const best = week.sort((a, b) => (b.like_count ?? 0) + (b.comments_count ?? 0) - (a.like_count ?? 0) - (a.comments_count ?? 0))[0];
  if (best) out.push(`Instagram: melhor publicação da semana — ${best.like_count ?? 0} gostos, ${best.comments_count ?? 0} comentários`);
  return out;
}
