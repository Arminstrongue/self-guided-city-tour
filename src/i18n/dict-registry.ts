import { createHash } from "node:crypto";
import { getDict, type Locale } from "./dictionaries";

/** Regista o dicionário em memória para o SSR dos componentes de cliente (sem o serializar na página). */
export function ensureDict(locale: Locale) {
  const g = globalThis as unknown as { __SGCT_DICT?: Record<string, unknown> };
  g.__SGCT_DICT ??= {};
  g.__SGCT_DICT[locale] ??= getDict(locale);
}

const versions = new Map<string, string>();
/** Versão (hash do conteúdo) para o URL do dicionário: muda só quando os textos mudam. */
export function dictVersion(locale: Locale): string {
  let v = versions.get(locale);
  if (!v) { v = createHash("sha1").update(JSON.stringify(getDict(locale))).digest("base64url").slice(0, 10); versions.set(locale, v); }
  return v;
}

// Carrega todas as línguas quando o módulo é importado (antes de qualquer renderização).
import { LOCALES } from "./core";
for (const l of LOCALES) ensureDict(l);
