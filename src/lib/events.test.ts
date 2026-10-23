import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTicketmaster } from "./events";
test("detalhes do evento: intervalo de preço, género, estado, morada, idade; lugares não são eventos", () => {
  const out = parseTicketmaster({ _embedded: { events: [
    { id: "1", name: "The Coral", url: "u", dates: { start: { localDate: "2026-10-23", localTime: "19:00:00" }, status: { code: "onsale" } },
      classifications: [{ segment: { name: "Music" }, genre: { name: "Rock" }, subGenre: { name: "Indie" } }], ageRestrictions: { legalAgeEnforced: true },
      priceRanges: [{ min: 35, max: 80, currency: "GBP" }], info: "Doors 7pm", _embedded: { venues: [{ name: "Albert Hall", address: { line1: "27 Peter St" }, postalCode: "M2 5QR", city: { name: "Manchester" } }] } },
    { id: "2", name: "Row C Start", url: "u", dates: { start: { localDate: "2026-10-24" } } }
  ] } } as never);
  assert.equal(out.length, 1);
  assert.equal(out[0].priceMax, 80); assert.equal(out[0].genre, "Rock · Indie"); assert.equal(out[0].status, "onsale");
  assert.equal(out[0].address, "27 Peter St, M2 5QR, Manchester"); assert.equal(out[0].adults, true); assert.equal(out[0].info, "Doors 7pm");
});
