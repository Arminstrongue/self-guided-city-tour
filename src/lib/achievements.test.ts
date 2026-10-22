import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";
process.env.SGCT_NO_OFFICIAL = "1";

test("conquistas: anunciadas uma vez, contas antigas em silêncio, textos", async () => {
  const { db, schema } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const p = await import("./points");
  const a = await import("./achievements");
  const n = await import("./notify");
  const { OFFICIAL_EMAIL, OFFICIAL_HANDLE } = await import("./official");
  const { achievementText } = await import("./achievement-text");
  const { getDict } = await import("@/i18n/dictionaries");
  await s.saveProfile(OFFICIAL_EMAIL, { handle: OFFICIAL_HANDLE, name: "VOYBU", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("ana@x.com", { handle: "ana", name: "Ana", bio: "", photo: null, isPrivate: false });

  // Conta nova: 1.ª cidade → medalha; repetir não volta a avisar.
  await p.checkIn("ana@x.com", "lis", "rossio", { lat: 38.7139, lng: -9.1394 });
  assert.deepEqual(await a.checkAchievements("ana@x.com"), ["badge:first-city"]);
  assert.deepEqual(await a.checkAchievements("ana@x.com"), []);
  // 2.ª cidade → passa os 200 pontos → nível 1.
  await p.checkIn("ana@x.com", "opo", "ribeira");
  assert.deepEqual(await a.checkAchievements("ana@x.com"), ["level:1"]);
  const list = await n.listNotifs("ana@x.com");
  assert.deepEqual(list.filter((x) => x.type === "achievement").map((x) => x.text).sort(), ["badge:first-city", "level:1"]);
  assert.equal(list[0].actor.handle, OFFICIAL_HANDLE, "assinado pela conta oficial");

  // Conta que já existia antes da funcionalidade: 1.ª verificação regista em silêncio; depois avisa normalmente.
  const d = await db();
  await d.insert(schema.achievements).values({ email: "old@x.com", key: "legacy" });
  await p.checkIn("old@x.com", "lis", "rossio");
  assert.deepEqual(await a.checkAchievements("old@x.com"), []);
  await p.checkIn("old@x.com", "opo", "ribeira");
  assert.deepEqual(await a.checkAchievements("old@x.com"), ["level:1"]);

  // Textos (push e centro de notificações).
  const en = getDict("en");
  assert.match(achievementText("level:1", en), /Level 2.*Explorer/);
  assert.match(achievementText("badge:first-city", en), /badge/i);
  assert.match(achievementText("reward:1000:100", en), /€1 /);
  assert.match(achievementText("reward:2500:250", en), /€2\.50/);

  await a.purgeAchievements("ana@x.com");
  assert.equal((await d.select().from(schema.achievements).where((await import("drizzle-orm")).eq(schema.achievements.email, "ana@x.com"))).length, 0);
});
