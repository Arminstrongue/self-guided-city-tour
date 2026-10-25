import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";
export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  return { title: `${getDict(params.locale).lEco} · VOYBU` };
}
export default async function Page(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params;
  return <InfoPage locale={params.locale} doc="eco" />;
}
