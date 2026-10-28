/**
 * Plano de viagem: UMA fonte para o planeador, a página da cidade (compra), o roteiro e a carteira.
 * - start / end: onde começa e onde tem de terminar (aeroporto, estação, terminal de cruzeiros, hotel, morada, onde estou).
 * - mode: como sai da cidade (avião, comboio, navio), "stay" (não sai: só tem de voltar ao ponto final)
 *   ou "walk" (termina a pé num lugar à escolha: museu, morada, restaurante).
 * - startAt: data e hora de início, na hora local da cidade ("AAAA-MM-DDTHH:MM"); vazio = agora.
 * - deadline: hora da partida (ou "voltar até"), na hora local da cidade; vazio = sem hora limite.
 * Todas as contas de tempo usam `breakdown`, para os números serem iguais em todos os ecrãs.
 */
import type { City } from "@/data/cities";
import { hop, type CityHop, type RoutePlan } from "./route-cost";
import { zonedToDate } from "./zoned";

export type Mode = "plane" | "train" | "bus" | "ship" | "stay" | "walk";
export type PlaceKind = "station" | "bus" | "port" | "hotel" | "address" | "here";
/** Aeroporto: terminal opcional (código oficial, ex.: "2", "2E", "N") — o viajante confirma no cartão de embarque. */
/** Estação ou terminal de autocarros: plataforma / cais opcional (ex.: "5", "13A") — anunciada pouco antes da partida, o viajante confirma no painel. */
export type Endpoint = { kind: "airport"; terminal?: string } | { kind: PlaceKind; lat: number; lng: number; label: string; platform?: string };
export const PLATFORM_RE = /^[A-Za-z0-9]{1,5}$/;
/** buffer: margem antes da partida escolhida pelo viajante, em minutos (vazio = a recomendada para a modalidade). */
/** next: a cidade para onde segue depois (avião, comboio, autocarro ou navio); `city` é o id quando é uma cidade VOYBU. */
export type NextCity = { city?: string; name: string };
export type Trip = { v: 2; start: Endpoint; end: Endpoint; mode: Mode; startAt: string; deadline: string; key?: string; buffer?: number; next?: NextCity };

/** Margem antes da partida (chegar com tempo ao aeroporto, à estação ou ao navio). */
export const BUFFER_MIN: Record<Mode, number> = { plane: 150, train: 45, bus: 20, ship: 60, stay: 0, walk: 0 };
/** Limites e passo da margem ajustável (minutos). */
export const BUFFER_RANGE: Record<Mode, { min: number; max: number; step: number }> = {
  plane: { min: 60, max: 300, step: 15 }, train: { min: 10, max: 120, step: 5 }, bus: { min: 5, max: 90, step: 5 },
  ship: { min: 30, max: 180, step: 15 }, stay: { min: 0, max: 0, step: 0 }, walk: { min: 0, max: 0, step: 0 }
};
/** Margem em vigor: a escolhida (dentro dos limites) ou a recomendada. */
export function bufferOf(t: Pick<Trip, "mode"> & { buffer?: number }): number {
  const r = BUFFER_RANGE[t.mode];
  if (typeof t.buffer !== "number" || !Number.isFinite(t.buffer) || r.max === 0) return BUFFER_MIN[t.mode];
  return Math.min(r.max, Math.max(r.min, Math.round(t.buffer)));
}

/** Onde a partida acontece, para cada modalidade (o fim do percurso tem de ser deste tipo). */
export const END_FOR_MODE: Record<Mode, Endpoint["kind"] | null> = { plane: "airport", train: "station", bus: "bus", ship: "port", stay: null, walk: null };

export const AIRPORT: Endpoint = { kind: "airport" };
export const defaultTrip = (): Trip => ({ v: 2, start: AIRPORT, end: AIRPORT, mode: "plane", startAt: "", deadline: "" });

export const sameEnd = (a: Endpoint, b: Endpoint) =>
  a.kind === b.kind && (a.kind === "airport" || (b.kind !== "airport" && a.lat === b.lat && a.lng === b.lng));

