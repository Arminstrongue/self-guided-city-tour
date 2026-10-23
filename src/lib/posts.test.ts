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
  // Fica no arquivo do autor (1 ano); os outros deixam de a ver
  const stId = (await p.storyArchive("a@x.com")).posts[0].id;
  assert.equal(await p.getPost("b@x.com", stId), null);
  assert.ok(await p.getPost("a@x.com", stId));
  assert.equal(await p.purgeExpired(), 0);
  await d.update(schema.posts).set({ expiresAt: new Date(Date.now() - 400 * 86_400_000) }).where((await import("drizzle-orm")).eq(schema.posts.kind, "story"));
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

test("destaques: histórias guardadas no perfil depois das 24 h", async () => {
  const { db, schema } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const { eq } = await import("drizzle-orm");
  const s = await import("./social");
  const p = await import("./posts");
  await s.saveProfile("h1@x.com", { handle: "hana", name: "Hana", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("h2@x.com", { handle: "hugo", name: "Hugo", bio: "", photo: null, isPrivate: false });
  const s1 = (await p.createPost("h1@x.com", { kind: "story", text: "Porto", photo: null, city: null, tag: null, bg: "sunset" }) as { id: string }).id;
  const s2 = (await p.createPost("h1@x.com", { kind: "story", text: "Ribeira", photo: null, city: null, tag: null, bg: "ocean" }) as { id: string }).id;
  const other = (await p.createPost("h2@x.com", { kind: "story", text: "x", photo: null, city: null, tag: null, bg: "ocean" }) as { id: string }).id;

  // Só histórias próprias entram
  assert.deepEqual(await p.createHighlight("h1@x.com", "Porto", [other]), { error: "empty" });
  const hl = (await p.createHighlight("h1@x.com", "  Porto  ", [s1, s2, other]) as { id: string }).id;
  // Expira: continua visível a todos dentro do destaque
  const d = await db();
  await d.update(schema.posts).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(schema.posts.author, "h1@x.com"));
  const list = (await p.highlightsOf("h2@x.com", "hana"))!;
  assert.deepEqual(list.list.map((h) => [h.title, h.n]), [["Porto", 2]]);
  const items = (await p.highlightItems("h2@x.com", hl))!;
  assert.deepEqual(items.items.map((x) => x.id), [s1, s2]);
  assert.ok(await p.getPost("h2@x.com", s1));

  // Editar título, tirar uma história, apagar
  await p.updateHighlight("h1@x.com", hl, { title: "Norte", remove: s1 });
  assert.deepEqual((await p.highlightItems("h2@x.com", hl))!.items.map((x) => x.id), [s2]);
  assert.equal((await p.highlightsOf("h1@x.com", "hana"))!.list[0].title, "Norte");
  assert.equal(await p.getPost("h2@x.com", s1), null); // já não está em nenhum destaque
  assert.deepEqual(await p.updateHighlight("h2@x.com", hl, { title: "x" }), { error: "not_found" });
  const r = await p.updateHighlight("h1@x.com", hl, { remove: s2 });
  assert.deepEqual(r, { ok: true, deleted: true }); // sem histórias, o destaque desaparece
  assert.equal((await p.highlightsOf("h1@x.com", "hana"))!.list.length, 0);
});

test("amigos próximos, palavras ocultas e a sua atividade", async () => {
  const { db, schema } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const p = await import("./posts");
  await s.saveProfile("c1@x.com", { handle: "clara", name: "Clara", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("c2@x.com", { handle: "dani", name: "Dani", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("c3@x.com", { handle: "edu", name: "Edu", bio: "", photo: null, isPrivate: false });
  for (const e of ["c2@x.com", "c3@x.com"]) await s.follow(e, "clara");
  await s.follow("c1@x.com", "dani"); await s.follow("c1@x.com", "edu");

  // História só para amigos próximos: a Dani vê, o Edu não
  assert.equal(await p.setCloseFriend("c1@x.com", "dani", true), true);
  const st = (await p.createPost("c1@x.com", { kind: "story", text: "só nós", photo: null, city: null, tag: null, bg: "ocean", close: true }) as { id: string }).id;
  assert.equal((await p.stories("c2@x.com")).rings.find((r) => r.handle === "clara")?.items[0].close, true);
  assert.equal((await p.stories("c3@x.com")).rings.find((r) => r.handle === "clara"), undefined);
  assert.equal(await p.getPost("c3@x.com", st), null);
  assert.deepEqual((await p.closeFriendsOf("c1@x.com")).filter((x) => x.close).map((x) => x.handle), ["dani"]);

  // Palavras ocultas: o comentário do Edu fica oculto para os outros e recolhido para a autora
  assert.equal(p.hasHiddenWord("Que FEIO isto", ["feio"]), true);
  assert.equal(p.hasHiddenWord("feiosinho", ["feio"]), false);
  assert.equal(p.hasHiddenWord("ok 💩", ["💩"]), true);
  const d = await db();
  await d.insert(schema.accountSettings).values({ email: "c1@x.com", hiddenWords: ["feio"] });
  const post = (await p.createPost("c1@x.com", { kind: "post", text: "Porto", photo: null, city: null, tag: null, bg: null }) as { id: string }).id;
  await p.addComment("c3@x.com", post, "muito feio");
  await p.addComment("c2@x.com", post, "lindo");
  assert.deepEqual((await p.comments("c2@x.com", post))!.comments.map((x) => x.text), ["lindo"]);
  assert.deepEqual((await p.comments("c3@x.com", post))!.comments.map((x) => x.text), ["muito feio", "lindo"]);
  const own = (await p.comments("c1@x.com", post))!.comments;
  assert.equal(own.find((x) => x.text === "muito feio")?.hidden, true);

  // A sua atividade
  await p.like("c2@x.com", post, true);
  const act = await p.myActivity("c2@x.com");
  assert.deepEqual(act.likes.posts.map((x) => x.id), [post]);
  assert.deepEqual(act.comments.map((x) => [x.text, x.handle]), [["lindo", "clara"]]);
});

test("pedidos para seguir: aceitar resolve a notificação (sem repetir)", async () => {
  const { db } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const n = await import("./notify");
  await s.saveProfile("r1@x.com", { handle: "rita", name: "Rita", bio: "", photo: null, isPrivate: true });
  await s.saveProfile("r2@x.com", { handle: "abdul", name: "Abdul", bio: "", photo: null, isPrivate: false });
  await s.follow("r2@x.com", "rita");
  await s.unfollow("r2@x.com", "rita"); await s.follow("r2@x.com", "rita"); // pedido repetido
  let list = await n.listNotifs("r1@x.com");
  assert.deepEqual(list.filter((x) => x.type === "request").map((x) => x.actor.handle), ["abdul"]);
  await s.answerRequest("r1@x.com", "abdul", true);
  list = await n.listNotifs("r1@x.com");
  assert.equal(list.filter((x) => x.type === "request").length, 0);
  assert.deepEqual(list.filter((x) => x.type === "follow").map((x) => [x.actor.handle, x.me]), [["abdul", "none"]]);
});
