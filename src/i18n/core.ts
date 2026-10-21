/**
 * Partes leves da tradução (idiomas, formatação), usadas no browser.
 * Os textos (dictionaries.ts) ficam no servidor: as páginas passam só o dicionário do idioma pedido.
 */
export const LOCALES = ["pt", "en", "es", "fr", "de", "it", "zh", "ar", "ja"] as const;
/** Idiomas escritos da direita para a esquerda. */
export const RTL: string[] = ["ar"];
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

/** Substitui {chaves} no texto. */
export function fmt(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return Object.entries(vars).reduce((acc, [k, v]) => acc.split(`{${k}}`).join(String(v)), s);
}
export const INTL_LOCALE: Record<Locale, string> = { pt: "pt-PT", en: "en-GB", es: "es-ES", fr: "fr-FR", de: "de-DE", it: "it-IT", zh: "zh-CN", ar: "ar", ja: "ja-JP" };
