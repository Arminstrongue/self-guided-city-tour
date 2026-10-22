import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/inter";
import "../globals.css";
import Link from "next/link";
import { ServiceWorker } from "@/components/ServiceWorker";
import { NativeChrome } from "@/components/NativeChrome";
import { Toaster } from "@/components/Toaster";
import { SkipLink } from "@/components/SkipLink";
import { SheetManager } from "@/components/SheetManager";
import { isLocale, RTL } from "@/i18n/core";
import { getDict } from "@/i18n/dictionaries";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: "VOYBU — Your self-guided tour",
  description: "VOYBU — your self-guided tour. City routes with an audio guide, the cheapest transport and your trip essentials in one place.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "VOYBU", statusBarStyle: "black-translucent" },
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
    <html lang={params.locale} dir={RTL.includes(params.locale) ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        {/* Tema (dia/noite) e cor escolhidos na carteira, aplicados antes de pintar para não piscar. */}
        {/* Fornecedor de mapas configurável no servidor (sem reconstruir a app): MAP_TILES, MAP_ATTRIBUTION, MAP_TILES_PREFETCH. */}
        <script dangerouslySetInnerHTML={{ __html: `window.__SGCT_MAP=${JSON.stringify({ t: process.env.MAP_TILES || process.env.NEXT_PUBLIC_MAP_TILES || "", a: process.env.MAP_ATTRIBUTION || process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || "", p: process.env.MAP_TILES_PREFETCH === "1" }).replace(/</g, "\\u003c")}` }} />
        <script dangerouslySetInnerHTML={{ __html: `try{var d=document.documentElement,t=localStorage.getItem("sgct:theme"),a=localStorage.getItem("sgct:accent");if(t==="light"||t==="dark")d.dataset.theme=t;if(a&&a!=="blue")d.dataset.accent=a}catch(e){}` }} />
      </head>
      <body>
        <SkipLink label={t.skipToContent} />
        <ServiceWorker />
        <NativeChrome />
        <SheetManager />
        {children}
        <Toaster />
        <footer className="foot">
          <p>{t.footer}</p>
          <p className="legal-links"><Link href={`/${params.locale}/about`}>{t.lAbout}</Link> · <Link href={`/${params.locale}/support`}>{t.lSupport}</Link> · <Link href={`/${params.locale}/eco`}>{t.lEco}</Link> · <Link href={`/${params.locale}/contact`}>{t.lContact}</Link></p>
          <p className="legal-links"><Link href={`/${params.locale}/legal/terms`}>{t.lTerms}</Link> · <Link href={`/${params.locale}/legal/privacy`}>{t.lPrivacy}</Link> · <Link href={`/${params.locale}/legal/cookies`}>{t.lCookies}</Link> · <Link href={`/${params.locale}/merchants`}>{t.lMerchants}</Link> · <Link href={`/${params.locale}/agents`}>{t.lAgents}</Link> · <Link href={`/${params.locale}/guides/join`}>{t.lGuides}</Link> · <Link href={`/${params.locale}/wallet`}>{t.wallet}</Link></p>
        </footer>
      </body>
    </html>
  );
}
