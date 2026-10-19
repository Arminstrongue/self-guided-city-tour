/**
 * "Explorar": lugares de diversão, natureza, cultura e família à volta de cada cidade, a partir do OpenStreetMap
 * (Overpass API, dados abertos, sem chave). Um pedido por cidade a cada 24 h, guardado em memória.
 */
import type { City } from "@/data/cities";

export const HOBBIES = ["food", "photo", "nature", "art", "music", "sport", "night", "shopping", "family", "history"] as const;
export type Hobby = (typeof HOBBIES)[number];
export const HOBBY_ICON: Record<Hobby, string> = {
  food: "🍜", photo: "📷", nature: "🌿", art: "🎨", music: "🎵", sport: "⚽", night: "🌙", shopping: "🛍", family: "🧸", history: "🏰"
};

export type PlaceCat = "parks" | "kids" | "fun" | "views" | "markets" | "culture" | "nightlife" | "sport" | "beach" | "country";
export const CAT_ICON: Record<PlaceCat, string> = {
  parks: "🌳", kids: "🧸", fun: "🎡", views: "🌅", markets: "🧺", culture: "🎭", nightlife: "🌙", sport: "🏟", beach: "🏖", country: "⛰"
};
/** Que hobbies cada categoria serve (para ordenar segundo o perfil do viajante). */
export const CAT_HOBBIES: Record<PlaceCat, Hobby[]> = {
  parks: ["nature", "family", "photo"], kids: ["family"], fun: ["family", "night"], views: ["photo", "nature"],
  markets: ["food", "shopping"], culture: ["art", "history", "music"], nightlife: ["night", "music"], sport: ["sport"],
  beach: ["nature", "photo", "family"], country: ["nature", "photo", "history"]
};

/** Filtros Overpass por categoria. Só entram lugares com nome. `far` = procurar nos arredores (raio maior). */
const QUERIES: Record<PlaceCat, { q: string[]; far?: boolean; limit: number }> = {
  parks: { q: ['nwr["leisure"="park"]["name"]', 'nwr["leisure"="garden"]["name"]["access"!="private"]'], limit: 40 },
  kids: { q: ['nwr["leisure"="playground"]["name"]', 'nwr["tourism"="zoo"]["name"]', 'nwr["tourism"="aquarium"]["name"]', 'nwr["leisure"="water_park"]["name"]', 'nwr["leisure"="trampoline_park"]["name"]'], limit: 40 },
  fun: { q: ['nwr["tourism"="theme_park"]["name"]', 'nwr["leisure"="amusement_arcade"]["name"]', 'nwr["leisure"="bowling_alley"]["name"]', 'nwr["leisure"="escape_game"]["name"]', 'nwr["leisure"="miniature_golf"]["name"]', 'nwr["amenity"="cinema"]["name"]'], limit: 40 },
  views: { q: ['nwr["tourism"="viewpoint"]["name"]'], limit: 30 },
  markets: { q: ['nwr["amenity"="marketplace"]["name"]'], limit: 25 },
  culture: { q: ['nwr["tourism"="museum"]["name"]', 'nwr["tourism"="gallery"]["name"]', 'nwr["amenity"="theatre"]["name"]', 'nwr["amenity"="arts_centre"]["name"]', 'nwr["amenity"="music_venue"]["name"]'], limit: 40 },
  nightlife: { q: ['nwr["amenity"="nightclub"]["name"]', 'nwr["amenity"="bar"]["name"]["live_music"="yes"]'], limit: 25 },
  sport: { q: ['nwr["leisure"="stadium"]["name"]', 'nwr["leisure"="marina"]["name"]', 'nwr["leisure"="ice_rink"]["name"]'], limit: 20 },
  beach: { q: ['nwr["natural"="beach"]["name"]'], far: true, limit: 15 },
  country: { q: ['nwr["leisure"="nature_reserve"]["name"]', 'nwr["boundary"="national_park"]["name"]', 'nwr["historic"="castle"]["name"]["tourism"="attraction"]'], far: true, limit: 20 }
};
export const PLACE_CATS = Object.keys(QUERIES) as PlaceCat[];
const NEAR_M = 9000, FAR_M = 40000;

export type Place = { id: string; name: string; cat: PlaceCat; lat: number; lng: number; dist: number; web?: string; hours?: string; fee?: boolean; wiki?: string };

/** Centro aproximado da cidade: média das paragens do roteiro. */
export function cityCenter(c: Pick<City, "stops">) {
  const n = c.stops.length || 1;
  return { lat: c.stops.reduce((a, s) => a + s.lat, 0) / n, lng: c.stops.reduce((a, s) => a + s.lng, 0) / n };
}

/** Um pedido por categoria: pedidos pequenos respondem depressa e uma categoria pesada não estraga as outras. */
export function overpassQuery(center: { lat: number; lng: number }, cat?: PlaceCat) {
  const cats = cat ? [cat] : PLACE_CATS;
  const parts = cats.flatMap((c) => QUERIES[c].q.map((q) => `${q}(around:${QUERIES[c].far ? FAR_M : NEAR_M},${center.lat.toFixed(5)},${center.lng.toFixed(5)});`));
  return `[out:json][timeout:25];(${parts.join("")});out center tags qt ${cat ? QUERIES[cat].limit * 6 : 2500};`;
}

