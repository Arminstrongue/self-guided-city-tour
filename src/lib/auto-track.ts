/**
 * Registo automático de viagens (motor puro, sem browser): recebe posições GPS e devolve o estado do dia —
 * km, km a pé, passos estimados, cidade, paragens visitadas e o que perguntar ao viajante (sempre com confirmação).
 */
export type LiteCity = { id: string; n: string; lat: number; lng: number; s: [string, string, number, number][] };
export type Fix = { lat: number; lng: number; t: number; acc?: number };
export type Place = { name: string; lat: number; lng: number; stop?: string };
export type Pending =
  | { k: "city"; key: string; city: string; name: string; lat: number; lng: number }
  | { k: "visit"; key: string; city: string; stop: string; name: string; lat: number; lng: number }
  | { k: "place"; key: string; name: string; lat: number; lng: number }
  | { k: "journey"; key: string; day: string; city: string | null; cityName: string; km: number; steps: number; places: Place[]; path: [number, number][] };
export type TState = {
  v: 1; day: string; path: [number, number][]; km: number; walkKm: number; motionSteps: number;
  city: string | null; cityName: string; places: Place[]; last: Fix | null;
  near: { key: string; since: number; lat: number; lng: number } | null; // perto de uma paragem
  stay: { lat: number; lng: number; since: number; asked: boolean; moved?: boolean } | null; // parado num sítio qualquer
  pending: Pending[]; asked: string[];
  /** Onde o viajante esteve parado pela última vez (ou a 1.ª posição). Só se pergunta por um sítio a que chegou a deslocar-se. */
  anchor?: { lat: number; lng: number };
};

export const MAX_ACC = 80;          // ignora posições pouco precisas (m)
export const STOP_R = 70;           // raio de uma paragem (m)
export const STOP_DWELL = 3 * 60e3; // tempo mínimo perto de uma paragem para contar como visita
export const STAY_R = 50;
export const STAY_DWELL = 12 * 60e3;
export const CITY_KM = 35;
export const STEP_M = 0.75;
export const WALK_MAX_MS = 2.5;     // acima disto não é a pé (m/s)
export const ARRIVE_M = 300;        // deslocação mínima desde o último sítio parado para perguntar "parou em…?"

export const blankState = (day: string): TState => ({ v: 1, day, path: [], km: 0, walkKm: 0, motionSteps: 0, city: null, cityName: "", places: [], last: null, near: null, stay: null, pending: [], asked: [] });
export const dayOf = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

export function metres(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371e3, r = Math.PI / 180, dl = (b.lat - a.lat) * r, dg = (b.lng - a.lng) * r;
  const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dg / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
/** Passos: o sensor de movimento quando conta bem; senão, estimativa pela distância a pé. */
export const stepsOf = (s: Pick<TState, "walkKm" | "motionSteps">) => Math.max(s.motionSteps, Math.round((s.walkKm * 1000) / STEP_M));

/** Reduz o trajeto a no máximo n pontos (mantém o primeiro e o último). */
export function thin(path: [number, number][], n = 300): [number, number][] {
  if (path.length <= n) return path;
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) out.push(path[Math.round((i * (path.length - 1)) / (n - 1))]);
  return out;
}

const ask = (s: TState, p: Pending) => { if (!s.asked.includes(p.key) && !s.pending.some((x) => x.key === p.key)) s.pending.push(p); };

/** Fecha o dia: se houve percurso a sério, fica a pergunta para o confirmar. */
export function closeDay(s: TState, nextDay: string): TState {
  const out = blankState(nextDay);
  out.asked = s.asked.slice(-200);
  out.pending = s.pending.filter((p) => p.k === "journey");
  if (s.km >= 0.3 || s.places.length) {
    out.pending.push({ k: "journey", key: `journey:${s.day}`, day: s.day, city: s.city, cityName: s.cityName, km: Math.round(s.km * 10) / 10, steps: stepsOf(s), places: s.places, path: thin(s.path) });
  }
  return out;
}

