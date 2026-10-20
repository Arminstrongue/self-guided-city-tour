/**
 * Restaurantes e cafés com as melhores avaliações e o preço mais baixo perto de um ponto
 * (Google Places API New, "searchNearby"). Só ativo com GOOGLE_PLACES_API_KEY.
 * Custo: um pedido por paragem e idioma a cada 6 h por instância (cache em memória).
 * Regras da Google: mostrar a atribuição "Google Maps" e não guardar os dados em base de dados.
 */
import { takeGoogle } from "./gbudget";

export type Eat = {
  id: string; name: string; rating: number; reviews: number; price: number | null;
  openNow: boolean | null; type: string | null; url: string; lat: number; lng: number; score: number;
};

export const placesEnabled = () => Boolean(process.env.GOOGLE_PLACES_API_KEY);

const PRICE: Record<string, number> = {
  PRICE_LEVEL_FREE: 0, PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4
};

/** Média bayesiana: 4,9 com 12 avaliações não passa à frente de 4,6 com 3 000. */
export function bayes(rating: number, count: number, m = 200, prior = 4.2): number {
  return (count / (count + m)) * rating + (m / (count + m)) * prior;
}

type ApiPlace = {
  id: string; displayName?: { text: string }; rating?: number; userRatingCount?: number; priceLevel?: string;
  currentOpeningHours?: { openNow?: boolean }; primaryTypeDisplayName?: { text: string }; googleMapsUri?: string;
  location?: { latitude: number; longitude: number };
};

/** Filtra (avaliação ≥ 4,2, ≥ 50 avaliações, preço até moderado) e ordena por qualidade e preço. */
export function rankEats(list: ApiPlace[], limit = 5): Eat[] {
  return list
    .map((p) => {
      const price = p.priceLevel && p.priceLevel in PRICE ? PRICE[p.priceLevel] : null;
      const rating = p.rating ?? 0, reviews = p.userRatingCount ?? 0;
      // Preço desconhecido conta como moderado, para não passar à frente de um barato confirmado.
      const score = bayes(rating, reviews) - 0.15 * (price ?? 2);
      return {
        id: p.id, name: p.displayName?.text ?? "", rating, reviews, price, openNow: p.currentOpeningHours?.openNow ?? null,
        type: p.primaryTypeDisplayName?.text ?? null, url: p.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${p.id}`,
        lat: p.location?.latitude ?? 0, lng: p.location?.longitude ?? 0, score: Math.round(score * 1000) / 1000
      };
    })
    .filter((e) => e.name && e.rating >= 4.2 && e.reviews >= 50 && (e.price === null || e.price <= 2) && e.openNow !== false)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

const cache = new Map<string, { at: number; v: Eat[] }>();
const TTL = 6 * 3600e3;

export async function bestEats(lat: number, lng: number, lang: string): Promise<Eat[]> {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)},${lang}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.v;
  if (!takeGoogle("search")) return [];
  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY ?? "",
      "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours.openNow,places.primaryTypeDisplayName,places.googleMapsUri,places.location"
    },
    body: JSON.stringify({
      includedTypes: ["restaurant", "cafe", "bakery", "fast_food_restaurant"],
      maxResultCount: 20, rankPreference: "POPULARITY", languageCode: lang,
      locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: 600 } }
    }),
    signal: AbortSignal.timeout(6000), cache: "no-store"
  });
  if (!res.ok) throw new Error(`places ${res.status}`);
  const j = await res.json() as { places?: ApiPlace[] };
  const v = rankEats(j.places ?? []);
  cache.set(key, { at: Date.now(), v });
  if (cache.size > 5000) cache.delete(cache.keys().next().value as string);
  return v;
}
