import type { Metadata } from "next";
import { hasCityAccess } from "@/lib/city-access";
import { LockedFor } from "@/components/LockedFor";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { WinNav } from "@/components/WinNav";
import { AgendaView } from "@/components/Agenda";
import { requestCurrency } from "@/lib/fx";
import { loadCities } from "@/lib/content";
import { cityName } from "@/data/cities";
import { exploreProps } from "@/lib/explore-props";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await props.params;
  return { title: `${getDict(locale).evTitle} | VOYBU` };
}

export default async function AgendaPage(
  props: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ city?: string; ev?: string }> }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const t = getDict(params.locale);
  const list = await loadCities();
  const city = list.find((c) => c.id === searchParams.city) ?? list[0];
  if (!city) notFound();
  const cities = Object.fromEntries(list.map((c) => [c.id, cityName(c, params.locale)]));
  const { moments, tz } = exploreProps(city, params.locale);
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <WinNav closeHref={`/${params.locale}/wallet`} labels={{ back: t.navBack, fwd: t.navFwd, close: t.close }} />
      {(await hasCityAccess(city.id))
        ? <AgendaView locale={params.locale} cityId={city.id} cities={cities} moments={moments} tz={tz} openId={searchParams.ev} />
        : <LockedFor t={t} locale={params.locale} city={city.id} cityName={cities[city.id]} what="events" />}
    </main>
  );
}
