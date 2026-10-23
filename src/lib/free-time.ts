/**
 * "Tenho X minutos livres": a partir de um ponto, que paragens cabem com ida, visita e regresso ao ponto de partida?
 * Distâncias em linha reta × 1,3 (ruas não são retas) a 75 m/min (passo calmo de turista). Sem rede: só aritmética.
 */
export type FreeStop = { id: string; n: string; lat: number; lng: number; v: number; top?: boolean };
type P = { lat: number; lng: number };

export const WALK_M_PER_MIN = 75;
const DETOUR = 1.3;

export function metres(a: P, b: P): number {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
/** Minutos a pé entre dois pontos (com o fator de ruas e, opcionalmente, mais lento com bagagem). */
export const walkMin = (a: P, b: P, slow = 1) => Math.max(1, Math.round((metres(a, b) * DETOUR * slow) / WALK_M_PER_MIN));

/** Visita mais curta num passeio curto: no máximo 20 min por paragem, no mínimo 5. */
const shortVisit = (v: number) => Math.min(20, Math.max(5, Math.round(v / 2)));

export type FreeLoop = { stops: (FreeStop & { walk: number; visit: number })[]; back: number; total: number };

/** Mini-roteiro guloso: vai sempre à paragem mais próxima que ainda permite voltar ao início a tempo. */
export function freeLoop(start: P, stops: FreeStop[], minutes: number, slow = 1): FreeLoop {
  const out: FreeLoop["stops"] = [];
  let here: P = start, used = 0;
  const left = [...stops];
  for (;;) {
    let best: { i: number; walk: number; visit: number; score: number } | null = null;
    left.forEach((s, i) => {
      const walk = walkMin(here, s, slow), visit = shortVisit(s.v), back = walkMin(s, start, slow);
      if (used + walk + visit + back > minutes) return;
      const score = walk - (s.top ? 4 : 0); // um ponto famoso compensa uns minutos a mais
      if (!best || score < best.score) best = { i, walk, visit, score };
    });
    if (!best) break;
    const b: { i: number; walk: number; visit: number } = best;
    const s = left.splice(b.i, 1)[0];
    out.push({ ...s, walk: b.walk, visit: b.visit });
    used += b.walk + b.visit; here = s;
  }
  const back = out.length ? walkMin(here, start, slow) : 0;
  return { stops: out, back, total: used + back };
}

/** Paragens isoladas que cabem (ida + visita + volta), das mais perto para as mais longe. */
export function freeSingles(start: P, stops: FreeStop[], minutes: number, slow = 1) {
  return stops.map((s) => ({ ...s, walk: walkMin(start, s, slow), visit: shortVisit(s.v) }))
    .filter((s) => 2 * s.walk + s.visit <= minutes).sort((a, b) => a.walk - b.walk).slice(0, 6);
}

/** Link do Google Maps a pé com as paragens como pontos intermédios e regresso ao início. */
export function walkUrl(start: P, stops: P[]): string {
  const ll = (p: P) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
  const q = new URLSearchParams({ api: "1", origin: ll(start), destination: ll(start), travelmode: "walking" });
  if (stops.length) q.set("waypoints", stops.slice(0, 9).map(ll).join("|"));
  return `https://www.google.com/maps/dir/?${q.toString()}`;
}
