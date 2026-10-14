import { Header } from "@/components/Header";
import { MerchantForm } from "@/components/MerchantForm";
import { CITIES, cityName } from "@/data/cities";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { MERCHANT_PLANS } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default function Merchants({ params }: { params: { locale: Locale } }) {
  const t = getDict(params.locale);
  const cities = CITIES.map((c) => ({ id: c.id, name: cityName(c, params.locale), stops: c.stops.map((s) => ({ id: s.id, name: s.n })) }));
  return (
    <main className="app">
      <Header locale={params.locale} />
      <div className="stack">
        <h1 style={{ fontSize: 28 }}>{t.mTitle}</h1>
        <p className="hint">{t.mSub}</p>
        <MerchantForm locale={params.locale} t={t} cities={cities}
          prices={{ basic: MERCHANT_PLANS.basic.amount, featured: MERCHANT_PLANS.featured.amount, partner: MERCHANT_PLANS.partner.amount }} />
      </div>
    </main>
  );
}
