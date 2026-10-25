import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOCALES, getDict } from "./dictionaries";

test("o proxy (ex-middleware) conhece todos os idiomas", () => {
  const mw = readFileSync("src/proxy.ts", "utf8");
  for (const l of LOCALES) assert.ok(mw.includes(`"${l}"`), l);
});

test("todos os idiomas têm os mesmos marcadores {x} que o inglês", () => {
  const en = getDict("en") as Record<string, unknown>;
  for (const l of LOCALES) {
    const d = getDict(l) as Record<string, unknown>;
    for (const [k, v] of Object.entries(en)) {
      if (typeof v !== "string") continue;
      const want = (v.match(/\{\w+\}/g) ?? []).sort().join();
      const got = (String(d[k]).match(/\{\w+\}/g) ?? []).sort().join();
      assert.equal(got, want, `${l}.${k}`);
    }
  }
});

import { originAllowed } from "../proxy";
test("pedidos que alteram dados só vêm do próprio site", () => {
  assert.equal(originAllowed(null, "voybu.com"), true, "sem Origin (servidor a servidor) passa");
  assert.equal(originAllowed("https://voybu.com", "voybu.com"), true);
  assert.equal(originAllowed("https://evil.example", "voybu.com"), false);
  assert.equal(originAllowed("null", "voybu.com"), false);
  assert.equal(originAllowed("https://voybu.com", "app:3000", "https://voybu.com"), true, "atrás do Caddy vale o APP_URL");
});
