import { Header } from "@/components/Header";
import { requestCurrency } from "@/lib/fx";
import { MerchantForm } from "@/components/MerchantForm";
import { cityName } from "@/data/cities";
import { loadCities } from "@/lib/content";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { MERCHANT_PLANS } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function Merchants({ params, searchParams }: { params: { locale: Locale }; searchParams: { agent?: string } }) {
  const t = getDict(params.locale);
  const cities = (await loadCities()).map((c) => ({ id: c.id, name: cityName(c, params.locale), stops: c.stops.map((s) => ({ id: s.id, name: s.n })) }));
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <div className="stack">
        <h1 style={{ fontSize: 28 }}>{t.mTitle}</h1>
        <p className="hint">{t.mSub}</p>
        <MerchantForm locale={params.locale} t={t} cities={cities}
          prices={{ basic: MERCHANT_PLANS.basic.amount, featured: MERCHANT_PLANS.featured.amount, partner: MERCHANT_PLANS.partner.amount }}
          agent={searchParams.agent?.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12)} />
        <p className="hint"><a href={`/${params.locale}/agents`}>{t.agCta}</a></p>
      </div>
    </main>
  );
}
