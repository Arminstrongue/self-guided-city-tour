import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";
export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  // Só acessível pelo link do rodapé: fora do sitemap e sem indexação.
  return { title: `${getDict(params.locale).lContact} · VOYBU`, robots: { index: false, follow: true } };
}
export default function Page({ params }: { params: { locale: Locale } }) {
  return <InfoPage locale={params.locale} doc="contact" />;
}
