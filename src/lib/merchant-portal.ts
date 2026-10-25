/**
 * Área do comerciante: o próprio negócio entra com um link enviado para o email do registo e gere a oferta,
 * o horário, as fotos, as reservas e a pausa do anúncio. Nome, categoria e morada continuam com a equipa
 * (para o anúncio continuar verificado: só negócios registados aparecem na app).
 */
import { cookies } from "next/headers";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "./db";
import { createPurposeToken, readPurposeToken } from "./access-token";
import { env } from "./env";
import { sendEmail } from "./email";
import { BookOption, MAX_OPTIONS, MAX_PHOTOS, bookKind, cleanPhone, cleanUrl, isPhotoDataUrl } from "./booking";
import { moderate } from "./moderation";

export const MERCHANT_COOKIE = "sgct_merchant";
export const MERCHANT_TTL_S = 30 * 24 * 3600;
const LINK_TTL_S = 30 * 60; // o link do email vale 30 min; a sessão, 30 dias

export async function currentMerchantEmail(): Promise<string | null> {
  return readPurposeToken((await cookies()).get(MERCHANT_COOKIE)?.value, "merchant");
}
export const sessionToken = (email: string) => createPurposeToken(email, "merchant", MERCHANT_TTL_S);
export const readLinkToken = (t: string | null) => readPurposeToken(t, "merchant-link");

/** Envia o link só se houver negócios com este email; a resposta ao pedido é sempre igual (não revela quem está registado). */
export async function sendMerchantLink(email: string, locale: string): Promise<{ sent: boolean; link: string | null }> {
  const e = email.trim().toLowerCase();
  const d = await db();
  const [m] = await d.select({ id: schema.merchants.id }).from(schema.merchants).where(eq(schema.merchants.email, e)).limit(1);
  if (!m) return { sent: false, link: null };
  const link = `${env.appUrl}/api/merchants/link?token=${encodeURIComponent(createPurposeToken(e, "merchant-link", LINK_TTL_S))}&locale=${locale}`;
  const ok = await sendEmail(e, "VOYBU — Área do comerciante / Business area",
    `<p>Entre na Área do comerciante / Open your business area:</p><p><a href="${link}">${link}</a></p><p style="color:#666">O link vale 30 minutos. Se não foi você, ignore este email. / The link is valid for 30 minutes. If this wasn't you, ignore this email.</p>`);
  return { sent: ok, link: ok ? null : link };
}

export async function merchantsOf(email: string) {
  const d = await db();
  return d.select().from(schema.merchants).where(eq(schema.merchants.email, email.toLowerCase())).orderBy(desc(schema.merchants.createdAt));
}
export async function ownMerchant(email: string, id: string) {
  const d = await db();
  const [m] = await d.select().from(schema.merchants).where(and(eq(schema.merchants.id, id), eq(schema.merchants.email, email.toLowerCase()))).limit(1);
  return m ?? null;
}

/** Vistas, contactos e pedidos dos últimos 30 dias, por negócio. */
export async function statsFor(ids: string[]) {
  const out: Record<string, { views: number; taps: number; bookings: number }> = {};
  for (const id of ids) out[id] = { views: 0, taps: 0, bookings: 0 };
  if (!ids.length) return out;
  const d = await db();
  const since = new Date(Date.now() - 30 * 86400_000);
  const ev = await d.select({ stop: schema.events.stop, name: schema.events.name, n: sql<number>`count(*)::int` }).from(schema.events)
    .where(and(inArray(schema.events.stop, ids), inArray(schema.events.name, ["offer_view", "offer_tap"]), gte(schema.events.createdAt, since)))
    .groupBy(schema.events.stop, schema.events.name);
  for (const r of ev) if (r.stop && out[r.stop]) out[r.stop][r.name === "offer_view" ? "views" : "taps"] = Number(r.n);
  const bk = await d.select({ id: schema.bookingRequests.merchantId, n: sql<number>`count(*)::int` }).from(schema.bookingRequests)
    .where(and(inArray(schema.bookingRequests.merchantId, ids), gte(schema.bookingRequests.createdAt, since))).groupBy(schema.bookingRequests.merchantId);
  for (const r of bk) if (out[r.id]) out[r.id].bookings = Number(r.n);
  return out;
}

