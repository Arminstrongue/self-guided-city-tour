/**
 * Marketplace de guias ("modelo Uber"): o guia regista-se e é aprovado; o turista escolhe o melhor avaliado,
 * pede uma data e paga na app. O cartão fica só autorizado; é cobrado quando o guia aceita (até 48 h) e
 * a Stripe Connect divide automaticamente: 80% para o guia, 20% para a plataforma.
 */
import type Stripe from "stripe";
import { cookies } from "next/headers";
import { and, asc, desc, eq, gt, inArray, lt, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { stripe } from "./stripe";
import { env } from "./env";
import { sendEmail } from "./email";
import { createPurposeToken, readPurposeToken } from "./access-token";
import { GUIDE_FEE, GUIDE_RESPOND_HOURS } from "./pricing";
import { COUNTRY } from "@/data/cities";
import { guideLinkMail, guideNewRequest, tourist } from "./guide-emails";

export const GUIDE_COOKIE = "sgct_guide";
export const GUIDE_LANGS = ["pt", "en", "es", "fr", "de", "it", "nl", "zh", "ar", "ja", "ru", "tr", "ko", "hi", "pl", "uk"] as const;

/** Média bayesiana: um guia novo com uma única nota 5 não passa à frente de quem tem 40 avaliações de 4,9. */
export function rankScore(sum: number, count: number, prior = 4.5, weight = 3) {
  return (prior * weight + sum) / (weight + count);
}
export const avgStars = (g: { ratingSum: number; ratingCount: number }) => (g.ratingCount ? g.ratingSum / g.ratingCount : null);

export function quote(hourlyCents: number, hours: number) {
  const amount = hourlyCents * hours;
  return { amount, fee: Math.round(amount * GUIDE_FEE) };
}

/* ---------- Sessão do guia ---------- */

export async function currentGuide(): Promise<schema.Guide | null> {
  const email = readPurposeToken(cookies().get(GUIDE_COOKIE)?.value, "guide");
  if (!email) return null;
  const d = await db();
  const [g] = await d.select().from(schema.guides).where(eq(schema.guides.email, email)).limit(1);
  return g ?? null;
}

export async function sendGuideLink(email: string, locale: string): Promise<string | null> {
  const link = `${env.appUrl}/api/guides/link?token=${encodeURIComponent(createPurposeToken(email, "guide", 30 * 24 * 3600))}&locale=${locale}`;
  const m = guideLinkMail(link);
  return (await sendEmail(email, m.subject, m.html)) ? null : link;
}

/* ---------- Listagem pública ---------- */

export async function listGuides(city: string) {
  const d = await db();
  const rows = await d.select().from(schema.guides)
    .where(and(eq(schema.guides.city, city), eq(schema.guides.status, "active"), eq(schema.guides.payoutsReady, true)));
  return rows.sort((a, b) => rankScore(b.ratingSum, b.ratingCount) - rankScore(a.ratingSum, a.ratingCount) || b.ratingCount - a.ratingCount);
}

export async function guideCounts(): Promise<Record<string, number>> {
  const d = await db();
  const rows = await d.select({ city: schema.guides.city, n: sql<number>`count(*)::int` }).from(schema.guides)
    .where(and(eq(schema.guides.status, "active"), eq(schema.guides.payoutsReady, true))).groupBy(schema.guides.city);
  return Object.fromEntries(rows.map((r) => [r.city, r.n]));
}

/** Perfil público. Com `preview`, mostra também perfis ainda não aprovados (só para o admin e o próprio guia). */
export async function publicGuide(id: string, preview = false) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const d = await db();
  const [g] = await d.select().from(schema.guides).where(eq(schema.guides.id, id)).limit(1);
  if (!g || (g.status !== "active" && !preview)) return null;
  const reviews = await d.select().from(schema.guideReviews).where(eq(schema.guideReviews.guideId, id)).orderBy(desc(schema.guideReviews.createdAt)).limit(30);
  return { guide: g, reviews };
}

/* ---------- Stripe Connect (contas Express) ---------- */

