/**
 * Conhecimento de cada cidade além das fotos: resumo e história, da Wikipédia (CC BY-SA 4.0), em todas as línguas
 * da app. Cada texto guarda a fonte e o link; quando uma língua não tem o artigo, usa-se o inglês.
 * O processo diário (scripts/worker.ts) renova os textos com mais de 7 dias.
 */
import { and, eq } from "drizzle-orm";
import { db, schema } from "./db";
import { LOCALES } from "@/i18n/core";

export const WIKI_TITLE: Record<string, string> = {
  lis: "Lisbon", opo: "Porto", mad: "Madrid", bcn: "Barcelona", par: "Paris", lon: "London", rom: "Rome", ams: "Amsterdam",
  edi: "Edinburgh", man: "Manchester", gla: "Glasgow", liv: "Liverpool", bir: "Birmingham", ist: "Istanbul",
  dxb: "Dubai", auh: "Abu Dhabi", doh: "Doha", ruh: "Riyadh", jed: "Jeddah", cai: "Cairo", amm: "Amman", mct: "Muscat"
};
const UA = { "User-Agent": "SelfGuidedCityTour/1.0 (https://selfguidedcitytour.com; hello@selfguidedcitytour.com)", "Api-User-Agent": "SelfGuidedCityTour/1.0" };
const MAX_AGE = 7 * 86400_000;

type F = typeof fetch;
async function json(f: F, url: string) {
  const r = await f(url, { headers: UA, signal: AbortSignal.timeout(10_000), cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

/** Título do mesmo artigo noutra língua (via ligações interlínguas). */
async function localTitle(f: F, enTitle: string, lang: string): Promise<string | null> {
  if (lang === "en") return enTitle;
  const j = await json(f, `https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=langlinks&lllang=${lang}&titles=${encodeURIComponent(enTitle)}`);
  const page = Object.values(j?.query?.pages ?? {})[0] as { langlinks?: { "*": string }[] } | undefined;
  return page?.langlinks?.[0]?.["*"] ?? null;
}

/** Corta um texto longo no fim de uma frase, perto de `max` caracteres. */
export function trimAtSentence(text: string, max: number) {
  const t = text.replace(/\n{2,}/g, "\n\n").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("。"), cut.lastIndexOf("! "), cut.lastIndexOf("? "), cut.lastIndexOf("।"), cut.lastIndexOf(".\n"));
  return (end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "") + "…").trim();
}

async function intro(f: F, lang: string, title: string, max: number) {
  const j = await json(f, `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=extracts&explaintext=1&exintro=1&titles=${encodeURIComponent(title)}`);
  const page = Object.values(j?.query?.pages ?? {})[0] as { title?: string; extract?: string; missing?: string } | undefined;
  if (!page?.extract || page.missing !== undefined) return null;
  return { title: page.title ?? title, text: trimAtSentence(page.extract, max), url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent((page.title ?? title).replace(/ /g, "_"))}` };
}

/** Título da secção "História" do artigo da cidade, em cada língua. */
const HISTORY_HEADING: Record<string, RegExp> = {
  en: /^history$/i, pt: /^história$/i, es: /^historia$/i, fr: /^histoire$/i, de: /^geschichte$/i, it: /^storia$/i,
  zh: /^(历史|歷史)$/, ar: /^(التاريخ|تاريخ)$/, ja: /^歴史$/, tr: /^(tarih|tarihçe)$/i, ru: /^история$/i, ko: /^역사$/
};
/** Para cidades sem artigo "História de …": a secção "História" do próprio artigo da cidade. */
async function historySection(f: F, lang: string, title: string, max: number) {
  const j = await json(f, `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=extracts&explaintext=1&exsectionformat=wiki&titles=${encodeURIComponent(title)}`);
  const page = Object.values(j?.query?.pages ?? {})[0] as { title?: string; extract?: string } | undefined;
  const text = page?.extract ?? "";
  const re = HISTORY_HEADING[lang] ?? HISTORY_HEADING.en;
  const lines = text.split("\n");
  const start = lines.findIndex((l) => { const m = l.match(/^==\s*([^=].*?)\s*==\s*$/); return Boolean(m && re.test(m[1].trim())); });
  if (start < 0) return null;
  const body: string[] = [];
  for (const l of lines.slice(start + 1)) {
    if (/^==\s*[^=].*==\s*$/.test(l)) break;          // próxima secção principal
    if (/^={3,}.*={3,}\s*$/.test(l)) continue;           // subtítulos
    body.push(l);
  }
  const out = trimAtSentence(body.join("\n"), max);
  if (out.length < 200) return null;
  const t = page?.title ?? title;
  return { title: t, text: out, url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(t.replace(/ /g, "_"))}#${encodeURIComponent(lines[start].replace(/=/g, "").trim().replace(/ /g, "_"))}` };
}

