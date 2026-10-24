"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Luggage, Check, X, Search } from "lucide-react";
import { LOCALES } from "@/i18n/core";
import { CURRENCIES, CURRENCY_COOKIE } from "@/lib/currency";
import Portal from "@/components/Portal";
import { BrandMark } from "@/components/BrandMark";

/** Cada idioma escrito no próprio idioma, para quem não lê o atual. */
export const LANG_NAMES: Record<string, string> = {
  pt: "Português", en: "English", es: "Español", fr: "Français", de: "Deutsch", it: "Italiano", zh: "中文", ar: "العربية", ja: "日本語",
  tr: "Türkçe", ru: "Русский", ko: "한국어", hi: "हिन्दी", nl: "Nederlands"
};
/** Bandeira de cada idioma (emoji: sem imagens extra para carregar). */
export const FLAG: Record<string, string> = { pt: "🇵🇹", en: "🇬🇧", es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪", it: "🇮🇹", zh: "🇨🇳", ar: "🇸🇦", ja: "🇯🇵", ko: "🇰🇷", ru: "🇷🇺", tr: "🇹🇷" };

/** Idioma do país (cookie posto pelo servidor a partir do país do IP) e do dispositivo (navigator.languages). */
export function countryLang(): string | null {
  const m = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )sgct_cl=([a-z]{2})/) : null;
  return m && (LOCALES as readonly string[]).includes(m[1]) ? m[1] : null;
}
export function deviceLang(): string | null {
  if (typeof navigator === "undefined") return null;
  for (const l of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    const v = (l || "").toLowerCase().split("-")[0];
    if ((LOCALES as readonly string[]).includes(v)) return v;
  }
  return null;
}
/** Etiquetas: [pergunta, idioma do país, idioma do dispositivo]. */
export const LANG_SRC: Record<string, [string, string, string]> = {
  pt: ["Em que idioma prefere?", "Idioma do país", "Idioma do dispositivo"],
  en: ["Which language do you prefer?", "Country language", "Device language"],
  es: ["¿En qué idioma prefieres?", "Idioma del país", "Idioma del dispositivo"],
  fr: ["Quelle langue préférez-vous ?", "Langue du pays", "Langue de l'appareil"],
  de: ["Welche Sprache bevorzugen Sie?", "Landessprache", "Gerätesprache"],
  it: ["Quale lingua preferisci?", "Lingua del paese", "Lingua del dispositivo"],
  zh: ["您想使用哪种语言？", "所在国家语言", "设备语言"],
  ar: ["ما اللغة التي تفضلها؟", "لغة البلد", "لغة الجهاز"],
  ja: ["どの言語で表示しますか？", "国の言語", "端末の言語"],
  ko: ["어떤 언어를 사용할까요?", "국가 언어", "기기 언어"],
  ru: ["Какой язык вам удобнее?", "Язык страны", "Язык устройства"],
  tr: ["Hangi dili tercih edersiniz?", "Ülke dili", "Cihaz dili"]
};
/** Muda de idioma mantendo a página e lembra que o viajante já escolheu. */
export function switchLang(v: string) {
  const rest = location.pathname.split("/").slice(2).join("/");
  document.cookie = `sgct_locale=${v}; path=/; max-age=31536000; samesite=lax`;
  document.cookie = `sgct_lang_ok=1; path=/; max-age=31536000; samesite=lax`;
  location.href = `/${v}${rest ? `/${rest}` : ""}${location.search}${location.hash}`;
}

/** Textos do seletor (curtos, para não carregar o dicionário inteiro no browser): idioma, moeda, pesquisar, sugeridas, todas. */
const UI: Record<string, [string, string, string, string, string]> = {
  pt: ["Idioma", "Moeda", "Pesquisar", "Sugeridas", "Todas"], en: ["Language", "Currency", "Search", "Suggested", "All"],
  es: ["Idioma", "Moneda", "Buscar", "Sugeridas", "Todas"], fr: ["Langue", "Devise", "Rechercher", "Suggérées", "Toutes"],
  de: ["Sprache", "Währung", "Suchen", "Vorgeschlagen", "Alle"], it: ["Lingua", "Valuta", "Cerca", "Suggerite", "Tutte"],
  zh: ["语言", "货币", "搜索", "推荐", "全部"], ar: ["اللغة", "العملة", "بحث", "مقترحة", "الكل"], ja: ["言語", "通貨", "検索", "おすすめ", "すべて"],
  tr: ["Dil", "Para birimi", "Ara", "Önerilen", "Tümü"], ru: ["Язык", "Валюта", "Поиск", "Рекомендуемые", "Все"],
  ko: ["언어", "통화", "검색", "추천", "전체"], hi: ["भाषा", "मुद्रा", "खोजें", "सुझाई गई", "सभी"], nl: ["Taal", "Valuta", "Zoeken", "Voorgesteld", "Alle"]
};
const SUGGESTED = ["EUR", "GBP", "USD", "CHF"];
/** Nome da área pessoal ("My Trip") por idioma, para o botão do topo. */
const TRIP: Record<string, string> = { en: "My Trip", pt: "A minha viagem", es: "Mi viaje", fr: "Mon voyage", de: "Meine Reise", it: "Il mio viaggio", zh: "我的行程", ar: "رحلتي", ja: "マイトリップ", tr: "Seyahatim", ru: "Моя поездка", ko: "내 여행" };
const SYM: Record<string, string> = { EUR: "€", GBP: "£", USD: "$", JPY: "¥", CNY: "¥", KRW: "₩", INR: "₹", TRY: "₺", ILS: "₪", BRL: "R$", CHF: "CHF", THB: "฿", PHP: "₱" };

