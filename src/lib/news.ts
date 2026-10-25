/**
 * Notícias ao vivo com foco em segurança, no idioma do viajante.
 * Fontes: avisos oficiais do governo do Reino Unido (FCDO, gov.uk) e títulos de editoras de notícias via Google News RSS.
 * Só mostramos títulos que falam de segurança (greves, alertas, roubos, protestos, meteorologia, aeroportos), das últimas 72 horas,
 * sempre com o nome da editora e o link para o artigo original. Cache de 30 minutos por cidade e idioma.
 */
import { CITIES, COUNTRY, type City } from "@/data/cities";

export type SafetyKind = "transport" | "weather" | "access" | "crime";
export type NewsItem = { title: string; url: string; source: string; at: number; site?: string; official?: boolean; trusted?: boolean; kind?: SafetyKind };

/**
 * Só entra o que pode mudar a viagem: transportes, meteorologia, acessos/encerramentos e criminalidade de rua.
 * Palavras genéricas ("alerta", "segurança") já não chegam: um alerta de segurança informática não é um aviso para o viajante.
 */
const KINDS: Record<string, Record<SafetyKind, string[]>> = {
  pt: { transport: ["greve", "metro", "comboio", "autocarro", "aeroporto", "voo", "cancelad", "atraso", "trânsito", "ponte", "ferry"], weather: ["tempestade", "chuva forte", "inundaç", "calor extremo", "onda de calor", "vento forte", "neve", "furacão", "aviso vermelho", "aviso laranja"], access: ["protesto", "manifestação", "encerrad", "fechad", "evacua", "incêndio", "sismo", "terramoto", "cortad", "interdit"], crime: ["roubo", "assalto", "carteirista", "burla", "esfaque", "tiroteio"] },
  en: { transport: ["strike", "metro", "subway", "tube", "train", "rail", "bus ", "airport", "flight", "cancel", "delay", "disruption", "traffic", "bridge", "ferry"], weather: ["storm", "flood", "heatwave", "heat wave", "extreme heat", "high winds", "snow", "hurricane", "typhoon", "red warning", "amber warning"], access: ["protest", "demonstration", "closure", "closed", "evacuat", "fire", "earthquake", "cordon", "shut"], crime: ["theft", "robbery", "pickpocket", "scam", "stabbing", "shooting", "mugging"] },
  es: { transport: ["huelga", "metro", "tren", "autobús", "aeropuerto", "vuelo", "cancela", "retraso", "tráfico", "ferry"], weather: ["tormenta", "inundaci", "ola de calor", "calor extremo", "viento fuerte", "nieve", "huracán", "alerta roja", "alerta naranja"], access: ["protesta", "manifestación", "cerrad", "cierre", "evacua", "incendio", "terremoto", "cortad"], crime: ["robo", "carterista", "estafa", "apuñal", "tiroteo", "atraco"] },
  fr: { transport: ["grève", "métro", "train", "sncf", "bus", "aéroport", "vol annulé", "annul", "retard", "trafic", "perturbation", "ferry"], weather: ["tempête", "inondation", "canicule", "vents violents", "neige", "ouragan", "vigilance rouge", "vigilance orange"], access: ["manifestation", "fermé", "fermeture", "évacu", "incendie", "séisme", "bouclé"], crime: ["vol ", "pickpocket", "arnaque", "agression", "coups de couteau", "fusillade"] },
  de: { transport: ["streik", "u-bahn", "s-bahn", "zug", "bahn", "bus", "flughafen", "flug", "ausfall", "verspätung", "verkehr", "fähre"], weather: ["sturm", "unwetter", "hochwasser", "hitzewelle", "schnee", "orkan"], access: ["protest", "demonstration", "gesperrt", "sperrung", "geschlossen", "evakui", "brand", "erdbeben"], crime: ["diebstahl", "taschendieb", "betrug", "raub", "messer", "schüsse"] },
  it: { transport: ["sciopero", "metro", "treno", "bus", "aeroporto", "volo", "cancellat", "ritard", "traffico", "traghetto"], weather: ["tempesta", "maltempo", "alluvione", "ondata di calore", "neve", "allerta rossa", "allerta arancione"], access: ["protesta", "manifestazione", "chius", "evacua", "incendio", "terremoto"], crime: ["furto", "borseggi", "truffa", "rapina", "accoltell", "sparatoria"] },
  zh: { transport: ["罢工", "地铁", "火车", "公交", "机场", "航班", "取消", "延误"], weather: ["风暴", "暴雨", "洪水", "高温", "台风", "大雪"], access: ["抗议", "示威", "关闭", "疏散", "火灾", "地震"], crime: ["盗窃", "抢劫", "扒手", "诈骗"] },
  ar: { transport: ["إضراب", "مترو", "قطار", "حافلة", "مطار", "رحلة", "إلغاء", "تأخير"], weather: ["عاصفة", "فيضان", "موجة حر", "أمطار غزيرة"], access: ["احتجاج", "مظاهرة", "إغلاق", "إخلاء", "حريق", "زلزال"], crime: ["سرقة", "نشل", "احتيال"] },
  ja: { transport: ["ストライキ", "スト", "地下鉄", "電車", "バス", "空港", "欠航", "遅延", "運休"], weather: ["嵐", "台風", "大雨", "洪水", "猛暑", "大雪", "警報"], access: ["抗議", "デモ", "閉鎖", "避難", "火災", "地震"], crime: ["盗難", "スリ", "詐欺", "強盗"] }
};
/** Temas que mencionam "segurança" mas não mudam a viagem (informática, finanças, desporto). */
const OFF_TOPIC = /vulnerab|cyber|ciber|hacker|malware|ransomware|\bphp\b|software|data breach|phishing|exploit|\bcve-|bitcoin|crypto|stock market|shares|sicherheitslücke|faille|premier league|champions league|football|futebol|fútbol/i;

