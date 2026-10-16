import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";

test("conteúdo de origem é válido e as edições do painel substituem-no", async () => {
  const { CITIES } = await import("../data/cities");
  const { CitySchema, loadCity, loadCities, saveCity, resetCity } = await import("./content");
  const { db } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  for (const c of CITIES) assert.ok(CitySchema.safeParse(c).success, c.id);
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });

  const lis = structuredClone(CITIES[0]);
  lis.single = 2.0;
  await saveCity(lis, true, "admin@test");
  assert.equal((await loadCity("lis"))?.single, 2.0);

  await saveCity({ ...lis, id: "pra", stops: lis.stops.slice(0, 4) }, false, "admin@test");
  assert.equal(await loadCity("pra"), undefined);                       // inativa não aparece
  assert.ok((await loadCities({ includeInactive: true })).some((c) => c.id === "pra"));

  await resetCity("lis");
  assert.equal((await loadCity("lis"))?.single, 1.9);
  assert.equal(CitySchema.safeParse({ ...lis, stops: [] }).success, false);
});
