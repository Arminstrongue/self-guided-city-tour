import { test } from "node:test";
import assert from "node:assert/strict";
import { CITIES } from "@/data/cities";
import { optionByKey, planRoute } from "./route-cost";
import { AIRPORT, availableMin, bufferOf, breakdown, endMatchesMode, parseTrip, tripReady, whenLabel, type Trip } from "./trip";

const lis = CITIES.find((c) => c.id === "lis")!;
const stationSA = { kind: "station" as const, lat: 38.7139, lng: -9.1225, label: "Santa Apolónia" };
const hotel = { kind: "hotel" as const, lat: 38.7167, lng: -9.1425, label: "Hotel Avenida" };

test("comboio: o fim é a estação (ou o aeroporto, se escolhido explicitamente)", () => {
  const t: Trip = { v: 2, start: AIRPORT, end: stationSA, mode: "train", startAt: "", deadline: "" };
  assert.ok(tripReady(t));
  assert.equal(endMatchesMode({ end: AIRPORT, mode: "train" }), true);  // estação ferroviária do aeroporto
  assert.equal(endMatchesMode({ end: AIRPORT, mode: "ship" }), false);
  const plan = planRoute(lis, false);
  const b = breakdown(lis, plan, t);
  assert.equal(b.to, lis.air.min);          // começa no aeroporto
  assert.notEqual(b.back, plan.ret.min);    // volta à estação, não ao aeroporto
  assert.equal(b.buffer, 45);
  assert.equal(b.total, b.to + b.tour + b.back);
  assert.equal(b.needed, b.total + 45);
});

test("os mesmos números em todos os ecrãs: aeroporto → aeroporto = tempo total do roteiro", () => {
  const plan = optionByKey(lis, "n4")!.plan;
  const b = breakdown(lis, plan, { start: AIRPORT, end: AIRPORT, mode: "plane" });
  assert.equal(b.total, plan.minutesTotal);
  assert.equal(b.tour, plan.minutesTour);
  assert.equal(b.total - b.tour, lis.air.min + plan.ret.min); // ida + regresso explicam a diferença
});

test("hotel → hotel: ida e regresso a pé ou de transporte, sem margem de partida", () => {
  const b = breakdown(lis, planRoute(lis, false), { start: hotel, end: hotel, mode: "stay" });
  assert.equal(b.buffer, 0);
  assert.ok(b.to > 0 && b.back > 0);
});

test("planear para outro dia: o tempo disponível conta a partir da hora de início, na hora da cidade", () => {
  const now = Date.parse("2026-10-22T10:00:00Z"); // 11:00 em Lisboa
  const t = { startAt: "2026-10-24T09:00", deadline: "2026-10-24T18:00", mode: "train" as const };
  assert.equal(availableMin(t, "Europe/Lisbon", now), 9 * 60 - 45);
  // Começar já: conta a partir de agora.
  assert.equal(availableMin({ ...t, startAt: "" }, "Europe/Lisbon", now), Math.round((Date.parse("2026-10-24T17:00:00Z") - now) / 60000) - 45);
});

test("hora com dia: hoje, amanhã ou data completa", () => {
  const now = Date.parse("2026-10-22T10:00:00Z");
  const w = { today: "today", tomorrow: "tomorrow" };
  assert.equal(whenLabel(Date.parse("2026-10-22T14:40:00Z"), "Europe/Lisbon", "en-GB", w, now), "15:40");
  assert.equal(whenLabel(Date.parse("2026-10-23T14:40:00Z"), "Europe/Lisbon", "en-GB", w, now), "tomorrow, 15:40");
  assert.match(whenLabel(Date.parse("2026-10-24T14:40:00Z"), "Europe/Lisbon", "en-GB", w, now), /Sat.*24.*15:40/);
});

test("plano recebido do navegador ou do servidor é validado", () => {
  assert.equal(parseTrip({ start: { kind: "station", lat: "x" }, end: AIRPORT, mode: "plane" }), null);
  assert.equal(parseTrip({ start: AIRPORT, end: AIRPORT, mode: "rocket" }), null);
  assert.equal(parseTrip({ start: AIRPORT, end: AIRPORT, mode: "bus" })?.mode, "bus");
  const ok = parseTrip({ start: AIRPORT, end: stationSA, mode: "train", startAt: "2026-10-24T09:00", deadline: "bad" });
  assert.equal(ok?.end.kind, "station");
  assert.equal(ok?.deadline, "");
});

