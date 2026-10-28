/**
 * Atualizações dos viajantes (estilo Waze): cada viajante com sessão pode deixar sinais/orientação, mudanças de caminho,
 * avisos, alertas, dicas e fotos/vídeos numa cidade, numa paragem ou num ponto do mapa.
 * - Alertas expiram em 48 h e avisos em 7 dias; um "ainda está" de outra pessoa prolonga-os.
 * - "Já não está" de várias pessoas, ou 3 denúncias, escondem a atualização automaticamente (a equipa revê as denúncias).
 * - O email do autor nunca sai do servidor; mostra-se o @nome só de perfis públicos.
 */
import { and, desc, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { moderate } from "./moderation";

export const UPDATE_KINDS = ["sign", "path", "warn", "alert", "tip", "photo"] as const;
export type UpdateKind = (typeof UPDATE_KINDS)[number];
const TTL_H: Partial<Record<UpdateKind, number>> = { alert: 48, warn: 24 * 7 };
const EXTEND_H: Partial<Record<UpdateKind, number>> = { alert: 24, warn: 72 };
export const HIDE_REPORTS = 3;

export type PublicUpdate = {
  id: string; city: string; stop: string | null; kind: UpdateKind; text: string; place: string; lat: number | null; lng: number | null;
  hasPhoto: boolean; postId: string | null; up: number; down: number; at: string; expiresAt: string | null;
  by: string | null; mine: boolean; myVote: number;
};

export type NewUpdate = { city: string; kind: UpdateKind; text: string; stop?: string | null; place?: string; lat?: number | null; lng?: number | null; photo?: string | null; postId?: string | null };

export async function createUpdate(author: string, v: NewUpdate): Promise<{ id: string } | { error: "offensive" | "empty" | "rate" | "video" }> {
  const mod = moderate(v.text.trim());
  if (!mod.ok) return { error: "offensive" };
  const placeMod = moderate((v.place ?? "").trim());
  if (!placeMod.ok) return { error: "offensive" };
  if (!mod.text && !v.photo && !v.postId) return { error: "empty" };
  const d = await db();
  // No máximo 20 atualizações por pessoa em 24 h (evita inundar uma cidade).
  const [{ n }] = await d.select({ n: sql<number>`count(*)::int` }).from(schema.travellerUpdates)
    .where(and(eq(schema.travellerUpdates.author, author), gt(schema.travellerUpdates.createdAt, new Date(Date.now() - 86400_000))));
  if (n >= 20) return { error: "rate" };
  if (v.postId) {
    const [p] = await d.select({ author: schema.posts.author, video: schema.posts.video }).from(schema.posts).where(eq(schema.posts.id, v.postId)).limit(1);
    if (!p || p.author !== author || !p.video) return { error: "video" };
  }
  const ttl = TTL_H[v.kind];
  const [row] = await d.insert(schema.travellerUpdates).values({
    author, city: v.city, stop: v.stop ?? null, kind: v.kind, text: mod.text, place: placeMod.text.slice(0, 120),
    lat: v.lat ?? null, lng: v.lng ?? null, photo: v.photo ?? null, postId: v.postId ?? null,
    expiresAt: ttl ? new Date(Date.now() + ttl * 3600_000) : null
  }).returning({ id: schema.travellerUpdates.id });
  return { id: row.id };
}

/** Atualizações visíveis de uma cidade (alertas e avisos primeiro, depois as mais recentes). */
export async function listUpdates(city: string, me: string | null, o: { stop?: string; limit?: number } = {}): Promise<PublicUpdate[]> {
  const d = await db();
  const now = new Date();
  const rows = await d.select({
    id: schema.travellerUpdates.id, author: schema.travellerUpdates.author, city: schema.travellerUpdates.city, stop: schema.travellerUpdates.stop,
    kind: schema.travellerUpdates.kind, text: schema.travellerUpdates.text, place: schema.travellerUpdates.place, lat: schema.travellerUpdates.lat, lng: schema.travellerUpdates.lng,
    hasPhoto: sql<boolean>`${schema.travellerUpdates.photo} is not null`, postId: schema.travellerUpdates.postId, up: schema.travellerUpdates.up, down: schema.travellerUpdates.down,
    createdAt: schema.travellerUpdates.createdAt, expiresAt: schema.travellerUpdates.expiresAt
  }).from(schema.travellerUpdates)
    .where(and(eq(schema.travellerUpdates.city, city), eq(schema.travellerUpdates.status, "live"),
      or(isNull(schema.travellerUpdates.expiresAt), gt(schema.travellerUpdates.expiresAt, now)),
      o.stop ? eq(schema.travellerUpdates.stop, o.stop) : undefined))
    .orderBy(desc(schema.travellerUpdates.createdAt)).limit(Math.min(o.limit ?? 80, 200));
  if (!rows.length) return [];
  const authors = [...new Set(rows.map((r) => r.author))];
  const profs = await d.select({ email: schema.travellerProfiles.email, handle: schema.travellerProfiles.handle, isPrivate: schema.travellerProfiles.isPrivate })
    .from(schema.travellerProfiles).where(inArray(schema.travellerProfiles.email, authors));
  const handle = new Map(profs.filter((p) => !p.isPrivate).map((p) => [p.email, p.handle]));
  const votes = me ? await d.select({ id: schema.travellerUpdateVotes.updateId, value: schema.travellerUpdateVotes.value }).from(schema.travellerUpdateVotes)
    .where(and(eq(schema.travellerUpdateVotes.voter, me), inArray(schema.travellerUpdateVotes.updateId, rows.map((r) => r.id)))) : [];
  const myVote = new Map(votes.map((v) => [v.id, v.value]));
  const rank = (k: string) => (k === "alert" ? 0 : k === "warn" ? 1 : 2);
  return rows.map((r) => ({
    id: r.id, city: r.city, stop: r.stop, kind: r.kind as UpdateKind, text: r.text, place: r.place, lat: r.lat, lng: r.lng, hasPhoto: Boolean(r.hasPhoto), postId: r.postId,
    up: r.up, down: r.down, at: r.createdAt.toISOString(), expiresAt: r.expiresAt?.toISOString() ?? null,
    by: handle.get(r.author) ?? null, mine: me === r.author, myVote: myVote.get(r.id) ?? 0
  })).sort((a, b) => rank(a.kind) - rank(b.kind) || b.at.localeCompare(a.at));
}

/** "Ainda está" (1) ou "já não está" (-1). Um voto por pessoa (pode mudar). Não se vota nas próprias. */
export async function voteUpdate(id: string, voter: string, value: 1 | -1): Promise<{ up: number; down: number; hidden: boolean } | { error: "not_found" | "own" }> {
  const d = await db();
  const [u] = await d.select().from(schema.travellerUpdates).where(eq(schema.travellerUpdates.id, id)).limit(1);
  if (!u || u.status !== "live") return { error: "not_found" };
  if (u.author === voter) return { error: "own" };
  const [prev] = await d.select().from(schema.travellerUpdateVotes).where(and(eq(schema.travellerUpdateVotes.updateId, id), eq(schema.travellerUpdateVotes.voter, voter))).limit(1);
  if (prev?.value === value) return { up: u.up, down: u.down, hidden: false };
  if (prev) await d.update(schema.travellerUpdateVotes).set({ value }).where(and(eq(schema.travellerUpdateVotes.updateId, id), eq(schema.travellerUpdateVotes.voter, voter)));
  else await d.insert(schema.travellerUpdateVotes).values({ updateId: id, voter, value });
  const up = u.up + (value === 1 ? 1 : 0) - (prev?.value === 1 ? 1 : 0);
  const down = u.down + (value === -1 ? 1 : 0) - (prev?.value === -1 ? 1 : 0);
  const hidden = down >= 3 && down >= up * 2;
  const ext = value === 1 ? EXTEND_H[u.kind as UpdateKind] : undefined;
  const expiresAt = ext && u.expiresAt ? new Date(Math.max(u.expiresAt.getTime(), Date.now() + ext * 3600_000)) : u.expiresAt;
  await d.update(schema.travellerUpdates).set({ up, down, expiresAt, ...(hidden ? { status: "hidden" } : {}) }).where(eq(schema.travellerUpdates.id, id));
  return { up, down, hidden };
}

/** Denúncia: fica para a equipa rever (tabela de denúncias); 3 pessoas diferentes escondem logo. */
export async function reportUpdate(id: string, reporter: string, reason: string, note: string): Promise<{ ok: true; hidden: boolean } | { error: "not_found" }> {
  const d = await db();
  const [u] = await d.select().from(schema.travellerUpdates).where(eq(schema.travellerUpdates.id, id)).limit(1);
  if (!u) return { error: "not_found" };
  const key = `report:${reporter}`;
  const [prev] = await d.select().from(schema.travellerUpdateVotes).where(and(eq(schema.travellerUpdateVotes.updateId, id), eq(schema.travellerUpdateVotes.voter, key))).limit(1);
  if (prev) return { ok: true, hidden: u.status !== "live" };
  await d.insert(schema.travellerUpdateVotes).values({ updateId: id, voter: key, value: 0 });
  await d.insert(schema.reports).values({ reporter, target: u.author, reason: reason.slice(0, 40), note: `update:${id} ${note}`.slice(0, 500) });
  const reports = u.reports + 1;
  const hidden = reports >= HIDE_REPORTS;
  await d.update(schema.travellerUpdates).set({ reports, ...(hidden ? { status: "hidden" } : {}) }).where(eq(schema.travellerUpdates.id, id));
  return { ok: true, hidden };
}

/** O autor (ou a equipa) apaga. */
export async function removeUpdate(id: string, who: string, admin = false) {
  const d = await db();
  await d.update(schema.travellerUpdates).set({ status: "removed", photo: null })
    .where(admin ? eq(schema.travellerUpdates.id, id) : and(eq(schema.travellerUpdates.id, id), eq(schema.travellerUpdates.author, who)));
}

export async function updatePhoto(id: string): Promise<string | null> {
  const d = await db();
  const [u] = await d.select({ photo: schema.travellerUpdates.photo, status: schema.travellerUpdates.status }).from(schema.travellerUpdates).where(eq(schema.travellerUpdates.id, id)).limit(1);
  return u && u.status === "live" ? u.photo : null;
}
