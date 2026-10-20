/**
 * Notícias ao vivo com foco em segurança, no idioma do viajante.
 * Fontes: avisos oficiais do governo do Reino Unido (FCDO, gov.uk) e títulos de editoras de notícias via Google News RSS.
 * Só mostramos títulos que falam de segurança (greves, alertas, roubos, protestos, meteorologia, aeroportos), das últimas 72 horas,
 * sempre com o nome da editora e o link para o artigo original. Cache de 30 minutos por cidade e idioma.
 */
import { CITIES, COUNTRY, type City } from "@/data/cities";

export type NewsItem = { title: string; url: string; source: string; at: number; official?: boolean; trusted?: boolean };

/** Palavras de segurança por idioma (usadas na pesquisa e para filtrar os títulos). */
const SAFETY: Record<string, string[]> = {
  pt: ["greve", "alerta", "aviso", "segurança", "roubo", "assalto", "carteirista", "protesto", "manifestação", "tempestade", "incêndio", "evacua", "aeroporto", "cancelad", "atraso", "polícia", "burla", "inundaç", "terramoto", "sismo"],
  en: ["strike", "alert", "warning", "safety", "security", "theft", "robbery", "pickpocket", "protest", "storm", "fire", "evacuat", "airport", "cancel", "delay", "police", "scam", "flood", "earthquake", "closure", "disruption"],
  es: ["huelga", "alerta", "aviso", "seguridad", "robo", "carterista", "protesta", "manifestación", "tormenta", "incendio", "evacua", "aeropuerto", "cancela", "retraso", "policía", "estafa", "inundaci", "terremoto"],
  fr: ["grève", "alerte", "vigilance", "sécurité", "vol ", "pickpocket", "manifestation", "tempête", "incendie", "évacu", "aéroport", "annul", "retard", "police", "arnaque", "inondation", "séisme", "perturbation"],
  de: ["streik", "warnung", "alarm", "sicherheit", "diebstahl", "taschendieb", "protest", "demonstration", "sturm", "unwetter", "brand", "evakui", "flughafen", "ausfall", "verspätung", "polizei", "betrug", "hochwasser", "erdbeben"],
  it: ["sciopero", "allerta", "avviso", "sicurezza", "furto", "borseggi", "protesta", "manifestazione", "tempesta", "maltempo", "incendio", "evacua", "aeroporto", "cancellat", "ritard", "polizia", "truffa", "alluvione", "terremoto"],
  zh: ["罢工", "警报", "警告", "安全", "盗窃", "抢劫", "扒手", "抗议", "示威", "风暴", "火灾", "疏散", "机场", "取消", "延误", "警方", "诈骗", "洪水", "地震"],
  ar: ["إضراب", "تحذير", "إنذار", "أمن", "سلامة", "سرقة", "احتجاج", "مظاهرة", "عاصفة", "حريق", "إخلاء", "مطار", "إلغاء", "تأخير", "الشرطة", "احتيال", "فيضان", "زلزال"],
  ja: ["ストライキ", "スト", "警報", "警告", "安全", "盗難", "スリ", "抗議", "デモ", "嵐", "台風", "火災", "避難", "空港", "欠航", "遅延", "警察", "詐欺", "洪水", "地震"]
};
const QUERY_WORDS: Record<string, string> = {
  pt: "greve OR alerta OR roubo OR protesto OR aeroporto OR segurança OR tempestade",
  en: "strike OR alert OR warning OR theft OR protest OR airport OR safety OR storm",
  es: "huelga OR alerta OR robo OR protesta OR aeropuerto OR seguridad OR tormenta",
  fr: "grève OR alerte OR vol OR manifestation OR aéroport OR sécurité OR tempête",
  de: "Streik OR Warnung OR Diebstahl OR Protest OR Flughafen OR Sicherheit OR Unwetter",
  it: "sciopero OR allerta OR furto OR protesta OR aeroporto OR sicurezza OR maltempo",
  zh: "罢工 OR 警告 OR 盗窃 OR 抗议 OR 机场 OR 安全",
  ar: "إضراب OR تحذير OR سرقة OR احتجاج OR مطار OR أمن",
  ja: "ストライキ OR 警報 OR 盗難 OR デモ OR 空港 OR 安全"
};
const GENERAL: Record<string, string> = {
  pt: "aeroporto (greve OR atrasos OR cancelamentos OR alerta) Europa",
  en: "airport (strike OR delays OR cancellations OR security alert) Europe",
  es: "aeropuerto (huelga OR retrasos OR cancelaciones OR alerta) Europa",
  fr: "aéroport (grève OR retards OR annulations OR alerte) Europe",
  de: "Flughafen (Streik OR Verspätungen OR Ausfälle OR Warnung) Europa",
  it: "aeroporto (sciopero OR ritardi OR cancellazioni OR allerta) Europa",
  zh: "欧洲 机场 (罢工 OR 延误 OR 取消)",
  ar: "مطار أوروبا (إضراب OR تأخير OR إلغاء)",
  ja: "欧州 空港 (ストライキ OR 遅延 OR 欠航)"
};
const EDITION: Record<string, string> = {
  pt: "hl=pt-PT&gl=PT&ceid=PT:pt-150", en: "hl=en-GB&gl=GB&ceid=GB:en", es: "hl=es&gl=ES&ceid=ES:es", fr: "hl=fr&gl=FR&ceid=FR:fr",
  de: "hl=de&gl=DE&ceid=DE:de", it: "hl=it&gl=IT&ceid=IT:it", zh: "hl=zh-CN&gl=CN&ceid=CN:zh-Hans", ar: "hl=ar&gl=AE&ceid=AE:ar", ja: "hl=ja&gl=JP&ceid=JP:ja"
};
/** Editoras de referência (aparecem primeiro e com um selo). */
const TRUSTED = /\b(bbc|reuters|associated press|ap news|the guardian|financial times|sky news|euronews|france 24|le monde|le figaro|franceinfo|el país|el pais|rtve|la vanguardia|el mundo|público|publico|rtp|sic notícias|observador|expresso|lusa|jornal de notícias|diário de notícias|corriere|la repubblica|ansa|rai|tagesschau|spiegel|zeit|faz|süddeutsche|dw|nos\.nl|nu\.nl|dutchnews|hürriyet|daily sabah|al jazeera|the national|nhk|asahi|xinhua|cgtn|gov\.uk|manchester evening news|evening standard|the scotsman)\b/i;

