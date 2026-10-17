/**
 * Fotografias e avaliações das paragens.
 *
 * - Sempre: galeria de fotos livres da Wikimedia Commons (com autor e licença, como a licença exige),
 *   encontradas pelo artigo da Wikipédia de cada ponto.
 * - Com GOOGLE_PLACES_API_KEY: nota média, número de avaliações, as avaliações mais úteis e fotos do Google
 *   (com a atribuição que a Google exige). Os dados da Google ficam só em memória durante 24 h.
 *
 * Tudo corre no servidor (a chave da Google nunca chega ao navegador) e fica em cache em memória.
 */
import { placesEnabled } from "./places";

export type Photo = { url: string; thumb: string; w: number; h: number; credit: string; license: string; source: "wikimedia" | "google"; page?: string };
export type Review = { author: string; avatar: string | null; rating: number; text: string; when: string; url: string | null };
export type Media = {
  photos: Photo[];
  rating: number | null; ratings: number | null;
  reviews: Review[];
  placeId: string | null; mapsUrl: string | null;
  wiki: string | null;
};

const UA = "SelfGuidedCityTour/1.0 (https://selfguidedcitytour.com; hello@selfguidedcitytour.com)";
const WIKI_TTL = 7 * 24 * 3600e3;
const GOOGLE_TTL = 24 * 3600e3;
const cache = new Map<string, { at: number; ttl: number; v: unknown }>();

async function cached<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.v as T;
  const v = await fn();
  cache.set(key, { at: Date.now(), ttl, v });
  if (cache.size > 4000) cache.delete(cache.keys().next().value as string);
  return v;
}

async function getJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "User-Agent": UA, "Api-User-Agent": UA, ...(init.headers ?? {}) }, signal: AbortSignal.timeout(7000), cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${url.slice(0, 80)}`);
  return res.json() as Promise<T>;
}

/** Tira etiquetas HTML dos metadados da Commons ("<a href=…>Autor</a>" → "Autor"). */
export function plain(html: string | undefined): string {
  return (html ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}

/** Ficheiros que não são fotografias (mapas, logótipos, ícones, plantas, brasões). */
export function isPhotoFile(title: string): boolean {
  if (!/\.(jpe?g|webp)$/i.test(title)) return false;
  return !/(map|mapa|karte|carte|plan\b|plano|logo|icon|flag|coat[ _]of[ _]arms|wappen|brasão|escudo|locator|diagram|seal|signature|svg)/i.test(title);
}

/* ---------- Wikimedia ---------- */

type SearchRes = { query?: { search?: { title: string }[] } };
type MediaList = { items?: { title: string; type: string; showInGallery?: boolean }[] };
type InfoRes = { query?: { pages?: Record<string, { title: string; imageinfo?: { thumburl?: string; thumbwidth?: number; thumbheight?: number; descriptionshorturl?: string; width?: number; height?: number; extmetadata?: Record<string, { value: string }> }[] }> } };

async function wikiTitle(q: string): Promise<string | null> {
  const u = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=1&srsearch=${encodeURIComponent(q)}`;
  const j = await getJson<SearchRes>(u);
  return j.query?.search?.[0]?.title ?? null;
}

async function articleFiles(title: string): Promise<string[]> {
  const j = await getJson<MediaList>(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title.replace(/ /g, "_"))}`);
  return (j.items ?? []).filter((i) => i.type === "image" && i.showInGallery !== false && isPhotoFile(i.title)).map((i) => i.title);
}

async function commonsSearch(q: string, n: number): Promise<string[]> {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&list=search&format=json&srnamespace=6&srlimit=${n}&srsearch=${encodeURIComponent(q + " filetype:bitmap")}`;
  const j = await getJson<SearchRes>(u);
  return (j.query?.search ?? []).map((s) => s.title).filter(isPhotoFile);
}

async function fileInfo(titles: string[]): Promise<Photo[]> {
  if (!titles.length) return [];
  const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1280&titles=${encodeURIComponent(titles.join("|"))}`;
  const j = await getJson<InfoRes>(u);
  const byTitle = new Map(Object.values(j.query?.pages ?? {}).map((p) => [p.title, p]));
  const out: Photo[] = [];
  for (const t of titles) {
    const ii = byTitle.get(t)?.imageinfo?.[0];
    if (!ii?.thumburl || !ii.width || !ii.height) continue;
    if (ii.width < 900 || ii.height < 500) continue;          // pequenas demais para ecrã inteiro
    const r = ii.width / ii.height;
    if (r < 0.6 || r > 2.4) continue;                          // panorâmicas extremas
    const m = ii.extmetadata ?? {};
    out.push({
      url: ii.thumburl, thumb: ii.thumburl.replace(/\/1280px-/, "/500px-"),
      w: ii.thumbwidth ?? 1280, h: ii.thumbheight ?? Math.round(1280 / r),
      credit: plain(m.Artist?.value).slice(0, 80) || "Wikimedia Commons", license: plain(m.LicenseShortName?.value) || "CC",
      source: "wikimedia", page: ii.descriptionshorturl
    });
  }
  return out;
}

/** Até `max` fotos para um ponto: primeiro as do artigo da Wikipédia, depois pesquisa na Commons. */
export async function wikiPhotos(names: string[], city: string, max = 10): Promise<{ photos: Photo[]; wiki: string | null }> {
  return cached(`wiki:${names.join("|")}:${city}`, WIKI_TTL, async () => {
    const files: string[] = [];
    let wiki: string | null = null;
    for (const n of names.slice(0, 2)) {
      try {
        const t = await wikiTitle(`${n} ${city}`);
        if (!t) continue;
        wiki ??= `https://en.wikipedia.org/wiki/${encodeURIComponent(t.replace(/ /g, "_"))}`;
        for (const f of (await articleFiles(t)).slice(0, 8)) if (!files.includes(f)) files.push(f);
      } catch { /* tenta o seguinte */ }
    }
    if (files.length < 6) {
      try { for (const f of await commonsSearch(`${names[0]} ${city}`, 12)) if (!files.includes(f)) files.push(f); } catch { /* sem mais fotos */ }
    }
    let photos: Photo[] = [];
    try { photos = await fileInfo(files.slice(0, 20)); } catch { /* sem fotos */ }
    return { photos: photos.slice(0, max), wiki };
  });
}

