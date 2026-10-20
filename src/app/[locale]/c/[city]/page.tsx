import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { fxContext } from "@/lib/fx";
import { BuyForm } from "@/components/BuyForm";
import { isFreeCity } from "@/lib/pricing";
import { Explore } from "@/components/Explore";
import { exploreProps } from "@/lib/explore-props";
import { WebOnly } from "@/components/WebOnly";
import { ExitCheck } from "@/components/ExitCheck";
import Link from "next/link";
import { cityName, COUNTRY } from "@/data/cities";
import { SafetyPanel } from "@/components/Safety";
import { Track } from "@/components/Track";
import { GuideCard } from "@/components/GuideCard";
import { listGuides } from "@/lib/guides";
import { stopName } from "@/data/stop-names";
import { loadCity } from "@/lib/content";
import { getDict, fmt, INTL_LOCALE, LOCALES, type Locale } from "@/i18n/dictionaries";
import { enabledProviders, sessionEmail } from "@/lib/auth";
import { TOUR_PLANS } from "@/lib/pricing";
import { dualMoney } from "@/lib/currency";
import { routeOptions } from "@/lib/route-cost";
import { CityGallery, CityHero, StickyBook } from "@/components/Showcase";

/** Página de entrada do QR: fotografias, destaques, plano, voo e pagamento. */
export const dynamic = "force-dynamic";

const hrs = (m: number) => { const v = Math.max(0, Math.round(m)); return `${Math.floor(v / 60)} h ${String(v % 60).padStart(2, "0")}`; };

export default async function CityEntry({ params, searchParams }: { params: { locale: Locale; city: string }; searchParams: { ref?: string } }) {
  const city = await loadCity(params.city);
  if (!city) notFound();
  const t = getDict(params.locale);
  const name = cityName(city, params.locale);
  const fx = await fxContext();
  const opts = routeOptions(city); const core = opts.find((o) => o.key === "core") ?? opts[opts.length - 1];
  const meta = fmt(t.cityMeta, { n: city.stops.length, h: hrs(core.plan.minutesTour) });
  const p = dualMoney(TOUR_PLANS.city.amount / 100, "EUR", fx, INTL_LOCALE[params.locale]);
  const guides = (await listGuides(city.id).catch(() => [])).slice(0, 3);
  const free = isFreeCity(city.id);
  const stops = city.stops.map((s) => ({ id: s.id, name: stopName(s, params.locale), area: s.a, minutes: s.v, top: Boolean(s.top) }));
  return (
    <main className="app xl">
      <Track name="view_city" city={city.id} locale={params.locale} refCode={searchParams.ref} />
      <CityHero cityId={city.id}>
        <Header locale={params.locale} currency={fx.cur} over />
        <div className="in rise">
          <span className="eyebrow">▣ {t.scanned}</span>
          <h1>{name}</h1>
          <p>{t.heroSub}</p>
          <div className="stats"><span className="num">{meta}</span><span><b>{LOCALES.length}</b> {t.statLangs}</span></div>
          <div className="ctas">{free
            ? <Link className="btn tram press" href={`/${params.locale}/tour/${city.id}`}>🎁 {t.freeCta}</Link>
            : <a className="btn tram press" href="#book">{fmt(t.fromP, { p: p.local ?? p.main })} · {t.bookTitle}</a>}</div>
        </div>
      </CityHero>

      <div style={{ maxWidth: 760, marginInline: "auto" }}>
        <Explore cityId={city.id} cityName={name} locale={params.locale} t={t} {...exploreProps(city, params.locale)} />

        <CityGallery cityId={city.id} cityName={name} stops={stops} sub={meta} t={t} locale={params.locale} />

        {guides.length > 0 && (
          <section className="sec" id="guides">
            <div className="sec-h reveal"><div><h2>{fmt(t.gdTitle, { city: name })}</h2><p>{t.gdSub}</p></div><Link href={`/${params.locale}/guides/${city.id}`}>{t.gdSeeAll}</Link></div>
            {guides.map((g) => <GuideCard key={g.id} g={g} t={t} locale={params.locale} />)}
          </section>
        )}

        <section className="sec" id="safety">
          <div className="sec-h reveal"><div><h2>{fmt(t.safetyTitle, { city: name })}</h2><p>{t.safetySub}</p></div></div>
          <SafetyPanel cityId={city.id} country={COUNTRY[city.id]} cityName={name} center={{ lat: city.stops[0].lat, lng: city.stops[0].lng }} t={t} locale={params.locale} />
        </section>

        {free ? (
          <section className="sec book" id="book">
            <div className="sec-h reveal"><div><h2>🎁 {t.freeBadge}</h2><p>{t.freeSub}</p></div></div>
            <div className="book-card"><Link className="btn tram press" href={`/${params.locale}/tour/${city.id}`}>{t.freeCta}</Link></div>
          </section>
        ) : (
        <section className="sec book" id="book">
          <div className="sec-h reveal"><div><h2>{fmt(t.buyTitle, { city: name })}</h2><p>{t.buySub}</p></div></div>
          <ExitCheck city={city} locale={params.locale} t={t} />
          <div className="book-card">
            <WebOnly fallback={<div className="stack"><p className="note">{t.appReader}</p><a className="btn" href={`/${params.locale}/wallet?signin=1&city=${city.id}`}>{t.signIn}</a></div>}>
              <BuyForm
                locale={params.locale} cityId={city.id} cityName={name} refCode={searchParams.ref ?? ""}
                providers={enabledProviders()} sessionEmail={await sessionEmail()}
                prices={{ city: TOUR_PLANS.city.amount, trip: TOUR_PLANS.trip.amount, all: TOUR_PLANS.all.amount }} fx={fx} t={t}
              />
            </WebOnly>
          </div>
        </section>
        )}
      </div>
      {!free && <WebOnly><StickyBook label={name} price={fmt(t.fromP, { p: p.local ?? p.main })} cta={t.bookTitle} /></WebOnly>}
    </main>
  );
}
