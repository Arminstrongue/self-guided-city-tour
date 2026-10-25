import { test } from "node:test";
import assert from "node:assert/strict";
import { kmBetween, nearbyCities, travelEstimate, hoursLabel, citiesByDistance } from "./nearby";

const LON = { id: "lon", name: "London", lat: 51.507, lng: -0.128 };
const ALL = [LON,
  { id: "man", name: "Manchester", lat: 53.48, lng: -2.24 },
  { id: "par", name: "Paris", lat: 48.857, lng: 2.352 },
  { id: "lisbon", name: "Lisboa", lat: 38.72, lng: -9.14 },
  { id: "tokyo", name: "Tokyo", lat: 35.68, lng: 139.76 }];

test("distância Londres–Paris ≈ 344 km", () => { assert.ok(Math.abs(kmBetween(LON, ALL[2]) - 344) < 6); });
test("cidades perto: ordem, corte e sem a própria", () => {
  const n = nearbyCities(ALL, LON);
  assert.deepEqual(n.map((x) => x.id), ["man", "par"]);
  assert.ok(n.every((x) => x.how === "ground"));
});
test("Manchester é ida e volta no dia; longe usa avião", () => {
  assert.equal(nearbyCities(ALL, LON)[0].dayTrip, true);
  assert.equal(travelEstimate(1600).how, "plane");
  assert.equal(travelEstimate(200).how, "ground");
});
test("lista por distância inclui longínquas", () => { assert.equal(citiesByDistance(ALL, LON).at(-1)?.id, "tokyo"); });
test("etiqueta de horas", () => { assert.equal(hoursLabel(130), "≈ 2 h 10"); assert.equal(hoursLabel(44), "≈ 45 min"); assert.equal(hoursLabel(120), "≈ 2 h"); });
import { parseTrip } from "./trip";
test("trip guarda a próxima cidade (e ignora-a se fica na cidade)", () => {
  const base = { v: 2, start: { kind: "airport" }, end: { kind: "airport" }, mode: "train", startAt: "", deadline: "" };
  assert.deepEqual(parseTrip({ ...base, next: { city: "paris", name: "Paris" } })?.next, { city: "paris", name: "Paris" });
  assert.deepEqual(parseTrip({ ...base, next: { city: "../x", name: " Brugge<b> " } })?.next, { name: "Bruggeb" });
  assert.equal(parseTrip({ ...base, mode: "stay", next: { name: "Paris" } })?.next, undefined);
});

test("sem ligação por terra (mar) → avião; Eurostar conta como terra", () => {
  const AMS = { id: "ams", name: "Amsterdam", lat: 52.37, lng: 4.9 };
  const n = nearbyCities([AMS, { id: "man", name: "Manchester", lat: 53.48, lng: -2.24 }, { id: "lon", name: "London", lat: 51.507, lng: -0.128 }], AMS);
  assert.equal(n.find((x) => x.id === "man")?.how, "plane");
  assert.equal(n.find((x) => x.id === "lon")?.how, "ground");
});
