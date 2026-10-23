import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";
process.env.SGCT_NO_OFFICIAL = "1";

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

test("gestão de publicações: arquivar, fixar, ocultar gostos, desligar comentários, editar, ocultar e silenciar", async () => {
  const { db } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const p = await import("./posts");
  await s.saveProfile("m1@x.com", { handle: "mia", name: "Mia", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("m2@x.com", { handle: "rui", name: "Rui", bio: "", photo: null, isPrivate: false });
  await s.follow("m2@x.com", "mia"); await s.follow("m1@x.com", "rui");
  const ids = [] as string[];
  for (const txt of ["um", "dois", "três", "quatro"]) ids.push((await p.createPost("m1@x.com", { kind: "post", text: txt, photo: null, city: "man", tag: null, bg: null }) as { id: string }).id);
  const [a, b, c, d] = ids;

  // Só o autor gere
  assert.deepEqual(await p.managePost("m2@x.com", a, "archive"), { error: "not_found" });
  // Arquivar: sai do perfil e dos feeds dos outros; o autor vê no Arquivo
  await p.managePost("m1@x.com", a, "archive");
  assert.ok(!(await p.userPosts("m2@x.com", "mia"))!.posts.some((x) => x.id === a));
  assert.equal(await p.getPost("m2@x.com", a), null);
  assert.deepEqual((await p.userPosts("m1@x.com", "mia", null, true))!.posts.map((x) => x.id), [a]);
  assert.equal(await p.userPosts("m2@x.com", "mia", null, true), null);
  assert.ok(!(await p.feedFollowing("m2@x.com")).posts.some((x) => x.id === a));

  // Fixar: no topo do perfil, máximo 3
  await p.managePost("m1@x.com", b, "pin");
  assert.equal((await p.userPosts("m2@x.com", "mia"))!.posts[0].id, b);
  await p.managePost("m1@x.com", c, "pin"); await p.managePost("m1@x.com", d, "pin");
  assert.deepEqual(await p.managePost("m1@x.com", a, "pin"), { error: "too_many" });

  // Ocultar gostos: os outros veem 0; o autor vê o número
  await p.like("m2@x.com", b, true);
  await p.managePost("m1@x.com", b, "hidelikes");
  assert.equal((await p.getPost("m2@x.com", b))!.posts[0].likes, 0);
  assert.equal((await p.getPost("m1@x.com", b))!.posts[0].likes, 1);

  // Comentários desligados
  await p.managePost("m1@x.com", b, "commentsoff");
  assert.deepEqual(await p.addComment("m2@x.com", b, "olá"), { error: "not_allowed" });
  assert.equal((await p.getPost("m2@x.com", b))!.posts[0].canComment, false);

  // Editar: passa pela moderação e fica "editada"
  assert.ok("ok" in (await p.editPost("m1@x.com", c, "novo texto")));
  const ed = (await p.getPost("m2@x.com", c))!.posts[0];
  assert.equal(ed.text, "novo texto"); assert.equal(ed.edited, true);
  assert.deepEqual(await p.editPost("m2@x.com", c, "x"), { error: "not_found" });

  // Ocultar uma publicação e silenciar a conta: saem do feed, o perfil continua visível
  await p.hidePost("m2@x.com", d, true);
  assert.ok(!(await p.feedFollowing("m2@x.com")).posts.some((x) => x.id === d));
  await p.muteAuthorOf("m2@x.com", b, true);
  assert.ok(!(await p.feedFollowing("m2@x.com")).posts.some((x) => x.handle === "mia"));
  assert.ok((await p.userPosts("m2@x.com", "mia"))!.posts.length > 0);
  await p.muteAuthorOf("m2@x.com", b, false);
  assert.ok((await p.feedFollowing("m2@x.com")).posts.some((x) => x.handle === "mia"));
});
