import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";

export type LockWhat = "route" | "steps" | "plan" | "explore" | "safety" | "know" | "free" | "events" | "info";

/**
 * Amostra grátis: o resto abre com o passe da cidade. Na app nativa não há compra nem preço (só "Já tenho passe").
 */
/** "7 paragens (+2 opcionais)": a mesma contagem em todos os ecrãs (roteiro principal + extensão opcional). */
export function stopsText(t: Dict, n: number, core?: number): string {
  const c = core && core < n ? core : n;
  return fmt(t.lk.more, { n: c }) + (c < n ? ` (+${n - c} ${t.tpOptional})` : "");
}

export function Locked({ t, locale, city, cityName, what, more = 0, core, signedIn = false }: { t: Dict; locale: Locale; city: string; cityName: string; what: LockWhat; more?: number; core?: number; signedIn?: boolean }) {
  return (
    <div className="lk card" role="note">
      <span className="lk-ic" aria-hidden="true">🔒</span>
      <b>{t.lk[what]}</b>
      {more > 0 && <span className="lk-more">{stopsText(t, more, core)}</span>}
      <p className="hint">{fmt(t.lk.sub, { c: cityName })}</p>
      <a className="btn tram press web-only" href={`/${locale}/c/${city}#book`}>{fmt(t.lk.unlock, { c: cityName })}</a>
      {/* Com sessão iniciada não se pede para entrar outra vez: oferece-se ligar um passe pago com outro email. */}
      {signedIn ? <a className="link-btn lk-link" href={`/${locale}/wallet?linkpass=1#passes`}>{t.lp.open}</a>
        : <a className="link-btn" href={`/${locale}/wallet?signin=1&city=${city}`}>{t.lk.have}</a>}
    </div>
  );
}

/** Linha "🔒 +N paragens" no fim de uma lista de paragens cortada. */
export function LockedMore({ t, n }: { t: Dict; n: number }) {
  return n > 0 ? <li className="lk-li"><span aria-hidden="true">🔒</span> {fmt(t.lk.more, { n })}</li> : null;
}
