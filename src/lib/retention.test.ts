import { test } from "node:test";
import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
process.env.DATABASE_URL = "pglite:memory";

test("conservação: apaga contagens antigas e mantém as recentes", async () => {
  const { db, schema } = await import("./db");
  const { purgeOld, RETENTION } = await import("./retention");
  const d = await db();
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate(d as never, { migrationsFolder: "./drizzle" });
  const old = new Date(Date.now() - (RETENTION.eventsDays + 5) * 86_400_000);
  await d.insert(schema.events).values([{ name: "view_city", city: "zzold", createdAt: old }, { name: "view_city", city: "zznew" }]);
  const r = await purgeOld();
  assert.ok(r.events >= 1);
  assert.equal((await d.select().from(schema.events).where(eq(schema.events.city, "zzold"))).length, 0);
  assert.equal((await d.select().from(schema.events).where(eq(schema.events.city, "zznew"))).length, 1);
});
