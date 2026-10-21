import type Stripe from "stripe";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { createPurposeToken, readPurposeToken } from "./access-token";
import { AGENT_COMMISSION, AGENT_MONTHS } from "./pricing";
import { env } from "./env";
import { sendEmail } from "./email";

export const AGENT_COOKIE = "sgct_agent";
export const LEAD_KINDS = ["shop", "food", "cafe", "guesthouse", "hotel", "exp", "company", "other"] as const;
export const LEAD_STATUSES = ["new", "contacted", "proposal", "won", "lost"] as const;

export function newAgentCode(): string {
  return "A" + randomBytes(5).toString("base64url").replace(/[-_]/g, "x").slice(0, 6).toUpperCase();
}

/** Comercial com sessão iniciada (cookie assinado com finalidade "agent"). */
export async function currentAgent(): Promise<schema.Agent | null> {
  const email = readPurposeToken(cookies().get(AGENT_COOKIE)?.value, "agent");
  if (!email) return null;
  const d = await db();
  const [a] = await d.select().from(schema.agents).where(eq(schema.agents.email, email)).limit(1);
  return a && a.status !== "suspended" ? a : null;
}

export async function agentByCode(code: string | null | undefined) {
  if (!code) return null;
  const d = await db();
  const [a] = await d.select().from(schema.agents).where(eq(schema.agents.code, code.toUpperCase())).limit(1);
  return a ?? null;
}

/** Envia (ou devolve, em desenvolvimento sem email) o link de entrada no portal. */
export async function sendAgentLink(email: string, locale: string): Promise<string | null> {
  const link = `${env.appUrl}/api/agents/link?token=${encodeURIComponent(createPurposeToken(email, "agent", 30 * 24 * 3600))}&locale=${locale}`;
  const sent = await sendEmail(email, "HelloTravell — portal de comerciais / partner portal",
    `<p>Entre no portal / Open the portal:</p><p><a href="${link}">${link}</a></p>`);
  return sent ? null : link;
}

/**
 * Comissão do comercial numa fatura de assinatura paga: 20% do valor (em euros),
 * só nos primeiros 12 meses desde a criação do cliente. Idempotente por fatura.
 */
export async function commissionForInvoice(inv: Stripe.Invoice): Promise<number | null> {
  // Versões da API até 2025-02 usam inv.subscription; a partir de 2025-03 ("basil") passa para inv.parent.subscription_details.
  const legacy = (inv as { subscription?: string | { id: string } | null }).subscription;
  const parent = (inv as { parent?: { subscription_details?: { subscription?: string | { id: string } | null } | null } | null }).parent?.subscription_details?.subscription;
  const ref = legacy ?? parent;
  const subId = typeof ref === "string" ? ref : ref?.id;
  if (!subId || !inv.amount_paid) return null;
  const d = await db();
  const [m] = await d.select().from(schema.merchants).where(eq(schema.merchants.stripeSubscriptionId, subId)).limit(1);
  if (!m?.agentId) return null;
  const limit = new Date(m.createdAt); limit.setMonth(limit.getMonth() + AGENT_MONTHS);
  const paidAt = new Date((inv.status_transitions?.paid_at ?? inv.created) * 1000);
  if (paidAt > limit) return null;
  const cents = Math.round(inv.amount_paid * AGENT_COMMISSION);
  const rows = await d.insert(schema.agentCommissions).values({
    agentId: m.agentId, merchantId: m.id, stripeInvoiceId: inv.id, amountCents: cents,
    description: `${m.name} · ${paidAt.toISOString().slice(0, 7)}`
  }).onConflictDoNothing().returning();
  return rows[0] ? cents : null;
}

/** Quando um comerciante angariado ativa a assinatura, o negócio na carteira passa a "fechado". */
export async function markLeadWon(merchant: schema.Merchant) {
  if (!merchant.agentId) return;
  const d = await db();
  await d.update(schema.leads).set({ status: "won", merchantId: merchant.id, updatedAt: new Date() })
    .where(and(eq(schema.leads.agentId, merchant.agentId), isNull(schema.leads.merchantId), sql`lower(${schema.leads.email}) = ${merchant.email.toLowerCase()}`));
}

export async function agentSummary(agentId: string) {
  const d = await db();
  const comm = await d.select().from(schema.agentCommissions).where(eq(schema.agentCommissions.agentId, agentId));
  const clients = await d.select().from(schema.merchants).where(eq(schema.merchants.agentId, agentId));
  const leads = await d.select().from(schema.leads).where(eq(schema.leads.agentId, agentId)).orderBy(sql`${schema.leads.updatedAt} desc`);
  const due = comm.filter((c) => !c.paidAt).reduce((a, c) => a + c.amountCents, 0);
  const paid = comm.filter((c) => c.paidAt).reduce((a, c) => a + c.amountCents, 0);
  return { comm, clients, leads, due, paid };
}
