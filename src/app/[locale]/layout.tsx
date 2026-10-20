import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/inter";
import "../globals.css";
import Link from "next/link";
import { ServiceWorker } from "@/components/ServiceWorker";
import { NativeChrome } from "@/components/NativeChrome";
import { isLocale, getDict, RTL } from "@/i18n/dictionaries";
import { LiveNews } from "@/components/LiveNews";
import { CITIES } from "@/data/cities";

export const metadata: Metadata = {
  title: "Self Guided City Tour",
  description: "Self-guided city routes for layover travellers, with the cheapest transport and a countdown to your flight.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "City Tour", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" }
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, viewportFit: "cover",
  // Cor da barra do navegador / sistema (Android Chrome, Safari iOS 15+).
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f5f5f7" }, { media: "(prefers-color-scheme: dark)", color: "#000000" }]
};

export default function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const t = getDict(params.locale);
  return (
    <html lang={params.locale} dir={RTL.includes(params.locale) ? "rtl" : "ltr"}>
      <body>
        <ServiceWorker />
        <NativeChrome />
        {children}
        <footer className="foot">
          <LiveNews locale={params.locale} cities={Object.fromEntries(CITIES.map((c) => [c.id, c.n[params.locale] ?? c.n.en]))}
            t={{ nwTitle: t.nwTitle, nwGeneral: t.nwGeneral, nwOfficial: t.nwOfficial, nwTrusted: t.nwTrusted, nwNone: t.nwNone, nwNote: t.nwNote, nwMore: t.nwMore }} />
          <p>{t.footer}</p>
          <p className="legal-links"><Link href={`/${params.locale}/legal/terms`}>{t.lTerms}</Link> · <Link href={`/${params.locale}/legal/privacy`}>{t.lPrivacy}</Link> · <Link href={`/${params.locale}/legal/cookies`}>{t.lCookies}</Link> · <Link href={`/${params.locale}/merchants`}>{t.lMerchants}</Link> · <Link href={`/${params.locale}/agents`}>{t.lAgents}</Link> · <Link href={`/${params.locale}/guides/join`}>{t.lGuides}</Link> · <Link href={`/${params.locale}/wallet`}>{t.wallet}</Link></p>
        </footer>
      </body>
    </html>
  );
}