/** Busca e guarda o resumo e a história de uma cidade numa língua. */
export async function refreshCityKnowledge(city: string, lang: string, f: F = fetch) {
  const en = WIKI_TITLE[city]; if (!en) return 0;
  const d = await db();
  let n = 0;
  for (const kind of ["summary", "history"] as const) {
    const enTitle = kind === "summary" ? en : `History of ${en}`;
    let got: { title: string; text: string; url: string } | null = null, src = lang;
    try {
      const max = kind === "summary" ? 900 : 2200;
      const t = await localTitle(f, enTitle, lang);
      if (t) got = await intro(f, lang, t, max);
      // Sem artigo "História de …" nesta língua: a secção "História" do artigo da cidade.
      if (!got && kind === "history") { const ct = await localTitle(f, en, lang); if (ct) got = await historySection(f, lang, ct, max); }
      if (!got && lang !== "en") {
        src = "en";
        got = await intro(f, "en", enTitle, max);
        if (!got && kind === "history") got = await historySection(f, "en", en, max);
      }
    } catch { continue; }
    if (!got) continue;
    const row = { city, lang, kind, title: got.title, text: got.text, url: got.url, srcLang: src, fetchedAt: new Date() };
    await d.insert(schema.cityKnowledge).values(row).onConflictDoUpdate({ target: [schema.cityKnowledge.city, schema.cityKnowledge.lang, schema.cityKnowledge.kind], set: row });
    n++;
  }
  return n;
}

/** Renova tudo o que tem mais de 7 dias (ou nunca foi buscado). */
export async function refreshAllKnowledge(cities: string[], f: F = fetch, log: (m: string) => void = () => undefined) {
  const d = await db();
  const have = await d.select({ city: schema.cityKnowledge.city, lang: schema.cityKnowledge.lang, kind: schema.cityKnowledge.kind, at: schema.cityKnowledge.fetchedAt }).from(schema.cityKnowledge);
  // Fresca = tem resumo E história com menos de 7 dias (as que ficaram sem história voltam a tentar).
  const count = new Map<string, number>();
  for (const h of have) if (Date.now() - h.at.getTime() < MAX_AGE) count.set(`${h.city}:${h.lang}`, (count.get(`${h.city}:${h.lang}`) ?? 0) + 1);
  const fresh = new Set([...count.entries()].filter(([, n]) => n >= 2).map(([k]) => k));
  let n = 0;
  for (const c of cities) for (const l of LOCALES) {
    if (fresh.has(`${c}:${l}`)) continue;
    n += await refreshCityKnowledge(c, l, f).catch((e) => { log(`wiki ${c}/${l}: ${e}`); return 0; });
    await new Promise((r) => setTimeout(r, 250)); // simpático para a Wikipédia
  }
  return n;
}

export async function cityKnowledge(city: string, lang: string) {
  const d = await db();
  let rows = await d.select().from(schema.cityKnowledge).where(and(eq(schema.cityKnowledge.city, city), eq(schema.cityKnowledge.lang, lang)));
  if (!rows.length && lang !== "en") rows = await d.select().from(schema.cityKnowledge).where(and(eq(schema.cityKnowledge.city, city), eq(schema.cityKnowledge.lang, "en")));
  const pick = (k: "summary" | "history") => { const r = rows.find((x) => x.kind === k); return r ? { title: r.title, text: r.text, url: r.url, lang: r.srcLang } : null; };
  return { summary: pick("summary"), history: pick("history") };
}

/** Pedido a partir de uma visita à página: no máximo uma tentativa por cidade/língua por dia, em segundo plano. */
const tried = new Map<string, number>();
export function ensureKnowledge(city: string, lang: string) {
  const k = `${city}:${lang}`;
  if (Date.now() - (tried.get(k) ?? 0) < 86400_000) return;
  tried.set(k, Date.now());
  void refreshCityKnowledge(city, lang).catch(() => null);
}
