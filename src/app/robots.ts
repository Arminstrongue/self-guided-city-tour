import type { MetadataRoute } from "next";
// Gerado a cada pedido: o domínio vem do .env do servidor (no build do Docker ainda não existe).
export const dynamic = "force-dynamic";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/*/admin", "/*/wallet", "/*/tour/", "/*/diary", "/*/success", "/*/agents"] }],
    sitemap: `${env.appUrl}/sitemap.xml`, host: env.appUrl
  };
}
