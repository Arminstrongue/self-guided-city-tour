import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";
process.env.SGCT_NO_OFFICIAL = "1";

test("carrossel, guardados, @menções, #hashtags, partilhar, foto/local/reações/respostas no chat", async () => {
  const { db } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const p = await import("./posts");
  const c = await import("./chat");
  const n = await import("./notify");
  const px = "data:image/jpeg;base64,/9j/AA==";
  await s.saveProfile("a@x.com", { handle: "ana", name: "Ana", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("b@x.com", { handle: "bruno", name: "Bruno", bio: "", photo: null, isPrivate: false });
  await s.follow("b@x.com", "ana");
  const post = await p.createPost("a@x.com", { kind: "post", text: "Pôr do sol com @bruno #Lisboa #sunset", photo: px, extra: [px, px], city: "lis", tag: null, bg: null }) as { id: string };
  const g = await p.getPost("b@x.com", post.id);
  assert.equal(g?.posts[0].photos, 3);
  assert.equal(await p.photoOf("b@x.com", post.id, 2), px);
  assert.ok((await n.listNotifs("b@x.com")).some((x) => x.type === "mention"));
  assert.equal((await p.tagPosts("b@x.com", "lisboa")).posts.length, 1);
  assert.equal((await p.tagPosts("b@x.com", "lis")).posts.length, 0); // palavra inteira
  await p.save("b@x.com", post.id, true);
  assert.equal((await p.savedPosts("b@x.com")).posts[0]?.saved, true);
  // Chat
  const sh = await c.sharePost("b@x.com", "ana", post.id);
  assert.ok("message" in sh && sh.message?.ref?.kind === "post");
  const loc = await c.send("b@x.com", "ana", "", "loc:38.71000,-9.14000");
  assert.ok("message" in loc && loc.message?.ref?.kind === "loc");
  const ph = await c.send("a@x.com", "bruno", "olha", null, { photo: px, replyTo: (loc as { message: { id: string } }).message.id });
  assert.ok("message" in ph && ph.message?.photo && ph.message?.reply?.text === "📍");
  assert.deepEqual(await c.react("b@x.com", (ph as { message: { id: string } }).message.id, "❤️"), [{ e: "❤️", n: 1, mine: true }]);
  const th = await c.thread("a@x.com", "bruno");
  const last = th!.messages.at(-1)!;
  assert.deepEqual(last.reactions, [{ e: "❤️", n: 1, mine: false }]);
  assert.equal((await c.messageMedia("a@x.com", last.id))?.photo, px);
  assert.equal(await c.messageMedia("z@x.com", last.id), null);
});
