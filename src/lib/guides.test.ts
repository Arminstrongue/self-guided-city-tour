import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";

test("ranking bayesiano e preço", async () => {
  const { rankScore, quote } = await import("./guides");
  assert.ok(rankScore(49 * 4.9, 49) > rankScore(5, 1)); // 49 avaliações de 4,9 batem 1 avaliação de 5
  assert.ok(rankScore(5, 1) > rankScore(0, 0));
  assert.deepEqual(quote(3500, 3), { amount: 10500, fee: 2100 }); // 20% para a plataforma
});

test("pedido → expira sem resposta; recusa liberta; avaliação só depois do passeio e uma vez", async () => {
  const { db, schema } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const g = await import("./guides");
  const { eq } = await import("drizzle-orm");
  const d = await db();
  await migrate(d as never, { migrationsFolder: "./drizzle" });
  const [guide] = await d.insert(schema.guides).values({ email: "ana@g.pt", name: "Ana", city: "lis", languages: ["pt", "en"], bio: "x".repeat(50), hourlyCents: 3000, status: "active", payoutsReady: true, stripeAccountId: "acct_1" }).returning();
  const mk = async (startIn: number) => (await d.insert(schema.guideBookings).values({ guideId: guide.id, email: "t@x.com", name: "Tom Smith", city: "lis", startAt: new Date(Date.now() + startIn), hours: 2, people: 2, amountCents: 6000, feeCents: 1200, locale: "en" }).returning())[0];

  // webhook: pendente → pedido (idempotente)
  const b1 = await mk(5 * 86400_000);
  const s = { metadata: { kind: "guide", bookingId: b1.id }, payment_intent: "pi_1" } as never;
  const r1 = await g.onGuideCheckout(s); const r2 = await g.onGuideCheckout(s);
  assert.equal(r1?.status, "requested"); assert.equal(r2?.status, "requested");
  assert.ok(r1!.respondBy!.getTime() <= Date.now() + 48 * 3600_000 + 1000);

  // horário ocupado
  assert.equal(await g.isSlotFree(guide.id, new Date(b1.startAt.getTime() + 3600_000), 2), false);
  assert.equal(await g.isSlotFree(guide.id, new Date(b1.startAt.getTime() + 3 * 3600_000), 2), true);

  // sem resposta no prazo → expira
  await d.update(schema.guideBookings).set({ respondBy: new Date(Date.now() - 1000) }).where(eq(schema.guideBookings.id, b1.id));
  assert.equal(await g.expireStale(), 1);
  assert.equal((await d.select().from(schema.guideBookings).where(eq(schema.guideBookings.id, b1.id)))[0].status, "expired");

  // recusa
  const b2 = await mk(3 * 86400_000);
  await g.onGuideCheckout({ metadata: { kind: "guide", bookingId: b2.id }, payment_intent: "pi_2" } as never);
  assert.equal((await g.respond(guide, b2.id, false) as { status?: string }).status, "declined");

  // avaliação: só com passeio confirmado e já começado, uma vez
  const b3 = await mk(-3 * 3600_000);
  await d.update(schema.guideBookings).set({ status: "confirmed" }).where(eq(schema.guideBookings.id, b3.id));
  const tok = g.reviewToken({ ...b3, status: "confirmed" });
  assert.deepEqual(await g.submitReview(b3.id, "forjado", 5, null), { error: "not_allowed" });
  assert.deepEqual(await g.submitReview(b3.id, tok, 5, "Fantástica"), { ok: true });
  assert.deepEqual(await g.submitReview(b3.id, tok, 1, "outra vez"), { error: "done" });
  const [after] = await d.select().from(schema.guides).where(eq(schema.guides.id, guide.id));
  assert.equal(after.ratingCount, 1); assert.equal(after.ratingSum, 5);
  assert.equal((await g.listGuides("lis"))[0].id, guide.id);
});

import { GuideSignup, missingLegal } from "./guide-input";
test("registo de guia exige dados profissionais e a declaração de independente", () => {
  const base = { name: "Ana Silva", email: "ana@x.pt", city: "lis", languages: ["pt"], bio: "x".repeat(60), hourly: 30, maxPeople: 6, locale: "pt", terms: true };
  const legal = { activityRegNo: "RNAAT 1234", insurer: "Fidelidade", policyNo: "AP-1", taxId: "123456789", taxCountry: "pt", address: "Rua A, 1, Lisboa", birthDate: "1990-01-31" };
  assert.equal(GuideSignup.safeParse(base).success, false);
  assert.equal(GuideSignup.safeParse({ ...base, ...legal }).success, false); // falta a declaração
  const ok = GuideSignup.safeParse({ ...base, ...legal, independent: true });
  assert.ok(ok.success);
  assert.equal(ok.success && ok.data.taxCountry, "PT");
  assert.deepEqual(missingLegal({ ...legal, insurer: " " }), ["insurer"]);
});

test("apresentação do guia: frases repetidas aparecem uma vez", async () => {
  const { dedupeText } = await import("./guide-input");
  const s = "Sou guia em Lisboa há 10 anos. Adoro história. Sou guia em Lisboa há 10 anos. Adoro história.";
  assert.equal(dedupeText(s), "Sou guia em Lisboa há 10 anos. Adoro história.");
  assert.equal(dedupeText("Olá.\n\nOlá, sou a Ana e mostro-lhe Alfama.\n\nOlá, sou a Ana e mostro-lhe Alfama."), "Olá.\n\nOlá, sou a Ana e mostro-lhe Alfama.");
});
