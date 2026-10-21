import { test } from "node:test";
import assert from "node:assert/strict";
process.env.DATABASE_URL = "pglite:memory";

test("história da cidade: Wikipédia na língua do viajante, com recurso ao inglês, e resumo diário", async () => {
  const { db } = await import("./db");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  await migrate((await db()) as never, { migrationsFolder: "./drizzle" });
  const k = await import("./city-knowledge");
  assert.equal(k.trimAtSentence("Primeira frase completa. Segunda frase que não cabe.", 30), "Primeira frase completa.");
  const long = "Lisbon is old. ".repeat(300);
  const calls: string[] = [];
  const fake = (async (url: string) => {
    calls.push(url);
    const u = new URL(url);
    const title = u.searchParams.get("titles") ?? "";
    const ok = (j: unknown) => new Response(JSON.stringify(j), { status: 200 });
    if (u.searchParams.get("prop") === "langlinks") {
      // "History of Lisbon" não existe em turco; "Lisbon" sim.
      return ok({ query: { pages: { "1": { title, ...(title === "Lisbon" ? { langlinks: [{ lang: "tr", "*": "Lizbon" }] } : {}) } } } });
    }
    if (u.hostname === "tr.wikipedia.org") return ok({ query: { pages: { "9": { title: "Lizbon", extract: "Lizbon, Portekiz'in başkentidir." } } } });
    return ok({ query: { pages: { "5": { title, extract: title.startsWith("History") ? long : "Lisbon is the capital of Portugal." } } } });
  }) as unknown as typeof fetch;
  assert.equal(await k.refreshCityKnowledge("lis", "tr", fake), 2);
  const tr = await k.cityKnowledge("lis", "tr");
  assert.equal(tr.summary?.text, "Lizbon, Portekiz'in başkentidir.");
  assert.equal(tr.summary?.lang, "tr");
  assert.equal(tr.history?.lang, "en", "sem artigo de história em turco → inglês");
  assert.ok(tr.history!.text.length <= 2200 && tr.history!.text.endsWith("."));
  assert.ok(tr.history!.url.startsWith("https://en.wikipedia.org/wiki/History_of_Lisbon"));
  // Língua ainda sem textos guardados → mostra o inglês se existir
  await k.refreshCityKnowledge("lis", "en", fake);
  assert.equal((await k.cityKnowledge("lis", "ko")).summary?.text, "Lisbon is the capital of Portugal.");

  const p = await import("./city-pulse");
  const t = await p.trendingIn("lis");
  assert.deepEqual(t, { stops: [], tags: [], comments: 0, posts: 0, visitors: 0 });
  assert.match(p.today("Europe/Lisbon"), /^\d{4}-\d{2}-\d{2}$/);
});
