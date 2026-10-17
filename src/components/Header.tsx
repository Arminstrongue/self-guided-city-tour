"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, getDict, isLocale } from "@/i18n/dictionaries";
import { CurrencyPicker } from "./CurrencyPicker";

/** Cada idioma escrito no próprio idioma, para quem não lê o atual. */
const LANG_NAMES: Record<string, string> = { pt: "Português", en: "English", es: "Español", fr: "Français", de: "Deutsch", it: "Italiano", zh: "中文", ar: "العربية", ja: "日本語" };

const Globe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" /></svg>
);

/** Barra superior em vidro. `over` = transparente por cima de uma fotografia (página inicial e da cidade). */
export function Header({ locale, currency, over = false }: { locale: string; currency?: string; over?: boolean }) {
  const path = usePathname() ?? `/${locale}`;
  const rest = path.split("/").slice(2).join("/");
  return (
    <div className={`bar${over ? " over" : ""}`}>
      <Link className="brand" href={`/${locale}`}><span className="mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path fillRule="evenodd" d="M12 2a7 7 0 0 0-7 7c0 4.9 5.6 11.6 6.3 12.4a.9.9 0 0 0 1.4 0C13.4 20.6 19 13.9 19 9a7 7 0 0 0-7-7zm0 4.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z" /></svg></span><span className="word">Self Guided <span>City Tour</span></span></Link>
      <div className="bar-end">
        <label className="pick press">
          <Globe /><span>{locale.toUpperCase()}</span>
          <select aria-label="Language" value={locale}
            onChange={(e) => { document.cookie = `sgct_locale=${e.target.value}; path=/; max-age=31536000; samesite=lax`; window.location.href = `/${e.target.value}${rest ? `/${rest}` : ""}`; }}>
            {LOCALES.map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
          </select>
        </label>
        {currency && <CurrencyPicker current={currency} label={getDict(isLocale(locale) ? locale : "en").currency} pill />}
      </div>
    </div>
  );
}
