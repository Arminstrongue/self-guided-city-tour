import { test } from "node:test";
import assert from "node:assert/strict";
import { routeSharePath, sharedMapUrl, sharedMinutes, sharedStops } from "./route-share";
import { CITIES } from "@/data/cities";

const man = CITIES.find((c) => c.id === "man")!;
const ids = man.stops.slice(0, 3).map((s) => s.id);

test("share link round-trips the stops in order", () => {
  const p = routeSharePath("pt", "man", ids, "Manchester Oxford Road");
  const u = new URL(p, "https://voybu.com");
  assert.equal(u.pathname, "/pt/r/man");
  assert.equal(u.searchParams.get("p"), "Manchester Oxford Road");
  assert.deepEqual(sharedStops(man, u.searchParams.get("s")).map((s) => s.id), ids);
});

test("unknown and repeated stops are dropped; no position is shared", () => {
  const got = sharedStops(man, `${ids[0]}.nope.${ids[0]}.${ids[1]}`);
  assert.deepEqual(got.map((s) => s.id), [ids[0], ids[1]]);
  assert.ok(!routeSharePath("pt", "man", ids).includes("lat"));
});

test("minutes and map link", () => {
  const st = sharedStops(man, ids.join("."));
  assert.equal(sharedMinutes(st), st.reduce((a, s, i) => a + s.v + (i ? s.leg.min : 0), 0));
  const u = new URL(sharedMapUrl(st));
  assert.equal(u.searchParams.get("travelmode"), "walking");
  assert.equal(u.searchParams.get("waypoints")?.split("|").length, 1);
});
