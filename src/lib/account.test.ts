import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";
process.env.SGCT_NO_OFFICIAL = "1";

test("notificações, privacidade das mensagens, tempo real, exportar e apagar a conta", async () => {
  const { db, schema } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const p = await import("./posts");
  const c = await import("./chat");
  const n = await import("./notify");
  const live = await import("./live");
  const acc = await import("./account");
  await s.saveProfile("a@x.com", { handle: "ana", name: "Ana", bio: "", photo: null, isPrivate: true });
  await s.saveProfile("b@x.com", { handle: "bruno", name: "Bruno", bio: "", photo: null, isPrivate: false });
  // Pedido para seguir → notificação "request"; aceitar → "accepted"
  await s.follow("b@x.com", "ana");
  assert.equal((await n.listNotifs("a@x.com"))[0]?.type, "request");
  await s.answerRequest("a@x.com", "bruno", true);
  assert.equal((await n.listNotifs("b@x.com"))[0]?.type, "accepted");
  // Gosto → notificação (sem duplicar); tirar o gosto apaga-a
  const post = await p.createPost("a@x.com", { kind: "post", text: "Olá", photo: null, city: null, tag: null, bg: null }) as { id: string };
  await p.like("b@x.com", post.id, true); await p.like("b@x.com", post.id, false); await p.like("b@x.com", post.id, true);
  assert.equal((await n.listNotifs("a@x.com")).filter((x) => x.type === "like").length, 1);
  await p.addComment("b@x.com", post.id, "Lindo");
  assert.equal(await n.unreadNotifs("a@x.com"), 3);
  await n.markNotifsRead("a@x.com");
  assert.equal(await n.unreadNotifs("a@x.com"), 0);
  // Mensagens em tempo real chegam ao destinatário
  const got: string[] = [];
  const off = live.subscribe("a@x.com", (ev) => { if (ev.t === "msg") got.push(ev.m.text); });
  await c.send("b@x.com", "ana", "olá em tempo real");
  off();
  assert.deepEqual(got, ["olá em tempo real"]);
  // Ana não aceita mensagens de ninguém
  await n.saveSettings("a@x.com", { dmPolicy: "none" });
  assert.deepEqual(await c.send("b@x.com", "ana", "olá?"), { error: "not_allowed" });
  await n.saveSettings("a@x.com", { dmPolicy: "following" }); // Ana não segue o Bruno
  assert.equal(await c.canChat("b@x.com", "a@x.com"), false);
  // Exportar e apagar
  const data = await acc.exportData("a@x.com");
  assert.equal(data.posts.length, 1); assert.equal(data.messagesReceived[0].from, "@bruno");
  await acc.deleteAccount("a@x.com");
  const d = await db();
  assert.equal((await d.select().from(schema.travellerProfiles)).length, 1);
  assert.equal((await d.select().from(schema.posts)).length, 0);
  assert.equal((await d.select().from(schema.messages)).length, 0);
  assert.equal((await n.listNotifs("b@x.com")).length, 0);
  assert.ok((await n.settingsOf("a@x.com")).sessionsAfter);
});
