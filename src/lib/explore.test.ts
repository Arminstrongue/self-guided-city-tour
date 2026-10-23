import { test } from "node:test";
import assert from "node:assert/strict";
import { overpassQuery, parseOverpass, rankCats } from "./explore";
import { parseTicketmaster } from "./events";
import { MOMENTS, AGENDA } from "../data/moments";
import { CITIES } from "../data/cities";

const c = { lat: 53.48, lng: -2.24 };
test("Overpass: categorias, duplicados, nome no idioma e distância", () => {
  const els = [
    { type: "node", id: 1, lat: 53.481, lon: -2.241, tags: { leisure: "playground", name: "Parque A", "name:pt": "Parque Infantil A" } },
    { type: "way", id: 2, center: { lat: 53.49, lon: -2.25 }, tags: { leisure: "park", name: "Heaton", fee: "no", website: "https://x.org" } },
    { type: "way", id: 3, center: { lat: 53.49, lon: -2.25 }, tags: { leisure: "park", name: "heaton" } },
    { type: "node", id: 4, lat: 53.5, lon: -2.2, tags: { amenity: "bench" } },
    { type: "node", id: 5, lat: 53.5, lon: -2.2, tags: { tourism: "viewpoint" } }
  ];
  const ps = parseOverpass({ elements: els as never }, c, "pt");
  assert.equal(ps.length, 2);
  assert.equal(ps.find((p) => p.cat === "kids")?.name, "Parque Infantil A");
  const park = ps.find((p) => p.cat === "parks")!;
  assert.equal(park.fee, false); assert.equal(park.web, "https://x.org"); assert.ok(park.dist > 1000 && park.dist < 2000);
  assert.match(overpassQuery(c, "beach"), /around:40000/); assert.doesNotMatch(overpassQuery(c, "parks"), /around:40000/);
});

test("ordenar categorias pelos hobbies", () => {
  assert.equal(rankCats(["family"])[0], "kids");
  assert.equal(rankCats(["food"])[0], "markets");
});

test("Ticketmaster: tipo, imagem 16:9, sem duplicados", () => {
  const ev = (id: string, name: string, seg: string) => ({ id, name, url: "https://t/" + id, dates: { start: { localDate: "2026-11-01", localTime: "20:00:00", dateTime: "2026-11-01T20:00:00Z" } },
    classifications: [{ segment: { name: seg } }], images: [{ url: "big", width: 1024, ratio: "16_9" }, { url: "small", width: 640, ratio: "16_9" }],
    _embedded: { venues: [{ name: "AO Arena", location: { latitude: "53.48", longitude: "-2.24" } }] }, priceRanges: [{ min: 35, currency: "GBP" }] });
  const out = parseTicketmaster({ _embedded: { events: [ev("1", "Show", "Music"), ev("2", "show", "Music"), ev("3", "Derby", "Sports")] } });
  assert.equal(out.length, 2);
  assert.equal(out[0].kind, "music"); assert.equal(out[0].image, "small"); assert.equal(out[0].localTime, "20:00"); assert.equal(out[1].kind, "sport");
});

test("todas as cidades têm momentos com coordenadas perto do centro e uma agenda", () => {
  for (const city of CITIES) {
    const ms = MOMENTS[city.id];
    assert.ok(ms && ms.length >= 5, city.id);
    assert.ok(AGENDA[city.id], city.id);
    const ids = new Set(ms.map((m) => m.id)); assert.equal(ids.size, ms.length, city.id);
    for (const m of ms) assert.ok(Math.abs(m.lat - city.stops[0].lat) < 0.6 && Math.abs(m.lng - city.stops[0].lng) < 0.6, `${city.id}/${m.id}`);
  }
});

import { mapGoogle } from "./gexplore";
test("Google Places: avaliação, foto, aberto e distância", () => {
  const out = mapGoogle([
    { id: "A", displayName: { text: "Heaton Park" }, location: { latitude: 53.53, longitude: -2.25 }, rating: 4.7, userRatingCount: 9000, photos: [{ name: "places/A/photos/x" }], currentOpeningHours: { openNow: true }, googleMapsUri: "https://maps.google.com/?cid=1" },
    { id: "B", location: { latitude: 53, longitude: -2 } }
  ], "parks", c);
  assert.equal(out.length, 1);
  assert.equal(out[0].rating, 4.7); assert.equal(out[0].photo, "places/A/photos/x"); assert.equal(out[0].openNow, true); assert.equal(out[0].id, "g:A");
  assert.ok(out[0].dist > 5000);
});

import { autoPlan, candidates, dayRoute } from "./autoplan";
test("plano automático: hora certa, interesses, sem repetir, rota do dia", () => {
  const ms = MOMENTS.man.map((m) => ({ id: m.id, icon: m.icon, when: m.when, h: m.h, lat: m.lat, lng: m.lng, title: m.en[0] }));
  const items = autoPlan(candidates(ms, []), ["sport"], 2);
  assert.ok(items.length >= 4);
  assert.equal(new Set(items.map((i) => i.title)).size, items.length);
  const d1 = items.filter((i) => i.day === 1);
  assert.equal(d1[0].title, "Old Trafford"); // desporto primeiro de manhã
  assert.ok(d1.some((i) => i.time === "21:00" && /Band on the Wall/.test(i.title))); // música à noite
  assert.ok(d1.some((i) => i.time === "18:30")); // pôr do sol
  assert.match(dayRoute(d1)!, /waypoints=/);
});

import { takeGoogle } from "./gbudget";
test("teto diário do Google", () => {
  process.env.GOOGLE_MAX_PHOTOS_PER_DAY = "3";
  assert.deepEqual([takeGoogle("photo"), takeGoogle("photo"), takeGoogle("photo"), takeGoogle("photo")], [true, true, true, false]);
  assert.equal(takeGoogle("search"), true);
});

import { collapseRuns } from "./events";
test("Ticketmaster: sessões do mesmo evento juntam-se numa entrada com a última data", () => {
  const e = (id: string, name: string, d: string, venue = "V") => ({ id, name, url: "u", start: `${d}T10:00:00`, localDate: d, localTime: "10:00", kind: "other" as const, venue, lat: null, lng: null, image: null, priceMin: null, currency: null });
  const out = collapseRuns([e("1", "Frameless", "2026-10-20"), e("2", "Frameless", "2026-10-21"), e("3", "Frameless", "2026-10-25"), e("4", "Gig", "2026-10-21"), e("5", "Frameless", "2026-10-22", "Other")]);
  assert.equal(out.length, 3);
  const f = out.find((x) => x.id === "1")!;
  assert.equal(f.until, "2026-10-25"); assert.equal(f.runs, 3);
  assert.equal(out.find((x) => x.id === "4")!.until, undefined);
});

test("momentos com dias: nunca 'agora' num dia em que não acontecem", async () => {
  const { MOMENTS, momentDays } = await import("@/data/moments");
  const ladra = MOMENTS.lis.find((m) => m.id === "ladra")!;
  assert.deepEqual(momentDays(ladra), [2, 6]); // terça e sábado
  assert.ok(!momentDays(ladra)!.includes(5)); // sexta não
  const rastro = MOMENTS.mad.find((m) => /Rastro/.test(m.en[0]));
  if (rastro) assert.deepEqual(momentDays(rastro), [0]);
  const pijp = Object.values(MOMENTS).flat().find((m) => /Monday to Saturday/.test(m.en[1]));
  if (pijp) assert.deepEqual(momentDays(pijp), [1, 2, 3, 4, 5, 6]);
});
