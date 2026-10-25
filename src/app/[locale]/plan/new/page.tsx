import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { DaysPlanner } from "@/components/DaysPlanner";
import { requestCurrency } from "@/lib/fx";
import { loadCities } from "@/lib/content";
import { exploreProps } from "@/lib/explore-props";
import { cityName } from "@/data/cities";
import { stopName } from "@/data/stop-names";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { isLocale, INTL_LOCALE } from "@/i18n/core";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return { title: `${t.dp.title} | VOYBU`, description: t.dp.sub, robots: { index: false } };
}

/** Roteiro de vários dias: escolher dias e interesses (lazer, passeios, gastronomia, arte…) e receber um plano dia a dia. */
export default async function NewDaysPlan(props: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ city?: string; days?: string }> }) {
  const params = await props.params;
  const sp = await props.searchParams;
  if (!isLocale(params.locale)) notFound();
  const list = await loadCities();
  const cities = list.map((c) => ({ id: c.id, name: cityName(c, params.locale) })).sort((a, b) => a.name.localeCompare(b.name, INTL_LOCALE[params.locale]));
  const city = list.find((c) => c.id === sp.city) ?? null;
  const ex = city ? exploreProps(city, params.locale) : null;
  const days = Math.min(14, Math.max(1, Number(sp.days) || 5));
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <DaysPlanner locale={params.locale} cities={cities} initialDays={days}
        city={city ? { id: city.id, name: cityName(city, params.locale), stops: city.stops.map((s) => ({ id: s.id, name: stopName(s, params.locale), lat: s.lat, lng: s.lng, top: Boolean(s.top) })) } : null}
        moments={ex?.moments ?? []} />
    </main>
  );
}
