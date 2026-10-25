/**
 * "Explorar" com o Google Places (API New, Text Search): fotos, avaliações e horário de cada lugar.
 * Só ativo com GOOGLE_PLACES_API_KEY. Uma pesquisa por categoria, em paralelo; cache de 7 dias por cidade (partilhada por todos os idiomas, para limitar o custo)
 * (as regras da Google não permitem guardar estes dados em base de dados).
 */
import type { City } from "@/data/cities";
import { cityCenter, distM, PUBLIC_CATS, type Place, type PlaceCat } from "./explore";
import { takeGoogle } from "./gbudget";

/** Pesquisa por categoria (em inglês, funciona em qualquer país). `far` = arredores. */
const Q: Record<PlaceCat, { q: string; far?: boolean }> = {
  parks: { q: "best parks and gardens" },
  kids: { q: "playgrounds and family attractions for children" },
  fun: { q: "amusement parks, bowling, escape rooms and entertainment" },
  views: { q: "scenic viewpoints and observation decks" },
  markets: { q: "food markets and street markets" },
  culture: { q: "museums, art galleries and theatres" },
  nightlife: { q: "nightclubs and live music bars" },
  sport: { q: "stadiums and stadium tours" },
  beach: { q: "beaches", far: true },
  country: { q: "countryside attractions, nature reserves and national parks", far: true }
};

export const googleExploreEnabled = () => Boolean(process.env.GOOGLE_PLACES_API_KEY);

type GPlace = {
  id: string; displayName?: { text: string }; location?: { latitude: number; longitude: number }; rating?: number; userRatingCount?: number;
  googleMapsUri?: string; websiteUri?: string; currentOpeningHours?: { openNow?: boolean }; primaryTypeDisplayName?: { text: string };
  photos?: { name: string }[]; priceLevel?: string;
};

export function mapGoogle(list: GPlace[], cat: PlaceCat, center: { lat: number; lng: number }, limit = 20): Place[] {
  return list
    .filter((p) => p.displayName?.text && p.location)
    .map((p) => ({
      id: `g:${p.id}`, name: p.displayName!.text, cat, lat: p.location!.latitude, lng: p.location!.longitude,
      dist: distM(center, { lat: p.location!.latitude, lng: p.location!.longitude }),
      ...(p.websiteUri ? { web: p.websiteUri } : {}), ...(p.googleMapsUri ? { gmaps: p.googleMapsUri } : {}),
      ...(p.rating ? { rating: p.rating, reviews: p.userRatingCount ?? 0 } : {}),
      ...(p.currentOpeningHours?.openNow !== undefined ? { openNow: p.currentOpeningHours.openNow } : {}),
      ...(p.photos?.[0]?.name ? { photo: p.photos[0].name } : {}),
      ...(p.primaryTypeDisplayName?.text ? { type: p.primaryTypeDisplayName.text } : {}),
      ...(p.priceLevel === "PRICE_LEVEL_FREE" ? { fee: false } : {})
    }))
    .slice(0, limit);
}

const cache = new Map<string, { at: number; places: Place[] }>();
const TTL = 30 * 60_000; // 30 min: os termos da Google não permitem guardar conteúdo dos Places; cache curta só para desempenho (o limite diário de chamadas protege o custo)

async function search(cat: PlaceCat, cityName: string, center: { lat: number; lng: number }, lang: string): Promise<Place[]> {
  const { q, far } = Q[cat];
  if (!takeGoogle("search")) throw new Error("google_daily_cap");
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY ?? "",
      "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri,places.currentOpeningHours.openNow,places.primaryTypeDisplayName,places.photos,places.priceLevel"
    },
    body: JSON.stringify({ textQuery: `${q} ${far ? "near" : "in"} ${cityName}`, languageCode: lang, pageSize: 20, locationBias: { circle: { center: { latitude: center.lat, longitude: center.lng }, radius: far ? 50000 : 12000 } } }),
    signal: AbortSignal.timeout(10_000), cache: "no-store"
  });
  if (!r.ok) { console.warn(`[explore/google] ${cat} HTTP ${r.status} ${(await r.text()).slice(0, 160)}`); throw new Error(String(r.status)); }
  const j = (await r.json()) as { places?: GPlace[] };
  return mapGoogle(j.places ?? [], cat, center);
}

export async function googlePlacesFor(city: City, _lang: string): Promise<Place[] | null> {
  const key = city.id, lang = "en"; // nomes dos lugares vêm no idioma local; uma só pesquisa serve todos os idiomas
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.places;
  const center = cityCenter(city);
  const res = await Promise.allSettled(PUBLIC_CATS.map((c) => search(c, city.n.en, center, lang)));
  const seen = new Set<string>();
  const places = res.flatMap((r) => (r.status === "fulfilled" ? r.value : [])).filter((p) => !seen.has(p.id) && (seen.add(p.id), true));
  if (!places.length) return hit?.places ?? null;
  cache.set(key, { at: Date.now(), places });
  return places;
}

/** Foto de um lugar (redireciona para o URL temporário do Google; a chave nunca vai para o navegador). */
export async function photoUrl(name: string, w = 640): Promise<string | null> {
  if (!/^places\/[\w-]+\/photos\/[\w-]+$/.test(name)) return null;
  if (!takeGoogle("photo")) return null;
  const r = await fetch(`https://places.googleapis.com/v1/${name}/media?maxWidthPx=${w}&skipHttpRedirect=true&key=${process.env.GOOGLE_PLACES_API_KEY ?? ""}`, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) return null;
  return ((await r.json()) as { photoUri?: string }).photoUri ?? null;
}
