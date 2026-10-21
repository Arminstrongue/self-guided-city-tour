"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Globe, Wallet, Check, X } from "lucide-react";
import { LOCALES } from "@/i18n/core";
import { CURRENCIES, CURRENCY_COOKIE } from "@/lib/currency";

/** Cada idioma escrito no próprio idioma, para quem não lê o atual. */
export const LANG_NAMES: Record<string, string> = {
  pt: "Português", en: "English", es: "Español", fr: "Français", de: "Deutsch", it: "Italiano", zh: "中文", ar: "العربية", ja: "日本語",
  tr: "Türkçe", ru: "Русский", ko: "한국어", hi: "हिन्दी", nl: "Nederlands"
};
/** Títulos da folha de idioma e moeda (curtos, para não carregar o dicionário inteiro no browser). */
const UI: Record<string, [string, string]> = {
  pt: ["Idioma", "Moeda"], en: ["Language", "Currency"], es: ["Idioma", "Moneda"], fr: ["Langue", "Devise"], de: ["Sprache", "Währung"],
  it: ["Lingua", "Valuta"], zh: ["语言", "货币"], ar: ["اللغة", "العملة"], ja: ["言語", "通貨"], tr: ["Dil", "Para birimi"], ru: ["Язык", "Валюта"],
  ko: ["언어", "통화"], hi: ["भाषा", "मुद्रा"], nl: ["Taal", "Valuta"]
};
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
      {open && (
        <div className="sheet-bg hb-bg" onClick={() => setOpen(false)}>
          <div className="sheet hb-sheet" role="dialog" aria-label={l} onClick={(e) => e.stopPropagation()}>
            <button className="sheet-x" onClick={() => setOpen(false)} aria-label="✕"><X size={18} aria-hidden="true" /></button>
            <b className="hb-h">{l}</b>
            <div className="hb-langs">
              {LOCALES.map((v) => (
                <button key={v} className={`hb-lang press ${v === locale ? "on" : ""}`} onClick={() => pickLang(v)} lang={v}>
                  <span className="hb-code">{v.toUpperCase()}</span><span className="hb-name">{LANG_NAMES[v] ?? v}</span>{v === locale && <Check size={16} strokeWidth={2.6} aria-hidden="true" />}
                </button>
              ))}
            </div>
            {currency && <>
              <b className="hb-h">{c}</b>
              <div className="hb-curs">
                {CURRENCIES.map((v) => <button key={v} className={`hb-cur press ${v === currency ? "on" : ""}`} onClick={() => pickCur(v)}><b>{SYM[v] ?? ""}</b>{v}</button>)}
              </div>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
