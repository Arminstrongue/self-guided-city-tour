import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeTx, ARRIVAL_LANGS } from "./arrival-text";
import { CITIES } from "@/data/cities";
import { arrivalsFor } from "@/data/arrivals";

const keys = JSON.parse(readFileSync("src/data/arrivals-i18n/keys.json", "utf8")) as string[];

test("every language pack has one translation per key", () => {
  for (const l of ARRIVAL_LANGS) {
    const p = JSON.parse(readFileSync(`src/data/arrivals-i18n/${l}.json`, "utf8"));
    assert.equal(p.s.length, keys.length, l);
    assert.ok(p.taxiApp.includes("{apps}") && p.taxiRide.includes("{to}"), l);
  }
});

test("all arrival texts are covered (no English left) for each pack", () => {
  for (const l of ARRIVAL_LANGS) {
    const tx = makeTx(l, keys, JSON.parse(readFileSync(`src/data/arrivals-i18n/${l}.json`, "utf8")));
    for (const c of CITIES) for (const p of arrivalsFor(c.id)) for (const o of p.options) {
      for (const s of [...o.steps, ...(o.note ? [o.note] : [])]) assert.notEqual(tx(s), s.en, `${l}: ${s.en}`);
    }
  }
});

test("pt and en untouched; unknown languages fall back to English", () => {
  const s = { pt: "Olá", en: "Hello" };
  assert.equal(makeTx("pt", null, null)(s), "Olá");
  assert.equal(makeTx("ja", null, null)(s), "Hello");
});
