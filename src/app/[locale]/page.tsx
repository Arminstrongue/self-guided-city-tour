import Link from "next/link";
import { Header } from "@/components/Header";
import { fxContext } from "@/lib/fx";
import { WebOnly } from "@/components/WebOnly";
import { SOON, cityName, COUNTRY } from "@/data/cities";
import { DestGrid, HomeHero, type DestCity } from "@/components/Showcase";
import { fmt, INTL_LOCALE, LOCALES } from "@/i18n/dictionaries";
import { loadCities } from "@/lib/content";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { TOUR_PLANS } from "@/lib/pricing";
import { dualMoney } from "@/lib/currency";

export const dynamic = "force-dynamic";

const I = {
  ticket: <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z M10 5v14" />,
  audio: <path d="M4 14v-2a8 8 0 0 1 16 0v2 M4 14a2 2 0 0 1 2-2h1v7H6a2 2 0 0 1-2-2z M20 14a2 2 0 0 0-2-2h-1v7h1a2 2 0 0 0 2-2z" />,
  clock: <path d="M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
};
const Icon = ({ d }: { d: React.ReactNode }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;

export default async function Home({ params }: { params: { locale: Locale } }) {
  const t = getDict(params.locale);
  const region = new Intl.DisplayNames([INTL_LOCALE[params.locale]], { type: "region" });
  const list = await loadCities();
  const cities: DestCity[] = list.map((c) => ({ id: c.id, name: cityName(c, params.locale), country: (COUNTRY[c.id] && region.of(COUNTRY[c.id])) || "", stops: c.stops.length }));
  const stops = list.reduce((a, c) => a + c.stops.length, 0);
  const fx = await fxContext();
  const p = dualMoney(TOUR_PLANS.city.amount / 100, "EUR", fx, INTL_LOCALE[params.locale]);
  const from = fmt(t.fromP, { p: p.local ?? p.main });
  const featured = ["lis", "par", "rom", "lon", "ist", "bcn", "ams"].filter((id) => list.some((c) => c.id === id));
  return (
    <main className="app xl">
      <HomeHero cities={featured}>
        <Header locale={params.locale} currency={fx.cur} over />
        <div className="in rise">
          <span className="eyebrow">▣ {t.scanned}</span>
          <h1>{t.heroA} <em>{t.europe}</em> {t.heroB}</h1>
          <p>{t.heroSub}</p>
          <div className="stats">
            <span><b>{list.length}</b> {t.statCities}</span><span><b>{stops}</b> {t.stops}</span>
            <span><b>{LOCALES.length}</b> {t.statLangs}</span><span>{t.f2t}</span>
          </div>
          <div className="ctas"><a className="btn tram press" href="#cities">{t.explore}</a></div>
        </div>
      </HomeHero>

      <section className="sec" id="cities" style={{ scrollMarginTop: 70 }}>
        <div className="sec-h reveal"><div><h2>{t.topDest}</h2><p>{t.topDestSub}</p></div></div>
        <DestGrid locale={params.locale} cities={cities} from={from} labels={{ stops: t.stops }} />
        {SOON.length > 0 && <div className="soon-row"><span style={{ background: "none", boxShadow: "none", paddingInline: 0 }}>{t.soon}:</span>{SOON.map((n) => <span key={n.en}>{n[params.locale] ?? n.en}</span>)}</div>}
      </section>

      <section className="sec">
        <div className="sec-h reveal"><h2>{t.howTitle}</h2></div>
        <div className="steps">
          {([[t.how1t, t.how1s], [t.how2t, t.how2s], [t.how3t, t.how3s]] as const).map(([a, b], i) => (
            <div key={a} className="step reveal"><span className="n">{i + 1}</span><b>{a}</b><p>{b}</p></div>
          ))}
        </div>
      </section>

      <section className="sec">
        <div className="sec-h reveal"><h2>{t.featTitle}</h2></div>
        <div className="feats">
          {([[I.ticket, t.f1t, t.f1s], [I.audio, t.f2t, t.f2s], [I.clock, t.f3t, t.f3s], [I.star, t.f4t, t.f4s]] as const).map(([d, a, b]) => (
            <div key={a} className="feat reveal"><Icon d={d} /><b>{a}</b><span>{b}</span></div>
          ))}
        </div>
      </section>

      <WebOnly>
        <section className="sec" style={{ display: "grid", gap: 12 }}>
          <Link className="merch-cta press reveal" href={`/${params.locale}/merchants`}>
            <div><b>{t.merchCta}</b><span>{t.merchSub}</span></div><i>→</i>
          </Link>
          <Link className="merch-cta alt press reveal" href={`/${params.locale}/agents`}>
            <div><b>{t.agCtaHome}</b><span>{t.agCtaHomeSub}</span></div><i>→</i>
          </Link>
        </section>
      </WebOnly>
    </main>
  );
}
