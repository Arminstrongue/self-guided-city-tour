import type Stripe from "stripe";
import { and, desc, eq, gt, inArray, or, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { PARTNER_COMMISSION, TOUR_PLANS, type TourPlan } from "./pricing";
import { createAccessToken } from "./access-token";
import { sendEmail } from "./email";
import { accessEmail } from "./access-email";
import { env } from "./env";
import { cityName } from "@/data/cities";
import { loadCities } from "./content";
import { isLocale } from "@/i18n/core";
import type { Locale } from "@/i18n/dictionaries";

/**
 * Regista o acesso pago de uma sessão Stripe Checkout. Idempotente: pode ser chamado pelo
 * webhook e pelo regresso do cliente sem duplicar acessos nem comissões.
 */
export async function fulfilTourSession(session: Stripe.Checkout.Session): Promise<schema.Access | null> {
  if (session.mode !== "payment" || session.payment_status !== "paid") return null;
  const m = session.metadata ?? {};
  const plan = (m.plan in TOUR_PLANS ? m.plan : "city") as TourPlan;
  const email = (session.customer_details?.email ?? session.customer_email ?? m.email ?? "").toLowerCase();
  if (!email) return null;
  const d = await db();

  const existing = await d.select().from(schema.accesses).where(eq(schema.accesses.stripeSessionId, session.id)).limit(1);
  if (existing[0]) return existing[0];

  const [user] = await d.insert(schema.users).values({ email, name: m.name || null, locale: m.locale || null })
    .onConflictDoUpdate({ target: schema.users.email, set: { name: sql`coalesce(excluded.name, ${schema.users.name})` } }).returning();

  const expiresAt = new Date(Date.now() + TOUR_PLANS[plan].hours * 3600_000);
  const inserted = await d.insert(schema.accesses).values({
    email, userId: user.id, scope: plan === "all" ? "all" : "city", plan, city: m.city || null,
    flightAt: m.flightAt ? new Date(m.flightAt) : null, flightNo: m.flightNo || null, expiresAt,
    // Com "Adaptive Pricing" o cliente paga na sua moeda; guardamos sempre o valor de origem (EUR).
    amountCents: session.currency_conversion?.amount_total ?? session.amount_total ?? TOUR_PLANS[plan].amount,
    currency: session.currency_conversion?.source_currency ?? session.currency ?? "eur",
    stripeSessionId: session.id, refMerchantId: m.refMerchantId || null, locale: m.locale || null
  }).onConflictDoNothing().returning();
  const access = inserted[0];
  if (!access) {
    const again = await d.select().from(schema.accesses).where(eq(schema.accesses.stripeSessionId, session.id)).limit(1);
    return again[0] ?? null;
  }

  await (await import("./referrals")).settleReferral(access, { refInviter: m.refInviter, creditUsed: m.creditUsed });

  if (access.refMerchantId) {
    const [mer] = await d.select().from(schema.merchants).where(eq(schema.merchants.id, access.refMerchantId)).limit(1);
    if (mer && mer.plan === "partner" && mer.status === "active") {
      await d.insert(schema.commissions).values({
        merchantId: mer.id, accessId: access.id, amountCents: Math.round(access.amountCents * PARTNER_COMMISSION)
      }).onConflictDoNothing();
    }
  }

  const locale: Locale = m.locale && isLocale(m.locale) ? m.locale : "en";
  const city = access.city ? (await loadCities({ includeInactive: true })).find((c) => c.id === access.city) : undefined;
  const link = `${env.appUrl}/api/access/link?token=${encodeURIComponent(createAccessToken(email))}&locale=${locale}${city ? `&city=${city.id}` : ""}`;
  const mail = accessEmail({ locale, name: m.name, place: city ? cityName(city, locale) : "All-Cities Pass", link, expiresAt, tz: city?.tz });
  await sendEmail(email, mail.subject, mail.html, mail.text);
  return access;
}

/** Acesso válido mais recente de qualquer um dos emails para a cidade indicada. */
export async function findActiveAccess(emails: string[], cityId: string): Promise<schema.Access | null> {
  const list = [...new Set(emails.filter(Boolean).map((e) => e.toLowerCase()))];
  if (!list.length) return null;
  const d = await db();
  const rows = await d.select().from(schema.accesses).where(and(
    inArray(schema.accesses.email, list),
    gt(schema.accesses.expiresAt, new Date()),
    or(eq(schema.accesses.scope, "all"), eq(schema.accesses.city, cityId))
  )).orderBy(desc(schema.accesses.createdAt)).limit(1);
  return rows[0] ?? null;
}

