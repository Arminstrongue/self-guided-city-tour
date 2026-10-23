import { test } from "node:test";
import assert from "node:assert/strict";
import { freeLoop, freeSingles, walkMin, walkUrl } from "./free-time";

const start = { lat: 51.5074, lng: -0.1278 }; // Trafalgar Square
const stops = [
  { id: "a", n: "National Gallery", lat: 51.5089, lng: -0.1283, v: 60, top: true },     // ~170 m
  { id: "b", n: "Covent Garden", lat: 51.5117, lng: -0.1240, v: 30 },                    // ~550 m
  { id: "c", n: "Tower of London", lat: 51.5081, lng: -0.0759, v: 90, top: true }        // ~3.6 km
];

test("walkMin grows with distance and luggage", () => {
  const near = walkMin(start, stops[0]), far = walkMin(start, stops[2]);
  assert.ok(near < far);
  assert.ok(walkMin(start, stops[2], 1.25) > far);
});

test("free loop fits the time including the way back", () => {
  const l = freeLoop(start, stops, 40);
  assert.ok(l.stops.length >= 1);
  assert.ok(l.total <= 40);
  assert.ok(!l.stops.some((s) => s.id === "c"), "the Tower is too far for 40 min");
});

test("no time means no stops", () => {
  assert.equal(freeLoop(start, stops, 3).stops.length, 0);
  assert.equal(freeSingles(start, stops, 3).length, 0);
});

test("singles sorted by walk and within time", () => {
  const s = freeSingles(start, stops, 60);
  assert.deepEqual(s.map((x) => x.id), ["a", "b"]);
  assert.ok(s.every((x) => 2 * x.walk + x.visit <= 60));
});

test("walk url loops back to the start", () => {
  const u = new URL(walkUrl(start, [stops[0]]));
  assert.equal(u.searchParams.get("origin"), u.searchParams.get("destination"));
  assert.equal(u.searchParams.get("travelmode"), "walking");
});
