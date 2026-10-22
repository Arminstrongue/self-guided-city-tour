import type { Metadata } from "next";
import { LOCALES } from "@/i18n/core";
import { env } from "./env";

/** Endereço canónico e as versões nas 12 línguas (hreflang) de uma página: `path` sem o idioma, ex. "/c/lis". */
export function alternates(locale: string, path = ""): Metadata["alternates"] {
  const url = (l: string) => `${env.appUrl}/${l}${path}`;
  return { canonical: url(locale), languages: { ...Object.fromEntries(LOCALES.map((l) => [l, url(l)])), "x-default": url("en") } };
}