/** Perturbação real: greve sozinha chega; os outros meios de transporte só contam com cancelamento, atraso, suspensão ou encerramento. */
const STRIKE: Record<string, string[]> = { pt: ["greve"], en: ["strike", "walkout"], es: ["huelga"], fr: ["grève"], de: ["streik"], it: ["sciopero"], zh: ["罢工"], ar: ["إضراب"], ja: ["ストライキ", "スト"] };
const DISRUPT: Record<string, string[]> = {
  pt: ["cancelad", "suprimid", "atraso", "suspens", "interromp", "encerrad", "fechad", "perturba", "caos", "sem serviço", "avaria"],
  en: ["cancel", "delay", "disruption", "suspend", "halt", "closed", "closure", "shut", "chaos", "outage", "no service", "breakdown"],
  es: ["cancela", "retraso", "suspend", "interrump", "cerrad", "cierre", "caos", "avería"],
  fr: ["annul", "retard", "perturb", "suspend", "interromp", "fermé", "fermeture", "chaos", "panne"],
  de: ["ausfall", "fällt aus", "verspätung", "eingestellt", "gesperrt", "sperrung", "chaos", "störung"],
  it: ["cancellat", "soppress", "ritard", "sospes", "interrott", "chius", "caos", "guasto"],
  zh: ["取消", "延误", "停运", "暂停", "关闭"], ar: ["إلغاء", "تأخير", "توقف", "إغلاق"], ja: ["欠航", "遅延", "運休", "運転見合わせ", "閉鎖"]
};
export function safetyKind(title: string, locale: string): SafetyKind | null {
  if (OFF_TOPIC.test(title)) return null;
  const t = title.toLowerCase();
  const has = (ws: string[] | undefined) => (ws ?? []).some((w) => t.includes(w.toLowerCase()));
  const k = KINDS[locale] ?? KINDS.en;
  const lang = KINDS[locale] ? locale : "en";
  if (has(STRIKE[lang]) || (has(k.transport) && has(DISRUPT[lang]))) return "transport";
  for (const kind of ["weather", "access", "crime"] as const) if (has(k[kind])) return kind;
  return null;
}

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
  de: "hl=de&gl=DE&ceid=DE:de", it: "hl=it&gl=IT&ceid=IT:it", zh: "hl=zh-CN&gl=CN&ceid=CN:zh-Hans", ar: "hl=ar&gl=AE&ceid=AE:ar", ja: "hl=ja&gl=JP&ceid=JP:ja",
  tr: "hl=tr&gl=TR&ceid=TR:tr", ru: "hl=ru&gl=RU&ceid=RU:ru", ko: "hl=ko&gl=KR&ceid=KR:ko"
};
/** Editoras de referência (aparecem primeiro e com um selo). */
const TRUSTED = /\b(bbc|reuters|associated press|ap news|the guardian|financial times|sky news|euronews|france 24|le monde|le figaro|franceinfo|el país|el pais|rtve|la vanguardia|el mundo|público|publico|rtp|sic notícias|observador|expresso|lusa|jornal de notícias|diário de notícias|corriere|la repubblica|ansa|rai|tagesschau|spiegel|zeit|faz|süddeutsche|dw|nos\.nl|nu\.nl|dutchnews|hürriyet|daily sabah|al jazeera|the national|nhk|asahi|xinhua|cgtn|gov\.uk|manchester evening news|evening standard|the scotsman)\b/i;