export async function bookingsOf(ids: string[]) {
  if (!ids.length) return [];
  const d = await db();
  return d.select().from(schema.bookingRequests).where(inArray(schema.bookingRequests.merchantId, ids)).orderBy(desc(schema.bookingRequests.createdAt)).limit(40);
}

const handle = z.string().max(120).transform((s) => s.trim().replace(/^@/, "").replace(/[^\w.\-]/g, "") || null);
/** Campos que o negócio pode mudar sozinho. Fotos: "keep:<n>" mantém a foto n atual; data URL acrescenta uma nova. */
export const MerchantPatch = z.object({
  id: z.guid(),
  offer: z.string().trim().min(3).max(140).optional(),
  hours: z.string().trim().max(160).optional(),
  phone: z.string().max(30).optional(),
  bookingUrl: z.string().max(300).optional(),
  instagram: handle.optional(), tiktok: handle.optional(), facebook: handle.optional(),
  bookMode: z.enum(["none", "request"]).optional(),
  bookOptions: z.array(BookOption).max(MAX_OPTIONS).optional(),
  paused: z.boolean().optional(),
  photos: z.array(z.string()).min(1).max(MAX_PHOTOS).optional()
});
export type MerchantPatchInput = z.infer<typeof MerchantPatch>;

/** Aplica as alterações de um negócio do próprio dono. Devolve um erro curto ou null. */
export async function applyPatch(email: string, p: MerchantPatchInput): Promise<"not_found" | "offensive" | "photo" | null> {
  const m = await ownMerchant(email, p.id);
  if (!m) return "not_found";
  const set: Partial<typeof schema.merchants.$inferInsert> = { updatedAt: new Date() };
  for (const k of ["offer", "hours"] as const) {
    const v = p[k];
    if (v === undefined) continue;
    if (!v) { if (k === "hours") set.hours = null; continue; }
    const r = moderate(v);
    if (!r.ok) return "offensive";
    set[k] = r.text;
  }
  if (p.phone !== undefined) set.phone = cleanPhone(p.phone);
  if (p.bookingUrl !== undefined) set.bookingUrl = cleanUrl(p.bookingUrl);
  for (const k of ["instagram", "tiktok", "facebook"] as const) if (p[k] !== undefined) set[k] = p[k];
  const bookable = bookKind(m.category) !== null;
  if (p.bookMode !== undefined) set.bookMode = bookable ? p.bookMode : "none";
  if (p.bookOptions !== undefined) {
    if (p.bookOptions.some((o) => !moderate(`${o.name} ${o.price}`, false).ok)) return "offensive";
    set.bookOptions = bookable ? p.bookOptions.filter((o) => o.name) : [];
  }
  if (p.paused !== undefined) set.paused = p.paused;
  const d = await db();
  if (p.photos) {
    const cur = await d.select().from(schema.merchantPhotos).where(eq(schema.merchantPhotos.merchantId, m.id));
    const byIdx = new Map(cur.map((x) => [x.idx, x.data]));
    const next: string[] = [];
    for (const s of p.photos) {
      const keep = /^keep:(\d)$/.exec(s);
      if (keep) { const v = byIdx.get(Number(keep[1])); if (v) next.push(v); }
      else if (isPhotoDataUrl(s)) next.push(s);
      else return "photo";
    }
    if (!next.length) return "photo";
    await d.delete(schema.merchantPhotos).where(eq(schema.merchantPhotos.merchantId, m.id));
    await d.insert(schema.merchantPhotos).values(next.map((data, idx) => ({ merchantId: m.id, idx, data })));
    set.photoCount = next.length;
  }
  await d.update(schema.merchants).set(set).where(eq(schema.merchants.id, m.id));
  return null;
}

/** O negócio marca um pedido de reserva como confirmado ou recusado (o viajante continua a ser contactado por email). */
export async function setBookingStatus(email: string, bookingId: string, status: "confirmed" | "declined") {
  const d = await db();
  const [b] = await d.select({ id: schema.bookingRequests.id, merchantId: schema.bookingRequests.merchantId }).from(schema.bookingRequests).where(eq(schema.bookingRequests.id, bookingId)).limit(1);
  if (!b || !(await ownMerchant(email, b.merchantId))) return false;
  await d.update(schema.bookingRequests).set({ status }).where(eq(schema.bookingRequests.id, bookingId));
  return true;
}
