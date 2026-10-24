/**
 * Partilhar um roteiro com amigos: o link leva a cidade e as paragens (por ordem) e, opcionalmente, o nome do
 * ponto de partida quando é um lugar público (estação, aeroporto, hotel) — nunca a posição de quem partilha.
 */
import type { City, Stop } from "@/data/cities";

export const MAX_SHARED_STOPS = 12;

export function routeSharePath(locale: string, cityId: string, stopIds: string[], from?: string | null): string {
  const q = new URLSearchParams({ s: stopIds.slice(0, MAX_SHARED_STOPS).join(".") });
  if (from && from.trim()) q.set("p", from.trim().slice(0, 60));
  return `/${locale}/r/${cityId}?${q.toString()}`;
}

/** Paragens válidas do link, pela ordem partilhada (ids desconhecidos ou repetidos são ignorados). */
export function sharedStops(city: Pick<City, "stops">, s: string | null | undefined): Stop[] {
  const seen = new Set<string>();
  const out: Stop[] = [];
  for (const id of (s ?? "").split(".").slice(0, MAX_SHARED_STOPS)) {
    const st = city.stops.find((x) => x.id === id);
    if (st && !seen.has(id)) { seen.add(id); out.push(st); }
  }
  return out;
}

/** Tempo do roteiro partilhado: visitas + trajetos entre paragens (o 1.º trajeto depende de onde cada um parte). */
export const sharedMinutes = (stops: Stop[]) => stops.reduce((a, s, i) => a + s.v + (i > 0 ? s.leg.min : 0), 0);

/** Percurso no Google Maps entre as paragens (primeira → última, as outras como pontos intermédios). */
export function sharedMapUrl(stops: Pick<Stop, "lat" | "lng">[]): string {
  const ll = (p: { lat: number; lng: number }) => `${p.lat},${p.lng}`;
  const q = new URLSearchParams({ api: "1", origin: ll(stops[0]), destination: ll(stops[stops.length - 1]), travelmode: "walking" });
  if (stops.length > 2) q.set("waypoints", stops.slice(1, -1).slice(0, 9).map(ll).join("|"));
  return `https://www.google.com/maps/dir/?${q.toString()}`;
}
