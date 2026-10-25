/**
 * Programa de convites: quem chega por convite tem REFERRAL_FRIEND_PCT % de desconto no primeiro passe;
 * quem convidou ganha REFERRAL_REWARD_CENTS de crédito quando esse amigo paga. O crédito desconta-se
 * sozinho no passe seguinte de quem convidou (sempre deixando o mínimo que o Stripe cobra).
 */
import { randomUUID } from "node:crypto";
import { and, desc, eq, gt, gte, ne, or, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { REFERRAL_FRIEND_PCT, REFERRAL_REWARD_CENTS, STRIPE_MIN_CENTS } from "./pricing";

const norm = (e: string) => e.trim().toLowerCase();

/** Já comprou algum passe pago? (o desconto de amigo é só para o primeiro) */
async function hasPaid(email: string) {
  const d = await db();
  const r = await d.select({ id: schema.accesses.id }).from(schema.accesses).where(and(eq(schema.accesses.email, norm(email)), gt(schema.accesses.amountCents, 0))).limit(1);
  return r.length > 0;
}

/** Quem convidou este comprador: pelo cookie do link de convite, ou pelo convite aceite quando criou o perfil. */
export async function inviterOf(buyerEmail: string | null, refHandle: string | null | undefined): Promise<{ email: string; handle: string } | null> {
  const d = await db();
  let inv: { email: string; handle: string } | undefined;
  if (refHandle && /^[a-z0-9._]{3,24}$/.test(refHandle)) {
    [inv] = await d.select({ email: schema.travellerProfiles.email, handle: schema.travellerProfiles.handle }).from(schema.travellerProfiles).where(eq(schema.travellerProfiles.handle, refHandle)).limit(1);
  }
  if (!inv && buyerEmail) {
    const [row] = await d.select({ email: schema.invites.inviter }).from(schema.invites).where(eq(schema.invites.joinedEmail, norm(buyerEmail))).orderBy(desc(schema.invites.joinedAt)).limit(1);
    if (row) [inv] = await d.select({ email: schema.travellerProfiles.email, handle: schema.travellerProfiles.handle }).from(schema.travellerProfiles).where(eq(schema.travellerProfiles.email, row.email)).limit(1);
  }
  if (!inv || (buyerEmail && norm(inv.email) === norm(buyerEmail))) return null;
  return inv;
}

export async function creditBalance(email: string) {
  const d = await db();
  // Reservas de pagamentos ainda em curso contam (não se gasta o mesmo crédito duas vezes); as de sessões
  // Stripe já expiradas (> 25 h) deixam de contar mesmo que o aviso de expiração não chegue.
  const fresh = or(ne(schema.referralCredits.kind, "hold"), gte(schema.referralCredits.createdAt, new Date(Date.now() - HOLD_MS)));
  const [r] = await d.select({ n: sql<number>`coalesce(sum(${schema.referralCredits.amountCents}), 0)::int` }).from(schema.referralCredits).where(and(eq(schema.referralCredits.email, norm(email)), fresh));
  return Math.max(0, r?.n ?? 0);
}

export async function referralStats(email: string) {
  const d = await db();
  const [r] = await d.select({ n: sql<number>`count(*)::int`, sum: sql<number>`coalesce(sum(${schema.referralCredits.amountCents}), 0)::int` }).from(schema.referralCredits)
    .where(and(eq(schema.referralCredits.email, norm(email)), eq(schema.referralCredits.kind, "earned")));
  return { paidFriends: r?.n ?? 0, earned: r?.sum ?? 0, credit: await creditBalance(email), friendPct: REFERRAL_FRIEND_PCT, reward: REFERRAL_REWARD_CENTS };
}

/**
 * Preço final de um passe: desconto de amigo convidado (primeira compra) e crédito de convites
 * (só quando quem compra está com sessão iniciada com o mesmo email).
 */
export async function quote(o: { amount: number; buyerEmail: string | null; refHandle?: string | null; signedEmail?: string | null }) {
  let amount = o.amount;
  let friendOff = 0, creditUsed = 0;
  let inviter: { email: string; handle: string } | null = null;
  if (!o.buyerEmail || !(await hasPaid(o.buyerEmail))) {
    inviter = await inviterOf(o.buyerEmail, o.refHandle);
    if (inviter) { friendOff = Math.round(amount * REFERRAL_FRIEND_PCT / 100); amount -= friendOff; }
  }
  if (o.signedEmail && o.buyerEmail && norm(o.signedEmail) === norm(o.buyerEmail)) {
    creditUsed = Math.min(await creditBalance(o.buyerEmail), Math.max(0, amount - STRIPE_MIN_CENTS));
    amount -= creditUsed;
  }
  return { amount, friendOff, creditUsed, inviter };
}

const HOLD_MS = 25 * 3600_000;
/**
 * Reserva o crédito usado num pagamento antes de abrir o Stripe. Grava primeiro e confirma depois o saldo:
 * dois pagamentos abertos ao mesmo tempo não conseguem usar o mesmo crédito. Devolve a chave da reserva ou null.
 */
export async function holdCredit(email: string, cents: number): Promise<string | null> {
  if (cents <= 0) return null;
  const d = await db();
  const key = randomUUID();
  await d.insert(schema.referralCredits).values({ email: norm(email), amountCents: -cents, kind: "hold", accessId: key });
  const d2 = await db();
  const [r] = await d2.select({ n: sql<number>`coalesce(sum(${schema.referralCredits.amountCents}), 0)::int` }).from(schema.referralCredits)
    .where(and(eq(schema.referralCredits.email, norm(email)), or(ne(schema.referralCredits.kind, "hold"), gte(schema.referralCredits.createdAt, new Date(Date.now() - HOLD_MS)))));
  if ((r?.n ?? 0) < 0) { await releaseHold(key); return null; }
  return key;
}
export async function releaseHold(key: string | null | undefined) {
  if (!key || !/^[0-9a-f-]{36}$/.test(key)) return;
  const d = await db();
  await d.delete(schema.referralCredits).where(and(eq(schema.referralCredits.accessId, key), eq(schema.referralCredits.kind, "hold")));
}

/** Depois do pagamento (idempotente por acesso): crédito para quem convidou e débito do crédito usado. */
export async function settleReferral(access: { id: string; email: string }, meta: { refInviter?: string; creditUsed?: string; creditHold?: string }) {
  const d = await db();
  await releaseHold(meta.creditHold); // a reserva passa a gasto definitivo (abaixo)
  if (meta.refInviter && norm(meta.refInviter) !== norm(access.email)) {
    await d.insert(schema.referralCredits).values({ email: norm(meta.refInviter), amountCents: REFERRAL_REWARD_CENTS, kind: "earned", accessId: access.id, friend: norm(access.email) }).onConflictDoNothing();
  }
  const used = Number(meta.creditUsed ?? 0);
  if (used > 0) await d.insert(schema.referralCredits).values({ email: norm(access.email), amountCents: -used, kind: "spent", accessId: access.id }).onConflictDoNothing();
}

/** RGPD: ao apagar a conta. */
export async function purgeReferrals(email: string) {
  const d = await db();
  await d.delete(schema.referralCredits).where(eq(schema.referralCredits.email, norm(email)));
  await d.update(schema.referralCredits).set({ friend: null }).where(eq(schema.referralCredits.friend, norm(email)));
}
