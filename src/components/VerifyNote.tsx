import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { COMPILED, verifiedOnSite } from "@/data/verify";

/** De onde vem a informação prática e se já foi confirmada no local. */
export function VerifyNote({ t, locale, city }: { t: Dict; locale: Locale; city: string }) {
  const m = (ym: string) => new Intl.DateTimeFormat(INTL_LOCALE[locale], { month: "long", year: "numeric" }).format(new Date(`${ym}-15`));
  const on = verifiedOnSite(city);
  return <p className={`hint vfn${on ? " ok" : ""}`}>{on ? `✓ ${fmt(t.vfOnSite, { d: m(on) })}` : `ⓘ ${fmt(t.vfCompiled, { d: m(COMPILED) })}`}</p>;
}
