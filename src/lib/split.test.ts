import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";
process.env.SGCT_NO_OFFICIAL = "1";

test("dividir: partes iguais, saldos e quem paga a quem", async () => {
  const { splitEqual, balancesOf, settleUp } = await import("./split");
  assert.deepEqual(splitEqual(1000, ["a", "b", "c"]), { a: 334, b: 333, c: 333 });
  const b = balancesOf(["a", "b", "c"], [{ payer: "a", amount: 9000, shares: { a: 3000, b: 3000, c: 3000 } }, { payer: "b", amount: 3000, shares: { a: 1000, b: 1000, c: 1000 } }]);
  assert.deepEqual(b, { a: 5000, b: -1000, c: -4000 });
  assert.deepEqual(settleUp(b), [{ from: "c", to: "a", amount: 4000 }, { from: "b", to: "a", amount: 1000 }]);
});

test("grupos de despesas: membros, despesas, acertos e permissões", async () => {
  const { db } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const sp = await import("./split");
  const n = await import("./notify");
  await s.saveProfile("a@x.com", { handle: "ana", name: "Ana", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("b@x.com", { handle: "bruno", name: "Bruno", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("z@x.com", { handle: "zara", name: "Zara", bio: "", photo: null, isPrivate: false });
  await s.follow("b@x.com", "ana");
  // zara não é contacto: não entra pelo @; o Carlos entra só com o nome.
  const g = await sp.createGroup("a@x.com", { title: "Lisboa 2026", currency: "EUR", people: [{ handle: "bruno" }, { handle: "zara" }, { name: "Carlos" }] }) as { id: string };
  assert.ok(g.id);
  assert.ok((await n.listNotifs("b@x.com")).some((x) => x.type === "split" && x.split === g.id));
  const v = (await sp.getGroup("b@x.com", g.id))!;
  assert.deepEqual(v.members.map((m) => m.name), ["Ana", "Bruno", "Carlos"]);
  assert.equal(await sp.getGroup("z@x.com", g.id), null);
  const [ana, bruno, carlos] = v.members.map((m) => m.id);
  await sp.addExpense("a@x.com", g.id, { title: "Jantar", amount: 90, currency: "EUR", payer: ana, among: [ana, bruno, carlos] });
  await sp.addExpense("b@x.com", g.id, { title: "Táxi", amount: 30, currency: "EUR", payer: bruno, among: [], shares: { [ana]: 10, [bruno]: 10, [carlos]: 10 } });
  let x = (await sp.getGroup("a@x.com", g.id))!;
  assert.equal(x.total, 12000);
  assert.deepEqual(x.balances, { [ana]: 5000, [bruno]: -1000, [carlos]: -4000 });
  assert.deepEqual(x.transfers, [{ from: carlos, to: ana, amount: 4000 }, { from: bruno, to: ana, amount: 1000 }]);
  assert.equal((await sp.addExpense("b@x.com", g.id, { title: "x", amount: 30, currency: "EUR", payer: bruno, among: [], shares: { [ana]: 10 } }) as { error: string }).error, "shares");
  await sp.settle("b@x.com", g.id, { from: bruno, to: ana, amount: 1000 });
  x = (await sp.getGroup("a@x.com", g.id))!;
  assert.equal(x.balances[bruno], 0);
  assert.equal(x.transfers.length, 1);
  // Despesa noutra moeda converte-se para euros.
  await sp.addExpense("a@x.com", g.id, { title: "Souvenir", amount: 10, currency: "USD", payer: ana, among: [ana] });
  x = (await sp.getGroup("a@x.com", g.id))!;
  const usd = x.items.find((i) => i.title === "Souvenir")!;
  assert.ok(usd.amount > 500 && usd.amount < 1500 && usd.origCurrency === "USD");
  // Só quem criou (ou o dono) apaga.
  const taxi = x.items.find((i) => i.title === "Táxi")!;
  assert.equal((await sp.removeItem("z@x.com", g.id, taxi.id) as { error: string }).error, "forbidden");
  assert.deepEqual(await sp.removeItem("a@x.com", g.id, taxi.id), { ok: true });
  assert.equal((await sp.listGroups("b@x.com"))[0].title, "Lisboa 2026");
  // Sair / apagar a conta: o grupo passa para o Bruno.
  await sp.purgeSplit("a@x.com");
  assert.equal((await sp.getGroup("b@x.com", g.id))!.owner, true);
  assert.equal(await sp.getGroup("a@x.com", g.id), null);
});
