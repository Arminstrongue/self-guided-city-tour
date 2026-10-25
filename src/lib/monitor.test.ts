import { test } from "node:test";
import assert from "node:assert/strict";
import { step, uptime, since, checksFor } from "./monitor";
import { unansweredOf, summaryLines } from "./instagram";
import { monthsSince, staleIds } from "./data-freshness";

const T0 = new Date("2026-10-25T10:00:00Z"), T1 = new Date("2026-10-25T10:05:00Z"), T2 = new Date("2026-10-25T10:10:00Z");

test("monitor: uma falha isolada não alerta; a 2.ª seguida alerta uma vez; a recuperação avisa", () => {
  const a = step(undefined, false, T0);
  assert.equal(a.event, null); assert.equal(a.next.ok, true); assert.equal(a.next.fails, 1);
  const b = step(a.next, false, T1);
  assert.equal(b.event, "down"); assert.equal(b.next.ok, false); assert.equal(b.next.since, T1);
  const c = step(b.next, false, T2);
  assert.equal(c.event, null, "não repete o alerta");
  assert.equal(c.next.since, T1, "mantém o início da falha");
  const d = step(c.next, true, T2);
  assert.equal(d.event, "up"); assert.equal(d.next.ok, true); assert.equal(d.next.fails, 0);
});

test("monitor: falha seguida de sucesso (deploy) não gera nenhum aviso", () => {
  const a = step(undefined, false, T0);
  const b = step(a.next, true, T1);
  assert.equal(b.event, null); assert.equal(b.next.fails, 0);
});

test("monitor: disponibilidade e durações", () => {
  assert.equal(uptime(287, 288), "99.6 %");
  assert.equal(uptime(0, 0), "—");
  assert.equal(since(5 * 60000), "5 min");
  assert.equal(since(65 * 60000), "1 h 05 min");
  assert.equal(since(3 * 86400_000), "3 dias");
});

test("monitor: verificações usam o endereço público e, se indicado, a app por dentro", () => {
  const c = checksFor("https://voybu.com/", "http://app:3000");
  assert.ok(c.some((x) => x.url === "https://voybu.com/api/health"));
  assert.ok(c.some((x) => x.name === "tls" && x.kind === "tls"));
  assert.ok(c.some((x) => x.url === "http://app:3000/api/health"));
  assert.equal(checksFor("https://voybu.com").some((x) => x.name === "app-internal"), false);
  assert.equal(new Set(c.map((x) => x.name)).size, c.length, "nomes únicos");
});

test("instagram: comentários por responder ignoram os da própria conta e os já respondidos", () => {
  const list = unansweredOf([
    { id: "1", text: "Funciona em Lisboa?", username: "ana" },
    { id: "2", text: "Obrigado!", username: "voybu" },
    { id: "3", text: "Preço?", username: "rui", replies: { data: [{ username: "voybu" }] } },
    { id: "4", text: "Top", username: "eva", replies: { data: [{ username: "outra" }] } }
  ], "voybu", "m1", "https://instagram.com/p/x");
  assert.deepEqual(list.map((c) => c.id), ["1", "4"]);
});

test("instagram: resumo avisa sem publicações há 7+ dias e comentários por responder", () => {
  const now = new Date("2026-10-25T12:00:00Z");
  const l = summaryLines("voybu", 120, 100, [{ id: "a", timestamp: "2026-10-10T10:00:00Z", like_count: 9, comments_count: 1 }], [{ id: "c", text: "?", media: "a" }], now);
  assert.match(l[0], /120 seguidores \(\+20 em 7 dias\)/);
  assert.ok(l.some((x) => /sem publicações há 15 dias/.test(x)));
  assert.ok(l.some((x) => /1 comentário/.test(x)));
});

test("dados: verificações com mais de 9 meses ficam por rever", () => {
  const now = new Date("2026-10-25T00:00:00Z");
  assert.equal(monthsSince("2026-10", now), 0);
  assert.equal(monthsSince("2025-12", now), 10);
  assert.equal(monthsSince("x", now), Infinity);
  assert.deepEqual(staleIds({ a: { checked: "2026-10" }, b: { checked: "2025-01" } }, now), ["b"]);
});
