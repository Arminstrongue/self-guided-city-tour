import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";

test("publicações: privacidade, feeds, histórias de 24 h, gostos, comentários e bloqueios", async () => {
  const { db, schema } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const p = await import("./posts");
  const px = "data:image/jpeg;base64,/9j/AA==";
  assert.deepEqual(await p.createPost("x@x.com", { kind: "post", text: "hi", photo: null, city: null, tag: null, bg: null }), { error: "no_profile" });
  await s.saveProfile("a@x.com", { handle: "ana", name: "Ana", bio: "", photo: null, isPrivate: true });
  await s.saveProfile("b@x.com", { handle: "bruno", name: "Bruno", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("c@x.com", { handle: "carla", name: "Carla", bio: "", photo: null, isPrivate: false });
  const a1 = await p.createPost("a@x.com", { kind: "post", text: "Lisboa!", photo: px, city: "lisbon", tag: "food", bg: null });
  const b1 = await p.createPost("b@x.com", { kind: "post", text: "Pastéis", photo: null, city: "lisbon", tag: "food", bg: null });
  assert.ok("id" in a1 && "id" in b1);
  const aId = (a1 as { id: string }).id, bId = (b1 as { id: string }).id;

  // Privado: Bruno não vê a Ana até ser aceite
  assert.equal(await p.getPost("b@x.com", aId), null);
  assert.equal(await p.photoOf("b@x.com", aId), null);
  assert.deepEqual((await p.feedCity("b@x.com", "lisbon")).posts.map((x) => x.handle), ["bruno"]);
  await s.follow("b@x.com", "ana"); await s.answerRequest("a@x.com", "bruno", true);
  assert.equal(await p.photoOf("b@x.com", aId), px);
  assert.deepEqual((await p.feedFollowing("b@x.com")).posts.map((x) => x.handle).sort(), ["ana", "bruno"]);

  // Algoritmo: Carla marcou "comida" como ver menos → não vê o post público do Bruno na cidade
  await s.savePrefsOnly("c@x.com", { lessOf: ["food"] });
  assert.equal((await p.feedCity("c@x.com", "lisbon")).posts.length, 0);

  // Comentários: só quem segue ou é seguido
  assert.deepEqual(await p.addComment("c@x.com", bId, "olá"), { error: "not_allowed" });
  assert.ok("id" in (await p.addComment("b@x.com", aId, "Que bonito")));
  assert.equal((await p.like("b@x.com", aId, true))?.likes, 1);
  const feed = await p.feedFollowing("a@x.com");
  const mine = feed.posts.find((x) => x.id === aId)!;
  assert.equal(mine.comments, 1); assert.equal(mine.likes, 1); assert.equal(mine.mine, true);

  // Histórias expiram após 24 h
  await p.createPost("a@x.com", { kind: "story", text: "Bom dia", photo: null, city: null, tag: null, bg: "ocean" });
  assert.equal((await p.stories("b@x.com")).rings[0]?.handle, "ana");
  const d = await db();
  await d.update(schema.posts).set({ expiresAt: new Date(Date.now() - 1000) }).where((await import("drizzle-orm")).eq(schema.posts.kind, "story"));
  assert.equal((await p.stories("b@x.com")).rings.length, 0);
  assert.equal(await p.purgeExpired(), 1);

  // Bloqueio esconde tudo; apagar o perfil apaga publicações
  await s.block("a@x.com", "bruno");
  assert.equal(await p.getPost("b@x.com", aId), null);
  await s.deleteProfile("a@x.com");
  assert.equal((await d.select().from(schema.posts)).length, 1);
  assert.equal((await d.select().from(schema.postComments)).length, 0);
});
