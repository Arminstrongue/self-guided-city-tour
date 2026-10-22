import { test } from "node:test";
import assert from "node:assert/strict";
import { getCity } from "@/data/cities";
import { dropToFit, fitFromBase, fitRoute, hop, minutesLeft, planFromBase, routeOptions, type Base } from "./route-cost";

const lis = getCity("lis")!;
const near: Base = { kind: "place", lat: lis.stops[0].lat + 0.003, lng: lis.stops[0].lng, label: "Hotel" };

test("hop: a pé perto, transporte longe", () => {
  assert.equal(hop({ lat: 38.71, lng: -9.14 }, { lat: 38.715, lng: -9.14 }).m, "walk");
  const far = hop({ lat: 38.71, lng: -9.14 }, { lat: 38.77, lng: -9.13 });
  assert.equal(far.m, "metro"); assert.ok(far.min >= 20 && far.min % 5 === 0);
});

test("a partir do hotel perto do centro o percurso é mais curto do que a partir do aeroporto", () => {
  const core = routeOptions(lis).find((o) => o.key === "core")!;
  const bp = planFromBase(lis, core.plan, near);
  assert.ok(bp.to && bp.back);
  assert.ok(bp.minutesTotal < core.plan.minutesTotal, `${bp.minutesTotal} < ${core.plan.minutesTotal}`);
  assert.equal(planFromBase(lis, core.plan, { kind: "airport" }).minutesTotal, core.plan.minutesTotal);
});

test("com o mesmo tempo, do hotel cabe pelo menos tanto como do aeroporto", () => {
  for (const t of [150, 240, 360]) {
    const a = fitRoute(lis, t), h = fitFromBase(lis, near, t);
    const n = (o: typeof a) => o?.plan.stops.length ?? 0;
    assert.ok(n(h) >= n(a), `${t} min: hotel ${n(h)} ≥ aeroporto ${n(a)}`);
  }
});

test("minutos que faltam descem à medida que se fazem paragens", () => {
  const core = routeOptions(lis).find((o) => o.key === "core")!;
  const bp = planFromBase(lis, core.plan, near);
  const all = minutesLeft(core.plan, bp, {});
  assert.equal(all, bp.minutesTotal);
  const one = minutesLeft(core.plan, bp, { [core.plan.stops[0].id]: true });
  assert.ok(one < all);
  const none = minutesLeft(core.plan, bp, Object.fromEntries(core.plan.stops.map((s) => [s.id, true])));
  assert.equal(none, bp.back!.min);
});

test("o plano mudou: retira as últimas paragens não-Top até recuperar o tempo, nunca a próxima", () => {
  const core = routeOptions(lis).find((o) => o.key === "core")!;
  const left = core.plan.stops;
  const r = dropToFit(left, 20)!;
  assert.ok(r.saved >= 20);
  assert.ok(!r.ids.includes(left[0].id));
  for (const id of r.ids) assert.ok(left.find((s) => s.id === id));
  assert.deepEqual(dropToFit(left, 0), { ids: [], saved: 0 });
  assert.equal(dropToFit(left, 100000), null);
});
