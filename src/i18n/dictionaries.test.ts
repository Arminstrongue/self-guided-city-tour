import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOCALES, getDict } from "./dictionaries";

test("o middleware conhece todos os idiomas", () => {
  const mw = readFileSync("src/middleware.ts", "utf8");
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
