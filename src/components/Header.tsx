"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, getDict, isLocale } from "@/i18n/dictionaries";
import { CurrencyPicker } from "./CurrencyPicker";

/** Cada idioma escrito no próprio idioma, para quem não lê o atual. */
const LANG_NAMES: Record<string, string> = { pt: "Português", en: "English", es: "Español", fr: "Français", de: "Deutsch", it: "Italiano", zh: "中文", ar: "العربية", ja: "日本語" };

export function Header({ locale, currency }: { locale: string; currency?: string }) {
  const path = usePathname() ?? `/${locale}`;
  const rest = path.split("/").slice(2).join("/");
  return (
    <>
      <div className="tiles" aria-hidden="true" />
      <div className="bar">
        <Link className="brand" href={`/${locale}`}>Self Guided <span>City Tour</span></Link>
        <div className="bar-end">
          <select className="cur-pick" aria-label="Language" value={locale}
            onChange={(e) => { document.cookie = `sgct_locale=${e.target.value}; path=/; max-age=31536000; samesite=lax`; window.location.href = `/${e.target.value}${rest ? `/${rest}` : ""}`; }}>
            {LOCALES.map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
          </select>
          {currency && <CurrencyPicker current={currency} label={getDict(isLocale(locale) ? locale : "en").currency} />}
        </div>
      </div>
    </>
  );
}
