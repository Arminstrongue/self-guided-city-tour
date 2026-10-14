import { test } from "node:test";
import assert from "node:assert/strict";
import { CITIES, getCity } from "../data/cities";
import { planRoute, leaveBy } from "./route-cost";

test("Lisboa sem Belém: bilhetes simples são mais baratos", () => {
  const p = planRoute(getCity("lis")!, false);
  assert.equal(p.rides, 3);                 // aeroporto, elétrico 28, regresso
  assert.equal(p.singles, 6.2);             // 3 × 1,90 + cartão 0,50
  assert.equal(p.alt, 7.75);                // passe 7,25 + cartão
  assert.equal(p.best, "singles");
});

test("Lisboa com Belém: passe de 24 h compensa", () => {
  const p = planRoute(getCity("lis")!, true);
  assert.equal(p.rides, 5);
  assert.equal(p.best, "alt");
  assert.equal(p.transport, 7.75);
});

test("Paris: Paris Visite inclui o aeroporto e ganha aos bilhetes", () => {
  const p = planRoute(getCity("par")!, false);
  assert.equal(p.fixed, 28);
  assert.equal(p.best, "alt");
  assert.equal(p.transport, 30.6);
});

test("Porto não tem alternativa: usa bilhetes simples", () => {
  const p = planRoute(getCity("opo")!, true);
  assert.equal(p.alt, null);
  assert.equal(p.best, "singles");
});

test("todas as cidades têm roteiro válido e custos positivos", () => {
  for (const c of CITIES) for (const ext of [false, true]) {
    const p = planRoute(c, ext);
    assert.ok(p.stops.length >= 5, c.id);
    assert.ok(p.transport > 0, c.id);
    assert.ok(p.minutesTour > 60 && p.minutesTour < 8 * 60, `${c.id} ${p.minutesTour}`);
  }
});

test("hora de saída = voo − 2h30 − regresso", () => {
  const p = planRoute(getCity("lis")!, false);
  const flight = new Date("2026-10-20T18:00:00Z");
  assert.equal(leaveBy(flight, p.ret).toISOString(), "2026-10-20T15:00:00.000Z");
});
