import type { Metadata } from "next";
import { RememberCity } from "@/components/RememberCity";
import { alternates } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { fxContext } from "@/lib/fx";
import { BuyForm } from "@/components/BuyForm";
import { isFreeCity } from "@/lib/pricing";
import { exploreProps } from "@/lib/explore-props";
import { WebOnly } from "@/components/WebOnly";
import { ExitCheck } from "@/components/ExitCheck";
import { CityTabs } from "@/components/CityTabs";
import { ChosenRoute } from "@/components/ChosenRoute";
import Link from "next/link";
import { cityName, COUNTRY } from "@/data/cities";
import { Track } from "@/components/Track";
import { GuideCard } from "@/components/GuideCard";
import { listGuides } from "@/lib/guides";
import { stopName } from "@/data/stop-names";
import { loadCity, loadCities } from "@/lib/content";
import { cityCenterOf } from "@/lib/city-center";
import { NearbyCities } from "@/components/Onward";
import { fmt, INTL_LOCALE, LOCALES, isLocale } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { enabledProviders, sessionEmail } from "@/lib/auth";
import { TOUR_PLANS } from "@/lib/pricing";
import { dualMoney } from "@/lib/currency";
import { routeOptions } from "@/lib/route-cost";
import { formatMoney } from "@/lib/currency";
import { CityGallery, CityHero, StickyBook } from "@/components/Showcase";
import { LazyComments, LazyExplore, LazySafety } from "@/components/CityLazy";
import { CityHub, CityToday, CityHistory, GoodToKnow } from "@/components/CityInfo";
import { latestPulse } from "@/lib/city-pulse";
import { cityKnowledge, ensureKnowledge } from "@/lib/city-knowledge";
import PageQR from "@/components/PageQR";
import { RouteDetails } from "@/components/RouteDetails";
import { accessCount } from "@/data/access";
import { hasCityAccess } from "@/lib/city-access";
import { liteCity } from "@/lib/city-lite";
import { Locked } from "@/components/Locked";

/** Página de entrada do QR: fotografias, destaques, plano, voo e pagamento. */
export const dynamic = "force-dynamic";

const hrs = (m: number) => { const v = Math.max(0, Math.round(m)); return `${Math.floor(v / 60)} h ${String(v % 60).padStart(2, "0")}`; };

