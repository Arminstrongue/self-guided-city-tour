/**
 * Paragens intermédias de linhas de comboio conhecidas (para seguir a viagem paragem a paragem).
 * Só linhas confirmadas: Manchester Piccadilly → Crewe pela Stockport (Northern, serviço com paragens),
 * conforme o percurso observado pela VOYBU em out. 2026. Os comboios rápidos (ex.: Avanti) não param em todas:
 * por isso só se usa quando o operador do troço coincide.
 */
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
