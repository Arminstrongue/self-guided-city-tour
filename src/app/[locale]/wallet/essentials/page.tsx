import type { Metadata } from "next";
import { PageBanner } from "@/components/SiteImage";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { EssentialsView, type EssCity } from "@/components/EssentialsView";
import { COUNTRY, cityName } from "@/data/cities";
import { PRACTICAL, emergencyText } from "@/data/practical";
import { isLocale } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { loadCities } from "@/lib/content";
import { requestCurrency } from "@/lib/fx";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return { title: `${t.ess.title} | VOYBU`, description: t.ess.sub, robots: { index: false } };
}

/** Essenciais offline (alojamento, reservas, plano, emergência, frases). */
export default async function Essentials(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const t = getDict(params.locale);
  const cities: EssCity[] = (await loadCities()).map((c) => {
    const g = PRACTICAL[c.id];
    return { id: c.id, name: cityName(c, params.locale), country: COUNTRY[c.id] ?? "", emergency: g ? emergencyText(g.emergency, t) : "", emergencyTel: g ? g.emergency.split(" ")[0] : "" };
  });
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <PageBanner k="nearby-essentials" alt={getDict(params.locale).img.alt["nearby-essentials"]} />
      <EssentialsView locale={params.locale} cities={cities} />
    </main>
  );
}
