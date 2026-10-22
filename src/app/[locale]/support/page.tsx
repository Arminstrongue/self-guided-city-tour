import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";
export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return { title: `${getDict(params.locale).lSupport} · VOYBU` };
}
export default function Page({ params }: { params: { locale: Locale } }) {
  return <InfoPage locale={params.locale} doc="support" />;
}
