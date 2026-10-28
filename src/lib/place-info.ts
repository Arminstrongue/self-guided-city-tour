/**
 * Descrição curta de um lugar (parque, museu, monumento…) a partir da Wikipédia (CC BY-SA 4.0), na língua da app
 * com o inglês como reserva. O lugar encontra-se pela etiqueta "wikipedia" do OpenStreetMap ou, sem ela, pelos
 * artigos com coordenadas a menos de 400 m cujo título se parece com o nome. Guarda-se em memória 7 dias.
 */
import { intro, localTitle } from "./city-knowledge";
import { env } from "./env";

export type PlaceInfo = { title: string; text: string; url: string; lang: string };
type F = typeof fetch;
const UA = { "User-Agent": env.ua, "Api-User-Agent": env.ua };
const TTL = 7 * 86400_000;
const cache = new Map<string, { at: number; v: PlaceInfo | null }>();

const norm = (x: string) => x.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const STOP = new Set(["the", "of", "and", "de", "da", "do", "la", "le", "el", "park", "garden", "gardens", "museum"]);
/** Semelhança entre o nome do lugar e o título do artigo (0–1), pelas palavras em comum. */
export function nameMatch(name: string, title: string) {
  // Nos dois sentidos: "Battersea Park" não pode ficar com o artigo "Battersea Power Station".
  const words = (x: string) => { const all = norm(x).split(" ").filter(Boolean); const key = all.filter((w) => !STOP.has(w)); return key.length ? key : all; };
  const cover = (a: string[], b: string[]) => { const set = new Set(b); return a.length ? a.filter((w) => set.has(w)).length / a.length : 0; };
  const a = words(name), b = words(title.replace(/\s*\(.*\)$/, ""));
  return Math.min(cover(a, norm(title).split(" ")), cover(b, norm(name).split(" ")));
}

async function json(f: F, url: string) {
  const r = await f(url, { headers: UA, signal: AbortSignal.timeout(8_000), cache: "no-store" });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

/** Artigo inglês para o lugar: etiqueta "en:Título" / "pt:Título", ou o artigo próximo com o nome mais parecido. */
async function findArticle(f: F, o: { name: string; lat: number; lng: number; wiki?: string }): Promise<{ lang: string; title: string } | null> {
  const m = o.wiki?.match(/^([a-z]{2,3}):(.+)$/);
  if (m) return { lang: m[1], title: m[2] };
  const j = await json(f, `https://en.wikipedia.org/w/api.php?action=query&format=json&list=geosearch&gscoord=${o.lat}|${o.lng}&gsradius=400&gslimit=15`);
  const hits = (j?.query?.geosearch ?? []) as { title: string; dist: number }[];
  const best = hits.map((h) => ({ ...h, s: nameMatch(o.name, h.title) })).filter((h) => h.s >= 0.6).sort((a, b) => b.s - a.s || a.dist - b.dist)[0];
  return best ? { lang: "en", title: best.title } : null;
}

export async function placeInfo(o: { name: string; lat: number; lng: number; wiki?: string; lang: string }, f: F = fetch): Promise<PlaceInfo | null> {
  const key = `${o.lang}|${o.wiki ?? ""}|${norm(o.name)}|${o.lat.toFixed(3)},${o.lng.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.v;
  let v: PlaceInfo | null = null;
  try {
    const art = await findArticle(f, o);
    if (art) {
      // Na língua da app quando existe; senão no idioma do artigo encontrado (normalmente inglês).
      let enTitle = art.lang === "en" ? art.title : null;
      if (!enTitle && art.lang === o.lang) { const x = await intro(f, o.lang, art.title, 700); if (x) v = { ...x, lang: o.lang }; }
      if (!v && !enTitle) { const x = await intro(f, art.lang, art.title, 700); if (x) v = { ...x, lang: art.lang }; }
      if (!v && enTitle) {
        const lt = o.lang !== "en" ? await localTitle(f, enTitle, o.lang).catch(() => null) : null;
        const loc = lt ? await intro(f, o.lang, lt, 700).catch(() => null) : null;
        const x = loc ?? (await intro(f, "en", enTitle, 700));
        if (x) v = { ...x, lang: loc ? o.lang : "en" };
      }
    }
  } catch { return null; } // erro de rede: não fica em cache, tenta-se da próxima vez
  if (cache.size > 3000) cache.delete(cache.keys().next().value as string);
  cache.set(key, { at: Date.now(), v });
  return v;
}
