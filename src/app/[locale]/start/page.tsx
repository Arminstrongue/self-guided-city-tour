import type { Metadata } from "next";
import { popularity } from "@/lib/popularity";
import { PageBanner } from "@/components/SiteImage";
import { alternates } from "@/lib/seo";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { QuickStart, type QsCity } from "@/components/QuickStart";
import { COUNTRY, cityName } from "@/data/cities";
import { stopName } from "@/data/stop-names";
import { flag } from "@/data/countries";
import { fmt, INTL_LOCALE, isLocale } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { loadCities } from "@/lib/content";
import { routeOptions } from "@/lib/route-cost";
import { cityCenter } from "@/lib/explore";
import { accessCount } from "@/data/access";
import { dualMoney, formatMoney } from "@/lib/currency";
import { fxContext, requestCurrency } from "@/lib/fx";
import { TOUR_PLANS, isFreeCity } from "@/lib/pricing";
import { ACCESS_COOKIE } from "@/lib/access-token";
import { validAccessEmail } from "@/lib/session-revoke";
import { sessionEmail } from "@/lib/auth";
import { activeCities } from "@/lib/orders";

export const dynamic = "force-dynamic";

/** Primeira experiência em 3 passos: cidade → tempo disponível → começar. */
export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return { title: `${t.qsCta} | VOYBU`, description: t.heroSub, alternates: alternates(params.locale, "/start") };
}

export default async function Start(
  props: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ city?: string }> }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const t = getDict(params.locale);
  const L = INTL_LOCALE[params.locale];
  // Cidades sem paragens (acabadas de criar no admin) ficam de fora: não partem o planeador.
  const list = (await loadCities()).filter((c) => c.stops.length > 0);
  const region = new Intl.DisplayNames([L], { type: "region" });
  const emails = [await validAccessEmail((await cookies()).get(ACCESS_COOKIE)?.value), await sessionEmail().catch(() => null)].filter((e): e is string => Boolean(e));
  // Uma só consulta (antes era uma por cidade).
  const act = await activeCities(emails).catch(() => ({ all: false, cities: new Set<string>() }));
  const owned = new Set(list.map((c) => c.id).filter((id) => act.all || act.cities.has(id)));
  const fx = await fxContext();
  const p = dualMoney(TOUR_PLANS.city.amount / 100, "EUR", fx, L);
  const cities: QsCity[] = list.map((c) => ({
    id: c.id, name: cityName(c, params.locale), country: (COUNTRY[c.id] && region.of(COUNTRY[c.id])) || "", flag: flag(COUNTRY[c.id] ?? ""),
    open: owned.has(c.id) || isFreeCity(c.id), center: cityCenter(c), tz: c.tz ?? "UTC", iata: c.ap?.iata,
    options: routeOptions(c).map((o) => ({
      key: o.key, n: o.plan.stops.length, min: o.plan.minutesTotal, tour: o.plan.minutesTour, air: c.air.min, ret: o.plan.ret.min, acc: accessCount(o.plan.stops.map((s) => s.id)),
      first: { lat: o.plan.stops[0].lat, lng: o.plan.stops[0].lng }, last: { lat: o.plan.stops[o.plan.stops.length - 1].lat, lng: o.plan.stops[o.plan.stops.length - 1].lng }, cost: formatMoney(o.plan.transport, c.cur, L),
      // Sem passe: nenhuma paragem tem nome (o resto do roteiro abre com o passe).
      names: o.plan.stops.slice(0, owned.has(c.id) || isFreeCity(c.id) ? undefined : 0).map((s) => stopName(s, params.locale))
    }))
  })).sort((a, b) => a.name.localeCompare(b.name, L));
  const pre = cities.some((c) => c.id === searchParams.city) ? searchParams.city! : "";
  // Mais procuradas: o que os viajantes mais abrem (90 dias); sem dados, as cidades mais conhecidas.
  const pop = await popularity();
  const FAMOUS = ["lon", "par", "lis", "nyc", "dxb", "rom", "bcn", "ams", "ist", "sin"];
  const top = [...cities.map((c) => c.id)].sort((a, b) => ((pop.city.get(b) ?? 0) - (pop.city.get(a) ?? 0)) || ((FAMOUS.indexOf(a) + 1 || 99) - (FAMOUS.indexOf(b) + 1 || 99))).slice(0, 6);
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <PageBanner k="find-my-way" alt={getDict(params.locale).img.alt["find-my-way"]} />
      <QuickStart locale={params.locale} cities={cities} pre={pre} top={top} from={fmt(t.fromP, { p: p.local ?? p.main })} />
    </main>
  );
}
