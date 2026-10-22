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
import { takeGoogle } from "./gbudget";
import { placesEnabled } from "./places";
import { env } from "./env";

export type Photo = { url: string; thumb: string; w: number; h: number; credit: string; license: string; source: "wikimedia" | "google"; page?: string };
export type Review = { author: string; avatar: string | null; rating: number; text: string; when: string; url: string | null; at?: number };
/** Só mostramos avaliações da Google com menos de um mês. */
export const REVIEW_MAX_AGE_MS = 31 * 86400_000;
export const recentReviews = (list: Review[], now = Date.now()) => list.filter((r) => r.at && now - r.at <= REVIEW_MAX_AGE_MS);
export type Media = {
  photos: Photo[];
  rating: number | null; ratings: number | null;
  reviews: Review[];
  placeId: string | null; mapsUrl: string | null;
  wiki: string | null;
};

const UA = env.ua;
const WIKI_TTL = 7 * 24 * 3600e3;
const EMPTY_TTL = 15 * 60e3;          // resultados vazios (falha ou limite da Wikimedia): voltar a tentar em 15 min
const GOOGLE_TTL = 7 * 24 * 3600e3; // 7 dias: controla o custo do Google (pesquisa com avaliações + fotos)
const cache = new Map<string, { at: number; ttl: number; v: unknown }>();

async function cached<T>(key: string, ttl: number, fn: () => Promise<T>, isEmpty: (v: T) => boolean = () => false): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.v as T;
  const v = await fn();
  cache.set(key, { at: Date.now(), ttl: isEmpty(v) ? EMPTY_TTL : ttl, v });
  if (cache.size > 4000) cache.delete(cache.keys().next().value as string);
  return v;
}

/* No máximo 4 pedidos à Wikimedia em simultâneo (acima disso responde 429). */
let active = 0;
const waiting: (() => void)[] = [];
async function slot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= 4) await new Promise<void>((r) => waiting.push(r));
  active++;
  try { return await fn(); } finally { active--; waiting.shift()?.(); }
}

async function getJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const go = () => fetch(url, { ...init, headers: { "User-Agent": UA, "Api-User-Agent": UA, ...(init.headers ?? {}) }, signal: AbortSignal.timeout(8000), cache: "no-store" });
  const wiki = /wiki(pedia|media)\.org/.test(url);
  let res = wiki ? await slot(go) : await go();
  if (res.status === 429 && wiki) { await new Promise((r) => setTimeout(r, 1500)); res = await slot(go); }
  if (!res.ok) throw new Error(`${res.status} ${url.slice(0, 80)}`);
  return res.json() as Promise<T>;
}

