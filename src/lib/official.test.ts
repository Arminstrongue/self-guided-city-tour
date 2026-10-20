import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";

test("conta oficial: criada uma vez, com dicas por cidade, seguida por quem cria perfil e no feed de todos", { timeout: 120_000 }, async () => {
  const { db, schema } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const o = await import("./official");
  const s = await import("./social");
  const p = await import("./posts");
  await o.ensureOfficial();
  const d = await db();
  const n1 = (await d.select().from(schema.posts)).length;
  assert.ok(n1 >= 40, `posts: ${n1}`);
  globalThis.__sgctOfficial = undefined; await o.ensureOfficial();
  assert.equal((await d.select().from(schema.posts)).length, n1); // idempotente
  await s.saveProfile("a@x.com", { handle: "ana", name: "Ana", bio: "", photo: null, isPrivate: true });
  assert.equal(await s.relation("a@x.com", o.OFFICIAL_EMAIL), "following");
  const feed = await p.feedFollowing("b@x.com");
  assert.ok(feed.posts.length > 0 && feed.posts[0].handle === o.OFFICIAL_HANDLE);
  assert.equal((await s.search("a@x.com", ""))[0]?.handle, o.OFFICIAL_HANDLE); // sugerida em primeiro
});
