import type Stripe from "stripe";
import { parseTrip } from "./trip";
import { and, desc, eq, gt, inArray, or, sql, isNull } from "drizzle-orm";
import { db, schema } from "./db";
import { PARTNER_COMMISSION, TOUR_PLANS, type TourPlan, ACTIVATE_DAYS } from "./pricing";
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

  // Ainda não começou a contar: expiresAt é o prazo para abrir o roteiro (a contagem começa na primeira abertura).
  const expiresAt = new Date(Date.now() + ACTIVATE_DAYS * 24 * 3600_000);
  const inserted = await d.insert(schema.accesses).values({
    email, userId: user.id, scope: plan === "all" ? "all" : "city", plan, city: m.city || null,
    flightAt: m.flightAt ? new Date(m.flightAt) : null, flightNo: m.flightNo || null, expiresAt,
    trip: (() => { try { return m.trip ? parseTrip(JSON.parse(m.trip)) : null; } catch { return null; } })(),
    // Com "Adaptive Pricing" o cliente paga na sua moeda; guardamos sempre o valor de origem (EUR).
    amountCents: session.currency_conversion?.amount_total ?? session.amount_total ?? TOUR_PLANS[plan].amount,
    currency: session.currency_conversion?.source_currency ?? session.currency ?? "eur",
    stripeSessionId: session.id, refMerchantId: m.refMerchantId || null, locale: m.locale || null,
    // Conta com sessão no momento da compra (definida no servidor, não pelo comprador): o passe segue essa conta.
    accountEmail: m.account && m.account.toLowerCase() !== email ? m.account.toLowerCase() : null
  }).onConflictDoNothing().returning();
  const access = inserted[0];
  if (!access) {
    const again = await d.select().from(schema.accesses).where(eq(schema.accesses.stripeSessionId, session.id)).limit(1);
    return again[0] ?? null;
  }

  await (await import("./referrals")).settleReferral(access, { refInviter: m.refInviter, creditUsed: m.creditUsed, creditHold: m.creditHold });
  // Nova cidade (e, para quem convidou, um amigo que pagou): pode trazer nível, medalha ou prémio.
  void import("./achievements").then((a) => Promise.all([a.checkAchievements(email), m.refInviter ? a.checkAchievements(m.refInviter) : null])).catch(() => {});

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
  const mail = accessEmail({ locale, name: m.name, place: city ? cityName(city, locale) : "All-Cities Pass", link, expiresAt, tz: city?.tz, startsOnOpen: { hours: TOUR_PLANS[plan].hours } });
  await sendEmail(email, mail.subject, mail.html, mail.text);
  return access;
}

/** Passes de uma conta: comprados com esse email ou ligados a ela (pagos com outro email). */
const ownedBy = (list: string[]) => or(inArray(schema.accesses.email, list), inArray(schema.accesses.accountEmail, list));

/** Liga a uma conta os passes comprados com outro email (depois de provar esse email com o código). */
export async function linkPassesToAccount(paidEmail: string, account: string): Promise<number> {
  const from = paidEmail.toLowerCase(), to = account.toLowerCase();
  if (!from || !to || from === to) return 0;
  const d = await db();
  const rows = await d.update(schema.accesses).set({ accountEmail: to }).where(eq(schema.accesses.email, from)).returning({ id: schema.accesses.id });
  return rows.length;
}

/** Liga um passe acabado de pagar à conta com sessão (quem pagou estava com sessão iniciada). */
export async function linkAccessToAccount(accessId: string, account: string) {
  const d = await db();
  await d.update(schema.accesses).set({ accountEmail: account.toLowerCase() }).where(and(eq(schema.accesses.id, accessId), isNull(schema.accesses.accountEmail)));
}

/** Reembolso ou contestação no Stripe: o passe deixa de dar acesso. */
export async function refundAccess(stripeSessionId: string): Promise<boolean> {
  const d = await db();
  const rows = await d.update(schema.accesses).set({ refundedAt: new Date(), expiresAt: new Date() })
    .where(and(eq(schema.accesses.stripeSessionId, stripeSessionId), isNull(schema.accesses.refundedAt))).returning({ id: schema.accesses.id });
  if (rows[0]) await d.delete(schema.commissions).where(eq(schema.commissions.accessId, rows[0].id)).catch(() => {});
  return rows.length > 0;
}

/** Acesso válido de qualquer um dos emails (ou da conta) para a cidade indicada. */
export async function findActiveAccess(emails: string[], cityId: string): Promise<schema.Access | null> {
  const list = [...new Set(emails.filter(Boolean).map((e) => e.toLowerCase()))];
  if (!list.length) return null;
  const d = await db();
  const rows = await d.select().from(schema.accesses).where(and(
    ownedBy(list),
    gt(schema.accesses.expiresAt, new Date()),
    isNull(schema.accesses.refundedAt),
    or(eq(schema.accesses.scope, "all"), eq(schema.accesses.city, cityId))
  )).orderBy(desc(schema.accesses.createdAt)).limit(20);
  // Um passe já a contar primeiro (não gastar outro); senão o que acaba primeiro.
  return rows.sort((a, b) => Number(Boolean(b.activatedAt)) - Number(Boolean(a.activatedAt)) || a.expiresAt.getTime() - b.expiresAt.getTime())[0] ?? null;
}

/** Cidades com passe ativo (uma só consulta para todas as cidades; "all" = todas). */
export async function activeCities(emails: string[]): Promise<{ all: boolean; cities: Set<string> }> {
  const list = [...new Set(emails.filter(Boolean).map((e) => e.toLowerCase()))];
  if (!list.length) return { all: false, cities: new Set() };
  const d = await db();
  const rows = await d.select({ scope: schema.accesses.scope, city: schema.accesses.city }).from(schema.accesses)
    .where(and(ownedBy(list), gt(schema.accesses.expiresAt, new Date()), isNull(schema.accesses.refundedAt))).limit(200);
  return { all: rows.some((r) => r.scope === "all"), cities: new Set(rows.map((r) => r.city).filter((c): c is string => Boolean(c))) };
}

/**
 * Primeira abertura de um roteiro: o passe começa a contar agora (48 h, 72 h ou 30 dias). Idempotente.
 * Um passe antigo (já ativado) fica como está.
 */
export async function activateAccess(a: schema.Access): Promise<schema.Access> {
  if (a.activatedAt) return a;
  const plan = (a.plan && a.plan in TOUR_PLANS ? a.plan : a.scope === "all" ? "all" : "city") as keyof typeof TOUR_PLANS;
  const now = new Date();
  const d = await db();
  const [u] = await d.update(schema.accesses).set({ activatedAt: now, expiresAt: new Date(now.getTime() + TOUR_PLANS[plan].hours * 3600_000) })
    .where(and(eq(schema.accesses.id, a.id), isNull(schema.accesses.activatedAt))).returning();
  return u ?? a;
}
