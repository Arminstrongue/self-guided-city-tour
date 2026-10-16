import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { fxContext } from "@/lib/fx";
import { BuyForm } from "@/components/BuyForm";
import { WebOnly } from "@/components/WebOnly";
import { ExitCheck } from "@/components/ExitCheck";
import Link from "next/link";
import { cityName } from "@/data/cities";
import { loadCity } from "@/lib/content";
import { getDict, fmt, type Locale } from "@/i18n/dictionaries";
import { enabledProviders, sessionEmail } from "@/lib/auth";
import { TOUR_PLANS } from "@/lib/pricing";

/** Página de entrada do QR: escolher plano, indicar voo e pagar. */
export const dynamic = "force-dynamic";

export default async function CityEntry({ params, searchParams }: { params: { locale: Locale; city: string }; searchParams: { ref?: string } }) {
  const city = await loadCity(params.city);
  if (!city) notFound();
  const t = getDict(params.locale);
  const name = cityName(city, params.locale);
  const fx = await fxContext();
  return (
    <main className="app">
      <Header locale={params.locale} currency={fx.cur} />
      <div className="stack">
        <h1 style={{ fontSize: 30 }}>{fmt(t.buyTitle, { city: name })}</h1>
        <p className="hint">{t.buySub}</p>
        <ExitCheck city={city} locale={params.locale} t={t} />
        <WebOnly fallback={<><p className="note">{t.appReader}</p><Link className="btn" href={`/api/auth/signin?callbackUrl=/${params.locale}/tour/${city.id}`}>{t.signIn}</Link></>}>
        <BuyForm
          locale={params.locale} cityId={city.id} cityName={name} refCode={searchParams.ref ?? ""}
          providers={enabledProviders()} sessionEmail={await sessionEmail()}
          prices={{ city: TOUR_PLANS.city.amount, all: TOUR_PLANS.all.amount }} fx={fx} t={t}
        />
        </WebOnly>
      </div>
    </main>
  );
}
