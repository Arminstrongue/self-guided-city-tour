"use client";
/**
 * Dicionário no cliente sem o embutir em cada página: o navegador carrega /api/dict/<língua> uma vez
 * (cache permanente, versão no URL) e o servidor usa o registo em memória durante o SSR.
 * Os componentes chamam useDict(); se receberem `t` por props, esse tem prioridade.
 */
import { createContext, useContext } from "react";
import type { Dict } from "./dictionaries";

const Ctx = createContext<string>("en");

export function DictProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

type G = { __SGCT_T?: Dict; __SGCT_DICT?: Record<string, Dict> };
export function useDict(fallback?: Dict): Dict {
  const locale = useContext(Ctx);
  if (fallback) return fallback;
  const g = globalThis as unknown as G;
  const d = typeof window === "undefined" ? g.__SGCT_DICT?.[locale] : g.__SGCT_T;
  if (!d) throw new Error(`dictionary not loaded for ${locale}`);
  return d;
}