/** O fim combina com a modalidade? (comboio → estação, navio → terminal, avião → aeroporto). */
export function endMatchesMode(t: Pick<Trip, "end" | "mode">): boolean {
  const need = END_FOR_MODE[t.mode];
  // De comboio também se pode terminar no aeroporto (muitos têm estação ferroviária).
  // De autocarro pode terminar numa estação de autocarros, numa paragem qualquer (morada) ou numa estação de comboios.
  return !need || t.end.kind === need || (t.mode === "train" && t.end.kind === "airport") || (t.mode === "bus" && ["hotel", "address", "station", "airport"].includes(t.end.kind));
}

export type Leg = { min: number; how: "airport" | CityHop["m"] };
/** Ida do ponto inicial à 1.ª paragem e volta da última paragem ao ponto final. */
export function endLegs(city: City, plan: RoutePlan, start: Endpoint, end: Endpoint): { to: Leg; back: Leg; toHop: CityHop | null; backHop: CityHop | null } {
  const first = plan.stops[0], last = plan.stops[plan.stops.length - 1];
  const toHop = start.kind === "airport" || !first ? null : hop(start, first);
  const backHop = end.kind === "airport" || !last ? null : hop(last, end);
  return {
    to: toHop ? { min: toHop.min, how: toHop.m } : { min: city.air.min, how: "airport" },
    back: backHop ? { min: backHop.min, how: backHop.m } : { min: plan.ret.min, how: "airport" },
    toHop, backHop
  };
}

export type Breakdown = { tour: number; to: number; back: number; buffer: number; total: number; needed: number };
type LL = { lat: number; lng: number };
/** O mínimo para calcular os tempos (serve também no navegador, sem a cidade inteira). */
export type RouteShape = { air: number; ret: number; tour: number; first: LL | null; last: LL | null };
export const shapeOf = (city: City, plan: RoutePlan): RouteShape => ({
  air: city.air.min, ret: plan.ret.min, tour: plan.minutesTour, first: plan.stops[0] ?? null, last: plan.stops[plan.stops.length - 1] ?? null
});
/**
 * Tempos do percurso, sempre com a mesma base:
 * tour = visitas + deslocações entre paragens; to/back = ida e regresso; total = to + tour + back;
 * needed = total + margem antes da partida.
 */
export function breakdownOf(r: RouteShape, trip: Pick<Trip, "start" | "end" | "mode"> & { buffer?: number }): Breakdown {
  // Ponto ainda por escolher (sem coordenadas): usa o tempo de referência da cidade, nunca NaN.
  const ok = (e: Endpoint) => e.kind === "airport" || (Number.isFinite(e.lat) && Number.isFinite(e.lng));
  const to = trip.start.kind === "airport" || !r.first || !ok(trip.start) ? r.air : hop(trip.start, r.first).min;
  const back = trip.end.kind === "airport" || !r.last || !ok(trip.end) ? r.ret : hop(r.last, trip.end).min;
  const buffer = bufferOf(trip);
  const total = to + r.tour + back;
  return { tour: r.tour, to, back, buffer, total, needed: total + buffer };
}
export const breakdown = (city: City, plan: RoutePlan, trip: Pick<Trip, "start" | "end" | "mode"> & { buffer?: number }) => breakdownOf(shapeOf(city, plan), trip);

/** Instante de início (agora, se não houver data) e instante limite (partida menos a margem), no fuso da cidade. */
export function tripWindow(trip: Pick<Trip, "startAt" | "deadline" | "mode"> & { buffer?: number }, tz: string, now = Date.now()): { start: number; limit: number | null; dep: number | null } {
  const s = trip.startAt ? zonedToDate(trip.startAt, tz).getTime() : NaN;
  const start = Number.isFinite(s) && s > now ? s : now;
  const d = trip.deadline ? zonedToDate(trip.deadline, tz).getTime() : NaN;
  const dep = Number.isFinite(d) ? d : null;
  return { start, limit: dep === null ? null : dep - bufferOf(trip) * 60_000, dep };
}