export async function payoutsLink(g: schema.Guide, locale: string) {
  const s = stripe();
  let acct = g.stripeAccountId;
  if (!acct) {
    const a = await s.accounts.create({
      type: "express", email: g.email, country: COUNTRY[g.city] ?? "PT", business_type: "individual",
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      business_profile: { product_description: "Walking tours for travellers booked through VOYBU", mcc: "4722", url: env.appUrl },
      metadata: { guideId: g.id }
    });
    acct = a.id;
    const d = await db();
    await d.update(schema.guides).set({ stripeAccountId: acct }).where(eq(schema.guides.id, g.id));
  }
  const link = await s.accountLinks.create({
    account: acct, type: "account_onboarding",
    refresh_url: `${env.appUrl}/${locale}/guides/portal?stripe=refresh`, return_url: `${env.appUrl}/${locale}/guides/portal?stripe=done`
  });
  return link.url;
}

/** Atualiza "pagamentos prontos" a partir da conta Stripe (sem precisar de webhook Connect). */
export async function syncPayouts(g: schema.Guide): Promise<boolean> {
  if (!g.stripeAccountId) return false;
  try {
    const a = await stripe().accounts.retrieve(g.stripeAccountId);
    const ready = Boolean(a.charges_enabled && a.payouts_enabled);
    if (ready !== g.payoutsReady) { const d = await db(); await d.update(schema.guides).set({ payoutsReady: ready }).where(eq(schema.guides.id, g.id)); }
    return ready;
  } catch (e) { console.error("syncPayouts", e); return g.payoutsReady; }
}

export async function payoutsDashboard(g: schema.Guide) {
  if (!g.stripeAccountId) return null;
  try { return (await stripe().accounts.createLoginLink(g.stripeAccountId)).url; } catch { return null; }
}

/* ---------- Reservas ---------- */

export type BookingInput = { startAt: Date; hours: number; people: number; email: string; name: string; phone?: string; note?: string; locale: string };

export async function createBooking(g: schema.Guide, b: BookingInput) {
  if (g.status !== "active" || !g.payoutsReady || !g.stripeAccountId) throw new Error("guide_unavailable");
  const { amount, fee } = quote(g.hourlyCents, b.hours);
  const d = await db();
  const [bk] = await d.insert(schema.guideBookings).values({
    guideId: g.id, email: b.email.toLowerCase(), name: b.name, phone: b.phone || null, city: g.city, startAt: b.startAt, hours: b.hours,
    people: b.people, amountCents: amount, feeCents: fee, note: b.note || null, locale: b.locale
  }).returning();
  const session = await stripe().checkout.sessions.create({
    mode: "payment", customer_email: b.email,
    locale: b.locale === "ar" ? "auto" : (b.locale as Stripe.Checkout.SessionCreateParams.Locale),
    line_items: [{ quantity: 1, price_data: { currency: "eur", unit_amount: amount, product_data: { name: `Guided walk with ${g.name} · ${b.hours} h · ${b.people} pax` } } }],
    payment_intent_data: {
      capture_method: "manual", application_fee_amount: fee, transfer_data: { destination: g.stripeAccountId },
      description: `Guide booking ${bk.id}`, metadata: { kind: "guide", bookingId: bk.id }
    },
    metadata: { kind: "guide", bookingId: bk.id },
    success_url: `${env.appUrl}/${b.locale}/g/${g.id}?booked=1`,
    cancel_url: `${env.appUrl}/${b.locale}/g/${g.id}`
  });
  await d.update(schema.guideBookings).set({ stripeSessionId: session.id }).where(eq(schema.guideBookings.id, bk.id));
  return { booking: bk, url: session.url };
}

async function cityTz(city: string) {
  const { loadCity } = await import("./content");
  return (await loadCity(city))?.tz;
}
const portalUrl = (locale = "pt") => `${env.appUrl}/${locale}/guides/portal`;
const othersUrl = (b: schema.GuideBooking) => `${env.appUrl}/${b.locale ?? "en"}/guides/${b.city}`;
const mailBooking = (b: schema.GuideBooking, g: schema.Guide, tz?: string) => ({ guide: g.name, when: b.startAt, tz, amountCents: b.amountCents, hours: b.hours, people: b.people, locale: b.locale });

