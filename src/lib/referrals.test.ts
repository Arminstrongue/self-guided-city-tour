import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";
process.env.SGCT_NO_OFFICIAL = "1";

test("convites: 20% ao amigo no 1.º passe, 2 € de crédito a quem convidou, crédito usado no passe seguinte", async () => {
  const { db } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const inv = await import("./invites");
  const r = await import("./referrals");
  const { fulfilTourSession } = await import("./orders");
  await s.saveProfile("ana@x.com", { handle: "ana", name: "Ana", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("rui@x.com", { handle: "rui", name: "Rui", bio: "", photo: null, isPrivate: false });

  // Link de convite (cookie): Rui ainda sem conta paga
  let q = await r.quote({ amount: 499, buyerEmail: "rui@x.com", refHandle: "ana" });
  assert.deepEqual([q.amount, q.friendOff, q.creditUsed, q.inviter?.handle], [399, 100, 0, "ana"]);
  // A própria Ana não pode usar o seu link
  assert.equal((await r.quote({ amount: 499, buyerEmail: "ana@x.com", refHandle: "ana" })).friendOff, 0);
  // Sem cookie, vale o convite aceite ao criar o perfil
  await inv.acceptInvite("rui@x.com", "ana");
  q = await r.quote({ amount: 499, buyerEmail: "rui@x.com" });
  assert.equal(q.inviter?.email, "ana@x.com");

  const pay = (id: string, email: string, amount: number, meta: Record<string, string>) => fulfilTourSession({
    id, mode: "payment", payment_status: "paid", amount_total: amount, currency: "eur", customer_details: { email },
    metadata: { plan: "city", city: "lis", flightAt: "2030-01-01T18:00:00.000Z", locale: "pt", ...meta }
  } as never);
  const a = await pay("cs_rui", "rui@x.com", q.amount, { refInviter: q.inviter!.email, creditUsed: "0" });
  await pay("cs_rui", "rui@x.com", q.amount, { refInviter: q.inviter!.email, creditUsed: "0" }); // webhook repetido
  assert.ok(a);
  assert.equal(await r.creditBalance("ana@x.com"), 200);
  // Segunda compra do Rui: já não tem desconto
  assert.equal((await r.quote({ amount: 499, buyerEmail: "rui@x.com", refHandle: "ana" })).friendOff, 0);

  // Ana usa o crédito só com sessão iniciada com o mesmo email
  assert.equal((await r.quote({ amount: 499, buyerEmail: "ana@x.com", signedEmail: null })).creditUsed, 0);
  const qa = await r.quote({ amount: 499, buyerEmail: "ana@x.com", signedEmail: "ana@x.com" });
  assert.deepEqual([qa.amount, qa.creditUsed], [299, 200]);
  await pay("cs_ana", "ana@x.com", qa.amount, { creditUsed: String(qa.creditUsed) });
  assert.equal(await r.creditBalance("ana@x.com"), 0);
  const st = await r.referralStats("ana@x.com");
  assert.deepEqual([st.paidFriends, st.earned, st.credit], [1, 200, 0]);
  // Nunca abaixo do mínimo do Stripe
  const { db: dbf, schema } = await import("./db");
  await (await dbf()).insert(schema.referralCredits).values({ email: "ana@x.com", amountCents: 5000, kind: "earned", accessId: "00000000-0000-0000-0000-000000000001" });
  assert.equal((await r.quote({ amount: 499, buyerEmail: "ana@x.com", signedEmail: "ana@x.com" })).amount, 50);

  // Crédito reservado: dois pagamentos abertos não usam o mesmo crédito; expirar devolve-o.
  const bal = await r.creditBalance("ana@x.com");
  const h1 = await r.holdCredit("ana@x.com", bal);
  assert.ok(h1);
  assert.equal(await r.creditBalance("ana@x.com"), 0);
  assert.equal(await r.holdCredit("ana@x.com", 100), null, "segundo pagamento já não tem crédito");
  await r.releaseHold(h1);
  assert.equal(await r.creditBalance("ana@x.com"), bal);
  // Pago: a reserva vira gasto definitivo (não conta a dobrar).
  const h2 = await r.holdCredit("ana@x.com", 300);
  await r.settleReferral({ id: "00000000-0000-0000-0000-0000000000aa", email: "ana@x.com" }, { creditUsed: "300", creditHold: h2! });
  assert.equal(await r.creditBalance("ana@x.com"), bal - 300);
});
