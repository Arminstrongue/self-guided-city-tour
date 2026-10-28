import type { City } from "@/data/cities";

/** Cidade sem nomes, zonas, textos nem linhas das paragens: para cálculos de tempo no cliente sem revelar o roteiro pago. */
export function liteCity(city: City): City {
  return { ...city, stops: city.stops.map((s) => ({ ...s, n: "", a: "", pt: "", en: "", leg: { ...s.leg, line: undefined } })) };
}
