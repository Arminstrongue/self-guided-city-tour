import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";
process.env.SGCT_NO_OFFICIAL = "1";

test("convites: limite diário, hash do contacto, aceitar convite segue e notifica", async () => {
  const { db, schema } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const iv = await import("./invites");
  const n = await import("./notify");
  assert.deepEqual(await iv.sendEmailInvites("a@x.com", ["b@x.com"], "en", ""), { error: "no_profile" });
  await s.saveProfile("a@x.com", { handle: "ana", name: "Ana", bio: "", photo: null, isPrivate: true });
  assert.deepEqual(await iv.sendEmailInvites("a@x.com", ["b@x.com", "B@x.com ", "not-an-email"], "pt", "Vem!"), { sent: 1 });
  const d = await db();
  const rows = await d.select().from(schema.invites);
  assert.equal(rows.length, 1); assert.notEqual(rows[0].targetHash, "b@x.com"); // só o hash
  assert.equal(rows[0].targetHash, iv.contactHash(" B@X.com"));
  assert.equal(iv.contactHash("+351 912 345 678"), iv.contactHash("00351912345678"));
  assert.ok(iv.validPhone("+351 912-345-678") && !iv.validPhone("123"));
  const many = Array.from({ length: 25 }, (_, i) => `f${i}@x.com`);
  assert.equal((await iv.sendEmailInvites("a@x.com", many, "en", "")).error, "limit");
  // O convidado entra e cria o perfil
  await s.saveProfile("b@x.com", { handle: "bruno", name: "Bruno", bio: "", photo: null, isPrivate: false });
  assert.equal(await iv.acceptInvite("b@x.com", "ana"), true);
  assert.equal(await iv.acceptInvite("b@x.com", "ana"), false); // só uma vez
  assert.equal(await s.relation("b@x.com", "a@x.com"), "requested"); // Ana é privada → pedido
  const st = await iv.inviteStats("a@x.com");
  assert.equal(st.joined, 1); assert.equal(st.friends[0].handle, "bruno");
  assert.ok((await n.listNotifs("a@x.com")).some((x) => x.type === "invite_joined"));
});
