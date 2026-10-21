import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";
process.env.SGCT_NO_OFFICIAL = "1";

test("pesquisa global e quem viu a história", async () => {
  const { db } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const s = await import("./social");
  const p = await import("./posts");
  const { globalSearch, fold } = await import("./search");
  assert.equal(fold("  São JORGE "), "sao jorge");
  await s.saveProfile("a@x.com", { handle: "ana", name: "Ana Lima", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("b@x.com", { handle: "bruno", name: "Bruno", bio: "", photo: null, isPrivate: false });
  await s.saveProfile("c@x.com", { handle: "carla", name: "Carla", bio: "", photo: null, isPrivate: true });
  await p.createPost("a@x.com", { kind: "post", text: "Pôr do sol #Lisboa #lisbonlife", photo: null, city: "lis", tag: null, bg: null });
  await p.createPost("c@x.com", { kind: "post", text: "segredo #lisboaprivada", photo: null, city: "lis", tag: null, bg: null });

  const r = await globalSearch("b@x.com", "lisb", "en");
  assert.ok(r.cities.some((c) => c.id === "lis"), "cidade pelo nome noutra língua");
  assert.deepEqual(r.tags.map((x) => x.tag).sort(), ["lisboa", "lisbonlife"], "só hashtags de perfis públicos");
  assert.ok((await globalSearch("b@x.com", "praca do comercio", "pt")).stops.some((x) => x.city === "lis"), "paragem sem acentos");
  assert.deepEqual((await globalSearch("b@x.com", "@ana", "en")).people.map((x) => x.handle), ["ana"]);
  assert.equal((await globalSearch("b@x.com", "#lis", "en")).people.length, 0);
  assert.equal((await globalSearch(null, "a", "en")).cities.length, 0, "termo curto");

  // Histórias: quem viu (só o autor vê a lista; o autor não conta)
  const st = await p.createPost("a@x.com", { kind: "story", text: "olá", photo: null, city: "lis", tag: null, bg: "ocean" });
  const id = (st as { id: string }).id;
  assert.equal(await p.viewStory("a@x.com", id), false);
  assert.equal(await p.viewStory("b@x.com", id), true);
  await p.viewStory("b@x.com", id);
  await p.like("b@x.com", id, true);
  const v = await p.storyViewers("a@x.com", id);
  assert.deepEqual(v?.map((x) => [x.handle, x.liked]), [["bruno", true]]);
  assert.equal(await p.storyViewers("b@x.com", id), null);
  await p.removePost(id, "a@x.com");
  assert.equal(await p.storyViewers("a@x.com", id), null);
});
