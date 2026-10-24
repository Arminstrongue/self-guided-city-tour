import type Stripe from "stripe";
import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, schema } from "./db";
import { bookKind } from "./booking";

export function newRefCode(): string {
  return randomBytes(5).toString("base64url").replace(/[-_]/g, "x").slice(0, 7).toUpperCase();
}

/** Ativa o comerciante depois do primeiro pagamento da assinatura. Idempotente. */
export async function activateFromSession(session: Stripe.Checkout.Session): Promise<schema.Merchant | null> {
  const id = session.metadata?.merchantId;
  if (session.mode !== "subscription" || !id) return null;
  if (session.status !== "complete" || session.payment_status === "unpaid") return null;
  const d = await db();
  const [m] = await d.update(schema.merchants).set({
    status: "active",
    stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
    stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null
  }).where(eq(schema.merchants.id, id)).returning();
  return m ?? null;
}

/** Atualiza o estado do comerciante a partir de eventos da assinatura. */
export async function syncSubscription(sub: Stripe.Subscription): Promise<void> {
  const status: schema.Merchant["status"] =
    sub.status === "active" || sub.status === "trialing" ? "active"
      : sub.status === "past_due" || sub.status === "unpaid" ? "past_due"
        : sub.status === "canceled" || sub.status === "incomplete_expired" ? "cancelled" : "pending";
  const d = await db();
  await d.update(schema.merchants).set({ status }).where(eq(schema.merchants.stripeSubscriptionId, sub.id));
}

const offerCache = new Map<string, { at: number; v: Awaited<ReturnType<typeof loadOffers>> }>();
/** Ofertas ativas por cidade, em cache 60 s (lidas em cada abertura de roteiro). */
export async function activeOffers(cityId: string) {
  const hit = offerCache.get(cityId);
  if (hit && Date.now() - hit.at < 60_000) return hit.v;
  const v = await loadOffers(cityId);
  offerCache.set(cityId, { at: Date.now(), v });
  return v;
}

async function loadOffers(cityId: string) {
  const d = await db();
  const rows = await d.select().from(schema.merchants)
    .where(and(eq(schema.merchants.city, cityId), eq(schema.merchants.status, "active"), eq(schema.merchants.paused, false)));
  const rank = { partner: 0, featured: 1, basic: 2 } as const;
  return rows.sort((a, b) => rank[a.plan] - rank[b.plan]).map((m) => ({
    id: m.id, stopId: m.stopId, name: m.name, category: m.category, offer: m.offer,
    instagram: m.instagram, tiktok: m.tiktok, facebook: m.facebook, featured: m.plan !== "basic",
    photos: m.photoCount, book: m.bookMode === "request" ? bookKind(m.category) : null, options: m.bookOptions,
    bookingUrl: m.bookingUrl, phone: m.phone, address: m.address, lat: m.lat, lng: m.lng, hours: m.hours, rev: m.updatedAt ? m.updatedAt.getTime() : 0
  }));
}
export type Offer = Awaited<ReturnType<typeof loadOffers>>[number];

export async function merchantByRef(ref: string | null | undefined) {
  if (!ref) return null;
  const d = await db();
  const [m] = await d.select().from(schema.merchants).where(eq(schema.merchants.refCode, ref.toUpperCase())).limit(1);
  return m ?? null;
}
