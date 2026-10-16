import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";

test("tokens com finalidade não se misturam", async () => {
  const { createAccessToken, createPurposeToken, readAccessToken, readPurposeToken } = await import("./access-token");
  const a = createAccessToken("x@y.com"), g = createPurposeToken("x@y.com", "agent");
  assert.equal(readAccessToken(a), "x@y.com");
  assert.equal(readPurposeToken(g, "agent"), "x@y.com");
  assert.equal(readPurposeToken(a, "agent"), null); // token de viajante não abre o portal
  assert.equal(readAccessToken(g), null);
});

test("comissão do comercial: 20% das faturas nos primeiros 12 meses, uma vez por fatura", async () => {
  const { db, schema } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const { commissionForInvoice, markLeadWon } = await import("./agents");
  const d = await db();
  await migrate(d as never, { migrationsFolder: "./drizzle" });
  const [ag] = await d.insert(schema.agents).values({ name: "Rui", email: "rui@x.com", code: "ATEST1", status: "active" }).returning();
  const [lead] = await d.insert(schema.leads).values({ agentId: ag.id, name: "Café Sol", kind: "cafe", email: "sol@x.com" }).returning();
  const [m] = await d.insert(schema.merchants).values({ name: "Café Sol", category: "cafe", city: "lis", stopId: "rossio", offer: "x", email: "sol@x.com", plan: "featured", status: "active", refCode: "R1", agentId: ag.id, stripeSubscriptionId: "sub_1" }).returning();
  await markLeadWon(m);
  const [l2] = await d.select().from(schema.leads).where((await import("drizzle-orm")).eq(schema.leads.id, lead.id));
  assert.equal(l2.status, "won");

  const now = Math.floor(Date.now() / 1000);
  const inv = { id: "in_1", subscription: "sub_1", amount_paid: 1900, created: now, status_transitions: { paid_at: now } } as never;
  assert.equal(await commissionForInvoice(inv), 380);
  assert.equal(await commissionForInvoice(inv), null); // repetição do webhook
  const late = now + 400 * 86400;
  assert.equal(await commissionForInvoice({ id: "in_2", subscription: "sub_1", amount_paid: 1900, created: late, status_transitions: { paid_at: late } } as never), null);
  assert.equal(await commissionForInvoice({ id: "in_3", subscription: "sub_x", amount_paid: 1900, created: now } as never), null);
});

test("plano de 3 dias (férias) sem voo", async () => {
  const { fulfilTourSession } = await import("./orders");
  const a = await fulfilTourSession({
    id: "cs_trip", mode: "payment", payment_status: "paid", amount_total: 799, currency: "eur",
    customer_details: { email: "f@x.com" }, metadata: { plan: "trip", city: "rom", flightAt: "", locale: "it" }
  } as never);
  assert.ok(a);
  assert.equal(a.plan, "trip"); assert.equal(a.flightAt, null);
  assert.ok(Math.abs(a.expiresAt.getTime() - Date.now() - 72 * 3600e3) < 60e3);
});

test("museus: aberto agora na hora local", async () => {
  const { MUSEUMS, openNow } = await import("../data/museums");
  const louvre = MUSEUMS.par.find((m) => m.id === "louvre-m")!;
  assert.equal(openNow(louvre, "Europe/Paris", new Date("2026-10-13T10:00:00Z")).open, false); // terça: fechado
  assert.equal(openNow(louvre, "Europe/Paris", new Date("2026-10-14T18:00:00Z")).open, true);  // quarta 20h: aberto até 21h
  for (const [city, list] of Object.entries(MUSEUMS)) for (const m of list) {
    assert.ok(m.h.length && m.url.startsWith("https://"), `${city}/${m.id}`);
  }
});
