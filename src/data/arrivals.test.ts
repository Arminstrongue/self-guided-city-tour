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
