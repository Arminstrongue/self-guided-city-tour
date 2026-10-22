import { test } from "node:test";
import assert from "node:assert/strict";
import { zonedToDate, hmIn } from "./zoned";

test("hora local do destino → instante absoluto, com horário de verão", () => {
  assert.equal(zonedToDate("2026-07-01T14:30", "Europe/Lisbon").toISOString(), "2026-07-01T13:30:00.000Z");
  assert.equal(zonedToDate("2026-12-01T14:30", "Europe/Lisbon").toISOString(), "2026-12-01T14:30:00.000Z");
  assert.equal(zonedToDate("2026-07-01T09:00", "Asia/Singapore").toISOString(), "2026-07-01T01:00:00.000Z");
  assert.equal(hmIn(new Date("2026-07-01T13:30:00Z"), "Europe/Lisbon"), "14:30");
  assert.ok(isNaN(zonedToDate("ontem", "UTC").getTime()));
});