/** Tira etiquetas HTML dos metadados da Commons ("<a href=…>Autor</a>" → "Autor"). */
export function plain(html: string | undefined): string {
  return (html ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}

/** Ficheiros que não são fotografias atuais (mapas, plantas, logótipos, postais e gravuras antigas, pinturas). */
export function isPhotoFile(title: string): boolean {
  if (!/\.(jpe?g|webp)$/i.test(title)) return false;
  return !/(map|mapa|karte|carte|plan\b|plano|plans\b|logo|icon|flag|coat[ _]of[ _]arms|wappen|brasão|escudo|locator|diagram|seal|signature|svg|postcard|post card|engraving|lithograph|drawing|painting|illustration|etching|sketch|interior of the|dock|chart|1[5-8]\d\d|19[0-6]\d)/i.test(title);
}

/**
 * Fotografia de capa de cada cidade: o artigo da Wikipédia do monumento mais emblemático.
 * A imagem principal desses artigos é escolhida pelos editores e quase sempre é excelente.
 */
export const CITY_COVER: Record<string, string> = {
  lis: "Belém Tower", opo: "Dom Luís I Bridge", mad: "Royal Palace of Madrid", bcn: "Sagrada Família",
  par: "Eiffel Tower", rom: "Colosseum", ams: "Canals of Amsterdam", lon: "Palace of Westminster",
  edi: "Edinburgh Castle", man: "Manchester Town Hall", gla: "Glasgow City Chambers", liv: "Royal Liver Building",
  bir: "Library of Birmingham", ist: "Hagia Sophia",
  dxb: "Burj Khalifa", auh: "Sheikh Zayed Grand Mosque", doh: "Museum of Islamic Art, Doha", ruh: "Kingdom Centre",
  jed: "Al-Balad, Jeddah", cai: "Giza pyramid complex", amm: "Amman Citadel", mct: "Sultan Qaboos Grand Mosque",
  fra: "Römerberg", ber: "Brandenburg Gate", muc: "Marienplatz", vie: "Schönbrunn Palace", prg: "Charles Bridge", sin: "Gardens by the Bay",
  nyc: "Lower Manhattan", was: "United States Capitol", sfo: "Golden Gate Bridge", chi: "Cloud Gate", bos: "Boston Common", mia: "Ocean Drive",
  lax: "Griffith Observatory", las: "Las Vegas Strip", msy: "Jackson Square (New Orleans)", mco: "Lake Eola Park", yyz: "CN Tower",
  mex: "Palacio de Bellas Artes", rio: "Christ the Redeemer (statue)", bue: "Caminito",
  rak: "Jemaa el-Fnaa", cpt: "Table Mountain", zan: "Stone Town", tun: "Medina of Tunis", add: "Holy Trinity Cathedral, Addis Ababa",
  nbo: "Nairobi National Park", cas: "Hassan II Mosque", lad: "Fortaleza de São Miguel", acc: "Black Star Square", kgl: "Kigali Convention Centre",
  dkr: "African Renaissance Monument"
};

/* ---------- Wikimedia ---------- */

type SearchRes = { query?: { search?: { title: string }[] } };
type MediaList = { items?: { title: string; type: string; showInGallery?: boolean }[] };
type LeadRes = { query?: { pages?: Record<string, { pageimage?: string }> } };
type InfoRes = { query?: { pages?: Record<string, { title: string; imageinfo?: { thumburl?: string; thumbwidth?: number; thumbheight?: number; descriptionshorturl?: string; width?: number; height?: number; extmetadata?: Record<string, { value: string }> }[] }> } };

async function wikiTitle(q: string): Promise<string | null> {
  const u = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=1&srsearch=${encodeURIComponent(q)}`;
  const j = await getJson<SearchRes>(u);
  return j.query?.search?.[0]?.title ?? null;
}

/** A imagem principal do artigo (a que aparece no topo da Wikipédia). */
async function leadImage(title: string): Promise<string | null> {
  const j = await getJson<LeadRes>(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=name&redirects=1&titles=${encodeURIComponent(title)}`);
  const name = Object.values(j.query?.pages ?? {})[0]?.pageimage;
  return name && isPhotoFile(name) ? `File:${name.replace(/_/g, " ")}` : null;
}

async function articleFiles(title: string): Promise<string[]> {
  const j = await getJson<MediaList>(`https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title.replace(/ /g, "_"))}`);
  return (j.items ?? []).filter((i) => i.type === "image" && i.showInGallery !== false && isPhotoFile(i.title)).map((i) => i.title.replace(/_/g, " "));
}

async function commonsSearch(q: string, n: number): Promise<string[]> {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&list=search&format=json&srnamespace=6&srlimit=${n}&srsearch=${encodeURIComponent(q + " filetype:bitmap")}`;
  const j = await getJson<SearchRes>(u);
  return (j.query?.search ?? []).map((s) => s.title).filter(isPhotoFile);
}

/** Pontuação de qualidade: imagens destacadas/de qualidade da Commons primeiro; fotos antigas ficam de fora. */
export function photoScore(meta: Record<string, { value: string }>, w: number, h: number): number | null {
  const date = plain(meta.DateTimeOriginal?.value);
  const year = Number(date.match(/\b(1[89]\d\d|20\d\d)\b/)?.[1] ?? 0);
  if (year && year < 1985) return null;                       // postais e fotos históricas
  const cats = (meta.Categories?.value ?? "").toLowerCase();
  let s = 0;
  if (/featured pictures/.test(cats)) s += 3;
  if (/quality images/.test(cats)) s += 2;
  if (/valued images/.test(cats)) s += 1;
  if (w / h >= 1.2 && w / h <= 1.9) s += 1;                   // paisagem, boa para cartões
  if (year >= 2010) s += 0.5;
  return s;
}

async function fileInfo(titles: string[]): Promise<Photo[]> {
  if (!titles.length) return [];
  const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1280&titles=${encodeURIComponent(titles.join("|"))}`;
  const j = await getJson<InfoRes>(u);
  const byTitle = new Map(Object.values(j.query?.pages ?? {}).map((p) => [p.title, p]));
  const out: (Photo & { score: number; i: number })[] = [];
  titles.forEach((t, i) => {
    const ii = byTitle.get(t)?.imageinfo?.[0];
    if (!ii?.thumburl || !ii.width || !ii.height) return;
    if (ii.width < 900 || ii.height < 500) return;            // pequenas demais para ecrã inteiro
    const r = ii.width / ii.height;
    if (r < 0.6 || r > 2.4) return;                           // panorâmicas extremas
    const m = ii.extmetadata ?? {};
    const score = photoScore(m, ii.width, ii.height);
    if (score === null) return;
    out.push({
      url: ii.thumburl, thumb: ii.thumburl.replace(/\/1280px-/, "/500px-"),
      w: ii.thumbwidth ?? 1280, h: ii.thumbheight ?? Math.round(1280 / r),
      credit: plain(m.Artist?.value).slice(0, 80) || "Wikimedia Commons", license: plain(m.LicenseShortName?.value) || "CC",
      source: "wikimedia", page: ii.descriptionshorturl, score, i
    });
  });
  // A imagem principal do artigo (índice 0) fica sempre à frente; o resto por qualidade e ordem original.
  out.sort((a, b) => (a.i === 0 ? -1 : b.i === 0 ? 1 : b.score - a.score || a.i - b.i));
  return out.map(({ score: _s, i: _i, ...p }) => p);
}

