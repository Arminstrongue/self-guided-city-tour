import { test } from "node:test";
import assert from "node:assert/strict";
import { CITIES } from "./cities";
import { arrivalsFor } from "./arrivals";
import { metres } from "../lib/free-time";

test("every city has a curated arrival guide", () => {
  for (const c of CITIES) assert.ok(arrivalsFor(c.id).length > 0, `missing arrivals for ${c.id}`);
});

test("arrival points and exits are in the right city and have steps", () => {
  const ids = new Set<string>();
  for (const c of CITIES) {
    const centre = c.stops[0];
    for (const p of arrivalsFor(c.id)) {
      assert.ok(metres(p, centre) < 80_000, `${p.id} too far from ${c.id}`);
      for (const o of p.options) {
        assert.ok(!ids.has(o.id), `duplicate option id ${o.id}`); ids.add(o.id);
        assert.ok(o.steps.length > 0 && o.steps.every((s) => s.pt && s.en), `${o.id} needs pt/en steps`);
        assert.ok(metres(o.to, centre) < 30_000, `${o.id} exit too far from ${c.id}`);
      }
    }
  }
});

import { optionName } from "./arrivals";
test("option names are translated outside Portuguese", () => {
  assert.equal(optionName({ name: "Autocarro 19" }, "en"), "Bus 19");
  assert.equal(optionName({ name: "Táxi oficial / Uber · Bolt" }, "fr"), "Official taxi / Uber · Bolt");
  assert.equal(optionName({ name: "Metro (linha Vermelha)" }, "en"), "Metro (Red line)");
  assert.equal(optionName({ name: "Autocarro 19" }, "pt"), "Autocarro 19");
});

import { GUIDES, GUIDE_FIELDS } from "./arrival-guides";
import { arrivalsFor as arrivals2 } from "./arrivals";
test("guias da estação: só para opções existentes, com fontes e traduzidos em todas as línguas", async () => {
  const fs = await import("node:fs");
  const ids = new Set<string>();
  for (const c of ["lon", "lis", "opo", "mad", "bcn", "par", "rom", "ams", "edi", "man", "gla", "liv", "bir", "ist", "fra", "ber", "muc", "vie", "prg", "sin", "dxb", "auh", "doh", "ruh", "jed", "cai", "amm", "mct", "nyc", "was", "sfo", "chi", "bos", "mia", "lax", "las", "msy", "mco", "yyz", "mex", "rio", "bue", "rak", "cas", "cpt", "zan", "tun", "add", "nbo", "lad", "acc", "kgl", "dkr"])
    for (const p of arrivals2(c)) for (const o of p.options) ids.add(o.id);
  const keys: string[] = [];
  for (const [id, g] of Object.entries(GUIDES)) {
    assert.ok(ids.has(id), `opção inexistente: ${id}`);
    assert.ok(g.sources.every((u) => u.startsWith("https://")), id);
    for (const f of GUIDE_FIELDS) if (g[f]) { assert.ok(g[f]!.pt && g[f]!.en, `${id}.${f}`); keys.push(`${id}.${f}`); }
  }
  for (const l of ["es", "fr", "de", "it", "zh", "ar", "ja", "ko", "ru", "tr"]) {
    const pack = JSON.parse(fs.readFileSync(`src/data/arrival-guides-i18n/${l}.json`, "utf8")) as Record<string, string>;
    const miss = keys.filter((k) => !pack[k]);
    assert.deepEqual(miss, [], `${l}: faltam ${miss.length}`);
  }
});

import { TERMINALS } from "./terminals";
test("terminais: códigos únicos, fontes, textos pt/en e traduzidos", async () => {
  const fs = await import("node:fs");
  const keys: string[] = [];
  for (const [iata, a] of Object.entries(TERMINALS)) {
    assert.ok(a.sources.length > 0, iata);
    const codes = a.terminals.map((x) => x.code);
    assert.equal(new Set(codes).size, codes.length, `${iata}: códigos repetidos`);
    for (const x of a.terminals) for (const k of ["serves", "transit"] as const) if (x[k]) { assert.ok(x[k]!.pt && x[k]!.en); keys.push(`${iata}.${x.code}.${k}`); }
    for (const k of ["between", "arrive"] as const) if (a[k]) keys.push(`${iata}.${k}`);
  }
  for (const l of ["es", "fr", "de", "it", "zh", "ar", "ja", "ko", "ru", "tr"]) {
    const pack = JSON.parse(fs.readFileSync(`src/data/terminals-i18n/${l}.json`, "utf8")) as Record<string, string>;
    assert.deepEqual(keys.filter((k) => !pack[k]), [], l);
  }
});

test("chegada: valor das tarifas e etiquetas mais barato / mais rápido", async () => {
  const { fareValue, optionBadges } = await import("./arrivals");
  assert.deepEqual(fareValue("≈ £13"), { cur: "£", v: 13 });
  assert.deepEqual(fareValue("≈ AED 4"), { cur: "AED", v: 4 });
  assert.deepEqual(fareValue("≈ 4 000 XOF"), { cur: "XOF", v: 4000 });
  assert.deepEqual(fareValue("≈ R$ 10"), { cur: "R$", v: 10 });
  assert.deepEqual(fareValue("grátis"), { cur: "*", v: 0 });
  assert.equal(fareValue("Istanbulkart"), null);
  assert.equal(fareValue(""), null);
  const b = optionBadges([{ id: "eliz", min: 35, fare: "≈ £13" }, { id: "picc", min: 55, fare: "≈ £5.60" }, { id: "hex", min: 15, fare: "≈ £25" }, { id: "taxi", min: 50, fare: "" }]);
  assert.deepEqual(b, { cheap: "picc", fast: "hex" });
  assert.deepEqual(optionBadges([{ id: "a", min: 20, fare: "≈ €2" }]), {}, "uma só opção: sem etiquetas");
  assert.equal(optionBadges([{ id: "a", min: 20, fare: "≈ €2" }, { id: "b", min: 30, fare: "≈ £2" }]).cheap, undefined, "moedas diferentes não se comparam");
  assert.equal(optionBadges([{ id: "a", min: 20, fare: "≈ €2" }, { id: "b", min: 20, fare: "≈ €3" }]).fast, undefined, "empate não ganha");
});