/** Minutos disponíveis para o percurso (do início até à hora limite já sem a margem). */
export function availableMin(trip: Pick<Trip, "startAt" | "deadline" | "mode"> & { buffer?: number }, tz: string, now = Date.now()): number | null {
  const w = tripWindow(trip, tz, now);
  return w.limit === null ? null : Math.round((w.limit - w.start) / 60_000);
}

/** "15:40", "amanhã, 15:40" ou "sáb., 24 out., 15:40", sempre na hora da cidade. */
export function whenLabel(at: number, tz: string, intl: string, words: { today: string; tomorrow: string }, now = Date.now()): string {
  if (!Number.isFinite(at)) return "—";
  const day = (x: number) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date(x));
  const hm = new Intl.DateTimeFormat(intl, { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(at));
  if (day(at) === day(now)) return hm;
  if (day(at) === day(now + 864e5)) return `${words.tomorrow}, ${hm}`;
  return new Intl.DateTimeFormat(intl, { timeZone: tz, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(at));
}

/** Validação do que vem do navegador ou do servidor. */
export function parseTrip(v: unknown): Trip | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const ep = (x: unknown): Endpoint | null => {
    if (!x || typeof x !== "object") return null;
    const e = x as Record<string, unknown>;
    if (e.kind === "airport") return typeof e.terminal === "string" && /^[A-Za-z0-9 ]{1,8}$/.test(e.terminal) ? { kind: "airport", terminal: e.terminal } : AIRPORT;
    // "bus" faltava aqui: o terminal de autocarros escolhido perdia-se ao voltar a abrir o plano.
    if (!["station", "bus", "port", "hotel", "address", "here"].includes(String(e.kind))) return null;
    if (typeof e.lat !== "number" || typeof e.lng !== "number" || !Number.isFinite(e.lat) || !Number.isFinite(e.lng)) return null;
    const platform = (e.kind === "station" || e.kind === "bus") && typeof e.platform === "string" && PLATFORM_RE.test(e.platform) ? { platform: e.platform } : {};
    return { kind: e.kind as PlaceKind, lat: e.lat, lng: e.lng, label: String(e.label ?? "").slice(0, 120), ...platform };
  };
  const start = ep(o.start), end = ep(o.end);
  const mode = ["plane", "train", "bus", "ship", "stay", "walk"].includes(String(o.mode)) ? (o.mode as Mode) : null;
  const dt = (x: unknown) => (typeof x === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(x) ? x : "");
  if (!start || !end || !mode) return null;
  return { v: 2, start, end, mode, startAt: dt(o.startAt), deadline: dt(o.deadline), ...(typeof o.key === "string" ? { key: o.key.slice(0, 8) } : {}),
    ...(typeof o.buffer === "number" && Number.isFinite(o.buffer) && BUFFER_RANGE[mode].max > 0 ? { buffer: bufferOf({ mode, buffer: o.buffer }) } : {}),
    ...(nextOf(o.next, mode) ?? {}) };
}
function nextOf(x: unknown, mode: Mode): { next: NextCity } | null {
  if (!x || typeof x !== "object" || mode === "stay" || mode === "walk") return null;
  const n = x as Record<string, unknown>;
  const name = String(n.name ?? "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 60);
  if (!name) return null;
  const city = typeof n.city === "string" && /^[a-z0-9-]{2,40}$/.test(n.city) ? n.city : undefined;
  return { next: city ? { city, name } : { name } };
}

/** Plano completo: início e fim com posição, e o fim de acordo com a modalidade. */
export const endpointReady = (e: Endpoint) => e.kind === "airport" || (Number.isFinite(e.lat) && Number.isFinite(e.lng));
export const tripReady = (t: Trip) => endpointReady(t.start) && endpointReady(t.end) && endMatchesMode(t);

/** Hora local da cidade agora, no formato dos campos de data ("AAAA-MM-DDTHH:MM"). */
export function cityNowLocal(tz: string, plusMin = 0, now = Date.now()): string {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
    .formatToParts(new Date(now + plusMin * 60_000)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
