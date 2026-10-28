import type { Metadata } from "next";
import { hasCityAccess } from "@/lib/city-access";
import { Locked } from "@/components/Locked";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { FreeTime } from "@/components/FreeTime";
import { cityName } from "@/data/cities";
import { stopName } from "@/data/stop-names";
import { cityCenterOf } from "@/lib/city-center";
import { isLocale } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { loadCities, PRIMARY_CITY } from "@/lib/content";
import { requestCurrency } from "@/lib/fx";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return { title: `${t.dx.free} | VOYBU`, description: t.dx.freeSub };
}

/** "Tenho X minutos livres" numa cidade. */
export default async function Free(
  props: { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | undefined>> }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const all = await loadCities();
  const city = all.find((c) => c.id === searchParams.city) ?? all.find((c) => c.id === PRIMARY_CITY) ?? all[0];
  if (!city) notFound();
  const stops = city.stops.map((s) => ({ id: s.id, n: stopName(s, params.locale), lat: s.lat, lng: s.lng, v: s.v, top: s.top }));
  const min = Number(searchParams.min);
  // Plano para o tempo livre (paragens e percurso) abre com o passe da cidade.
  if (!(await hasCityAccess(city.id))) return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <Locked t={getDict(params.locale)} locale={params.locale} city={city.id} cityName={cityName(city, params.locale)} what="free" />
    </main>
  );
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <FreeTime back={`/${params.locale}/tour/${city.id}`} cityName={cityName(city, params.locale)} center={cityCenterOf(city)} stops={stops}
        initial={{ min: Number.isFinite(min) ? min : undefined, bag: searchParams.bag === "1" }} />
    </main>
  );
}
