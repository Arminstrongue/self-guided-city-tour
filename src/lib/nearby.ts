/**
 * Cidades perto (ida e volta no dia, ou a próxima etapa da viagem).
 * Tempo de viagem ESTIMADO a partir da distância em linha reta — não é um horário.
 * Linha ≈ 1,2 × linha reta; comboio interurbano ≈ 130 km/h de média com paragens, + 30 min de acesso à estação.
 * Acima de ~600 km, o avião costuma ser mais rápido (3 h de aeroporto incluídas). Ida e volta no dia: até 3 h 30 por sentido.
 */
import { COUNTRY } from "@/data/city-meta";

export type CityPoint = { id: string; name: string; lat: number; lng: number };

/** Europa continental ligada por terra (comboio/autocarro sem atravessar o mar). */
const LAND_EU = new Set(["PT", "ES", "FR", "IT", "NL", "BE", "LU", "DE", "AT", "CH", "CZ", "PL", "HU", "SK", "SI", "HR", "DK", "SE", "NO", "FI", "RO", "BG", "GR", "RS", "BA", "ME", "AL", "MK", "MC", "SM", "LI", "AD"]);
/** Eurostar: Londres liga por comboio a Paris, Bruxelas e Amesterdão. */
const EUROSTAR = new Set(["par", "bru", "ams", "lil"]);
/** Há ligação por terra (ou túnel) entre as duas cidades? Sem país conhecido, decide só a distância. */
export function groundLink(a: string, b: string): boolean {
  const ca = COUNTRY[a], cb = COUNTRY[b];
  if (!ca || !cb || ca === cb) return true;
  if (LAND_EU.has(ca) && LAND_EU.has(cb)) return true;
  if ((a === "lon" && EUROSTAR.has(b)) || (b === "lon" && EUROSTAR.has(a))) return true;
  return false;
}
export type Near = { id: string; name: string; km: number; min: number; how: "ground" | "plane"; dayTrip: boolean };

const R = 6371;
export function kmBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const r = (x: number) => (x * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function travelEstimate(km: number, ground = true): { min: number; how: "ground" | "plane" } {
  const g = Math.round(((km * 1.2) / 130) * 60 + 30);
  const plane = Math.round((km / 750) * 60 + 180);
  return !ground || (km > 600 && plane < g) ? { min: plane, how: "plane" } : { min: g, how: "ground" };
}

/** Ordena por distância; `maxKm` corta as longínquas. Ida e volta no dia: até 3 h 30 por sentido. */
export function nearbyCities(all: CityPoint[], from: { id?: string; lat: number; lng: number }, maxKm = 900, limit = 8): Near[] {
  return all
    .filter((c) => c.id !== from.id && Number.isFinite(c.lat) && Number.isFinite(c.lng))
    .map((c) => { const k = kmBetween(from, c); const e = travelEstimate(k, groundLink(from.id ?? "", c.id)); return { id: c.id, name: c.name, km: Math.round(k), min: e.min, how: e.how, dayTrip: e.how === "ground" && e.min <= 210 }; })
    .filter((c) => c.km <= maxKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

/** Lista para "Para onde vai a seguir?": todas as cidades, as mais próximas primeiro, com a distância como subtítulo. */
export function citiesByDistance(all: CityPoint[], from: { id?: string; lat: number; lng: number }): (CityPoint & { km: number })[] {
  return all.filter((c) => c.id !== from.id).map((c) => ({ ...c, km: Math.round(kmBetween(from, c)) })).sort((a, b) => a.km - b.km);
}

/** "≈ 2 h 10" / "≈ 45 min". */
export function hoursLabel(min: number): string {
  const r = Math.max(5, Math.round(min / 5) * 5);
  const h = Math.floor(r / 60), m = r % 60;
  return h ? `≈ ${h} h${m ? ` ${String(m).padStart(2, "0")}` : ""}` : `≈ ${m} min`;
}