/** Webhook: pagamento autorizado → pedido enviado ao guia, com prazo para responder. */
export async function onGuideCheckout(session: Stripe.Checkout.Session) {
  const id = session.metadata?.bookingId;
  if (!id) return null;
  const d = await db();
  const [b] = await d.select().from(schema.guideBookings).where(eq(schema.guideBookings.id, id)).limit(1);
  if (!b || b.status !== "pending") return b ?? null; // idempotente
  const respondBy = new Date(Math.min(Date.now() + GUIDE_RESPOND_HOURS * 3600_000, b.startAt.getTime() - 3600_000));
  const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
  const [nb] = await d.update(schema.guideBookings).set({ status: "requested", paymentIntentId: pi, respondBy }).where(and(eq(schema.guideBookings.id, id), eq(schema.guideBookings.status, "pending"))).returning();
  if (!nb) return b;
  const [g] = await d.select().from(schema.guides).where(eq(schema.guides.id, b.guideId)).limit(1);
  const tz = await cityTz(b.city);
  const toG = guideNewRequest({ ...mailBooking(nb, g, tz), tourist: b.name, note: b.note }, respondBy, portalUrl());
  await sendEmail(g.email, toG.subject, toG.html);
  const toT = tourist("req", mailBooking(nb, g, tz), { respondBy });
  await sendEmail(b.email, toT.subject, toT.html);
  return nb;
}

export function reviewToken(b: schema.GuideBooking) { return createPurposeToken(b.email, `review:${b.id}`, 60 * 24 * 3600); }
export const reviewUrl = (b: schema.GuideBooking) => `${env.appUrl}/${b.locale ?? "en"}/g/review?b=${b.id}&t=${encodeURIComponent(reviewToken(b))}`;

/** O guia aceita (cobra o cartão) ou recusa (liberta a autorização). */
export async function respond(g: schema.Guide, bookingId: string, accept: boolean) {
  // Guia suspenso ou recusado já não aceita reservas (não cobra cartões); recusar continua possível para libertar o cartão.
  if (accept && g.status !== "active") return { error: "state" as const };
  const d = await db();
  const [b] = await d.select().from(schema.guideBookings).where(and(eq(schema.guideBookings.id, bookingId), eq(schema.guideBookings.guideId, g.id))).limit(1);
  if (!b || b.status !== "requested" || !b.paymentIntentId) return { error: "state" as const };
  const tz = await cityTz(b.city);
  if (accept) {
    try { await stripe().paymentIntents.capture(b.paymentIntentId); } catch (e) { console.error("capture", e); return { error: "capture" as const }; }
    await d.update(schema.guideBookings).set({ status: "confirmed" }).where(eq(schema.guideBookings.id, b.id));
    const m = tourist("ok", mailBooking(b, g, tz), { meet: g.meetingPoint, contact: [g.phone, g.email].filter(Boolean).join(" · "), rateUrl: reviewUrl(b) });
    await sendEmail(b.email, m.subject, m.html);
    return { ok: true as const, status: "confirmed" as const };
  }
  try { await stripe().paymentIntents.cancel(b.paymentIntentId); } catch (e) { console.error("cancel", e); }
  await d.update(schema.guideBookings).set({ status: "declined" }).where(eq(schema.guideBookings.id, b.id));
  const m = tourist("no", mailBooking(b, g, tz), { othersUrl: othersUrl(b) });
  await sendEmail(b.email, m.subject, m.html);
  return { ok: true as const, status: "declined" as const };
}