const FCDO: Record<string, string> = { PT: "portugal", ES: "spain", FR: "france", IT: "italy", NL: "netherlands", TR: "turkey", AE: "united-arab-emirates", QA: "qatar", SA: "saudi-arabia", EG: "egypt", JO: "jordan", OM: "oman", DE: "germany", AT: "austria", CZ: "czech-republic", SG: "singapore",
  US: "usa", CA: "canada", MX: "mexico", BR: "brazil", AR: "argentina", MA: "morocco", ZA: "south-africa", TZ: "tanzania", TN: "tunisia", ET: "ethiopia",
  KE: "kenya", AO: "angola", GH: "ghana", RW: "rwanda", SN: "senegal" };

export function isSafety(title: string, locale: string) {
  return safetyKind(title, locale) !== null;
}

const decode = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).trim();

export function parseRss(xml: string, locale: string, now = Date.now()): NewsItem[] {
  const out: NewsItem[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const g = (tag: string) => { const r = m[1].match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)); return r ? decode(r[1]) : ""; };
    let source = g("source");
    const srcUrl = m[1].match(/<source[^>]*url="([^"]+)"/)?.[1];
    let site: string | undefined;
    try { site = srcUrl ? new URL(srcUrl).hostname.replace(/^www\./, "") : undefined; } catch { /* ignorar */ }
    if (/^https?:\/\//.test(source)) { try { source = new URL(source).hostname.replace(/^www\./, ""); } catch { /* ignorar */ } }
    let title = g("title");
    const raw = g("source");
    if (raw && title.endsWith(` - ${raw}`)) title = title.slice(0, -(raw.length + 3));
    const url = g("link"); const at = Date.parse(g("pubDate"));
    if (!title || !/^https:\/\//.test(url) || !Number.isFinite(at)) continue;
    if (now - at > 72 * 3600_000 || !isSafety(title, locale)) continue;
    if (!source && site) source = site;
    out.push({ title: title.slice(0, 200), url, source: source || new URL(url).hostname, at, kind: safetyKind(title, locale) ?? undefined, ...(site ? { site } : {}), ...(TRUSTED.test(source) ? { trusted: true } : {}) });
  }
  const seen = new Set<string>();
  return out.filter((n) => { const k = n.title.toLowerCase().slice(0, 60); return !seen.has(k) && (seen.add(k), true); })
    .sort((a, b) => Number(Boolean(b.trusted)) - Number(Boolean(a.trusted)) || b.at - a.at).slice(0, 8);
}

