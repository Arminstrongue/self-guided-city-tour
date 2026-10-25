import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";
export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  // Só acessível pelo link do rodapé: fora do sitemap e sem indexação.
  return { title: `${getDict(params.locale).lContact} · VOYBU`, robots: { index: false, follow: true } };
}
export default async function Page(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params;
  return <InfoPage locale={params.locale} doc="contact" />;
}
