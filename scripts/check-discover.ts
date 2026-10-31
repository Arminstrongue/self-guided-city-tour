/** Verifica os ficheiros src/data/discover/*.json e gera o index.ts com os carregadores. Uso: npx tsx scripts/check-discover.ts */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { CITIES } from "../src/data/cities";
const dir = "src/data/discover";
const KINDS = new Set(["sight", "museum", "gallery", "park", "market", "view", "church", "palace", "district", "landmark", "food"]);
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => Math.hypot((b.lat - a.lat) * 111, (b.lng - a.lng) * 111 * Math.cos(a.lat * Math.PI / 180));
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[^a-z0-9]+/g, " ").trim();
let bad = 0; const ids: string[] = [];
for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
  const id = f.replace(".json", ""), city = CITIES.find((c) => c.id === id);
  const err = (m: string) => { bad++; console.log(`✗ ${id}: ${m}`); };
  if (!city) { err("unknown city"); continue; }
  const d = JSON.parse(readFileSync(`${dir}/${f}`, "utf8"));
  const centre = { lat: city.stops.reduce((a, s) => a + s.lat, 0) / city.stops.length, lng: city.stops.reduce((a, s) => a + s.lng, 0) / city.stops.length };
  const seen = new Set<string>(); const routeNames = city.stops.map((s) => norm(s.n));
  const money = /[£€$¥]\s?\d|\d\s?(€|eur|usd|gbp|aed|jpy)\b|\b\d{1,2}[:h]\d{2}\b/i;
  for (const p of d.places ?? []) {
    for (const k of ["id", "n", "a", "lat", "lng", "k", "en", "pt"]) if (p[k] === undefined || p[k] === "") err(`place ${p.id ?? p.n} missing ${k}`);
    if (!KINDS.has(p.k)) err(`place ${p.id} bad kind ${p.k}`);
    if (seen.has(p.id)) err(`dup id ${p.id}`); seen.add(p.id);
    if (km(centre, p) > 40) err(`place ${p.id} is ${km(centre, p).toFixed(0)} km from centre`);
    if (routeNames.includes(norm(p.n))) err(`place ${p.id} repeats a route stop`);
    if (money.test(p.en) || money.test(p.pt)) err(`place ${p.id} has price/hours in text`);
    if (p.url && !/^https:\/\//.test(p.url)) err(`place ${p.id} url not https`);
  }
  for (const s of d.streets ?? []) { for (const k of ["id", "n", "a", "lat", "lng", "en", "pt"]) if (s[k] === undefined) err(`street ${s.id} missing ${k}`); if (km(centre, s) > 40) err(`street ${s.id} far`); if (seen.has(s.id)) err(`dup id ${s.id}`); seen.add(s.id); }
  for (const w of d.walks ?? []) {
    for (const k of ["id", "en_n", "pt_n", "km", "min", "en", "pt", "pts"]) if (w[k] === undefined) err(`walk ${w.id} missing ${k}`);
    if (!Array.isArray(w.pts) || w.pts.length < 3) err(`walk ${w.id} has <3 points`);
    let len = 0; for (let i = 1; i < (w.pts?.length ?? 0); i++) len += km(w.pts[i - 1], w.pts[i]);
    if (len > w.km * 1.05 + 0.3) err(`walk ${w.id}: straight-line ${len.toFixed(1)} km > stated ${w.km} km`);
    if (w.km / (w.min / 60) > 5.5 || w.km / (w.min / 60) < 2.5) err(`walk ${w.id}: speed ${(w.km / (w.min / 60)).toFixed(1)} km/h unrealistic`);
    if (seen.has(w.id)) err(`dup id ${w.id}`); seen.add(w.id);
  }
  console.log(`${id}: ${d.places?.length ?? 0} places · ${d.streets?.length ?? 0} streets · ${d.walks?.length ?? 0} walks`);
  ids.push(id);
}
writeFileSync(`${dir}/index.ts`, `/** Ficheiros "Descobrir" por cidade (carregados só quando pedidos). Gerado por scripts/check-discover.ts. */\nexport const DISCOVER_LOADERS: Record<string, () => Promise<{ default: unknown }>> = {\n${ids.map((i) => `  ${i}: () => import("./${i}.json"),`).join("\n")}\n};\n`);
console.log(bad ? `\n${bad} problem(s)` : "\nall good"); process.exit(bad ? 1 : 0);