/**
 * Google News RSS: desligado por defeito — os termos não deixam claro o uso comercial destes feeds.
 * Liga-se com NEWS_GOOGLE_RSS=1 no .env (só depois de confirmar a licença ou trocar por uma API de notícias licenciada).
 */
export const googleNewsEnabled = () => process.env.NEWS_GOOGLE_RSS === "1";

export async function googleNews(q: string, locale: string): Promise<NewsItem[]> {
  if (!googleNewsEnabled()) return [];
  const r = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(`${q} when:3d`)}&${EDITION[locale] ?? EDITION.en}`, { signal: AbortSignal.timeout(8000), cache: "no-store", headers: { "User-Agent": "Mozilla/5.0 VOYBU/1.0" } });
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
  return { title: `${j.title ?? slug}: ${(j.details?.change_description ?? "").slice(0, 160)}`, url: `https://www.gov.uk/foreign-travel-advice/${slug}`, source: "GOV.UK (FCDO) · Open Government Licence v3.0", site: "gov.uk", at, official: true, trusted: true };
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
  // Só o que diz respeito à cidade e à viagem: o título tem de nomear a cidade e falar de segurança/transportes
  // (a pesquisa do Google também apanha artigos que só mencionam a cidade no texto, ex. Funchal numa pesquisa de Lisboa).
  const keep = (n: NewsItem, l: string) => !city || (titleNames(n.title, city) && isSafety(n.title, l));
  let items = (news.status === "fulfilled" ? news.value : []).filter((n) => keep(n, lang));
  if (!items.length && lang !== "en" && name) items = (await googleNews(`"${city!.n.en}" (${QUERY_WORDS.en})`, "en").catch(() => [])).filter((n) => keep(n, "en"));
  const off = official.status === "fulfilled" ? official.value : null;
  const all = [...(off ? [off] : []), ...items].slice(0, 8);
  if (all.length || !hit) cache.set(key, { at: Date.now(), items: all });
  return { items: all.length ? all : hit?.items ?? [], city: city?.id ?? null };
}

/** Notícias "boas" da cidade para o resumo diário: cultura, eventos, turismo, aberturas. */
const CULTURE_WORDS: Record<string, string> = {
  pt: "festival OR exposição OR museu OR concerto OR turismo OR inauguração OR festa",
  en: "festival OR exhibition OR museum OR concert OR tourism OR opening OR celebration",
  es: "festival OR exposición OR museo OR concierto OR turismo OR inauguración OR fiesta",
  fr: "festival OR exposition OR musée OR concert OR tourisme OR ouverture OR fête",
  de: "Festival OR Ausstellung OR Museum OR Konzert OR Tourismus OR Eröffnung OR Fest",
  it: "festival OR mostra OR museo OR concerto OR turismo OR inaugurazione OR festa",
  zh: "节 OR 展览 OR 博物馆 OR 音乐会 OR 旅游",
  ar: "مهرجان OR معرض OR متحف OR حفل OR سياحة OR افتتاح",
  ja: "祭り OR 展覧会 OR 美術館 OR コンサート OR 観光",
  tr: "festival OR sergi OR müze OR konser OR turizm OR açılış",
  ru: "фестиваль OR выставка OR музей OR концерт OR туризм OR открытие",
  ko: "축제 OR 전시 OR 박물관 OR 콘서트 OR 관광"
};
export async function cultureNews(cityName: string, locale: string, city?: City): Promise<NewsItem[]> {
  const lang = CULTURE_WORDS[locale] ? locale : "en";
  const fold = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const items = await googleNews(`"${cityName}" (${CULTURE_WORDS[lang]})`, lang).catch(() => []);
  return items.filter((n) => (city ? titleNames(n.title, city) : fold(n.title).includes(fold(cityName)))).slice(0, 5);
}

/** O título nomeia a cidade (em qualquer das línguas)? */
export function titleNames(title: string, city: City): boolean {
  const fold = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const t = fold(title);
  return Object.values(city.n).some((n) => n && t.includes(fold(n)));
}
