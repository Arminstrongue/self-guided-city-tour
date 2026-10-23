import type { Metadata } from "next";
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

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return { title: `${t.ess.title} | VOYBU`, description: t.ess.sub, robots: { index: false } };
}

/** Essenciais offline (alojamento, reservas, plano, emergência, frases). */
export default async function Essentials({ params }: { params: { locale: Locale } }) {
  if (!isLocale(params.locale)) notFound();
  const t = getDict(params.locale);
  const cities: EssCity[] = (await loadCities()).map((c) => {
    const g = PRACTICAL[c.id];
    return { id: c.id, name: cityName(c, params.locale), country: COUNTRY[c.id] ?? "", emergency: g ? emergencyText(g.emergency, t) : "", emergencyTel: g ? g.emergency.split(" ")[0] : "" };
  });
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <EssentialsView t={t} locale={params.locale} cities={cities} />
    </main>
  );
}
