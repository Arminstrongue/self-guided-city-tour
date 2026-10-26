import type { Metadata } from "next";
import { PageBanner } from "@/components/SiteImage";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { LayoverMode } from "@/components/LayoverMode";
import { ExitCheck } from "@/components/ExitCheck";
import { requestCurrency } from "@/lib/fx";
import { loadCities } from "@/lib/content";
import { routeOptions } from "@/lib/route-cost";
import { cityName } from "@/data/cities";
import { stopName } from "@/data/stop-names";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { isLocale, INTL_LOCALE } from "@/i18n/core";
import { alternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return { title: `${t.ly.title} | VOYBU`, description: t.ly.sub, alternates: alternates(params.locale, "/layover") };
}

/** VOYBU Layover · Modo Escala: aeroporto + tempo de escala → plano real com tempos e margem. */
export default async function Layover(props: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ city?: string }> }) {
  const params = await props.params;
  const sp = await props.searchParams;
  if (!isLocale(params.locale)) notFound();
  const t = getDict(params.locale);
  const list = (await loadCities()).filter((c) => c.ap?.iata);
  const cities = list.map((c) => ({ id: c.id, name: cityName(c, params.locale), iata: c.ap!.iata })).sort((a, b) => a.name.localeCompare(b.name, INTL_LOCALE[params.locale]));
  const city = list.find((c) => c.id === sp.city) ?? null;
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <PageBanner k="dubai-metro" alt={getDict(params.locale).img.alt["dubai-metro"]} />
      <LayoverMode locale={params.locale} cities={cities}
        city={city ? {
          id: city.id, name: cityName(city, params.locale), iata: city.ap!.iata, tz: city.tz ?? "UTC", airMin: city.air.min, airLine: city.air.line ?? "",
          options: routeOptions(city).map((o) => ({ key: o.key, n: o.plan.stops.length, tour: o.plan.minutesTour, ret: o.plan.ret.min, names: o.plan.stops.map((s) => stopName(s, params.locale)) }))
        } : null} />
      {city && (
        <section className="sec ly-exit" id="exit">
          <div className="sec-h"><div><h2>{t.ly.exitT}</h2><p>{t.ly.exitSub}</p></div></div>
          <ExitCheck city={city} locale={params.locale} compact onlyPlane />
        </section>
      )}
    </main>
  );
}
