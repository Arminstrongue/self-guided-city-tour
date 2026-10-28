import { test } from "node:test";
import assert from "node:assert/strict";
import { nameMatch, placeInfo } from "./place-info";

const ok = (j: unknown) => new Response(JSON.stringify(j), { status: 200, headers: { "content-type": "application/json" } });

test("nameMatch: reconhece o mesmo lugar e rejeita vizinhos", () => {
  assert.ok(nameMatch("St James's Park", "St. James's Park") >= 0.6);
  assert.ok(nameMatch("Queen Mary's Rose Garden", "Queen Mary's Gardens") >= 0.6);
  assert.ok(nameMatch("Sky Garden", "20 Fenchurch Street") < 0.6);
  assert.ok(nameMatch("Battersea Park", "Battersea Power Station") < 0.6);
});

test("placeInfo: encontra o artigo próximo e devolve o resumo na língua pedida, com reserva em inglês", async () => {
  const calls: string[] = [];
  const f = (async (u: string | URL) => {
    const url = new URL(String(u)); calls.push(url.hostname + " " + (url.searchParams.get("list") ?? url.searchParams.get("prop")));
    if (url.searchParams.get("list") === "geosearch") return ok({ query: { geosearch: [{ title: "Battersea Power Station", dist: 300 }, { title: "Battersea Park", dist: 50 }] } });
    if (url.searchParams.get("prop") === "langlinks") return ok({ query: { pages: { "1": { langlinks: [{ "*": "Parque de Battersea" }] } } } });
    if (url.hostname === "pt.wikipedia.org") return ok({ query: { pages: { "2": { title: "Parque de Battersea", extract: "O Parque de Battersea é um parque em Londres." } } } });
    return ok({ query: { pages: {} } });
  }) as typeof fetch;
  const v = await placeInfo({ name: "Battersea Park", lat: 51.479, lng: -0.156, lang: "pt" }, f);
  assert.equal(v?.title, "Parque de Battersea");
  assert.equal(v?.lang, "pt");
  assert.match(v?.url ?? "", /^https:\/\/pt\.wikipedia\.org\/wiki\//);
  const none = await placeInfo({ name: "Sky Garden", lat: 51.511, lng: -0.083, lang: "en" }, (async () => ok({ query: { geosearch: [{ title: "20 Fenchurch Street", dist: 10 }] } })) as unknown as typeof fetch);
  assert.equal(none, null);
});
