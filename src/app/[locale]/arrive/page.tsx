import type { Metadata } from "next";
import { PageBanner } from "@/components/SiteImage";
import { notFound } from "next/navigation";
import { alternates } from "@/lib/seo";
import { Header } from "@/components/Header";
import { ArriveFlow, type ArriveCity } from "@/components/ArriveFlow";
import { cityName } from "@/data/cities";
import { lineText } from "@/data/stop-names";
import { isLocale } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { loadCities, PRIMARY_CITY } from "@/lib/content";
import { cityCenterOf } from "@/lib/city-center";
import { requestCurrency } from "@/lib/fx";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return { title: `${t.nn.arrived} | VOYBU`, description: t.nn.arrivedSub, alternates: alternates(params.locale, "/arrive") };
}

/** "Acabei de chegar" e "Quero chegar a um lugar": orientação passo a passo (Londres primeiro). */
export default async function Arrive(
  props: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ city?: string; go?: string }> }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const list = await loadCities();
  const cities: ArriveCity[] = list.map((c) => ({
    id: c.id, name: cityName(c, params.locale), center: cityCenterOf(c),
    ap: c.ap ? { name: c.ap.name, iata: c.ap.iata, lat: c.ap.lat, lng: c.ap.lng } : null,
    air: { min: c.air.min, line: lineText(c.air.line, params.locale) }
  }));
  const initial = cities.some((c) => c.id === searchParams.city) ? searchParams.city! : PRIMARY_CITY;
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <PageBanner k="airport-arrival" alt={getDict(params.locale).img.alt["airport-arrival"]} />
      <ArriveFlow locale={params.locale} cities={cities} initial={initial} go={searchParams.go === "1"} explicit={cities.some((c) => c.id === searchParams.city)} />
    </main>
  );
}