/** Barra superior em vidro. `over` = transparente por cima de uma fotografia (página inicial e da cidade). */
export function Header({ locale, currency, over = false }: { locale: string; currency?: string; over?: boolean }) {
  const [open, setOpen] = useState(false);
  const [l, c] = UI[locale] ?? UI.en;
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open]);
  const pickLang = (v: string) => switchLang(v);
  const pickCur = (v: string) => { document.cookie = `${CURRENCY_COOKIE}=${v}; path=/; max-age=${365 * 86400}; samesite=lax`; window.location.reload(); };
  return (
    <div className={`bar${over ? " over" : ""}`}>
      <Link className="brand" href={`/${locale}`} aria-label="VOYBU"><span className="mark" aria-hidden="true"><BrandMark size={30} ring="auto" /></span><span className="word">VOYBU</span></Link>
      <div className="bar-end">
        <Link className="hb-ic press" href={`/${locale}/wallet`} aria-label={TRIP[locale] ?? TRIP.en} title={TRIP[locale] ?? TRIP.en}><Luggage size={18} strokeWidth={2} aria-hidden="true" /></Link>
        <button className="hb-chip press" onClick={() => setOpen(true)} aria-label={`${l} · ${c}`} title={`${l} · ${c}`} aria-haspopup="dialog">
          <span className="hb-flag" aria-hidden="true">{FLAG[locale] ?? "🌐"}</span><b>{locale.toUpperCase()}</b>{currency && <><i aria-hidden="true" /><span>{SYM[currency] ?? currency}</span></>}
        </button>
      </div>
      {open && <LocalePicker locale={locale} currency={currency} ui={UI[locale] ?? UI.en} onClose={() => setOpen(false)} onLang={pickLang} onCur={pickCur} />}
    </div>
  );
}

