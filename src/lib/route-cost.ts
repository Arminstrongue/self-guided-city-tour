import type { City, Leg, Stop } from "@/data/cities";
import { AIRPORT_BUFFER_MIN } from "./pricing";

export type RoutePlan = {
  stops: Stop[];
  ret: Leg;
  rides: number;          // viagens pagas com a tarifa da cidade
  fixed: number;          // bilhetes fixos (aeroporto)
  entries: number;        // entradas/compras incluídas
  minutesTotal: number;   // aeroporto → aeroporto
  minutesTour: number;    // primeira paragem → última paragem
  singles: number;        // custo total com bilhetes simples (inclui cartão e aeroporto)
  alt: number | null;     // custo total com a alternativa da cidade (passe, pacote, teto)
  best: "singles" | "alt";
  transport: number;      // opção mais barata
};

export function hasExtension(city: City): boolean {
  return city.stops.some((s) => s.x);
}

/**
 * Plano do roteiro. `maxStops` encurta o roteiro base (sem extensão), mantendo as primeiras paragens;
 * o regresso continua a ser o do roteiro base (aproximação: as paragens do fim ficam perto do centro).
 */
export function planRoute(city: City, withExtension: boolean, maxStops?: number): RoutePlan {
  let stops = city.stops.filter((s) => withExtension || !s.x);
  if (!withExtension && maxStops && maxStops < stops.length) stops = stops.slice(0, Math.max(1, maxStops));
  const ret = withExtension && hasExtension(city) ? city.ret.extra : city.ret.core;
  const legs: Leg[] = [city.air, ...stops.slice(1).map((s) => s.leg), ret];
  let minutes = 0, rides = 0, fixed = 0, entries = 0;
  for (const l of legs) { minutes += l.min; rides += l.r ?? 0; fixed += l.f ?? 0; }
  for (const s of stops) { minutes += s.v; entries += s.c ?? 0; }
  // a primeira paragem tem leg de 0 min (já está no fim da ligação ao aeroporto)
  minutes += stops[0]?.leg.min ?? 0;

  const card = rides > 0 ? city.card : 0; // cartão só é preciso se houver viagens com a tarifa da cidade
  const singles = rides * city.single + card + fixed;
  let alt: number | null = null;
  const a = city.alt;
  if (a?.type === "pass") alt = a.price + (a.includesAirport ? 0 : card + fixed);
  if (a?.type === "pack") alt = Math.ceil(rides / a.n) * a.price + card + fixed;
  if (a?.type === "cap") alt = Math.min(rides * city.single, a.price) + fixed;
  const best = alt === null || singles <= alt ? "singles" : "alt";
  return {
    stops, ret, rides, fixed, entries,
    minutesTotal: minutes,
    minutesTour: minutes - city.air.min - ret.min,
    singles: round2(singles), alt: alt === null ? null : round2(alt), best,
    transport: round2(best === "singles" ? singles : (alt as number))
  };
}

/** Escolhas de roteiro, da mais curta à mais completa. `key`: "ext", "core" ou "n<paragens>". */
export type RouteOption = { key: string; plan: RoutePlan };
export const MIN_STOPS = 2;

export function routeOptions(city: City): RouteOption[] {
  const core = city.stops.filter((s) => !s.x).length;
  const out: RouteOption[] = [];
  for (let n = Math.min(MIN_STOPS, core); n < core; n++) out.push({ key: `n${n}`, plan: planRoute(city, false, n) });
  out.push({ key: "core", plan: planRoute(city, false) });
  if (hasExtension(city)) out.push({ key: "ext", plan: planRoute(city, true) });
  return out;
}

export function optionByKey(city: City, key: string | null | undefined): RouteOption | undefined {
  return routeOptions(city).find((o) => o.key === key);
}

/**
 * O roteiro mais completo que cabe no tempo disponível (minutos, de aeroporto a aeroporto,
 * já sem a margem antes do voo). Devolve null se nem o mais curto cabe.
 */
export function fitRoute(city: City, availableMin: number): RouteOption | null {
  const fits = routeOptions(city).filter((o) => o.plan.minutesTotal <= availableMin);
  return fits.length ? fits[fits.length - 1] : null;
}