/** Até `max` fotos para um ponto: imagem principal do artigo, galeria do artigo e, se faltar, pesquisa na Commons. */
export async function wikiPhotos(names: string[], city: string, max = 10, exactTitle?: string): Promise<{ photos: Photo[]; wiki: string | null }> {
  return cached(`wiki2:${exactTitle ?? names.join("|")}:${city}`, WIKI_TTL, async () => {
    const files: string[] = [];
    const add = (f: string | null) => { if (f && !files.includes(f)) files.push(f); };
    let wiki: string | null = null;
    const titles = exactTitle ? [exactTitle] : names.slice(0, 2).map((n) => `${n} ${city}`);
    for (const q of titles) {
      try {
        const t = exactTitle ?? await wikiTitle(q);
        if (!t) continue;
        wiki ??= `https://en.wikipedia.org/wiki/${encodeURIComponent(t.replace(/ /g, "_"))}`;
        add(await leadImage(t).catch(() => null));
        for (const f of (await articleFiles(t).catch(() => [])).slice(0, 10)) add(f);
      } catch { /* tenta o seguinte */ }
    }
    if (files.length < 6) {
      try { for (const f of await commonsSearch(exactTitle ?? `${names[0]} ${city}`, 12)) add(f); } catch { /* sem mais fotos */ }
    }
    let photos: Photo[] = [];
    try { photos = await fileInfo(files.slice(0, 24)); } catch { /* sem fotos */ }
    return { photos: photos.slice(0, max), wiki };
  }, (v) => v.photos.length === 0);
}

/** Capa da cidade (página inicial e herói da cidade). */
export async function cityCover(cityId: string, cityEn: string): Promise<Photo[]> {
  const t = CITY_COVER[cityId];
  if (!t) return [];
  const exact = (await wikiPhotos([t], cityEn, 4, t).catch(() => ({ photos: [] as Photo[] }))).photos;
  if (exact.length) return exact;
  // Plano B: pesquisa normal pelo monumento e pela cidade.
  return (await wikiPhotos([t, cityEn], cityEn, 4).catch(() => ({ photos: [] as Photo[] }))).photos;
}

/* ---------- Google Places ---------- */

type GPlace = {
  id: string; rating?: number; userRatingCount?: number; googleMapsUri?: string;
  photos?: { name: string; widthPx: number; heightPx: number; authorAttributions?: { displayName?: string; uri?: string }[] }[];
  reviews?: { rating?: number; text?: { text?: string }; originalText?: { text?: string }; relativePublishTimeDescription?: string; publishTime?: string; authorAttribution?: { displayName?: string; photoUri?: string; uri?: string }; googleMapsUri?: string }[];
};

async function googlePlace(query: string, lat: number, lng: number, lang: string) {
  return cached(`g:${query}:${lang}`, GOOGLE_TTL, async () => {
    if (!takeGoogle("search")) throw new Error("google_daily_cap"); // teto atingido: só Wikimedia (e não fica em cache)
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
    for (const ph of (p.photos ?? []).slice(0, 3)) {
      if (!takeGoogle("photo")) break;
      try {
        const m = await getJson<{ photoUri?: string }>(`https://places.googleapis.com/v1/${ph.name}/media?maxWidthPx=1280&skipHttpRedirect=true&key=${key}`);
        if (!m.photoUri) continue;
        const a = ph.authorAttributions?.[0];
        photos.push({ url: m.photoUri, thumb: m.photoUri, w: ph.widthPx, h: ph.heightPx, credit: a?.displayName ?? "Google", license: "Google Maps", source: "google", page: a?.uri });
      } catch { /* salta esta foto */ }
    }
    const reviews: Review[] = (p.reviews ?? []).filter((r) => (r.text?.text ?? r.originalText?.text ?? "").trim()).slice(0, 5).map((r) => ({
      at: r.publishTime ? Date.parse(r.publishTime) || undefined : undefined,
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
    rating: g?.rating ?? null, ratings: g?.ratings ?? null, reviews: recentReviews(g?.reviews ?? []),
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
