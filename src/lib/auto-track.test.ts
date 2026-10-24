import { test } from "node:test";
import assert from "node:assert/strict";
import { blankState, closeDay, resolve, step, stepsOf, thin, type LiteCity } from "./auto-track";

const man: LiteCity = { id: "man", n: "Manchester", lat: 53.4808, lng: -2.2426, s: [["piccadilly", "Piccadilly Gardens", 53.4808, -2.2367], ["museum", "Manchester Museum", 53.4664, -2.2343]] };
const T0 = new Date("2026-10-24T10:00:00").getTime();
const min = 60e3;

test("detects the city and asks once", () => {
  let s = blankState("2026-10-24");
  s = step(s, { lat: 53.47, lng: -2.24, t: T0 }, [man]);
  assert.equal(s.city, "man");
  assert.equal(s.pending.filter((p) => p.k === "city").length, 1);
  s = resolve(s, "city:man", true);
  s = step(s, { lat: 53.471, lng: -2.24, t: T0 + min }, [man]);
  assert.equal(s.pending.filter((p) => p.k === "city").length, 0);
});

test("walking adds km and estimated steps; GPS jumps are ignored", () => {
  let s = blankState("2026-10-24");
  for (let i = 0; i <= 10; i++) s = step(s, { lat: 53.47 + i * 0.0009, lng: -2.24, t: T0 + i * min }, [man]); // ~100 m/min
  assert.ok(s.km > 0.9 && s.km < 1.1, `km ${s.km}`);
  assert.ok(stepsOf(s) > 1200 && stepsOf(s) < 1500);
  const before = s.km;
  s = step(s, { lat: 40, lng: -3, t: T0 + 11 * min }, [man]);
  assert.equal(s.km, before);
});

test("staying near a stop for 3 minutes asks about the visit", () => {
  let s = blankState("2026-10-24");
  s = step(s, { lat: 53.4664, lng: -2.2343, t: T0 }, [man]);
  s = step(s, { lat: 53.46645, lng: -2.2343, t: T0 + 2 * min }, [man]);
  assert.ok(!s.pending.some((p) => p.k === "visit"));
  s = step(s, { lat: 53.4664, lng: -2.23435, t: T0 + 4 * min }, [man]);
  const v = s.pending.find((p) => p.k === "visit");
  assert.ok(v && v.k === "visit" && v.name === "Manchester Museum");
  s = resolve(s, v.key, true);
  assert.equal(s.places[0].stop, "museum");
});

test("a new day turns yesterday into a route to confirm", () => {
  let s = blankState("2026-10-24");
  for (let i = 0; i <= 6; i++) s = step(s, { lat: 53.47 + i * 0.0009, lng: -2.24, t: T0 + i * min }, [man]);
  s = step(s, { lat: 53.476, lng: -2.24, t: new Date("2026-10-25T09:00:00").getTime() }, [man]);
  const j = s.pending.find((p) => p.k === "journey");
  assert.ok(j && j.k === "journey" && j.day === "2026-10-24" && j.km > 0.4);
  assert.equal(s.day, "2026-10-25");
  assert.equal(closeDay(blankState("2026-10-25"), "2026-10-26").pending.length, 0);
});

test("thin keeps ends and caps length", () => {
  const p = Array.from({ length: 1000 }, (_, i) => [i, i] as [number, number]);
  const t = thin(p, 300);
  assert.equal(t.length, 300); assert.deepEqual(t[0], [0, 0]); assert.deepEqual(t[299], [999, 999]);
});
