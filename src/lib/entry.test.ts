import { test } from "node:test";
import assert from "node:assert/strict";
import { getCity } from "../data/cities";
import { _lists, checkEntry, checkLayover } from "./entry";
import { fitRoute, km, returnEstimate, routeOptions } from "./route-cost";
import { parseFlights, validFlightNo, normaliseFlightNo } from "./flight";

const lis = getCity("lis")!, lon = getCity("lon")!, ist = getCity("ist")!;

test("listas sem contradições", () => {
  const both = (a: string[], b: string[]) => a.filter((x) => b.includes(x));
  assert.deepEqual(both(_lists.SCHENGEN_EXEMPT, _lists.SCHENGEN_VISA), []);
  assert.deepEqual(both(_lists.UK_ETA, _lists.UK_VISA), []);
  assert.deepEqual(both(_lists.TR_FREE, [..._lists.TR_EVISA, ..._lists.TR_VISA]), []);
  assert.deepEqual(both([..._lists.EU, ..._lists.EEA_CH], _lists.SCHENGEN_VISA), []);
});

test("regras de entrada por nacionalidade", () => {
  assert.equal(checkEntry(lis, "PT").verdict, "free");
  assert.equal(checkEntry(lis, "BR").verdict, "free-ees");
  assert.equal(checkEntry(lis, "US").verdict, "free-ees");
  assert.equal(checkEntry(lis, "AO").verdict, "visa");
  assert.equal(checkEntry(lis, "AO", true).verdict, "free-ees"); // com visto Schengen
  assert.equal(checkEntry(lis, "NG").transitVisa, true);
  assert.equal(checkEntry(lon, "PT").verdict, "eta");
  assert.equal(checkEntry(lon, "US").verdict, "eta");
  assert.equal(checkEntry(lon, "GB").verdict, "free");
  assert.equal(checkEntry(lon, "IE").verdict, "free");
  assert.equal(checkEntry(lon, "IN").verdict, "visa");
  assert.equal(checkEntry(lis, "QA").verdict, "unknown");
  // Turquia
  assert.equal(checkEntry(ist, "PT").verdict, "free");
  assert.equal(checkEntry(ist, "GB").verdict, "free");
  assert.equal(checkEntry(ist, "CN").verdict, "free");
  assert.equal(checkEntry(ist, "CY").verdict, "visa");
  assert.equal(checkEntry(ist, "IN").verdict, "evisa");
  assert.equal(checkEntry(ist, "AO").verdict, "visa");
  assert.equal(checkEntry(ist, "AO", true).verdict, "free");
  assert.equal(checkEntry(ist, "PT").zone, "tr");
});

test("tempo de escala: roteiro que cabe", () => {
  const a = new Date("2030-05-01T08:00:00Z");
  const long = checkLayover(lis, "PT", a, new Date(a.getTime() + 10 * 3600e3));
  assert.equal(long.route?.key, "ext");
  const mid = checkLayover(lis, "PT", a, new Date(a.getTime() + 6 * 3600e3));
  assert.ok(mid.route && mid.route.key !== "ext");
  assert.ok(mid.route.plan.minutesTotal <= mid.cityMin);
  const short = checkLayover(lis, "PT", a, new Date(a.getTime() + 3.5 * 3600e3));
  assert.equal(short.route, null);
  assert.equal(short.worthIt, false);
  assert.equal(checkLayover(lis, "AO", a, new Date(a.getTime() + 10 * 3600e3)).worthIt, false);
});

test("opções de roteiro crescem e fitRoute escolhe a maior que cabe", () => {
  const opts = routeOptions(lis);
  for (let i = 1; i < opts.length; i++) assert.ok(opts[i].plan.minutesTotal >= opts[i - 1].plan.minutesTotal);
  assert.equal(fitRoute(lis, 10), null);
  const f = fitRoute(lis, opts[2].plan.minutesTotal);
  assert.equal(f?.key, opts[2].key);
});

test("regresso a partir da posição", () => {
  assert.ok(Math.abs(km({ lat: 38.7139, lng: -9.1394 }, { lat: 38.7742, lng: -9.1342 }) - 6.7) < 0.3);
  const fromRossio = returnEstimate(lis, lis.stops[0])!;
  assert.equal(fromRossio, lis.air.min + 10);
  const fromBelem = returnEstimate(lis, lis.stops.find((s) => s.id === "torre-belem")!)!;
  assert.ok(fromBelem > fromRossio);
});

test("estado do voo (AeroDataBox)", () => {
  assert.equal(normaliseFlightNo("tp 1234"), "TP1234");
  assert.ok(validFlightNo("TP1234") && validFlightNo("U22345") && validFlightNo("FR1"));
  assert.ok(!validFlightNo("1234") && !validFlightNo("TPX"));
  const s = parseFlights([
    { number: "TP 1234", status: "Expected", departure: { airport: { iata: "OPO" }, scheduledTime: { utc: "2030-05-01 06:00Z" } } },
    { number: "TP 1234", status: "Delayed", departure: { airport: { iata: "LIS" }, scheduledTime: { utc: "2030-05-01 18:05Z" }, revisedTime: { utc: "2030-05-01 18:50Z" }, terminal: "1", gate: "14" }, arrival: { airport: { iata: "GRU" } } }
  ], "TP1234", "LIS")!;
  assert.equal(s.from, "LIS"); assert.equal(s.to, "GRU");
  assert.equal(s.delayMin, 45); assert.equal(s.gate, "14");
  assert.equal(s.estimated, "2030-05-01T18:50:00.000Z");
  assert.equal(parseFlights([], "X"), null);
});
