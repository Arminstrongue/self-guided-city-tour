import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";

test("rede social: @nome, seguir com pedido, aceitar, pesquisar e bloquear", async () => {
  const { db } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  assert.ok(s.validHandle("ana.lisboa") && !s.validHandle("ab") && !s.validHandle("Ana") && !s.validHandle(".ana") && !s.validHandle("admin"));
  await s.saveProfile("a@x.com", { handle: "ana", name: "Ana", bio: "", photo: null, isPrivate: true });
  await s.saveProfile("b@x.com", { handle: "bruno", name: "Bruno", bio: "", photo: null, isPrivate: false });
  assert.equal(await s.handleTaken("ana", "b@x.com"), true);
  assert.equal(await s.follow("b@x.com", "ana"), "pending");
  assert.equal((await s.viewProfile("b@x.com", "ana"))?.canSee, false);
  await s.answerRequest("a@x.com", "bruno", true);
  assert.equal(await s.relation("b@x.com", "a@x.com"), "following");
  assert.equal((await s.counts("a@x.com")).followers, 1);
  assert.equal(await s.follow("a@x.com", "bruno"), "accepted");
  assert.equal((await s.search("a@x.com", "bru")).length, 1);
  await s.block("a@x.com", "bruno");
  assert.equal((await s.search("a@x.com", "bru")).length, 0);
  assert.equal(await s.viewProfile("b@x.com", "ana"), null);
  assert.equal((await s.counts("a@x.com")).followers, 0);
});
