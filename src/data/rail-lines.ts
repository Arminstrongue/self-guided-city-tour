/**
 * Paragens intermédias de linhas de comboio conhecidas (para seguir a viagem paragem a paragem).
 * Só linhas confirmadas: Manchester Piccadilly → Crewe pela Stockport (Northern, serviço com paragens),
 * conforme o percurso observado pela VOYBU em out. 2026. Os comboios rápidos (ex.: Avanti) não param em todas:
 * por isso só se usa quando o operador do troço coincide.
 */
import { knownStations, stationCoords } from "./rail-stations";

export type Call = { n: string; lat: number; lng: number };
type Line = { id: string; op: RegExp; calls: Call[] };

const LINES: Line[] = [
  { id: "man-cre-styal-stockport", op: /northern/i, calls: [
    { n: "Manchester Piccadilly", lat: 53.4774, lng: -2.2309 }, { n: "Levenshulme", lat: 53.4440, lng: -2.1925 },
    { n: "Heaton Chapel", lat: 53.4256, lng: -2.1789 }, { n: "Stockport", lat: 53.4055, lng: -2.1630 },
    { n: "Cheadle Hulme", lat: 53.3760, lng: -2.1880 }, { n: "Handforth", lat: 53.3465, lng: -2.2135 },
    { n: "Wilmslow", lat: 53.3270, lng: -2.2265 }, { n: "Alderley Edge", lat: 53.3037, lng: -2.2367 },
    { n: "Chelford", lat: 53.2707, lng: -2.2800 }, { n: "Goostrey", lat: 53.2226, lng: -2.3262 },
    { n: "Holmes Chapel", lat: 53.1990, lng: -2.3510 }, { n: "Sandbach", lat: 53.1503, lng: -2.3936 },
    { n: "Crewe", lat: 53.0896, lng: -2.4331 }
  ] }
];

export const normStation = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, " ").replace(/\b(railway|train|rail)?\s*station\b/g, " ").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();

/** Paragens de "from" a "to" (inclusive), na ordem da viagem; null se não houver linha conhecida para este operador. */
export function callsBetween(from: string, to: string, op?: string): Call[] | null {
  if (!op) return null;
  const a = normStation(from), b = normStation(to);
  for (const l of LINES) {
    if (!l.op.test(op)) continue;
    const i = l.calls.findIndex((c) => normStation(c.n) === a), j = l.calls.findIndex((c) => normStation(c.n) === b);
    if (i < 0 || j < 0 || i === j) continue;
    return i < j ? l.calls.slice(i, j + 1) : l.calls.slice(j, i + 1).reverse();
  }
  return null;
}

/** Todas as estações com posição (das linhas conhecidas e das estações principais), sem repetidos. */
export function allStations(): Call[] {
  const m = new Map<string, Call>();
  for (const c of [...LINES.flatMap((l) => l.calls), ...knownStations()]) if (!m.has(normStation(c.n))) m.set(normStation(c.n), c);
  return [...m.values()];
}
/** Posição de uma estação pelo nome (linhas conhecidas primeiro). */
export function coordsOf(name: string): { lat: number; lng: number } | null {
  const k = normStation(name);
  const c = LINES.flatMap((l) => l.calls).find((x) => normStation(x.n) === k);
  return c ? { lat: c.lat, lng: c.lng } : stationCoords(name);
}
const d2 = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const x = ((b.lng - a.lng) * Math.PI / 180) * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180), y = (b.lat - a.lat) * Math.PI / 180;
  return Math.sqrt(x * x + y * y) * 6371000;
};
/** Estação mais perto de uma posição (e a distância, em metros). */
export function nearestStation(p: { lat: number; lng: number }): { s: Call; m: number } | null {
  let best: { s: Call; m: number } | null = null;
  for (const s of allStations()) { const m = d2(p, s); if (!best || m < best.m) best = { s, m }; }
  return best;
}
/** Distância ao longo da linha (ou em linha reta × 1,25 sem linha conhecida), em metros. */
export function railDistance(from: string, to: string, op?: string): number | null {
  const c = callsBetween(from, to, op);
  if (c) { let m = 0; for (let i = 1; i < c.length; i++) m += d2(c[i - 1], c[i]); return m; }
  const a = coordsOf(from), b = coordsOf(to);
  return a && b ? d2(a, b) * 1.25 : null;
}

/** Todas as paragens das linhas conhecidas (com coordenadas). */
export const LINE_STATIONS: Call[] = [...new Map(LINES.flatMap((l) => l.calls).map((c) => [normStation(c.n), c])).values()];