/** Pedidos sem resposta no prazo expiram (corre quando o portal, a lista ou o admin abrem). */
export async function expireStale() {
  const d = await db();
  const stale = await d.select().from(schema.guideBookings).where(and(eq(schema.guideBookings.status, "requested"), lt(schema.guideBookings.respondBy, new Date()))).limit(50);
  for (const b of stale) {
    const [up] = await d.update(schema.guideBookings).set({ status: "expired" }).where(and(eq(schema.guideBookings.id, b.id), eq(schema.guideBookings.status, "requested"))).returning();
    if (!up) continue;
    if (b.paymentIntentId) { try { await stripe().paymentIntents.cancel(b.paymentIntentId); } catch (e) { console.error("expire cancel", e); } }
    const [g] = await d.select().from(schema.guides).where(eq(schema.guides.id, b.guideId)).limit(1);
    const m = tourist("no", mailBooking(b, g, await cityTz(b.city)), { othersUrl: othersUrl(b) });
    await sendEmail(b.email, m.subject, m.html);
  }
  // Pedidos abandonados no checkout (nunca pagos) deixam de contar.
  await d.update(schema.guideBookings).set({ status: "cancelled" })
    .where(and(eq(schema.guideBookings.status, "pending"), lt(schema.guideBookings.createdAt, new Date(Date.now() - 24 * 3600_000))));
  return stale.length;
}

export async function guideBookings(guideId: string) {
  const d = await db();
  return d.select().from(schema.guideBookings)
    .where(and(eq(schema.guideBookings.guideId, guideId), inArray(schema.guideBookings.status, ["requested", "confirmed", "completed", "declined", "expired", "refunded"])))
    .orderBy(asc(schema.guideBookings.startAt)).limit(200);
}

/* ---------- Avaliações (só depois do passeio, com link assinado do email) ---------- */

export async function reviewableBooking(bookingId: string, token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(bookingId)) return null;
  const d = await db();
  const [b] = await d.select().from(schema.guideBookings).where(eq(schema.guideBookings.id, bookingId)).limit(1);
  if (!b || readPurposeToken(token, `review:${b.id}`) !== b.email) return null;
  const [g] = await d.select().from(schema.guides).where(eq(schema.guides.id, b.guideId)).limit(1);
  const [existing] = await d.select().from(schema.guideReviews).where(eq(schema.guideReviews.bookingId, b.id)).limit(1);
  return { booking: b, guide: g, review: existing ?? null, started: b.startAt.getTime() <= Date.now(), confirmed: b.status === "confirmed" || b.status === "completed" };
}

export async function submitReview(bookingId: string, token: string, stars: number, comment: string | null) {
  const r = await reviewableBooking(bookingId, token);
  if (!r || !r.confirmed || !r.started) return { error: "not_allowed" as const };
  if (r.review) return { error: "done" as const };
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return { error: "invalid" as const };
  const d = await db();
  const ins = await d.insert(schema.guideReviews).values({
    bookingId, guideId: r.guide.id, stars, comment: comment?.trim().slice(0, 1000) || null, author: r.booking.name.split(/\s+/)[0]?.slice(0, 30) || null, locale: r.booking.locale
  }).onConflictDoNothing().returning();
  if (!ins.length) return { error: "done" as const };
  await d.update(schema.guides).set({ ratingSum: sql`${schema.guides.ratingSum} + ${stars}`, ratingCount: sql`${schema.guides.ratingCount} + 1` }).where(eq(schema.guides.id, r.guide.id));
  await d.update(schema.guideBookings).set({ status: "completed" }).where(eq(schema.guideBookings.id, bookingId));
  return { ok: true as const };
}

/** Datas ocupadas do guia (para evitar dois pedidos à mesma hora). */
export async function isSlotFree(guideId: string, startAt: Date, hours: number) {
  const d = await db();
  const end = new Date(startAt.getTime() + hours * 3600_000);
  const rows = await d.select({ s: schema.guideBookings.startAt, h: schema.guideBookings.hours }).from(schema.guideBookings)
    .where(and(eq(schema.guideBookings.guideId, guideId), inArray(schema.guideBookings.status, ["requested", "confirmed"]),
      gt(schema.guideBookings.startAt, new Date(startAt.getTime() - 12 * 3600_000)), lt(schema.guideBookings.startAt, end)));
  return !rows.some((r) => r.s.getTime() < end.getTime() && r.s.getTime() + r.h * 3600_000 > startAt.getTime());
}
