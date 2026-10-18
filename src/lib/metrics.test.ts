import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";

test("NPS e validação da avaliação", async () => {
  const { npsScore, validRating, isEvent } = await import("./metrics");
  assert.equal(npsScore([10, 9, 8, 6]), 25); // 2 promotores − 1 detrator em 4
  assert.equal(npsScore([]), null);
  assert.equal(validRating({ stars: 6 }), null);
  assert.equal(validRating({ stars: 4, nps: 11 }), null);
  assert.deepEqual(validRating({ stars: 5, nps: 10, comment: "  Ótimo  ", locale: "pt" }), { stars: 5, nps: 10, comment: "Ótimo", locale: "pt" });
  assert.ok(isEvent("tour_done") && !isEvent("drop_table"));
});

test("funil, receita e avaliações no painel", async () => {
  const { db, schema } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const { track, saveRating, dashboard } = await import("./metrics");
  const d = await db();
  await migrate(d as never, { migrationsFolder: "./drizzle" });
  for (let i = 0; i < 10; i++) await track({ name: "view_city", city: "lis" });
  await track({ name: "checkout_start", city: "lis" });
  await track({ name: "tour_open", city: "lis'; drop table x;--" }); // limpo, nunca injeta
  const [a] = await d.insert(schema.accesses).values({ email: "a@b.c", scope: "city", city: "lis", expiresAt: new Date(Date.now() + 86400_000), amountCents: 499, stripeSessionId: "cs_1" }).returning();
  await saveRating(a.id, "lis", { stars: 4, nps: 9, comment: "Bom", locale: "pt" });
  await saveRating(a.id, "lis", { stars: 5, nps: 10, comment: "Excelente", locale: "pt" }); // corrige, não duplica
  const m = await dashboard(30);
  assert.equal(m.funnel.find((f) => f.key === "view_city")?.n, 10);
  assert.equal(m.purchases, 1);
  assert.equal(m.revenue, 499);
  assert.equal(m.stars, 5);
  assert.equal(m.nps, 100);
  assert.equal(m.byCity.find((c) => c.city === "lis")?.purchases, 1);
  assert.equal(m.comments[0].comment, "Excelente");
});
