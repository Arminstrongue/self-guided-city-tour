import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/600.css";
import "@fontsource/figtree/700.css";
import "@fontsource/bricolage-grotesque/600.css";
import "@fontsource/bricolage-grotesque/800.css";
import "../globals.css";
import Link from "next/link";
import { ServiceWorker } from "@/components/ServiceWorker";
import { isLocale, getDict } from "@/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Self Guided City Tour",
  description: "Self-guided city routes for layover travellers, with the cheapest transport and a countdown to your flight.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" }
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#1d4aa0" };

export default function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const t = getDict(params.locale);
  return (
    <html lang={params.locale}>
      <body>
        <ServiceWorker />
        {children}
        <footer className="foot">
          <p>{t.footer}</p>
          <p className="legal-links"><Link href={`/${params.locale}/legal/terms`}>{t.lTerms}</Link> · <Link href={`/${params.locale}/legal/privacy`}>{t.lPrivacy}</Link> · <Link href={`/${params.locale}/legal/cookies`}>{t.lCookies}</Link></p>
        </footer>
      </body>
    </html>
  );
}
