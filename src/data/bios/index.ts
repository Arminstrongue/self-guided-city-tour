/**
 * Biografias longas de cada paragem, por idioma (para ler e para o áudio-guia).
 * Ficheiros JSON por idioma: { [cidade]: { [paragem]: texto } }. Só usados no servidor.
 * Falta um idioma ou um texto → usa o inglês.
 */
import en from "./en.json";
import pt from "./pt.json";
import es from "./es.json";
import fr from "./fr.json";
import de from "./de.json";

type Bios = Record<string, Record<string, string>>;
const BIOS: Record<string, Bios> = { en, pt, es, fr, de };

export type Bio = { text: string; lang: string };

export function biosFor(cityId: string, locale: string): Record<string, Bio> {
  const out: Record<string, Bio> = {};
  const local = BIOS[locale]?.[cityId] ?? {};
  const base = BIOS.en[cityId] ?? {};
  for (const id of new Set([...Object.keys(base), ...Object.keys(local)])) {
    out[id] = local[id] ? { text: local[id], lang: locale } : { text: base[id], lang: "en" };
  }
  return out;
}

export const BIO_LANGS = Object.keys(BIOS);
