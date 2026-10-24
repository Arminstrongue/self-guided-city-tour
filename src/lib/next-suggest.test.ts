import { test } from "node:test";
import assert from "node:assert/strict";
import { suggestNext, type SgStop } from "./next-suggest";

const a: SgStop = { id: "a", n: "Hyde Park", lat: 51.507, lng: -0.165, v: 30 };
const b: SgStop = { id: "b", n: "British Museum", lat: 51.519, lng: -0.127, v: 60, hours: ["10:00", "17:00"] };
const c: SgStop = { id: "c", n: "Covent Garden Market", lat: 51.512, lng: -0.122, v: 30 };

test("sugestão: segue o roteiro quando não há razão para trocar", () => {
  assert.equal(suggestNext({ remaining: [a, b, c], nowHM: "11:00" }), null);
});
test("sugestão: chuva → espaço interior; fecha em breve → ir já; fechado → nunca", () => {
  assert.deepEqual(suggestNext({ remaining: [a, b, c], nowHM: "11:00", rainSoon: true })?.id, "b");
  const s = suggestNext({ remaining: [a, c, b], nowHM: "16:20" });
  assert.equal(s?.id, "b"); assert.equal(s?.reason, "closing"); assert.equal(s?.closes, "17:00");
  assert.notEqual(suggestNext({ remaining: [a, b, c], nowHM: "18:00", rainSoon: true })?.id, "b");
});
test("sugestão: muito perto de si", () => {
  const s = suggestNext({ remaining: [a, b, c], pos: { lat: 51.5122, lng: -0.1223 }, nowHM: "11:00" });
  assert.equal(s?.id, "c"); assert.equal(s?.reason, "near");
});
