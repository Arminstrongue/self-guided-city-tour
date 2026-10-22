import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";

test("pagamento regista acesso e comissão uma única vez", async () => {
  const { db, schema } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const { fulfilTourSession, findActiveAccess } = await import("./orders");
  const { eq } = await import("drizzle-orm");
  const d = await db();
  await migrate(d as never, { migrationsFolder: "./drizzle" });
  const [mer] = await d.insert(schema.merchants).values({
    name: "Parceiro", category: "bag", city: "lis", stopId: "rossio", offer: "x", email: "p@x.com",
    plan: "partner", status: "active", refCode: "TEST01"
  }).returning();

  const session = {
    id: "cs_test_123", mode: "payment", payment_status: "paid", amount_total: 499, currency: "eur",
    customer_details: { email: "Viajante@Exemplo.com" },
    metadata: { plan: "city", city: "lis", name: "Ana", flightAt: "2030-01-01T18:00:00.000Z", locale: "pt", refMerchantId: mer.id }
  } as never;

  const a1 = await fulfilTourSession(session);
  const a2 = await fulfilTourSession(session);
  assert.ok(a1 && a2);
  assert.equal(a1.id, a2.id);
  assert.equal(a1.email, "viajante@exemplo.com");
  const comms = await d.select().from(schema.commissions).where(eq(schema.commissions.merchantId, mer.id));
  assert.equal(comms.length, 1);
  assert.equal(comms[0].amountCents, 100); // 20% de 4,99 €

  assert.ok(await findActiveAccess(["viajante@exemplo.com"], "lis"));
  // O passe só começa a contar na primeira abertura: até lá, 30 dias para abrir; depois, 48 h a partir de agora.
  assert.equal(a1.activatedAt, null);
  assert.ok(a1.expiresAt.getTime() > Date.now() + 29 * 24 * 3600_000);
  const { activateAccess } = await import("./orders");
  const act = await activateAccess(a1);
  assert.ok(act.activatedAt);
  assert.ok(Math.abs(act.expiresAt.getTime() - (Date.now() + 48 * 3600_000)) < 60_000);
  const again = await activateAccess(act);
  assert.equal(again.expiresAt.getTime(), act.expiresAt.getTime()); // não volta a contar
  assert.equal(await findActiveAccess(["viajante@exemplo.com"], "par"), null); // acesso só de cidade
  const unpaid = { ...(session as object), id: "cs_x", payment_status: "unpaid" } as never;
  assert.equal(await fulfilTourSession(unpaid), null);

  // Cliente paga em libras (Adaptive Pricing): regista-se o valor de origem em euros.
  const gbp = { ...(session as object), id: "cs_test_gbp", amount_total: 438, currency: "gbp",
    currency_conversion: { amount_subtotal: 499, amount_total: 499, fx_rate: "0.8778", source_currency: "eur" } } as never;
  const a3 = await fulfilTourSession(gbp);
  assert.equal(a3?.amountCents, 499);
  assert.equal(a3?.currency, "eur");
});