export async function generateMetadata(props: { params: Promise<{ locale: Locale; city: string }> }): Promise<Metadata> {
  const params = await props.params;
  const city = await loadCity(params.city);
  if (!city || !isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  const name = cityName(city, params.locale);
  const core = routeOptions(city).find((o) => o.key === "core");
  const title = fmt(t.seoCity, { city: name });
  const description = fmt(t.seoCityDesc, { n: core?.plan.stops.length ?? city.stops.length, h: hrs(core?.plan.minutesTour ?? 0) });
  return { title, description, alternates: alternates(params.locale, `/c/${city.id}`), openGraph: { title, description, siteName: "VOYBU", type: "website" } };
}

export default async function CityEntry(
  props: { params: Promise<{ locale: Locale; city: string }>; searchParams: Promise<{ ref?: string }> }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const city = await loadCity(params.city);
  if (!city) notFound();
  const t = getDict(params.locale);
  const name = cityName(city, params.locale);
  const fx = await fxContext();
  const opts = routeOptions(city);const core = opts.find((o) => o.key === "core") ?? opts[opts.length - 1];
  // Um só cálculo: paragens e duração do mesmo roteiro (o base, sem extensão), com visitas e deslocações entre paragens.
  const nExt = city.stops.filter((s) => s.x).length;
  const meta = fmt(t.cityMeta, { n: core.plan.stops.length, h: hrs(core.plan.minutesTour) }) + (nExt ? ` · ${fmt(t.tpExtVersion, { n: nExt })}` : "");
  const p = dualMoney(TOUR_PLANS.city.amount / 100, "EUR", fx, INTL_LOCALE[params.locale]);
  const guides = (await listGuides(city.id).catch(() => [])).slice(0, 3);
  const free = isFreeCity(city.id);
  // Sem passe: amostra (fotos, destaques, duração, preço); lugares, segurança e dicas abrem com o passe.
  const open = await hasCityAccess(city.id);
  // Principais primeiro, opcionais (extensão) no fim e identificadas.
  const stops = [...city.stops.filter((s) => !s.x), ...city.stops.filter((s) => s.x)].map((s) => ({ id: s.id, name: stopName(s, params.locale), area: s.a, minutes: s.v, top: Boolean(s.top), optional: Boolean(s.x) }));
  const [pulse, know] = await Promise.all([latestPulse(city.id).catch(() => null), cityKnowledge(city.id, params.locale).catch(() => ({ summary: null, history: null }))]);
  // Ainda sem história nesta língua: vai buscá-la em segundo plano (a próxima visita já a mostra).
  if (!know.summary || know.summary.lang !== params.locale) ensureKnowledge(city.id, params.locale);
  return (
    <main className="app xl">
      <RememberCity id={city.id} />
      <Track name="view_city" city={city.id} locale={params.locale} refCode={searchParams.ref} />
      <CityHero cityId={city.id}>
        <Header locale={params.locale} currency={fx.cur} over />
        <div className="in rise">
          <span className="eyebrow">✦ {t.scanned}</span>
          <h1>{name}</h1>
          <p>{t.heroSub}</p>
          <div className="stats" tabIndex={0}><span className="num">{meta}</span><span><b>{LOCALES.length}</b> {t.statLangs}</span></div>
          <div className="ctas">{free
            ? <Link className="btn tram press" href={`/${params.locale}/tour/${city.id}`}>{t.freeCta}</Link>
            : <><a className="btn tram press web-only" href="#book">{fmt(t.fromP, { p: p.local ?? p.main })} · {t.bookTitle}</a></>}</div>
          <Link className="hero-link" href={`/${params.locale}/start?city=${city.id}`}>{t.qsByTime} →</Link>
        </div>
        <div className="web-only"><PageQR label={t.qrScan} /></div>
      </CityHero>

      <div style={{ maxWidth: 760, marginInline: "auto" }}>
        {/* "Tudo sobre a cidade" logo no topo: um toque leva a cada secção (abre o separador certo). */}
        <CityHub t={t} locale={params.locale} city={city} name={name} />
        <CityTabs tabs={[{ key: "route", label: t.route }, { key: "today", label: t.hbToday }, { key: "safety", label: t.qsEssSafety }, { key: "know", label: t.hbTips }]}>
          <>
        <CityGallery cityId={city.id} cityName={name} stops={open ? stops : stops.filter((s) => s.top).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 4).map((s) => ({ ...s, area: "", minutes: 0, optional: false }))} locale={params.locale} />
        <RouteDetails t={t} meta={meta} free={free} accessN={accessCount(core.plan.stops.map((s) => s.id))}
          start={open && core.plan.stops[0] ? { name: stopName(core.plan.stops[0], params.locale), lat: core.plan.stops[0].lat, lng: core.plan.stops[0].lng } : null} />
        {free ? (
          <section className="sec book" id="book">
            <div className="sec-h reveal"><div><h2>{t.freeBadge}</h2><p>{t.freeSub}</p></div></div>
            <div className="book-card"><Link className="btn tram press" href={`/${params.locale}/tour/${city.id}`}>{t.freeCta}</Link></div>
          </section>
        ) : (
        <section className="sec book" id="book">
          <div className="sec-h reveal"><div><h2>{fmt(t.buyTitle, { city: name })}</h2><p>{t.tpBuySub}</p></div></div>
          <ChosenRoute locale={params.locale} city={city.id} tz={city.tz ?? "UTC"} coreN={city.stops.filter((x) => !x.x).length} extN={city.stops.filter((x) => x.x).length}>
            <div className="card bk-sum">
              <b>{meta}</b>
              <span>{fmt(t.bkTransport, { c: formatMoney(core.plan.transport, city.cur, INTL_LOCALE[params.locale]) })}</span>
              <p className="hint">{t.bkIncl}</p>
            </div>
          </ChosenRoute>
          <ExitCheck city={open ? city : liteCity(city)} locale={params.locale} compact onlyPlane />
          <div className="book-card">
            <WebOnly fallback={<div className="stack"><p className="note">{t.appReader}</p><a className="btn" href={`/${params.locale}/wallet?signin=1&city=${city.id}`}>{t.signIn}</a></div>}>
              <BuyForm
                locale={params.locale} cityId={city.id} cityName={name} refCode={searchParams.ref ?? ""}
                providers={enabledProviders()} sessionEmail={await sessionEmail()}
                prices={{ city: TOUR_PLANS.city.amount, trip: TOUR_PLANS.trip.amount, all: TOUR_PLANS.all.amount }} fx={fx} tz={city.tz ?? "UTC"}
              />
            </WebOnly>
          </div>
        </section>
        )}
        <section className="sec" id="nearby">
          <NearbyCities locale={params.locale} from={{ id: city.id, name, ...cityCenterOf(city) }}
            cities={(await loadCities()).filter((c) => c.stops.length).map((c) => ({ id: c.id, name: cityName(c, params.locale), ...cityCenterOf(c) }))} />
        </section>
          </>
          <>
        {open ? <CityToday t={t} locale={params.locale} city={city} name={name} pulse={pulse} /> : <Locked t={t} locale={params.locale} city={city.id} cityName={name} what="info" />}
        {open ? <LazyExplore cityId={city.id} cityName={name} locale={params.locale} {...exploreProps(city, params.locale)} />
          : <Locked t={t} locale={params.locale} city={city.id} cityName={name} what="explore" />}
        {guides.length > 0 && (
          <section className="sec" id="guides">
            <div className="sec-h reveal"><div><h2>{fmt(t.gdTitle, { city: name })}</h2><p>{t.gdSub}</p></div><Link href={`/${params.locale}/guides/${city.id}`}>{t.gdSeeAll}</Link></div>
            {guides.map((g) => <GuideCard key={g.id} g={g} t={t} locale={params.locale} />)}
          </section>
        )}
        <section className="sec" id="comments">
          <div className="sec-h reveal"><div><h2>{fmt(t.cmCity, { city: name })}</h2><p>{t.cmCitySub}</p></div></div>
          <LazyComments locale={params.locale} city={city.id} />
        </section>
          </>
          <>
        <section className="sec" id="safety">
          <div className="sec-h reveal"><div><h2>{fmt(t.safetyTitle, { city: name })}</h2><p>{t.safetySub}</p></div></div>
          {open ? <LazySafety cityId={city.id} country={COUNTRY[city.id]} cityName={name} center={{ lat: city.stops[0].lat, lng: city.stops[0].lng }} locale={params.locale} />
            : <Locked t={t} locale={params.locale} city={city.id} cityName={name} what="safety" />}
        </section>
          </>
          <>
        {open ? <GoodToKnow t={t} locale={params.locale} city={city} name={name} /> : <Locked t={t} locale={params.locale} city={city.id} cityName={name} what="know" />}
        {open && <CityHistory t={t} name={name} k={know} />}
          </>
        </CityTabs>
      </div>
      {!free && <WebOnly><StickyBook label={name} price={fmt(t.fromP, { p: p.local ?? p.main })} cta={t.bookTitle} /></WebOnly>}
    </main>
  );
}
