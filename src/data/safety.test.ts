import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ALERT_TEXT, CITY_SAFETY, safetyFor } from "./safety";
import { CITIES, COUNTRY } from "./cities";
import { LOCALES } from "@/i18n/core";

describe("safety", () => {
  it("covers every city", () => {
    for (const c of CITIES) assert.ok(safetyFor(c.id, COUNTRY[c.id]), c.id);
  });
  it("has every alert in every language", () => {
    for (const k of Object.keys(ALERT_TEXT) as (keyof typeof ALERT_TEXT)[])
      for (const l of LOCALES) { const v = ALERT_TEXT[k][l]; assert.ok(v?.[0] && v?.[1], `${k}/${l}`); }
  });
  it("only uses known alerts", () => {
    for (const s of Object.values(CITY_SAFETY)) for (const a of s.alerts) assert.ok(ALERT_TEXT[a]);
  });
});
