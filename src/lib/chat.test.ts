import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";
process.env.SGCT_NO_OFFICIAL = "1";

test("conversas: só seguidores/a seguir, lidas, anular, apagar para mim, resposta a história, bloqueio", async () => {
  const { db } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const c = await import("./chat");
  const p = await import("./posts");
  await s.saveProfile("a@x.com", { handle: "ana", name: "Ana", bio: "", photo: null, isPrivate: true });
  await s.saveProfile("b@x.com", { handle: "bruno", name: "Bruno", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("c@x.com", { handle: "carla", name: "Carla", bio: "", photo: null, isPrivate: false });
  assert.deepEqual(await c.send("a@x.com", "bruno", "olá"), { error: "not_allowed" });
  await s.follow("a@x.com", "bruno"); // Bruno é público → aceite
  const m1 = await c.send("a@x.com", "bruno", "olá Bruno");
  assert.ok("message" in m1);
  assert.ok("message" in (await c.send("b@x.com", "ana", "olá Ana"))); // Bruno é seguido pela Ana → pode responder
  assert.equal(await c.unreadCount("b@x.com"), 1);
  const t = await c.thread("b@x.com", "ana");
  assert.equal(t?.messages.length, 2); assert.equal(t?.canSend, true);
  assert.equal(await c.unreadCount("b@x.com"), 0);
  assert.ok((await c.thread("a@x.com", "bruno"))?.seenUntil);
  const inbox = await c.inbox("a@x.com");
  assert.equal(inbox.threads.length, 1); assert.equal(inbox.threads[0].peer.handle, "bruno"); assert.equal(inbox.threads[0].last.text, "olá Ana");
  assert.deepEqual((await c.contacts("a@x.com")).map((x) => x.handle), ["bruno"]);
  // Carla não segue ninguém → não pode
  assert.deepEqual(await c.send("c@x.com", "ana", "oi"), { error: "not_allowed" });
  // Anular envio
  await c.unsend("a@x.com", (m1 as { message: { id: string } }).message.id);
  assert.equal((await c.thread("b@x.com", "ana"))?.messages.length, 1);
  // Resposta a história
  const st = await p.createPost("b@x.com", { kind: "story", text: "Em Lisboa", photo: null, city: null, tag: null, bg: "ocean" }) as { id: string };
  const r = await c.replyToStory("a@x.com", st.id, "Que inveja!");
  assert.equal("message" in r && r.message?.ref && "text" in r.message.ref ? r.message.ref.text : null, "Em Lisboa");
  // Apagar para mim
  await c.clearThread("a@x.com", "bruno");
  assert.equal((await c.inbox("a@x.com")).threads.length, 0);
  assert.equal((await c.inbox("b@x.com")).threads.length, 1);
  // Bloqueio
  await s.block("b@x.com", "ana");
  assert.equal(await c.thread("a@x.com", "bruno"), null);
  assert.equal((await c.inbox("b@x.com")).threads.length, 0);
  await s.deleteProfile("a@x.com");
  assert.equal((await c.inbox("b@x.com")).threads.length, 0);
});
