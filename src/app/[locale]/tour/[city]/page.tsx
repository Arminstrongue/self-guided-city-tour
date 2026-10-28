import type { Metadata } from "next";
import { Locked } from "@/components/Locked";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { fxContext, requestCurrency } from "@/lib/fx";
import { TourView } from "@/components/TourView";
import { cityName } from "@/data/cities";
import { loadCity, loadCities } from "@/lib/content";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { ACCESS_COOKIE } from "@/lib/access-token";
import { validAccessEmail } from "@/lib/session-revoke";
import { sessionEmail } from "@/lib/auth";
import { activateAccess, findActiveAccess } from "@/lib/orders";
import { activeOffers } from "@/lib/merchants";
import { flightApiEnabled } from "@/lib/flight";
import { MUSEUMS } from "@/data/museums";
import { biosFor } from "@/data/bios";
import { TOUR_PLANS, isFreeCity } from "@/lib/pricing";
import { dualMoney } from "@/lib/currency";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { exploreProps } from "@/lib/explore-props";
import { cityCenterOf } from "@/lib/city-center";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: Locale; city: string }> }): Promise<Metadata> {
  const { locale, city: id } = await props.params;
  const c = await loadCity(id);
  return { title: c ? `${cityName(c, locale)} · ${getDict(locale).wallet} | VOYBU` : "VOYBU", robots: { index: false } };
}

export default async function Tour(props: { params: Promise<{ locale: Locale; city: string }> }) {
  const params = await props.params;
  const city = await loadCity(params.city);
  if (!city) notFound();
  const t = getDict(params.locale);
  const emails = [await validAccessEmail((await cookies()).get(ACCESS_COOKIE)?.value), await sessionEmail()].filter((e): e is string => Boolean(e));
  const free = isFreeCity(city.id);
  const found = await findActiveAccess(emails, city.id);
  // Primeira abertura: o passe começa a contar agora.
  const access = found ? await activateAccess(found).catch(() => found) : null;

  // Sem acesso: amostra grátis — a 1.ª paragem completa (texto e áudio); as outras só com nome, sem texto.
  const preview = !access && !free;
  const first = city.stops.find((x) => !x.x) ?? city.stops[0];
  const shown = preview ? { ...city, stops: city.stops.map((x) => (x.id === first.id ? x : { ...x, pt: "", en: "" })) } : city;
  const keep = <T,>(o: Record<string, T>) => (preview ? Object.fromEntries(Object.entries(o).filter(([k]) => k === first.id)) : o);
  const fx = await fxContext();
  const price = dualMoney(TOUR_PLANS.city.amount / 100, "EUR", fx, INTL_LOCALE[params.locale]);

  const all = await loadCities();
  const otherCities = access?.scope === "all" ? all.map((c) => ({ id: c.id, name: cityName(c, params.locale) })) : [];
  const allCities = all.filter((c) => c.stops.length).map((c) => ({ id: c.id, name: cityName(c, params.locale), ...cityCenterOf(c) }));
  // Sem passe: nada do roteiro (paragens, textos, áudio, mapa) — só o convite para desbloquear.
  if (preview) return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <h1 className="arv-h" style={{ marginTop: 16 }}>{cityName(city, params.locale)}</h1>
      <Locked t={t} locale={params.locale} city={city.id} cityName={cityName(city, params.locale)} what="route" more={city.stops.length} />
    </main>
  );
  return (
    <main className="app">
      {preview && <Header locale={params.locale} currency={(await requestCurrency())} />}
      <TourView
        preview={preview ? { buy: `/${params.locale}/c/${city.id}#book`, price: fmt(t.fromP, { p: price.local ?? price.main }), signIn: `/${params.locale}/wallet?signin=1&city=${city.id}` } : undefined}
        locale={params.locale} city={shown} cityLabel={cityName(city, params.locale)}
        flightAt={access?.flightAt?.toISOString() ?? null} offers={await activeOffers(city.id)} otherCities={otherCities} allCities={allCities} fx={fx}
        flightNo={access?.flightNo ?? null} flightApi={flightApiEnabled()} tripIn={access?.trip ?? null}
        museums={MUSEUMS[city.id] ?? []} plan={access ? access.plan ?? access.scope : preview ? "preview" : "free"}
        explore={exploreProps(city, params.locale)}
        bios={keep(biosFor(city.id, params.locale))} enBios={keep(Object.fromEntries(Object.entries(biosFor(city.id, "en")).map(([k, v]) => [k, v.text])))}
      />
    </main>
  );
}