type OsmEl = { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

function catOf(t: Record<string, string>): PlaceCat | null {
  if (t.leisure === "park" || t.leisure === "garden") return "parks";
  if (t.leisure === "playground" || t.tourism === "zoo" || t.tourism === "aquarium" || t.leisure === "water_park" || t.leisure === "trampoline_park") return "kids";
  if (t.tourism === "theme_park" || ["amusement_arcade", "bowling_alley", "escape_game", "miniature_golf"].includes(t.leisure ?? "") || t.amenity === "cinema") return "fun";
  if (t.tourism === "viewpoint") return "views";
  if (t.amenity === "marketplace") return "markets";
  if (["museum", "gallery"].includes(t.tourism ?? "") || ["theatre", "arts_centre", "music_venue"].includes(t.amenity ?? "")) return "culture";
  if (t.amenity === "nightclub" || t.amenity === "bar") return "nightlife";
  if (["stadium", "marina", "ice_rink"].includes(t.leisure ?? "")) return "sport";
  if (t.natural === "beach") return "beach";
  if (t.leisure === "nature_reserve" || t.boundary === "national_park" || t.historic === "castle") return "country";
  return null;
}

const R = 6371000, rad = (d: number) => (d * Math.PI) / 180;
export function distM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const x = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(x)));
}

/** Converte a resposta Overpass em lugares: sem duplicados por nome, os mais próximos primeiro, com limite por categoria. */
export function parseOverpass(json: { elements?: OsmEl[] }, center: { lat: number; lng: number }, locale = "en"): Place[] {
  const seen = new Set<string>();
  const all: Place[] = [];
  for (const e of json.elements ?? []) {
    const t = e.tags ?? {};
    const lat = e.lat ?? e.center?.lat, lng = e.lon ?? e.center?.lon;
    const cat = catOf(t);
    const name = (t[`name:${locale}`] || t.name || "").trim();
    if (!cat || lat === undefined || lng === undefined || !name) continue;
    const key = `${cat}:${name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const web = t.website || t["contact:website"];
    all.push({
      id: `${e.type[0]}${e.id}`, name, cat, lat, lng, dist: distM(center, { lat, lng }),
      ...(web && /^https?:\/\//.test(web) ? { web } : {}), ...(t.opening_hours ? { hours: t.opening_hours.slice(0, 80) } : {}),
      ...(t.fee === "yes" ? { fee: true } : t.fee === "no" ? { fee: false } : {}),
      ...(t.wikipedia ? { wiki: t.wikipedia } : {})
    });
  }
  const out: Place[] = [];
  for (const cat of PLACE_CATS) {
    // Lugares com página na Wikipédia sobem um pouco: costumam ser os mais conhecidos.
    const list = all.filter((p) => p.cat === cat).sort((a, b) => (a.dist - (a.wiki ? 1500 : 0)) - (b.dist - (b.wiki ? 1500 : 0)));
    out.push(...list.slice(0, QUERIES[cat].limit));
  }
  return out;
}

/** Ordena categorias segundo os hobbies escolhidos (as que servem mais hobbies primeiro). */
export function rankCats(hobbies: Hobby[]): PlaceCat[] {
  // Categorias mais específicas pesam mais: "família" põe Crianças à frente de Parques.
  const score = (c: PlaceCat) => CAT_HOBBIES[c].filter((h) => hobbies.includes(h)).length / CAT_HOBBIES[c].length;
  return [...PLACE_CATS].sort((a, b) => score(b) - score(a));
}

const ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
const cache = new Map<string, { at: number; json: { elements?: OsmEl[] } }>();
const pending = new Map<string, Promise<{ elements?: OsmEl[] } | null>>();
const DAY = 24 * 3600_000;

type OsmJson = { elements?: OsmEl[]; remark?: string };

async function fetchCat(city: City, cat: PlaceCat): Promise<OsmEl[] | null> {
  const body = new URLSearchParams({ data: overpassQuery(cityCenter(city), cat) }).toString();
  for (const url of ENDPOINTS) {
    try {
      const r = await fetch(url, { method: "POST", body, headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "SelfGuidedCityTour/1.0 (hello@selfguidedcitytour.com)" }, signal: AbortSignal.timeout(30_000) });
      if (!r.ok) { console.warn(`[explore] ${city.id}/${cat} ${url} HTTP ${r.status}`); continue; }
      const j = (await r.json()) as OsmJson;
      // O Overpass responde 200 mesmo quando o pedido falha (tempo ou memória): o erro vem em "remark".
      if (j.remark && /error|timed out|out of memory/i.test(j.remark) && !j.elements?.length) { console.warn(`[explore] ${city.id}/${cat}: ${j.remark.slice(0, 120)}`); continue; }
      return j.elements ?? [];
    } catch (e) { console.warn(`[explore] ${city.id}/${cat} ${url}: ${(e as Error).message}`); }
  }
  return null;
}

/** Pede as categorias uma a uma (o Overpass só aceita 2 pedidos em simultâneo por servidor). */
async function fetchOsm(city: City): Promise<{ elements: OsmEl[] } | null> {
  const elements: OsmEl[] = [];
  let ok = 0;
  for (const cat of PLACE_CATS) {
    const els = await fetchCat(city, cat);
    if (els) { ok++; elements.push(...els); }
  }
  return ok && elements.length ? { elements } : null; // vazio não fica em cache: tenta outra vez no pedido seguinte
}

/** Um pedido ao OpenStreetMap por cidade a cada 24 h (partilhado por todos os idiomas e pedidos em simultâneo). */
export async function placesFor(city: City, locale: string): Promise<Place[] | null> {
  const hit = cache.get(city.id);
  let json = hit && Date.now() - hit.at < DAY ? hit.json : null;
  if (!json) {
    let p = pending.get(city.id);
    if (!p) { p = fetchOsm(city).finally(() => pending.delete(city.id)); pending.set(city.id, p); }
    const fresh = await p;
    if (fresh) { cache.set(city.id, { at: Date.now(), json: fresh }); json = fresh; } else json = hit?.json ?? null; // em falha, serve a cópia antiga
  }
  return json ? parseOverpass(json, cityCenter(city), locale) : null;
}
