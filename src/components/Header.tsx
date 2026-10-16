"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, getDict, isLocale } from "@/i18n/dictionaries";
import { CurrencyPicker } from "./CurrencyPicker";

export function Header({ locale, currency }: { locale: string; currency?: string }) {
  const path = usePathname() ?? `/${locale}`;
  const rest = path.split("/").slice(2).join("/");
  return (
    <>
      <div className="tiles" aria-hidden="true" />
      <div className="bar">
        <Link className="brand" href={`/${locale}`}>Self Guided <span>City Tour</span></Link>
        <div className="bar-end">
          <nav className="langs" aria-label="Language">
            {LOCALES.map((l) => (
              <a key={l} href={`/${l}${rest ? `/${rest}` : ""}`} aria-current={l === locale}>{l.toUpperCase()}</a>
            ))}
          </nav>
          {currency && <CurrencyPicker current={currency} label={getDict(isLocale(locale) ? locale : "en").currency} />}
        </div>
      </div>
    </>
  );
}