test("ponto final ainda por escolher (comboio sem estação) não dá NaN", () => {
  const t: Trip = { v: 2, start: AIRPORT, end: { kind: "station", lat: NaN, lng: NaN, label: "" }, mode: "train", startAt: "", deadline: "" };
  const b = breakdown(lis, planRoute(lis, false), t);
  assert.ok(Number.isFinite(b.back) && Number.isFinite(b.needed));
});

test("bus and walk modes accept ending at any place", () => {
  const place = { kind: "hotel" as const, lat: 53.46, lng: -2.23, label: "Manchester Museum" };
  assert.equal(endMatchesMode({ mode: "bus", end: place }), true);
  assert.equal(endMatchesMode({ mode: "bus", end: { kind: "bus", lat: 53.47, lng: -2.24, label: "Chorlton Street" } }), true);
  assert.equal(endMatchesMode({ mode: "walk", end: place }), true);
  assert.equal(endMatchesMode({ mode: "ship", end: place }), false);
});

test("margem ajustável: limites, contas e validação", () => {
  assert.equal(bufferOf({ mode: "plane" }), 150);
  assert.equal(bufferOf({ mode: "plane", buffer: 90 }), 90);
  assert.equal(bufferOf({ mode: "plane", buffer: 10 }), 60);
  assert.equal(bufferOf({ mode: "train", buffer: 999 }), 120);
  assert.equal(bufferOf({ mode: "stay", buffer: 30 }), 0);
  const b = breakdown(lis, planRoute(lis, false), { start: AIRPORT, end: AIRPORT, mode: "plane", buffer: 120 });
  assert.equal(b.buffer, 120);
  assert.equal(b.needed, b.total + 120);
  const t = parseTrip({ v: 2, start: AIRPORT, end: AIRPORT, mode: "plane", startAt: "", deadline: "2026-10-24T18:00", buffer: 105 });
  assert.equal(t?.buffer, 105);
  assert.equal(parseTrip({ v: 2, start: AIRPORT, end: AIRPORT, mode: "stay", startAt: "", deadline: "", buffer: 50 })?.buffer, undefined);
  const now = Date.parse("2026-10-24T08:00:00Z");
  assert.equal(availableMin({ mode: "plane", startAt: "", deadline: "2026-10-24T18:00", buffer: 90 }, "Europe/Lisbon", now), 9 * 60 - 90);
});

test("plataforma/cais: guarda-se para estação e autocarros, rejeita lixo, e o terminal de autocarros não se perde", () => {
  const base = { v: 2, start: AIRPORT, mode: "train", startAt: "", deadline: "" };
  const st = parseTrip({ ...base, end: { kind: "station", lat: 51.5, lng: -0.13, label: "Euston", platform: "13A" } });
  assert.deepEqual(st?.end, { kind: "station", lat: 51.5, lng: -0.13, label: "Euston", platform: "13A" });
  const bus = parseTrip({ ...base, mode: "bus", end: { kind: "bus", lat: 51.49, lng: -0.15, label: "Victoria Coach Station", platform: "7" } });
  assert.deepEqual(bus?.end, { kind: "bus", lat: 51.49, lng: -0.15, label: "Victoria Coach Station", platform: "7" });
  const bad = parseTrip({ ...base, end: { kind: "station", lat: 51.5, lng: -0.13, label: "Euston", platform: "<script>" } });
  assert.equal(bad?.end.kind !== "airport" && bad?.end.platform, undefined);
  const hotel = parseTrip({ ...base, mode: "stay", end: { kind: "hotel", lat: 51.5, lng: -0.13, label: "Hotel", platform: "5" } });
  assert.equal(hotel?.end.kind !== "airport" && hotel?.end.platform, undefined);
});

test("começar fora da cidade: a origem fica guardada e valores inválidos são ignorados", () => {
  const base = { v: 2, start: { kind: "station", lat: 51.528, lng: -0.134, label: "London Euston" }, end: AIRPORT, mode: "plane", startAt: "", deadline: "" };
  const ok = parseTrip(({ ...base, origin: { label: "Manchester Piccadilly", lat: 53.477, lng: -2.231 } }));
  assert.deepEqual(ok?.origin, { label: "Manchester Piccadilly", lat: 53.477, lng: -2.231 });
  assert.equal(parseTrip(({ ...base, origin: { label: "X", lat: "a", lng: 2 } }))?.origin, undefined);
  assert.equal(parseTrip(base)?.origin, undefined);
});
