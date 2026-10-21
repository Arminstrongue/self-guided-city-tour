"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Globe, Wallet, Check, X, Search } from "lucide-react";
import { LOCALES } from "@/i18n/core";
import { CURRENCIES, CURRENCY_COOKIE } from "@/lib/currency";
import Portal from "@/components/Portal";

/** Cada idioma escrito no próprio idioma, para quem não lê o atual. */
export const LANG_NAMES: Record<string, string> = {
  pt: "Português", en: "English", es: "Español", fr: "Français", de: "Deutsch", it: "Italiano", zh: "中文", ar: "العربية", ja: "日本語",
  tr: "Türkçe", ru: "Русский", ko: "한국어", hi: "हिन्दी", nl: "Nederlands"
};
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
const SYM: Record<string, string> = { EUR: "€", GBP: "£", USD: "$", JPY: "¥", CNY: "¥", KRW: "₩", INR: "₹", TRY: "₺", ILS: "₪", BRL: "R$", CHF: "CHF", THB: "฿", PHP: "₱" };

/** Barra superior em vidro. `over` = transparente por cima de uma fotografia (página inicial e da cidade). */
export function Header({ locale, currency, over = false }: { locale: string; currency?: string; over?: boolean }) {
  const path = usePathname() ?? `/${locale}`;
  const rest = path.split("/").slice(2).join("/");
  const [open, setOpen] = useState(false);
  const [l, c] = UI[locale] ?? UI.en;
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open]);
  const pickLang = (v: string) => { document.cookie = `sgct_locale=${v}; path=/; max-age=31536000; samesite=lax`; window.location.href = `/${v}${rest ? `/${rest}` : ""}`; };
  const pickCur = (v: string) => { document.cookie = `${CURRENCY_COOKIE}=${v}; path=/; max-age=${365 * 86400}; samesite=lax`; window.location.reload(); };
  return (
    <div className={`bar${over ? " over" : ""}`}>
      <Link className="brand" href={`/${locale}`} aria-label="Self Guided City Tour"><span className="mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path fillRule="evenodd" d="M12 2a7 7 0 0 0-7 7c0 4.9 5.6 11.6 6.3 12.4a.9.9 0 0 0 1.4 0C13.4 20.6 19 13.9 19 9a7 7 0 0 0-7-7zm0 4.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z" /></svg></span><span className="word">Self Guided <span>City Tour</span></span></Link>
      <div className="bar-end">
        <Link className="hb-ic press" href={`/${locale}/wallet`} aria-label="Wallet" title="Wallet"><Wallet size={18} strokeWidth={2} aria-hidden="true" /></Link>
        <button className="hb-chip press" onClick={() => setOpen(true)} aria-label={`${l} · ${c}`} title={`${l} · ${c}`} aria-haspopup="dialog">
          <Globe size={14} strokeWidth={2.2} aria-hidden="true" /><b>{locale.toUpperCase()}</b>{currency && <><i aria-hidden="true" /><span>{SYM[currency] ?? currency}</span></>}
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
                <Globe size={15} strokeWidth={2.2} aria-hidden="true" /><span><small>{lt}</small><b>{LANG_NAMES[locale] ?? locale}</b></span>
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
            {tab === "lang" ? (
              <div className="pk-grid">
                {langs.map((x) => (
                  <button key={x.v} role="option" aria-selected={x.v === locale} lang={x.v} className={`pk-row press${x.v === locale ? " on" : ""}`} onClick={() => go("lang", x.v)} disabled={!!busy}>
                    <span className="pk-code" aria-hidden="true">{x.v.toUpperCase()}</span>
                    <span className="pk-tx"><b>{x.native}</b>{x.here !== x.native && <small lang={locale}>{x.here}</small>}</span>
                    {busy === x.v ? <i className="pk-spin" /> : x.v === locale && <Check size={16} strokeWidth={2.8} className="pk-ck" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            ) : (
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
