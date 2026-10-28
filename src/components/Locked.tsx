import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";

export type LockWhat = "route" | "steps" | "plan" | "explore" | "safety" | "know" | "free" | "events" | "info";

/**
 * Amostra grátis: o resto abre com o passe da cidade. Na app nativa não há compra nem preço (só "Já tenho passe").
 */
export function Locked({ t, locale, city, cityName, what, more = 0 }: { t: Dict; locale: Locale; city: string; cityName: string; what: LockWhat; more?: number }) {
  return (
    <div className="lk card" role="note">
      <span className="lk-ic" aria-hidden="true">🔒</span>
      <b>{t.lk[what]}</b>
      {more > 0 && <span className="lk-more">{fmt(t.lk.more, { n: more })}</span>}
      <p className="hint">{fmt(t.lk.sub, { c: cityName })}</p>
      <a className="btn tram press web-only" href={`/${locale}/c/${city}#book`}>{fmt(t.lk.unlock, { c: cityName })}</a>
      <a className="link-btn" href={`/${locale}/wallet?signin=1&city=${city}`}>{t.lk.have}</a>
    </div>
  );
}

/** Linha "🔒 +N paragens" no fim de uma lista de paragens cortada. */
export function LockedMore({ t, n }: { t: Dict; n: number }) {
  return n > 0 ? <li className="lk-li"><span aria-hidden="true">🔒</span> {fmt(t.lk.more, { n })}</li> : null;
}