const FCDO: Record<string, string> = { PT: "portugal", ES: "spain", FR: "france", IT: "italy", NL: "netherlands", TR: "turkey" };

export function isSafety(title: string, locale: string) {
  const t = title.toLowerCase();
  return (SAFETY[locale] ?? SAFETY.en).some((w) => t.includes(w.toLowerCase()));
}

const decode = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).trim();

export function parseRss(xml: string, locale: string, now = Date.now()): NewsItem[] {
  const out: NewsItem[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const g = (tag: string) => { const r = m[1].match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)); return r ? decode(r[1]) : ""; };
    const source = g("source");
    let title = g("title");
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    const url = g("link"); const at = Date.parse(g("pubDate"));
    if (!title || !/^https:\/\//.test(url) || !Number.isFinite(at)) continue;
    if (now - at > 72 * 3600_000 || !isSafety(title, locale)) continue;
    out.push({ title: title.slice(0, 200), url, source: source || new URL(url).hostname, at, ...(TRUSTED.test(source) ? { trusted: true } : {}) });
  }
  const seen = new Set<string>();
  return out.filter((n) => { const k = n.title.toLowerCase().slice(0, 60); return !seen.has(k) && (seen.add(k), true); })
    .sort((a, b) => Number(Boolean(b.trusted)) - Number(Boolean(a.trusted)) || b.at - a.at).slice(0, 8);
}

async function googleNews(q: string, locale: string): Promise<NewsItem[]> {
  const r = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(`${q} when:3d`)}&${EDITION[locale] ?? EDITION.en}`, { signal: AbortSignal.timeout(8000), cache: "no-store", headers: { "User-Agent": "Mozilla/5.0 SelfGuidedCityTour/1.0" } });
  if (!r.ok) throw new Error(String(r.status));
  return parseRss(await r.text(), locale);
}

async function fcdo(cc: string): Promise<NewsItem | null> {
  const slug = FCDO[cc]; if (!slug) return null;
  const r = await fetch(`https://www.gov.uk/api/content/foreign-travel-advice/${slug}`, { signal: AbortSignal.timeout(8000), cache: "no-store" });
  if (!r.ok) return null;
  const j = (await r.json()) as { title?: string; public_updated_at?: string; details?: { change_description?: string } };
  const at = Date.parse(j.public_updated_at ?? "");
  if (!Number.isFinite(at) || Date.now() - at > 14 * 24 * 3600_000) return null; // só avisos recentes
  return { title: `${j.title ?? slug}: ${(j.details?.change_description ?? "").slice(0, 160)}`, url: `https://www.gov.uk/foreign-travel-advice/${slug}`, source: "GOV.UK (FCDO)", at, official: true, trusted: true };
}

const cache = new Map<string, { at: number; items: NewsItem[] }>();
const TTL = 30 * 60_000;

export async function safetyNews(cityId: string | null, locale: string): Promise<{ items: NewsItem[]; city: string | null }> {
  const city: City | undefined = cityId ? CITIES.find((c) => c.id === cityId) : undefined;
  const lang = SAFETY[locale] ? locale : "en";
  const key = `${city?.id ?? "-"}:${lang}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return { items: hit.items, city: city?.id ?? null };
  const name = city ? (city.n[lang] ?? city.n.en) : null;
  const q = name ? `"${name}" (${QUERY_WORDS[lang]})` : GENERAL[lang];
  const [news, official] = await Promise.allSettled([googleNews(q, lang), city ? fcdo(COUNTRY[city.id]) : Promise.resolve(null)]);
  let items = news.status === "fulfilled" ? news.value : [];
  if (!items.length && lang !== "en" && name) items = await googleNews(`"${city!.n.en}" (${QUERY_WORDS.en})`, "en").catch(() => []);
  const off = official.status === "fulfilled" ? official.value : null;
  const all = [...(off ? [off] : []), ...items].slice(0, 8);
  if (all.length || !hit) cache.set(key, { at: Date.now(), items: all });
  return { items: all.length ? all : hit?.items ?? [], city: city?.id ?? null };
}
