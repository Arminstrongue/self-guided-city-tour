import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";
process.env.SGCT_NO_OFFICIAL = "1";

test("pontos: check-ins, GPS, cidades declaradas, ranking, prémios e comentários", async () => {
  const { db, schema } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const p = await import("./points");
  const c = await import("./place-comments");
  const w = await import("./wallet");
  await s.saveProfile("ana@x.com", { handle: "ana", name: "Ana", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("rui@x.com", { handle: "rui", name: "Rui", bio: "", photo: null, isPrivate: true });

  // Check-in: paragem inexistente recusada; com GPS a 50 m conta como confirmado.
  assert.deepEqual(await p.checkIn("ana@x.com", "lis", "nope"), { error: "unknown" });
  const r1 = await p.checkIn("ana@x.com", "lis", "rossio", { lat: 38.7139, lng: -9.1394 });
  assert.equal(r1.verified, true);
  const again = await p.checkIn("ana@x.com", "lis", "rossio");
  assert.equal("pts" in again && again.pts, 0, "repetir não dá pontos");
  await p.checkIn("ana@x.com", "lis", "se");          // sem GPS
  await p.checkIn("ana@x.com", "opo", "ribeira");
  // Cidades declaradas: Lisboa já confirmada não conta duas vezes; Tóquio conta como declarada.
  await w.setPrefs("ana@x.com", { visited: [{ name: "Lisboa", country: "PT", at: 1 }, { name: "Tokyo", country: "JP", at: 1 }, { name: "Paris", country: "FR", want: true, at: 1 }] });

  const me = await p.myScore("ana@x.com");
  const by = Object.fromEntries(me.breakdown.map((b) => [b.k, b.n]));
  assert.deepEqual([by.cities, by.declared, by.countries, by.stops, by.gps], [2, 1, 2, 3, 1]);
  assert.equal(me.points, 2 * 100 + 25 + 2 * 50 + 3 * 10 + 10);
  // Sem nenhum passe comprado, nada conta para prémios em dinheiro (contas descartáveis não acumulam crédito).
  assert.equal(me.rewardPoints, 0);
  // Com um passe de Lisboa: contam Lisboa (passe e GPS), Portugal e a paragem com GPS; o Porto (sem GPS) e a Sé não.
  const { db: dbf, schema: sch } = await import("./db");
  await (await dbf()).insert(sch.accesses).values({ email: "ana@x.com", scope: "city", city: "lis", expiresAt: new Date(Date.now() + 86400_000), amountCents: 499, stripeSessionId: "cs_pts" });
  const paid = await p.myScore("ana@x.com");
  assert.equal(paid.rewardPoints, 100 + 50 + 20);
  assert.ok(me.badges.includes("first-city"));

  // Prémios: só uma vez por marco, e só com pontos "confirmados".
  assert.deepEqual(await p.claimRewards("ana@x.com", 2600), [100, 200]);
  assert.deepEqual(await p.claimRewards("ana@x.com", 2600), []);
  const { creditBalance } = await import("./referrals");
  assert.equal(await creditBalance("ana@x.com"), 300);

  // Ranking global: o perfil privado do Rui não aparece aos outros, mas vê-se a si próprio.
  await p.checkIn("rui@x.com", "mad", "sol");
  const g = await p.leaderboard("ana@x.com", "global", "all");
  assert.deepEqual(g.top.map((x) => x.handle), ["ana"]);
  const gr = await p.leaderboard("rui@x.com", "global", "all");
  assert.ok(gr.top.some((x) => x.handle === "rui" && x.me));
  const m = await p.leaderboard("ana@x.com", "friends", "month");
  assert.equal(m.top[0].handle, "ana");

  // Comentários
  assert.deepEqual(await c.addComment("zz@x.com", "lis", "", "olá"), { error: "no_profile" });
  assert.deepEqual(await c.addComment("ana@x.com", "xxx", "", "olá"), { error: "unknown" });
  const k = await c.addComment("ana@x.com", "lis", "rossio", "Vá cedo, antes das 9h!");
  assert.ok("id" in k);
  await c.addComment("rui@x.com", "lis", "", "Lisboa é linda");
  assert.equal((await c.listComments(null, "lis", "rossio")).total, 1);
  assert.deepEqual(await c.commentCounts("lis"), { rossio: 1, "": 1 });
  assert.equal(await c.deleteComment("rui@x.com", (k as { id: string }).id), false, "só o autor apaga");
  // 3 denúncias escondem
  const k2 = await c.addComment("rui@x.com", "lis", "", "spam spam");
  for (const who of ["a1@x.com", "a2@x.com", "a3@x.com"]) await c.reportComment(who, (k2 as { id: string }).id, "spam");
  assert.equal((await c.listComments(null, "lis", "")).total, 1);
  const d = await db();
  assert.equal((await d.select().from(schema.reports)).length, 3);
  await p.purgePoints("ana@x.com");
  assert.equal((await p.myCheckins("ana@x.com", "lis")).length, 0);
});
