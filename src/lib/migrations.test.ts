import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

// O migrador do drizzle só corre migrações com data ("when") posterior à última aplicada:
// uma data fora de ordem faz a migração ser saltada em silêncio na produção.
test("migrações: datas sempre a subir e ficheiro .sql para cada uma", () => {
  const j = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")) as { entries: { idx: number; tag: string; when: number }[] };
  for (let i = 1; i < j.entries.length; i++) {
    const a = j.entries[i - 1], b = j.entries[i];
    assert.ok(b.when > a.when, `${b.tag} tem data anterior a ${a.tag}`);
    assert.equal(b.idx, a.idx + 1);
  }
  for (const e of j.entries) assert.ok(existsSync(`drizzle/${e.tag}.sql`), `falta drizzle/${e.tag}.sql`);
});
