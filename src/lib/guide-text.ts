"use client";
/** Textos do guia da estação noutras línguas (carregados só quando necessários). */
import { useEffect, useState } from "react";
import type { GTxt } from "@/data/arrival-guides";
import { ARRIVAL_LANGS } from "./arrival-text";

export function useGuideTx(locale: string) {
  const [pack, setPack] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    if (!(ARRIVAL_LANGS as readonly string[]).includes(locale)) return;
    let live = true;
    void import(`@/data/arrival-guides-i18n/${locale}.json`).then((p) => { if (live) setPack((p.default ?? p) as Record<string, string>); }).catch(() => null);
    return () => { live = false; };
  }, [locale]);
  return (key: string, t: GTxt) => (locale === "pt" ? t.pt : pack?.[key] ?? t.en);
}
