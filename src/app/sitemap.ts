import type { MetadataRoute } from "next";
import { CITIES } from "@/data/cities";
import { LOCALES } from "@/i18n/core";
// Gerado a cada pedido: o domínio vem do .env do servidor (no build do Docker ainda não existe).
export const dynamic = "force-dynamic";
import { env } from "@/lib/env";

/** /sitemap.xml: página inicial, começar em 3 passos e cada cidade, nas 12 línguas (com as versões alternativas). */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/start", ...CITIES.map((c) => `/c/${c.id}`), ...CITIES.map((c) => `/guides/${c.id}`)];
  const now = new Date();
  return paths.flatMap((p) => LOCALES.map((l) => ({
    url: `${env.appUrl}/${l}${p}`, lastModified: now,
    changeFrequency: p.startsWith("/c/") ? "daily" as const : "weekly" as const,
    priority: p === "" ? 1 : p.startsWith("/c/") ? 0.9 : 0.6,
    alternates: { languages: Object.fromEntries(LOCALES.map((x) => [x, `${env.appUrl}/${x}${p}`])) }
  })));
}
