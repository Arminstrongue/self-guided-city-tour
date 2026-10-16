import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { fxContext, requestCurrency } from "@/lib/fx";
import { TourView } from "@/components/TourView";
import { WebOnly } from "@/components/WebOnly";
import { cityName } from "@/data/cities";
import { loadCity, loadCities } from "@/lib/content";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { ACCESS_COOKIE, readAccessToken } from "@/lib/access-token";
import { sessionEmail } from "@/lib/auth";
import { findActiveAccess } from "@/lib/orders";
import { activeOffers } from "@/lib/merchants";
import { flightApiEnabled } from "@/lib/flight";
import { MUSEUMS } from "@/data/museums";

export const dynamic = "force-dynamic";

export default async function Tour({ params }: { params: { locale: Locale; city: string } }) {
  const city = await loadCity(params.city);
  if (!city) notFound();
  const t = getDict(params.locale);
  const emails = [readAccessToken(cookies().get(ACCESS_COOKIE)?.value), await sessionEmail()].filter((e): e is string => Boolean(e));
  const access = await findActiveAccess(emails, city.id);

  if (!access) {
    return (
      <main className="app">
        <Header locale={params.locale} currency={requestCurrency()} />
        <div className="stack">
          <h1 style={{ fontSize: 28 }}>{cityName(city, params.locale)}</h1>
          <p>{t.noAccess}</p>
          <WebOnly fallback={<p className="note">{t.appReader}</p>}>
            <Link className="btn tram" href={`/${params.locale}/c/${city.id}`}>{t.buyAccess}</Link>
            <p className="hint">{t.restore}</p>
          </WebOnly>
          <Link className="btn ghost" href={`/api/auth/signin?callbackUrl=/${params.locale}/tour/${city.id}`}>{t.signIn}</Link>
        </div>
      </main>
    );
  }

  const otherCities = access.scope === "all" ? (await loadCities()).map((c) => ({ id: c.id, name: cityName(c, params.locale) })) : [];
  return (
    <main className="app">
      <TourView
        locale={params.locale} t={t} city={city} cityLabel={cityName(city, params.locale)}
        flightAt={access.flightAt?.toISOString() ?? null} offers={await activeOffers(city.id)} otherCities={otherCities} fx={await fxContext()}
        flightNo={access.flightNo ?? null} flightApi={flightApiEnabled()}
        museums={MUSEUMS[city.id] ?? []} plan={access.plan ?? access.scope}
      />
    </main>
  );
}
