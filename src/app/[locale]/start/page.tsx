import type { Metadata } from "next";
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
import { ACCESS_COOKIE, readAccessToken } from "@/lib/access-token";
import { sessionEmail } from "@/lib/auth";
import { findActiveAccess } from "@/lib/orders";

export const dynamic = "force-dynamic";

/** Primeira experiência em 3 passos: cidade → tempo disponível → começar. */
export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return { title: `${t.qsCta} | VOYBU`, description: t.heroSub, alternates: alternates(params.locale, "/start") };
}

export default async function Start({ params, searchParams }: { params: { locale: Locale }; searchParams: { city?: string } }) {
  if (!isLocale(params.locale)) notFound();
  const t = getDict(params.locale);
  const L = INTL_LOCALE[params.locale];
  const list = await loadCities();
  const region = new Intl.DisplayNames([L], { type: "region" });
  const emails = [readAccessToken(cookies().get(ACCESS_COOKIE)?.value), await sessionEmail().catch(() => null)].filter((e): e is string => Boolean(e));
  const owned = new Set<string>();
  if (emails.length) for (const c of list) if (await findActiveAccess(emails, c.id).catch(() => null)) owned.add(c.id);
  const fx = await fxContext();
  const p = dualMoney(TOUR_PLANS.city.amount / 100, "EUR", fx, L);
  const cities: QsCity[] = list.map((c) => ({
    id: c.id, name: cityName(c, params.locale), country: (COUNTRY[c.id] && region.of(COUNTRY[c.id])) || "", flag: flag(COUNTRY[c.id] ?? ""),
    open: owned.has(c.id) || isFreeCity(c.id), center: cityCenter(c), tz: c.tz ?? "UTC",
    options: routeOptions(c).map((o) => ({
      key: o.key, n: o.plan.stops.length, min: o.plan.minutesTotal, tour: o.plan.minutesTour, air: c.air.min, ret: o.plan.ret.min, acc: accessCount(o.plan.stops.map((s) => s.id)),
      first: { lat: o.plan.stops[0].lat, lng: o.plan.stops[0].lng }, last: { lat: o.plan.stops[o.plan.stops.length - 1].lat, lng: o.plan.stops[o.plan.stops.length - 1].lng }, cost: formatMoney(o.plan.transport, c.cur, L),
      names: o.plan.stops.map((s) => stopName(s, params.locale))
    }))
  })).sort((a, b) => a.name.localeCompare(b.name, L));
  const pre = cities.some((c) => c.id === searchParams.city) ? searchParams.city! : "";
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <QuickStart t={t} locale={params.locale} cities={cities} pre={pre} from={fmt(t.fromP, { p: p.local ?? p.main })} />
    </main>
  );
}
