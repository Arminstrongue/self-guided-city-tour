import { Header } from "@/components/Header";
import { requestCurrency } from "@/lib/fx";
import { MerchantForm } from "@/components/MerchantForm";
import { cityName } from "@/data/cities";
import { loadCities } from "@/lib/content";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { MERCHANT_PLANS, PARTNER_COMMISSION } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function Merchants({ params, searchParams }: { params: { locale: Locale }; searchParams: { agent?: string } }) {
  const t = getDict(params.locale);
  const cities = (await loadCities()).map((c) => ({ id: c.id, name: cityName(c, params.locale), stops: c.stops.map((s) => ({ id: s.id, name: s.n, lat: s.lat, lng: s.lng })) }));
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <div className="stack">
        <h1 style={{ fontSize: 28, lineHeight: 1.15 }}>{t.bzTitle}</h1>
        <p className="hint" style={{ fontSize: 15 }}>{t.bzSub}</p>
        <a className="ios-row press" href={`/${params.locale}/merchants/manage`} style={{ textDecoration: "none" }}><span className="ios-tx"><b>{t.mp.manage}</b><small>{t.mp.sub}</small></span><span aria-hidden="true">›</span></a>

        {/* Exemplo de anúncio, antes de pedir o registo */}
        <span className="label">{t.mPreviewT}</span>
        <div className="mb-sample" aria-label={t.mSample}>
          <span className="mb-sample-tag">{t.mSample}</span>
          <div className="offer mb-offer" style={{ borderStyle: "solid" }}>
            <span className="mb-thumb mb-thumb-demo" aria-hidden="true">☕</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="cat">{t.cats.cafe}</span>
              <b>Café da Praça</b>{t.mSampleOffer}
              <div className="mb-cta">{t.mbReq.table} ›</div>
            </div>
            <span className="feat">{t.featured}</span>
          </div>
        </div>

        <MerchantForm locale={params.locale} cities={cities} partnerPct={Math.round(PARTNER_COMMISSION * 100)}
          prices={{ basic: MERCHANT_PLANS.basic.amount, featured: MERCHANT_PLANS.featured.amount, partner: MERCHANT_PLANS.partner.amount }}
          agent={searchParams.agent?.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12)} />
        <p className="hint"><a href={`/${params.locale}/agents`}>{t.agCta}</a></p>
      </div>
    </main>
  );
}