/* ---------- Google Places ---------- */

type GPlace = {
  id: string; rating?: number; userRatingCount?: number; googleMapsUri?: string;
  photos?: { name: string; widthPx: number; heightPx: number; authorAttributions?: { displayName?: string; uri?: string }[] }[];
  reviews?: { rating?: number; text?: { text?: string }; originalText?: { text?: string }; relativePublishTimeDescription?: string; authorAttribution?: { displayName?: string; photoUri?: string; uri?: string }; googleMapsUri?: string }[];
};

async function googlePlace(query: string, lat: number, lng: number, lang: string) {
  return cached(`g:${query}:${lang}`, GOOGLE_TTL, async () => {
    const key = process.env.GOOGLE_PLACES_API_KEY ?? "";
    const j = await getJson<{ places?: GPlace[] }>("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.rating,places.userRatingCount,places.googleMapsUri,places.photos,places.reviews"
      },
      body: JSON.stringify({ textQuery: query, languageCode: lang, maxResultCount: 1, locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 800 } } })
    });
    const p = j.places?.[0];
    if (!p) return null;
    // A Google devolve um URL de imagem sem a chave quando se pede skipHttpRedirect.
    const photos: Photo[] = [];
    for (const ph of (p.photos ?? []).slice(0, 6)) {
      try {
        const m = await getJson<{ photoUri?: string }>(`https://places.googleapis.com/v1/${ph.name}/media?maxWidthPx=1280&skipHttpRedirect=true&key=${key}`);
        if (!m.photoUri) continue;
        const a = ph.authorAttributions?.[0];
        photos.push({ url: m.photoUri, thumb: m.photoUri, w: ph.widthPx, h: ph.heightPx, credit: a?.displayName ?? "Google", license: "Google Maps", source: "google", page: a?.uri });
      } catch { /* salta esta foto */ }
    }
    const reviews: Review[] = (p.reviews ?? []).filter((r) => (r.text?.text ?? r.originalText?.text ?? "").trim()).slice(0, 5).map((r) => ({
      author: r.authorAttribution?.displayName ?? "Google", avatar: r.authorAttribution?.photoUri ?? null,
      rating: r.rating ?? 0, text: (r.text?.text ?? r.originalText?.text ?? "").trim(), when: r.relativePublishTimeDescription ?? "",
      url: r.authorAttribution?.uri ?? r.googleMapsUri ?? null
    }));
    return { id: p.id, rating: p.rating ?? null, ratings: p.userRatingCount ?? null, maps: p.googleMapsUri ?? null, photos, reviews };
  });
}

/** Tudo o que a página de uma paragem precisa: fotos, nota, avaliações e ligações. */
export async function stopMedia(o: { names: string[]; city: string; lat: number; lng: number; lang: string }): Promise<Media> {
  const [w, g] = await Promise.all([
    wikiPhotos(o.names, o.city).catch(() => ({ photos: [] as Photo[], wiki: null })),
    placesEnabled() ? googlePlace(`${o.names.join(" ")}, ${o.city}`, o.lat, o.lng, o.lang).catch(() => null) : Promise.resolve(null)
  ]);
  return {
    // Fotos da Google primeiro (são as mais atuais), completadas pelas da Commons.
    photos: [...(g?.photos ?? []), ...w.photos].slice(0, 14),
    rating: g?.rating ?? null, ratings: g?.ratings ?? null, reviews: g?.reviews ?? [],
    placeId: g?.id ?? null,
    mapsUrl: g?.maps ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${o.names[0]}, ${o.city}`)}`,
    wiki: w.wiki
  };
}

/** "Jerónimos & Pastéis de Belém" → ["Jerónimos", "Pastéis de Belém"]. */
export function searchNames(name: string): string[] {
  return name.split(/\s+&\s+|\s+e\s+|,\s*/).map((s) => s.trim()).filter(Boolean);
}

export const writeReviewUrl = (placeId: string) => `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
