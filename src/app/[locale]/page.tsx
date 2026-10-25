import type { Metadata } from "next";
import { alternates } from "@/lib/seo";
import Link from "next/link";
import { Header } from "@/components/Header";
import { NeedNow } from "@/components/NeedNow";
import { fxContext } from "@/lib/fx";
import { WebOnly } from "@/components/WebOnly";
import { SOON, cityName, cityNames, regionOf, COUNTRY } from "@/data/cities";
import { DestGrid, HomeHero, type DestCity } from "@/components/Showcase";
import { fmt, INTL_LOCALE, LOCALES, isLocale } from "@/i18n/core";
import { notFound } from "next/navigation";
import { loadCities } from "@/lib/content";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { TOUR_PLANS, isFreeCity } from "@/lib/pricing";
import { dualMoney } from "@/lib/currency";
import { Ticket as TicketIcon, Headphones, Clock, Star, CloudDownload, ArrowLeftRight, Receipt, ShieldAlert, Plane, Radar, Users, BadgeCheck, QrCode, CreditCard, Footprints } from "lucide-react";
import PageQR from "@/components/PageQR";
import { HeroSearch } from "@/components/HeroSearch";
import { flag } from "@/data/countries";
import { Building2, MapPinned, Languages, Compass, Sparkles, Baby, Store, ChevronRight, ShieldCheck, Globe, Heart, Smartphone } from "lucide-react";
import { stopName } from "@/data/stop-names";

export const dynamic = "force-dynamic";

// Ícones das funcionalidades (traço fino, em azulejos de cor).
const FEATS = [
  [TicketIcon, "q1"], [Headphones, "q4"], [Clock, "q5"], [Star, "q3"], [CloudDownload, "q2"], [ArrowLeftRight, "q1"],
  [Receipt, "q3"], [ShieldAlert, "q5"], [Plane, "q4"], [Radar, "q2"], [Users, "q4"], [BadgeCheck, "q1"]
] as const;

// Cada funcionalidade abre onde está na app (a demonstração gratuita de Manchester quando é preciso um roteiro).
const FEAT_HREF = [
  "/start",                // transporte mais barato: o planeador mostra o custo do roteiro
  "/tour/man",             // áudio-guia: roteiro de demonstração
  "/start",                // contagem até à partida: planear com a hora de partida
  "/c/lon",                // avaliações e fotos de cada paragem
  "/wallet#offline",       // descarregar para offline
  "/wallet#tools",         // conversor de moeda
  "/wallet#split",         // dividir despesas
  "/c/man#safety",         // SOS e segurança
  "/c/lon#book",           // posso sair do aeroporto?
  "/wallet#trip",          // estado do voo na minha viagem
  "/wallet#home",          // comunidade
  "/guides/lon"            // guias locais
] as const;

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  const title = `VOYBU — ${t.scanned}`;
  return { title, description: t.heroSub, alternates: alternates(params.locale), openGraph: { title, description: t.heroSub, siteName: "VOYBU", type: "website" } };
}

