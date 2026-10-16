// Teste de carga com k6 (https://k6.io): k6 run -e BASE=https://SEU_DOMINIO scripts/loadtest.js
// Simula viajantes a abrir a página inicial, a página de compra e a verificação de saúde.
import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.BASE || "http://localhost:3000";
const CITIES = ["lis", "opo", "mad", "bcn", "par", "lon", "rom", "ams", "edi", "man", "gla", "liv", "bir"];

export const options = {
  scenarios: {
    pico: { executor: "ramping-arrival-rate", startRate: 10, timeUnit: "1s", preAllocatedVUs: 200, maxVUs: 1000,
      stages: [{ target: 100, duration: "2m" }, { target: 300, duration: "5m" }, { target: 0, duration: "1m" }] }
  },
  thresholds: { http_req_failed: ["rate<0.01"], http_req_duration: ["p(95)<800"] }
};

export default function () {
  const c = CITIES[Math.floor(Math.random() * CITIES.length)];
  const r1 = http.get(`${BASE}/en`);
  const r2 = http.get(`${BASE}/en/c/${c}`);
  check(r1, { "home 200": (r) => r.status === 200 });
  check(r2, { "cidade 200": (r) => r.status === 200 });
  sleep(1);
}
