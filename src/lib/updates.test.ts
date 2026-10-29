import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";
process.env.SGCT_NO_OFFICIAL = "1";

test("atualizações dos viajantes: criar, listar, votar, esconder, denunciar, expirar e apagar com a conta", async () => {
  const { db, schema } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const u = await import("./updates");
  const { eq } = await import("drizzle-orm");
  await s.saveProfile("ana@x.com", { handle: "ana", name: "Ana", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("rui@x.com", { handle: "rui", name: "Rui", bio: "", photo: null, isPrivate: true });

  const a = await u.createUpdate("ana@x.com", { city: "lon", kind: "alert", text: "Euston: platforms 12-15 closed today", lat: 51.528, lng: -0.134 }) as { id: string };
  const t = await u.createUpdate("rui@x.com", { city: "lon", kind: "tip", text: "Exit 2 is closest to the British Museum", stop: "british-museum" }) as { id: string };
  assert.ok(a.id && t.id);
  assert.deepEqual(await u.createUpdate("ana@x.com", { city: "lon", kind: "tip", text: "   " }), { error: "empty" });

  // Lista: alerta primeiro; @nome só de perfis públicos; email nunca sai.
  let list = await u.listUpdates("lon", "rui@x.com");
  assert.equal(list[0].kind, "alert");
  assert.equal(list[0].by, "ana");
  assert.equal(list.find((x) => x.id === t.id)?.by, null);
  assert.ok(!JSON.stringify(list).includes("@x.com"));
  assert.equal(list.find((x) => x.id === t.id)?.mine, true);
  assert.equal((await u.listUpdates("lon", null, { stop: "british-museum" })).length, 1);

  // Votos: não nas próprias; "ainda está" prolonga o alerta; 3 "já não está" escondem.
  assert.deepEqual(await u.voteUpdate(a.id, "ana@x.com", 1), { error: "own" });
  const before = (await u.listUpdates("lon", null)).find((x) => x.id === a.id)!.expiresAt!;
  await u.voteUpdate(a.id, "rui@x.com", 1);
  const after = (await u.listUpdates("lon", null)).find((x) => x.id === a.id)!.expiresAt!;
  assert.ok(after >= before);
  await u.voteUpdate(a.id, "rui@x.com", -1); // mudou de ideias: 0 / 1
  for (const v of ["v1@x.com", "v2@x.com"]) await u.voteUpdate(a.id, v, -1);
  assert.equal((await u.listUpdates("lon", null)).some((x) => x.id === a.id), false, "3 'já não está' escondem");

  // Denúncias: ficam registadas para a equipa; 3 pessoas escondem.
  for (const r of ["r1@x.com", "r2@x.com", "r2@x.com", "r3@x.com"]) await u.reportUpdate(t.id, r, "false", "");
  const d = await db();
  assert.equal((await d.select().from(schema.reports).where(eq(schema.reports.target, "rui@x.com"))).length, 3, "uma denúncia por pessoa");
  assert.equal((await u.listUpdates("lon", null)).some((x) => x.id === t.id), false);

  // Expirado não aparece.
  const old = await u.createUpdate("ana@x.com", { city: "lon", kind: "warn", text: "Works on the bridge" }) as { id: string };
  await d.update(schema.travellerUpdates).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(schema.travellerUpdates.id, old.id));
  assert.equal((await u.listUpdates("lon", null)).some((x) => x.id === old.id), false);

  // Texto ofensivo bloqueado; apagar a conta apaga as atualizações.
  const tip = await u.createUpdate("ana@x.com", { city: "lon", kind: "tip", text: "Free water refill at the station" }) as { id: string };
  const { deleteAccount } = await import("./account");
  await deleteAccount("ana@x.com");
  assert.equal((await d.select().from(schema.travellerUpdates).where(eq(schema.travellerUpdates.id, tip.id))).length, 0);
});

test("texto repetido: maiúsculas, acentos e pontuação não contam", async () => {
  const { sameText } = await import("./updates");
  assert.equal(sameText("Piccadilly station: platforms 13–14 closed!", "piccadilly station platforms 13 14 closed"), true);
  assert.equal(sameText("Estação fechada", "estacao  FECHADA."), true);
  assert.equal(sameText("Platform 13 closed", "Platform 14 closed"), false);
});