export default async function Home(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params;
  // Pedidos de robôs a caminhos como /wp-login.php caem aqui com um "idioma" inválido: 404 sem erro no log.
  if (!isLocale(params.locale)) notFound();
  const t = getDict(params.locale);
  const region = new Intl.DisplayNames([INTL_LOCALE[params.locale]], { type: "region" });
  const list = await loadCities();
  const regionEn = new Intl.DisplayNames(["en"], { type: "region" });
  const cities: DestCity[] = list.map((c) => {
    const cc = COUNTRY[c.id];
    const country = (cc && region.of(cc)) || "";
    return {
      id: c.id, name: cityName(c, params.locale), country, stops: c.stops.filter((s) => !s.x).length, region: regionOf(c.id),
      keys: [...cityNames(c), country, cc ? regionEn.of(cc) ?? "" : ""].join(" "),
      ...(isFreeCity(c.id) ? { free: t.freeBadge } : {})
    };
  });
  const stops = list.reduce((a, c) => a + c.stops.length, 0);
  const fx = await fxContext();
  const p = dualMoney(TOUR_PLANS.city.amount / 100, "EUR", fx, INTL_LOCALE[params.locale]);
  const from = fmt(t.fromP, { p: p.local ?? p.main });
  // Atrações de topo por país: um país por bloco, numeradas, cada uma leva à página da cidade.
  const byCountry = new Map<string, { name: string; items: { city: string; cityName: string; id: string; name: string }[] }>();
  for (const c of list) {
    const cc = COUNTRY[c.id]; if (!cc) continue;
    const g = byCountry.get(cc) ?? { name: region.of(cc) ?? cc, items: [] };
    for (const s of c.stops) if (s.top && !s.x) g.items.push({ city: c.id, cityName: cityName(c, params.locale), id: s.id, name: stopName(s, params.locale) });
    byCountry.set(cc, g);
  }
  const countries = [...byCountry.entries()].filter(([, g]) => g.items.length).sort((a, b) => b[1].items.length - a[1].items.length || a[1].name.localeCompare(b[1].name));
  const flagOf = (cc: string) => String.fromCodePoint(...[...cc.toUpperCase()].map((ch) => 0x1f1a5 + ch.charCodeAt(0)));
  const searchCities = list.map((c) => ({ id: c.id, name: cityName(c, params.locale), country: (COUNTRY[c.id] && region.of(COUNTRY[c.id])) || "", flag: flag(COUNTRY[c.id] ?? "") })).sort((a, b) => a.name.localeCompare(b.name, INTL_LOCALE[params.locale]));
  const featured = ["lon", "lis", "nyc", "par", "rak", "dxb", "rio", "rom", "cpt", "sin", "ist", "mex", "prg", "cai", "bcn", "ams"].filter((id) => list.some((c) => c.id === id));
  return (
    <main className="app xl">
      <HomeHero cities={featured}>
        <Header locale={params.locale} currency={fx.cur} over />
        <div className="hx-grid rise">
          <div className="in hx-l">
            <span className="eyebrow">✦ {t.hx.eyebrow}</span>
            <h1>{t.hx.h1a} <em>{t.hx.h1b}</em></h1>
            <p>{t.hx.sub}</p>
            <div className="stats hx-stats" tabIndex={0}>
              <span><Building2 size={15} aria-hidden="true" />{fmt(t.hx.stats.cities, { n: String(list.length) })}</span>
              <span><MapPinned size={15} aria-hidden="true" />{fmt(t.hx.stats.stops, { n: String(stops) })}</span>
              <span><Languages size={15} aria-hidden="true" />{fmt(t.hx.stats.langs, { n: String(LOCALES.length) })}</span>
              <span><Headphones size={15} aria-hidden="true" />{t.hx.stats.audio}</span>
            </div>
            <p className="hm-free">{t.hmFree}</p>
            <div className="hx-qr"><PageQR label={t.qrScan} mobileLabel={t.qrShare} /></div>
          </div>
          <HeroSearch locale={params.locale} cities={searchCities} />
        </div>
      </HomeHero>

      {/* Experiências: entradas diretas para cada forma de viajar. */}
      <section className="sec hx-exp" aria-labelledby="hx-exp-h">
        <div className="hx-exp-in">
          <div className="hx-exp-h reveal">
            <h2 id="hx-exp-h">{t.hx.expTitle}</h2>
            <p>{t.hx.expSub}</p>
            <a href="#features">{t.hx.expAll} →</a>
          </div>
          <div className="hx-cards">
            {([
              ["layover", "VOYBU Layover", Plane, `/${params.locale}/start`, t.hx.cards.tagMain],
              ["explore", "VOYBU Explore", Compass, `/${params.locale}/plan/new?days=1&g=sights,food`, ""],
              ["experiences", "VOYBU Experiences", Sparkles, `/${params.locale}/plan/new?days=3&g=food,art`, t.hx.cards.tagFree],
              ["family", "VOYBU Family", Baby, `/${params.locale}/plan/new?days=2&g=family,sights`, ""],
              ["business", "VOYBU Business", Store, `/${params.locale}/merchants`, t.hx.cards.tagBiz]
            ] as const).map(([k, name, Ic, href, tag]) => (
              <a key={k} href={href} className={`hx-card hx-${k} press reveal`}>
                <span className="hx-card-art" aria-hidden="true"><Ic size={34} strokeWidth={1.8} /></span>
                <span className="hx-card-tx">
                  {tag && <span className="hx-tag">{tag}</span>}
                  <b>{name}</b>
                  <span className="hx-card-sub">{t.hx.cards[k][0]}</span>
                  <small>{t.hx.cards[k][1]}</small>
                  <em>{t.hx.cards[k][2]}</em>
                </span>
                <span className="hx-card-go" aria-hidden="true"><ChevronRight size={16} /></span>
              </a>
            ))}
          </div>
        </div>
        <ul className="hx-trust">
          {([["info", ShieldCheck], ["langs", Globe], ["community", Heart], ["offline", Smartphone]] as const).map(([k, Ic]) => (
            <li key={k}><Ic size={22} aria-hidden="true" /><span><b>{t.hx.trust[k][0]}</b><small>{t.hx.trust[k][1]}</small></span></li>
          ))}
        </ul>
      </section>

      {/* Para quem acabou de chegar ou precisa de algo já: quatro entradas diretas (Londres primeiro). */}
      <div className="sec nn-sec"><NeedNow locale={params.locale} city="lon" /></div>

      {/* O produto logo a seguir ao topo: escolher → roteiro → próximo passo → bilhete */}
      <section className="sec dm" aria-labelledby="dm-h">
        <div className="sec-h reveal"><div><h2 id="dm-h">{t.dmTitle}</h2></div><a href={`/${params.locale}/tour/man`}>🎧 {t.qsTry} →</a></div>
        <ol className="dm-rail">
          <li className="dm-card reveal"><span className="dm-n">1</span><b>{t.dm1t}</b><small>{t.dm1s}</small>
            <div className="dm-ui"><div className="dm-search">⌕ Lond…</div><div className="dm-row on">🇬🇧 {cityName(list.find((c) => c.id === "lon")!, params.locale)}</div><div className="dm-row">🇬🇧 Manchester</div></div></li>
          <li className="dm-card reveal"><span className="dm-n">2</span><b>{t.dm2t}</b><small>{t.dm2s}</small>
            <div className="dm-ui"><div className="dm-big">4 {t.stops} · 2 h 38</div><div className="dm-line"><span>✈ → 🚆</span><span>+45 min</span></div><div className="dm-bar"><i style={{ width: "62%" }} /><i style={{ width: "19%" }} /><i style={{ width: "19%" }} /></div></div></li>
          <li className="dm-card reveal"><span className="dm-n">3</span><b>{t.dm3t}</b><small>{t.dm3s}</small>
            <div className="dm-ui"><div className="dm-k">{t.nxLabel}</div><div className="dm-big">Praça do Comércio</div><div className="dm-line"><span>🚶 {t.walk} · 6 min</span><span className="dm-ok">✓</span></div></div></li>
          <li className="dm-card reveal"><span className="dm-n">4</span><b>{t.dm4t}</b><small>{t.dm4s}</small>
            <div className="dm-ui dm-ticket"><div><div className="dm-k">{t.rsTicket}</div><div className="dm-big">Torre de Belém</div><div className="dm-line"><span>10:30</span></div></div><div className="dm-qr" aria-hidden="true" /></div></li>
        </ol>
      </section>

      <section className="sec" id="cities" style={{ scrollMarginTop: 70 }}>
        <div className="sec-h reveal"><div><h2>{t.topDest}</h2><p>{t.topDestSub}</p></div></div>
        <DestGrid locale={params.locale} cities={cities} from={from}
          labels={{ stops: t.stops, search: t.qsSearch, all: t.exAll, none: t.gsNone, showAll: t.dShowAll, regions: t.dRegions }} />
        {SOON.length > 0 && <div className="soon-row"><span style={{ background: "none", boxShadow: "none", paddingInline: 0 }}>{t.soon}:</span>{SOON.map((n) => <span key={n.en}>{n[params.locale] ?? n.en}</span>)}</div>}
      </section>

      {countries.length > 0 && <section className="sec" aria-labelledby="tc-h">
        <div className="sec-h reveal"><div><h2 id="tc-h">{t.tcTitle}</h2><p>{t.tcSub}</p></div></div>
        <div className="tc-list">
          {countries.map(([cc, g], i) => (
            <details key={cc} className="tc reveal" open={i < 2}>
              <summary className="press"><span aria-hidden="true">{flagOf(cc)}</span><b>{g.name}</b><small>{fmt(t.tcN, { n: String(g.items.length) })}</small></summary>
              <ol className="tc-ol">
                {g.items.slice(0, 12).map((s, k) => (
                  <li key={s.city + s.id}><Link href={`/${params.locale}/c/${s.city}`} className="press"><i>{k + 1}</i><span><b>{s.name}</b><small>{s.cityName}</small></span></Link></li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </section>}

      <section className="sec">
        <div className="sec-h reveal"><h2>{t.howTitle}</h2></div>
        <ol className="steps2">
          {([[QrCode, t.how1t, t.how1s], [CreditCard, t.how2t, t.how2s], [Footprints, t.how3t, t.how3s]] as const).map(([Ic, a, b], i) => (
            <li key={a} className="step2 reveal"><span className="step2-n" aria-hidden="true"><Ic size={20} strokeWidth={2.2} /><i>{i + 1}</i></span><span className="step2-t"><b>{a}</b><small>{b}</small></span></li>
          ))}
        </ol>
      </section>

      <section className="sec" id="features" style={{ scrollMarginTop: 70 }}>
        <div className="sec-h reveal"><h2>{t.featTitle}</h2></div>
        {(() => {
          const all = ([[t.f1t, t.f1s], [t.f2t, t.f2s], [t.f3t, t.f3s], [t.f4t, t.f4s], [t.f5t, t.f5s], [t.f6t, t.f6s], [t.f7t, t.f7s], [t.f8t, t.f8s], [t.f9t, t.f9s], [t.f10t, t.f10s], [t.f11t, t.f11s], [t.f12t, t.f12s]] as const);
          const card = (i: number) => { const [a, b] = all[i]; const [Ic, q] = FEATS[i]; return <Link key={a} href={`/${params.locale}${FEAT_HREF[i]}`} className="feat2 feat2-link press reveal"><span className={`qi ${q}`} aria-hidden="true"><Ic size={18} strokeWidth={2.2} /></span><span className="f2-tx"><b>{a}</b><small>{b}</small></span></Link>; };
          // O essencial primeiro (transporte, áudio, hora de voltar, offline); o resto fica a um toque.
          const CORE = [0, 1, 2, 4], MORE = [3, 5, 6, 7, 8, 9, 10, 11];
          return <>
            <div className="feats2">{CORE.map(card)}</div>
            <details className="feats-more">
              <summary className="press">{fmt(t.featMore, { n: String(MORE.length) })}</summary>
              <div className="feats2">{MORE.map(card)}</div>
            </details>
          </>;
        })()}
      </section>

      <WebOnly>
        <section className="sec" style={{ display: "grid", gap: 12 }}>
          <div className="pcta reveal">
            <div><b>{t.bzTitle}</b><span>{t.bzSub}</span></div>
            <div className="pcta-acts">
              <Link className="btn press pcta-btn" href={`/${params.locale}/merchants#start`}>{t.bzBtn}</Link>
              <Link className="pcta-link" href={`/${params.locale}/merchants#plans`}>{t.bzLink}</Link>
            </div>
          </div>
          <div className="pcta alt reveal">
            <div><b>{t.hpTitle}</b><span>{t.hpSub}</span></div>
            <div className="pcta-acts">
              <Link className="btn press pcta-btn" href={`/${params.locale}/agents#join`}>{t.hpBtn}</Link>
              <Link className="pcta-link" href={`/${params.locale}/agents#how`}>{t.hpLink}</Link>
            </div>
          </div>
        </section>
      </WebOnly>
    </main>
  );
}
