import Link from "next/link";
import { Header } from "@/components/Header";
import { fxContext } from "@/lib/fx";
import { WebOnly } from "@/components/WebOnly";
import { SOON, cityName, COUNTRY } from "@/data/cities";
import { DestGrid, HomeHero, type DestCity } from "@/components/Showcase";
import { fmt, INTL_LOCALE, LOCALES, isLocale } from "@/i18n/core";
import { notFound } from "next/navigation";
import { loadCities } from "@/lib/content";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { TOUR_PLANS, isFreeCity } from "@/lib/pricing";
import { dualMoney } from "@/lib/currency";
import { Ticket as TicketIcon, Headphones, Clock, Star, CloudDownload, ArrowLeftRight, Receipt, ShieldAlert, Plane, Radar, Users, BadgeCheck, QrCode, CreditCard, Footprints } from "lucide-react";
import PageQR from "@/components/PageQR";

export const dynamic = "force-dynamic";

// Ícones das funcionalidades (traço fino, em azulejos de cor).
const FEATS = [
  [TicketIcon, "q1"], [Headphones, "q4"], [Clock, "q5"], [Star, "q3"], [CloudDownload, "q2"], [ArrowLeftRight, "q1"],
  [Receipt, "q3"], [ShieldAlert, "q5"], [Plane, "q4"], [Radar, "q2"], [Users, "q4"], [BadgeCheck, "q1"]
] as const;

export default async function Home({ params }: { params: { locale: Locale } }) {
  // Pedidos de robôs a caminhos como /wp-login.php caem aqui com um "idioma" inválido: 404 sem erro no log.
  if (!isLocale(params.locale)) notFound();
  const t = getDict(params.locale);
  const region = new Intl.DisplayNames([INTL_LOCALE[params.locale]], { type: "region" });
  const list = await loadCities();
  const cities: DestCity[] = list.map((c) => ({ id: c.id, name: cityName(c, params.locale), country: (COUNTRY[c.id] && region.of(COUNTRY[c.id])) || "", stops: c.stops.length, ...(isFreeCity(c.id) ? { free: t.freeBadge } : {}) }));
  const stops = list.reduce((a, c) => a + c.stops.length, 0);
  const fx = await fxContext();
  const p = dualMoney(TOUR_PLANS.city.amount / 100, "EUR", fx, INTL_LOCALE[params.locale]);
  const from = fmt(t.fromP, { p: p.local ?? p.main });
  const featured = ["lis", "par", "dxb", "rom", "lon", "sin", "ist", "prg", "ber", "cai", "doh", "bcn", "ams"].filter((id) => list.some((c) => c.id === id));
  return (
    <main className="app xl">
      <HomeHero cities={featured}>
        <Header locale={params.locale} currency={fx.cur} over />
        <div className="in rise">
          <span className="eyebrow">✦ {t.scanned}</span>
          <h1>{t.heroA} <em>{t.europe}</em> {t.heroB}</h1>
          <p>{t.heroSub}</p>
          <div className="stats" tabIndex={0}>
            <span><b>{list.length}</b> {t.statCities}</span><span><b>{stops}</b> {t.stops}</span>
            <span><b>{LOCALES.length}</b> {t.statLangs}</span><span>{t.f2t}</span>
          </div>
          <div className="ctas"><a className="btn tram press" href={`/${params.locale}/start`}>{t.qsCta}</a><a className="btn ghost press" href="#cities">{t.explore}</a></div>
        </div>
        <PageQR label={t.qrScan} />
      </HomeHero>

      <section className="sec" id="cities" style={{ scrollMarginTop: 70 }}>
        <div className="sec-h reveal"><div><h2>{t.topDest}</h2><p>{t.topDestSub}</p></div></div>
        <DestGrid locale={params.locale} cities={cities} from={from} labels={{ stops: t.stops }} />
        {SOON.length > 0 && <div className="soon-row"><span style={{ background: "none", boxShadow: "none", paddingInline: 0 }}>{t.soon}:</span>{SOON.map((n) => <span key={n.en}>{n[params.locale] ?? n.en}</span>)}</div>}
      </section>

      <section className="sec">
        <div className="sec-h reveal"><h2>{t.howTitle}</h2></div>
        <ol className="steps2">
          {([[QrCode, t.how1t, t.how1s], [CreditCard, t.how2t, t.how2s], [Footprints, t.how3t, t.how3s]] as const).map(([Ic, a, b], i) => (
            <li key={a} className="step2 reveal"><span className="step2-n" aria-hidden="true"><Ic size={20} strokeWidth={2.2} /><i>{i + 1}</i></span><span className="step2-t"><b>{a}</b><small>{b}</small></span></li>
          ))}
        </ol>
      </section>

      <section className="sec">
        <div className="sec-h reveal"><h2>{t.featTitle}</h2></div>
        <div className="feats2">
          {([[t.f1t, t.f1s], [t.f2t, t.f2s], [t.f3t, t.f3s], [t.f4t, t.f4s], [t.f5t, t.f5s], [t.f6t, t.f6s], [t.f7t, t.f7s], [t.f8t, t.f8s], [t.f9t, t.f9s], [t.f10t, t.f10s], [t.f11t, t.f11s], [t.f12t, t.f12s]] as const).map(([a, b], i) => {
            const [Ic, q] = FEATS[i];
            return <div key={a} className="feat2 reveal"><span className={`qi ${q}`} aria-hidden="true"><Ic size={20} strokeWidth={2.1} /></span><b>{a}</b><small>{b}</small></div>;
          })}
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
