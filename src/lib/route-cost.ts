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

export function planRoute(city: City, withExtension: boolean): RoutePlan {
  const stops = city.stops.filter((s) => withExtension || !s.x);
  const ret = withExtension && hasExtension(city) ? city.ret.extra : city.ret.core;
  const legs: Leg[] = [city.air, ...stops.slice(1).map((s) => s.leg), ret];
  let minutes = 0, rides = 0, fixed = 0, entries = 0;
  for (const l of legs) { minutes += l.min; rides += l.r ?? 0; fixed += l.f ?? 0; }
  for (const s of stops) { minutes += s.v; entries += s.c ?? 0; }
  // a primeira paragem tem leg de 0 min (já está no fim da ligação ao aeroporto)
  minutes += stops[0]?.leg.min ?? 0;

  const singles = rides * city.single + city.card + fixed;
  let alt: number | null = null;
  const a = city.alt;
  if (a?.type === "pass") alt = a.price + (a.includesAirport ? 0 : city.card + fixed);
  if (a?.type === "pack") alt = Math.ceil(rides / a.n) * a.price + city.card + fixed;
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

/** Hora a que o viajante deve sair da última paragem para chegar ao aeroporto a tempo. */
export function leaveBy(flightAt: Date, ret: Leg): Date {
  return new Date(flightAt.getTime() - (AIRPORT_BUFFER_MIN + ret.min) * 60_000);
}

function round2(v: number) { return Math.round(v * 100) / 100; }
