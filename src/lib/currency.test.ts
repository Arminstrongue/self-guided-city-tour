import { test } from "node:test";
import assert from "node:assert/strict";
import { CURRENCIES, convert, countryFromAcceptLanguage, dualMoney, formatMoney, pickCurrency } from "./currency";
import { FALLBACK_RATES, parseEcbXml } from "./fx";

test("deteta a moeda do viajante", () => {
  assert.equal(pickCurrency({ ipCountry: "GB" }), "GBP");
  assert.equal(pickCurrency({ ipCountry: "BR", acceptLanguage: "en-US" }), "BRL"); // o IP vence o idioma
  assert.equal(pickCurrency({ acceptLanguage: "en-US,en;q=0.9" }), "USD");
  assert.equal(pickCurrency({ cookie: "JPY", ipCountry: "PT" }), "JPY"); // a escolha do viajante vence tudo
  assert.equal(pickCurrency({ cookie: "XYZ", ipCountry: "AO" }), "USD");
  assert.equal(pickCurrency({ ipCountry: "XX", acceptLanguage: "pt" }), "EUR");
  assert.equal(countryFromAcceptLanguage("de-CH, de;q=0.8"), "CH");
});

test("converte e formata", () => {
  const r = { GBP: 0.8, USD: 1.2 };
  assert.equal(convert(10, "EUR", "GBP", r), 8);
  assert.ok(Math.abs(convert(8, "GBP", "USD", r)! - 12) < 1e-9);
  assert.equal(convert(1, "EUR", "ZZZ", r), null);
  assert.equal(formatMoney(4.99, "EUR", "pt-PT").replace(/\s/g, " "), "4,99 €");
  assert.equal(formatMoney(853.2, "JPY", "en-GB"), "JP¥853");
  const d = dualMoney(4.99, "EUR", { cur: "GBP", rates: r, date: "" }, "en-GB");
  assert.equal(d.main, "€4.99"); assert.equal(d.local, "≈ £3.99");
  assert.equal(dualMoney(2, "EUR", { cur: "EUR", rates: r, date: "" }, "en-GB").local, null);
  assert.equal(Object.keys(FALLBACK_RATES).length, CURRENCIES.length);
});

test("lê o ficheiro do Banco Central Europeu", () => {
  const xml = `<Cube><Cube time='2026-10-15'><Cube currency='USD' rate='1.1642'/><Cube currency='GBP' rate='0.8712'/><Cube currency='XAU' rate='9'/></Cube></Cube>`;
  const { rates, date } = parseEcbXml(xml);
  assert.equal(date, "2026-10-15");
  assert.equal(rates.USD, 1.1642); assert.equal(rates.GBP, 0.8712);
  assert.equal((rates as Record<string, number>).XAU, undefined);
});