/** Símbolo curto real da moeda (CA$ → $, R$, zł…), no formato do idioma atual. */
function symOf(code: string, locale: string) {
  try { return new Intl.NumberFormat(locale, { style: "currency", currency: code, currencyDisplay: "narrowSymbol" }).formatToParts(0).find((p) => p.type === "currency")?.value ?? code; } catch { return SYM[code] ?? code; }
}
function dn(locale: string, type: "language" | "currency", code: string) {
  try { return new Intl.DisplayNames([locale], { type }).of(code) ?? code; } catch { return code; }
}
/** Bandeira do país emissor (EUR → UE), a partir das duas primeiras letras do código ISO. */
function flagOf(code: string) {
  const r = code === "EUR" ? "EU" : code.slice(0, 2);
  return String.fromCodePoint(...[...r].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}
const fold = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function LocalePicker({ locale, currency, ui, onClose, onLang, onCur }: {
  locale: string; currency?: string; ui: [string, string, string, string, string];
  onClose: () => void; onLang: (v: string) => void; onCur: (v: string) => void;
}) {
  const [tab, setTab] = useState<"lang" | "cur">("lang");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [lt, ct, st, sg, all] = ui;
  const f = fold(q.trim());
  const langs = LOCALES.map((v) => ({ v, native: LANG_NAMES[v] ?? v, here: dn(locale, "language", v) }))
    .filter((x) => !f || fold(`${x.v} ${x.native} ${x.here}`).includes(f));
  const curs = CURRENCIES.map((v) => ({ v, name: dn(locale, "currency", v), sym: symOf(v, locale) }))
    .filter((x) => !f || fold(`${x.v} ${x.name} ${x.sym}`).includes(f));
  const go = (kind: "lang" | "cur", v: string) => { setBusy(v); kind === "lang" ? onLang(v) : onCur(v); };
  const curRow = (x: { v: string; name: string; sym: string }) => (
    <button key={x.v} role="option" aria-selected={x.v === currency} className={`pk-row press${x.v === currency ? " on" : ""}`} onClick={() => go("cur", x.v)} disabled={!!busy}>
      <span className="pk-flag" aria-hidden="true">{flagOf(x.v)}</span>
      <span className="pk-tx"><b>{x.name}</b><small>{x.v}</small></span>
      <span className="pk-sym">{busy === x.v ? <i className="pk-spin" /> : x.v === currency ? <Check size={16} strokeWidth={2.8} /> : x.sym}</span>
    </button>
  );
  return (
    <Portal>
      <div className="sheet-bg pk-bg" onClick={onClose}>
        <div className="sheet pk" role="dialog" aria-label={`${lt} · ${ct}`} onClick={(e) => e.stopPropagation()}>
          <div className="pk-grab" aria-hidden="true" />
          <div className="pk-top">
            <div className="pk-seg" role="tablist">
              <button role="tab" aria-selected={tab === "lang"} className={tab === "lang" ? "on" : ""} onClick={() => { setTab("lang"); setQ(""); }}>
                <i className="pk-flag sm" aria-hidden="true">{FLAG[locale] ?? "🌐"}</i><span><small>{lt}</small><b>{LANG_NAMES[locale] ?? locale}</b></span>
              </button>
              {currency && <button role="tab" aria-selected={tab === "cur"} className={tab === "cur" ? "on" : ""} onClick={() => { setTab("cur"); setQ(""); }}>
                <span className="pk-cs" aria-hidden="true">{symOf(currency, locale)}</span><span><small>{ct}</small><b>{currency}</b></span>
              </button>}
              <i className={`pk-ind${tab === "cur" ? " r" : ""}`} aria-hidden="true" />
            </div>
            <button className="pk-x press" onClick={onClose} aria-label="✕"><X size={18} aria-hidden="true" /></button>
          </div>
          <label className="pk-q">
            <Search size={16} aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={st} aria-label={st} autoComplete="off" spellCheck={false} />
            {q && <button onClick={() => setQ("")} aria-label="✕"><X size={14} /></button>}
          </label>
          <div className="pk-body" role="listbox" aria-label={tab === "lang" ? lt : ct}>
            {tab === "lang" ? (<>
              {!f && <LangSources locale={locale} onPick={(v) => go("lang", v)} />}
              <div className="pk-grid">
                {langs.map((x) => (
                  <button key={x.v} role="option" aria-selected={x.v === locale} lang={x.v} className={`pk-row press${x.v === locale ? " on" : ""}`} onClick={() => go("lang", x.v)} disabled={!!busy}>
                    <span className="pk-flag" aria-hidden="true">{FLAG[x.v] ?? "🌐"}</span>
                    <span className="pk-tx"><b>{x.native}</b>{x.here !== x.native && <small lang={locale}>{x.here}</small>}</span>
                    {busy === x.v ? <i className="pk-spin" /> : x.v === locale && <Check size={16} strokeWidth={2.8} className="pk-ck" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </>) : (
              <>
                {!f && <><h4 className="pk-h">{sg}</h4><div className="pk-chips">{curs.filter((x) => SUGGESTED.includes(x.v)).map(curRow)}</div><h4 className="pk-h">{all}</h4></>}
                <div className="pk-list">{curs.filter((x) => f || !SUGGESTED.includes(x.v)).map(curRow)}</div>
              </>
            )}
            {(tab === "lang" ? langs : curs).length === 0 && <p className="pk-none">—</p>}
          </div>
        </div>
      </div>
    </Portal>
  );
}

/** No seletor: atalhos para o idioma do país onde está e o do dispositivo. */
function LangSources({ locale, onPick }: { locale: string; onPick: (v: string) => void }) {
  const [src, setSrc] = useState<{ v: string; why: string }[]>([]);
  useEffect(() => {
    const [, cl, dl] = LANG_SRC[locale] ?? LANG_SRC.en;
    const c = countryLang(), d = deviceLang();
    const out: { v: string; why: string }[] = [];
    if (c) out.push({ v: c, why: cl });
    if (d) { const same = out.find((x) => x.v === d); if (same) same.why = `${cl} · ${dl}`; else out.push({ v: d, why: dl }); }
    setSrc(out);
  }, [locale]);
  if (!src.length) return null;
  return (
    <div className="pk-src">
      {src.map((x) => (
        <button key={x.v} type="button" className={`pk-src-b press${x.v === locale ? " on" : ""}`} onClick={() => onPick(x.v)} lang={x.v}>
          <span className="pk-flag sm" aria-hidden="true">{FLAG[x.v] ?? "🌐"}</span>
          <span><b>{LANG_NAMES[x.v]}</b><small lang={locale}>{x.why}</small></span>
          {x.v === locale && <Check size={15} strokeWidth={2.8} aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}
