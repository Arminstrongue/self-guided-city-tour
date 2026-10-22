/**
 * Hora local de um destino ↔ instante absoluto. Um bilhete diz "14:30" na hora de Lisboa; o telemóvel pode estar
 * noutro fuso. Sem bibliotecas: usa o Intl para descobrir o desvio do fuso nessa data.
 */
function offsetMin(tz: string, at: Date): number {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
    .formatToParts(at).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - at.getTime()) / 60000);
}
/** "2026-10-22T14:30" em `tz` → Date. */
export function zonedToDate(local: string, tz: string): Date {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return new Date(NaN);
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let t = guess - offsetMin(tz, new Date(guess)) * 60000;
  t = guess - offsetMin(tz, new Date(t)) * 60000; // segunda passagem acerta a mudança de hora
  return new Date(t);
}
/** Hora "HH:MM" de um instante, no fuso do destino. */
export function hmIn(d: Date, tz: string, locale = "en-GB"): string {
  return new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(d);
}
