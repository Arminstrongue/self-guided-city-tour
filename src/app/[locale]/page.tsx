import type { Metadata } from "next";
import { SiteImage } from "@/components/SiteImage";
import type { SiteImageKey } from "@/lib/site-images";
import { alternates } from "@/lib/seo";
import Link from "next/link";
import { Header } from "@/components/Header";
import { fxContext } from "@/lib/fx";
import { WebOnly } from "@/components/WebOnly";
import { SOON, cityName, cityNames, regionOf, COUNTRY } from "@/data/cities";
import { DestGrid, HomeHero, type DestCity } from "@/components/Showcase";
import { fmt, INTL_LOCALE, LOCALES, isLocale } from "@/i18n/core";
import { notFound } from "next/navigation";
import { loadCities } from "@/lib/content";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { TOUR_PLANS, MERCHANT_PLANS, isFreeCity } from "@/lib/pricing";
import { dualMoney, formatMoney } from "@/lib/currency";
import { Ticket as TicketIcon, Headphones, Clock, Star, CloudDownload, ArrowLeftRight, Receipt, ShieldAlert, Plane, Radar, Users, BadgeCheck, QrCode, CreditCard, Footprints } from "lucide-react";
import PageQR from "@/components/PageQR";
import { HeroSearch } from "@/components/HeroSearch";
import { TopByCountry } from "@/components/TopByCountry";
import { popularity } from "@/lib/popularity";
import { flag } from "@/data/countries";
import { Building2, MapPinned, Languages, ShieldCheck, Globe, Heart, Smartphone, Check, X } from "lucide-react";
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
  // Atrações de topo por país, ordenadas pelo que os viajantes mais abrem na VOYBU (90 dias) e pela fama (paragens "top").
  const pop = await popularity();
  const byCountry = new Map<string, { name: string; score: number; items: { city: string; cityName: string; id: string; name: string; score: number }[] }>();
  for (const c of list) {
    const cc = COUNTRY[c.id]; if (!cc) continue;
    const g = byCountry.get(cc) ?? { name: region.of(cc) ?? cc, score: 0, items: [] };
    g.score += pop.city.get(c.id) ?? 0;
    for (const s of c.stops) if (s.top && !s.x) g.items.push({ city: c.id, cityName: cityName(c, params.locale), id: s.id, name: stopName(s, params.locale), score: (pop.stop.get(`${c.id}:${s.id}`) ?? 0) * 3 + (pop.city.get(c.id) ?? 0) });
    byCountry.set(cc, g);
  }
  const countries = [...byCountry.entries()].filter(([, g]) => g.items.length)
    .sort((a, b) => b[1].score - a[1].score || b[1].items.length - a[1].items.length || a[1].name.localeCompare(b[1].name))
    .map(([cc, g]) => ({ cc, name: g.name, flag: flag(cc), items: [...g.items].sort((x, y) => y.score - x.score).map(({ score: _s, ...i }) => i) }));
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
      <section className="sec hx-exp" aria-label={t.hx.expTitle}>
        {/* Um só começo (cidade → tempo → roteiro, no topo): as antigas entradas paralelas (Layover, Explore, Experiences, Family) foram retiradas. */}
        <ul className="hx-trust">
          {([["info", ShieldCheck], ["langs", Globe], ["community", Heart], ["offline", Smartphone]] as const).map(([k, Ic]) => (
            <li key={k}><Ic size={22} aria-hidden="true" /><span><b>{t.hx.trust[k][0]}</b><small>{t.hx.trust[k][1]}</small></span></li>
          ))}
        </ul>
      </section>

      {/* Preços claros: o que é grátis, o que custa um passe (pagamento único) e os planos para empresas. */}
      {/* Nas apps das lojas não se mostram preços nem compras de conteúdo digital (regras do Google Play e da App Store). */}
      <section className="sec pr web-only" id="prices" aria-labelledby="pr-h" style={{ scrollMarginTop: 70 }}>
        {/* Painel escuro "premium": passes com destaque (mais escolhido / melhor valor), preço por dia e o que inclui. */}
        <div className="prx reveal">
          <div className="prx-h">
            <span className="prx-eyebrow">{t.pr.eyebrow}</span>
            <h2 id="pr-h">{t.pr.title}</h2>
            <p>{t.pr.sub}</p>
          </div>
          <div className="prx-grid">
            {(["city", "trip", "all"] as const).map((k) => {
              const m = dualMoney(TOUR_PLANS[k].amount / 100, "EUR", fx, INTL_LOCALE[params.locale]);
              const days = k === "city" ? 2 : k === "trip" ? 3 : 30;
              const perDay = formatMoney(Math.ceil((TOUR_PLANS[k].amount / days)) / 100, "EUR", INTL_LOCALE[params.locale]);
              const badge = k === "city" ? t.pr.popular : k === "all" ? t.pr.best : null;
              return (
                <div key={k} className={`prx-card prx-${k}${k === "all" ? " hot" : ""}`}>
                  {badge && <span className="prx-badge">{badge}</span>}
                  <span className="prx-name">{t.pr[k][0]}</span>
                  <div className="prx-price"><b className="num">{m.main}</b>{m.local && <small className="num">{m.local}</small>}</div>
                  <span className="prx-day num">{fmt(t.pr.perDay, { p: perDay })}</span>
                  <p className="prx-for">{t.pr[k][1]}</p>
                  <ul>{[k === "all" ? t.pr.featAll : k === "trip" ? t.pr.featTrip : t.pr.featCity, ...t.pr.feat].map((x) => <li key={x}><Check size={16} aria-hidden="true" />{x}</li>)}</ul>
                  <Link className={`prx-go press${k === "all" ? " hot" : ""}`} href={`/${params.locale}/start`}>{t.pr.buy}</Link>
                  <small className="prx-once">{t.pr.oneTime}</small>
                </div>
              );
            })}
          </div>
          <div className="prx-free">
            <div><b>{t.pr.freeName} · <span className="num">{t.pr.free}</span></b><small>{t.pr.freeItems.join(" · ")}</small></div>
            <Link className="prx-free-go press" href={`/${params.locale}/tour/man`}>{t.wDemo} →</Link>
          </div>
          <p className="prx-note"><X size={14} aria-hidden="true" />{t.pr.notIncl}</p>
        </div>
        <div className="pr-biz reveal">
          <div><b>{t.pr.bizTitle}</b><small>{t.pr.bizNote}</small></div>
          <ul>
            {(["basic", "featured", "partner"] as const).map((k) => (
              <li key={k}><span>{t.mPlans[k][0]}</span><b className="num">{MERCHANT_PLANS[k].amount ? `${formatMoney(MERCHANT_PLANS[k].amount / 100, "EUR", INTL_LOCALE[params.locale])}${t.perMonth}` : t.pr.free}</b></li>
            ))}
          </ul>
          <Link className="pr-biz-go" href={`/${params.locale}/merchants#plans`}>{t.pr.bizCta} →</Link>
        </div>
      </section>

      {/* Para quem acabou de chegar ou precisa de algo já: quatro entradas diretas (Londres primeiro). */}
      {/* "O que precisa agora?" vive no separador Agora (durante a viagem), não na página inicial. */}

      {/* O produto logo a seguir ao topo: escolher → roteiro → próximo passo → bilhete */}
      <section className="sec dm" aria-labelledby="dm-h">
        <div className="sec-h reveal"><div><h2 id="dm-h">{t.dmTitle}</h2></div><a href={`/${params.locale}/tour/man`}>🎧 {t.wDemo} →</a></div>
        <ol className="dm-rail" tabIndex={0}>
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
        <TopByCountry locale={params.locale} countries={countries} label={t.tcTitle} countTpl={t.tcN} moreLabel={t.cmMore} />
      </section>}

      <section className="sec">
        <div className="sec-h reveal"><h2>{t.howTitle}</h2></div>
        <ol className="steps2">
          {([[QrCode, t.how1t, t.how1s, "find-my-way"], [CreditCard, t.how2t, t.how2s, "trip-wallet"], [Footprints, t.how3t, t.how3s, "nyc-neighbourhood"]] as const).map(([Ic, a, b, img], i) => (
            <li key={a} className="step2 reveal"><span className="step2-n" aria-hidden="true"><Ic size={20} strokeWidth={2.2} /><i>{i + 1}</i></span>
              <span className="step2-t"><b>{a}</b><small>{b}</small><SiteImage k={img} alt={t.img.alt[img]} className="step2-img" sizes="(min-width: 960px) 30vw, 90vw" /></span></li>
          ))}
        </ol>
      </section>

      <section className="sec" id="features" style={{ scrollMarginTop: 70 }}>
        <div className="sec-h reveal"><h2>{t.featTitle}</h2></div>
        {(() => {
          const all = ([[t.f1t, t.f1s], [t.f2t, t.f2s], [t.f3t, t.f3s], [t.f4t, t.f4s], [t.f5t, t.f5s], [t.f6t, t.f6s], [t.f7t, t.f7s], [t.f8t, t.f8s], [t.f9t, t.f9s], [t.f10t, t.f10s], [t.f11t, t.f11s], [t.f12t, t.f12s]] as const);
          // As 4 principais têm fotografia; as outras ficam com ícone.
          const PHOTO: Partial<Record<number, SiteImageKey>> = { 0: "nyc-subway", 1: "audio-walk", 2: "airport-arrival", 4: "stay-connected" };
          const card = (i: number) => { const [a, b] = all[i]; const [Ic, q] = FEATS[i]; const ph = PHOTO[i]; return <Link key={a} href={`/${params.locale}${FEAT_HREF[i]}`} className={`feat2 feat2-link press reveal${ph ? " feat2-ph" : ""}`}>{ph && <SiteImage k={ph} alt="" className="feat2-img" sizes="(min-width: 960px) 25vw, 40vw" />}<span className={`qi ${q}`} aria-hidden="true"><Ic size={18} strokeWidth={2.2} /></span><span className="f2-tx"><b>{a}</b><small>{b}</small></span></Link>; };
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

      {/* Momentos da viagem: imagens que levam a cada ajuda da app. */}
      <section className="sec" aria-labelledby="mo-h">
        <div className="sec-h reveal"><div><h2 id="mo-h">{t.img.mo.title}</h2><p>{t.img.mo.sub}</p></div></div>
        <div className="mo-grid">
          {([
            ["family", "family-travel", "/plan/new?days=2&g=family,sights"], ["access", "accessible-city", "/wallet?settings=1"],
            ["food", "local-food", "/plan/new?days=1&g=food"], ["culture", "dubai-old-city", "/plan/new?days=1&g=sights,art"],
            ["luggage", "luggage-storage", "/wallet/essentials"], ["health", "pharmacy-help", "/c/man#safety"],
            ["partner", "local-partner", "/merchants"], ["walk", "london-explore", "/start"]
          ] as const).map(([k, img, href]) => (
            <Link key={k} href={`/${params.locale}${href}`} className="mo-tile press reveal">
              <SiteImage k={img} alt={t.img.alt[img]} sizes="(min-width: 960px) 25vw, 50vw" />
              <span className="mo-tx"><b>{t.img.mo.items[k][0]}</b><small>{t.img.mo.items[k][1]}</small></span>
            </Link>
          ))}
        </div>
      </section>

      <WebOnly>
        <section className="sec" style={{ display: "grid", gap: 12 }}>
          <div className="pcta reveal">
            <div><b>{t.bzTitle}</b><span>{t.bzSub}</span></div>
            <div className="pcta-acts">
              <Link className="btn press pcta-btn" href={`/${params.locale}/merchants#start`}>{t.bzBtn}</Link>
              <Link className="pcta-link web-only" href={`/${params.locale}/merchants#plans`}>{t.bzLink}</Link>
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
