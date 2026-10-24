/**
 * Próxima paragem sugerida "para agora": entre as que faltam, pesa a ordem do roteiro, a distância a pé de onde
 * o viajante está, se está aberta (e se fecha em breve) e o tempo (chuva ou calor → espaço interior).
 * Só sugere quando há uma razão concreta para trocar a ordem; caso contrário, segue-se o roteiro.
 */
import { placeType, type PlaceType } from "./place-rules";

export type SgStop = { id: string; n: string; lat: number; lng: number; v: number; closedToday?: boolean; hours?: [string, string] | null };
export type SgReason = "near" | "closing" | "rain" | "heat";
export type Suggestion = { id: string; reason: SgReason; walkMin?: number; closes?: string };

const INDOOR: ReadonlySet<PlaceType> = new Set(["museum", "library", "religious", "theatre", "music", "market"]);
const OUTDOOR: ReadonlySet<PlaceType> = new Set(["park", "view"]);
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371, dLat = ((b.lat - a.lat) * Math.PI) / 180, dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const toMin = (hm: string) => { const [h, m] = hm.split(":").map(Number); return h * 60 + m; };

export function suggestNext(o: {
  remaining: SgStop[];               // por ordem do roteiro
  pos?: { lat: number; lng: number } | null;
  nowHM?: string;                    // hora local "HH:MM"
  rainSoon?: boolean; hot?: boolean;
  minutesLeft?: number | null;
}): Suggestion | null {
  const { remaining, pos, nowHM } = o;
  if (remaining.length < 2) return null;
  const now = nowHM ? toMin(nowHM) : null;
  type C = { s: SgStop; k: number; score: number; reason: SgReason | null; walk?: number; closes?: string };
  const cands: C[] = [];
  remaining.forEach((s, k) => {
    if (s.closedToday) return;
    let closes: string | undefined;
    if (s.hours && now !== null) {
      const [a, b] = s.hours.map(toMin);
      if (now < a || now >= b) return;           // fechado agora
      if (b - now <= 60) closes = s.hours[1];     // fecha em menos de 1 hora
    }
    const d = pos ? km(pos, s) : null;
    const walk = d !== null ? Math.max(1, Math.round(d * 13)) : undefined;
    if (o.minutesLeft != null && (walk ?? 0) + s.v > o.minutesLeft) return;
    const ty = placeType(s.n);
    let score = -k * 0.6;
    let reason: SgReason | null = null;
    if (d !== null) score -= d * 1.5;
    if (closes) { score += 3; reason = "closing"; }
    if ((o.rainSoon || o.hot) && INDOOR.has(ty)) { score += 2; reason ??= o.rainSoon ? "rain" : "heat"; }
    if ((o.rainSoon || o.hot) && OUTDOOR.has(ty)) score -= 2;
    if (!reason && d !== null && d < 0.6) reason = "near";
    cands.push({ s, k, score, reason, walk, closes });
  });
  if (!cands.length) return null;
  cands.sort((a, b) => b.score - a.score);
  const best = cands[0];
  // A primeira do roteiro já é a melhor e não há aviso de horário: nada a sugerir.
  if (best.k === 0 && best.reason !== "closing") return null;
  if (!best.reason) return null;
  return { id: best.s.id, reason: best.reason, ...(best.walk ? { walkMin: best.walk } : {}), ...(best.closes ? { closes: best.closes } : {}) };
}