export function step(prev: TState, fix: Fix, cities: LiteCity[]): TState {
  if (fix.acc !== undefined && fix.acc > MAX_ACC) return prev;
  let s: TState = { ...prev, path: prev.path, places: prev.places, pending: [...prev.pending], asked: prev.asked };
  const today = dayOf(fix.t);
  if (s.day !== today) s = closeDay(s, today);
  // Estado antigo sem âncora: as perguntas "parou em…" já em fila podem ter nascido sem deslocação — descartam-se.
  if (!s.anchor) { s.anchor = { lat: fix.lat, lng: fix.lng }; s.pending = s.pending.filter((p) => p.k !== "place" && p.k !== "visit"); }
  const anchor = s.anchor;

  // Distância (ignora saltos impossíveis do GPS e tremores parados).
  if (s.last) {
    const d = metres(s.last, fix), dt = Math.max(1, (fix.t - s.last.t) / 1000);
    if (d / dt > 70) return s; // > 250 km/h: erro de GPS
    if (d >= 15) {
      s.km += d / 1000;
      if (d / dt <= WALK_MAX_MS) s.walkKm += d / 1000;
      const lp = s.path[s.path.length - 1];
      if (!lp || metres({ lat: lp[0], lng: lp[1] }, fix) >= 40) s.path = [...s.path, [+fix.lat.toFixed(5), +fix.lng.toFixed(5)] as [number, number]].slice(-1500);
      s.last = fix;
    } else s.last = { ...s.last, t: s.last.t }; // mantém a âncora para não somar tremores
  } else { s.last = fix; s.path = [[+fix.lat.toFixed(5), +fix.lng.toFixed(5)]]; }

  // Cidade mais próxima.
  let best: LiteCity | null = null, bd = Infinity;
  for (const c of cities) { const d = metres(c, fix); if (d < bd) { bd = d; best = c; } }
  const city = best && bd <= CITY_KM * 1000 ? best : null;
  if (city && city.id !== s.city) { s.city = city.id; s.cityName = city.n; }
  if (city) ask(s, { k: "city", key: `city:${city.id}`, city: city.id, name: city.n, lat: fix.lat, lng: fix.lng });

  // Paragem: perto durante STOP_DWELL → pergunta se visitou.
  let stopHit: [string, string, number, number] | null = null;
  if (city) for (const st of city.s) if (metres({ lat: st[2], lng: st[3] }, fix) <= STOP_R) { stopHit = st; break; }
  if (stopHit && city) {
    const key = `visit:${city.id}:${stopHit[0]}`;
    if (!s.near || s.near.key !== key) s.near = { key, since: fix.t, lat: stopHit[2], lng: stopHit[3] };
    else if (fix.t - s.near.since >= STOP_DWELL) {
      // Sem deslocação (ex.: o hotel fica ao lado da paragem, ou o telemóvel está pousado), não pergunta.
      if (metres(anchor, s.near) >= ARRIVE_M) ask(s, { k: "visit", key, city: city.id, stop: stopHit[0], name: stopHit[1], lat: stopHit[2], lng: stopHit[3] });
      s.anchor = { lat: s.near.lat, lng: s.near.lng };
    }
  } else s.near = null;

  // Parado num sítio que não é paragem → pergunta se quer guardar (o nome vem depois, pela morada).
  if (!stopHit) {
    if (!s.stay || metres(s.stay, fix) > STAY_R) s.stay = { lat: fix.lat, lng: fix.lng, since: fix.t, asked: false, moved: metres(anchor, fix) >= ARRIVE_M };
    else if (!s.stay.asked && fix.t - s.stay.since >= STAY_DWELL) {
      s.stay = { ...s.stay, asked: true };
      // Só pergunta se chegou aqui a deslocar-se; parado desde o início (casa, hotel, telemóvel pousado) não gera alertas.
      if (s.stay.moved) ask(s, { k: "place", key: `place:${s.stay.lat.toFixed(3)},${s.stay.lng.toFixed(3)}`, name: "", lat: s.stay.lat, lng: s.stay.lng });
      s.anchor = { lat: s.stay.lat, lng: s.stay.lng };
    }
  } else s.stay = null;
  return s;
}

/** Resposta do viajante: confirmar guarda o lugar no percurso; ignorar não volta a perguntar. */
export function resolve(s: TState, key: string, ok: boolean): TState {
  const p = s.pending.find((x) => x.key === key);
  const out = { ...s, pending: s.pending.filter((x) => x.key !== key), asked: [...s.asked, key].slice(-300) };
  if (ok && p && (p.k === "visit" || p.k === "place") && !out.places.some((x) => x.name === p.name)) {
    out.places = [...out.places, { name: p.name || `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`, lat: p.lat, lng: p.lng, ...(p.k === "visit" ? { stop: p.stop } : {}) }];
  }
  return out;
}