/** Tempo médio para passar a fronteira e sair do aeroporto (minutos). */
export const EXIT_AIRPORT_MIN = { free: 30, check: 60 } as const;

/** Distância em linha reta (km). */
export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Minutos a pé (4,5 km/h, com 30% a mais pelo traçado das ruas). */
export const walkMin = (d: number) => Math.round((d * 1.3 / 4.5) * 60);

/**
 * Estimativa do tempo de regresso ao aeroporto a partir de um ponto: proporcional à ligação
 * aeroporto → primeira paragem da cidade, mais 10 minutos de espera. Nunca abaixo de 15 minutos.
 */
/** Mais longe do que isto do centro, o viajante ainda não chegou à cidade. */
export const FAR_KM = 60;

export function returnEstimate(city: City, from: { lat: number; lng: number }): number | null {
  if (!city.ap || !city.stops[0]) return null;
  const ref = km(city.stops[0], city.ap);
  if (ref < 1) return null;
  if (km(from, city.stops[0]) > FAR_KM) return null; // ainda não está na cidade
  return Math.max(15, Math.round((city.air.min * km(from, city.ap)) / ref + 10));
}

/** Hora a que o viajante deve sair da última paragem para chegar ao aeroporto a tempo. */
export function leaveBy(flightAt: Date, ret: Leg): Date {
  return new Date(flightAt.getTime() - (AIRPORT_BUFFER_MIN + ret.min) * 60_000);
}

function round2(v: number) { return Math.round(v * 100) / 100; }

/* ---------- Ponto de partida: aeroporto, hotel ou onde estou ---------- */

/** De onde começa e acaba o percurso. Sem `place`, é o aeroporto (o roteiro clássico de escala). */
export type Base = { kind: "airport" } | { kind: "place"; lat: number; lng: number; label: string; here?: boolean };
export type CityHop = { m: "walk" | "metro"; min: number; km: number };

/** Até esta distância vale a pena ir a pé (km em linha reta). */
export const WALK_MAX_KM = 1.6;

/**
 * Estimativa de uma deslocação dentro da cidade: a pé até 1,6 km; acima disso transporte público
 * (10 min de espera e caminho até à estação + ~18 km/h de média). Arredonda a 5 minutos.
 */
export function hop(a: { lat: number; lng: number }, b: { lat: number; lng: number }): CityHop {
  const d = km(a, b);
  if (d <= WALK_MAX_KM) return { m: "walk", min: Math.max(3, walkMin(d)), km: d };
  return { m: "metro", min: Math.ceil((10 + (d * 1.3 / 18) * 60) / 5) * 5, km: d };
}

/** O percurso visto a partir de um ponto: ida até à 1.ª paragem, volta da última e tempo total. */
export type BasePlan = { to: CityHop | null; back: CityHop | null; minutesTotal: number };
export function planFromBase(city: City, plan: RoutePlan, base: Base): BasePlan {
  if (base.kind !== "place" || !plan.stops.length) return { to: null, back: null, minutesTotal: plan.minutesTotal };
  const to = hop(base, plan.stops[0]);
  const back = hop(plan.stops[plan.stops.length - 1], base);
  return { to, back, minutesTotal: to.min + plan.minutesTour + back.min };
}

/** O roteiro mais completo que cabe no tempo, a partir do ponto escolhido. */
export function fitFromBase(city: City, base: Base, availableMin: number): RouteOption | null {
  const fits = routeOptions(city).filter((o) => planFromBase(city, o.plan, base).minutesTotal <= availableMin);
  return fits.length ? fits[fits.length - 1] : null;
}

/**
 * Minutos que faltam até voltar ao ponto de partida, a contar das paragens ainda por fazer
 * (visita + ligação de cada uma) e da volta. Se ainda não começou, inclui a ida.
 */
export function minutesLeft(plan: RoutePlan, bp: BasePlan, done: Record<string, boolean>): number {
  const left = plan.stops.filter((s) => !done[s.id]);
  if (!left.length) return bp.back?.min ?? plan.ret.min;
  const started = left.length < plan.stops.length;
  let m = 0;
  left.forEach((s, i) => { m += s.v; if (i > 0 || started) m += s.leg.min; });
  if (!started) m += bp.to?.min ?? 0;
  return m + (bp.back?.min ?? plan.ret.min);
}
