import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ShareAgain } from "@/components/ShareAgain";
import { cityName, type Leg } from "@/data/cities";
import { lineText, stopName } from "@/data/stop-names";
import { fmt, isLocale } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { loadCity } from "@/lib/content";
import { requestCurrency } from "@/lib/fx";
import { sharedMapUrl, sharedMinutes, sharedStops } from "@/lib/route-share";

export const dynamic = "force-dynamic";
type P = { params: { locale: Locale; city: string }; searchParams: Record<string, string | undefined> };
const MODE_ICON: Record<Leg["m"], string> = { walk: "🚶", metro: "🚇", tram: "🚊", bus: "🚌", train: "🚆", ferry: "⛴", car: "🚕" };
const hrs = (m: number) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;

async function load({ params, searchParams }: P) {
  if (!isLocale(params.locale)) return null;
  const city = await loadCity(params.city);
  if (!city) return null;
  const stops = sharedStops(city, searchParams.s);
  return { city, stops, name: cityName(city, params.locale), t: getDict(params.locale) };
}

export async function generateMetadata(p: P): Promise<Metadata> {
  const d = await load(p);
  if (!d || d.stops.length < 1) return {};
  const title = `${fmt(d.t.rs.lead, { n: d.stops.length, c: d.name, h: hrs(sharedMinutes(d.stops)) })} | VOYBU`;
  const description = d.stops.map((s) => stopName(s, p.params.locale)).join(" → ");
  return { title, description, robots: { index: false }, openGraph: { title, description, type: "website" } };
}

/** Roteiro que um amigo partilhou: paragens, tempos, mapa e convite para o fazer com a VOYBU. */
export default async function SharedRoute(p: P) {
  const d = await load(p);
  if (!d) notFound();
  const { t, city, stops, name } = d;
  const l = p.params.locale;
  const from = (p.searchParams.p ?? "").slice(0, 60);
  const lead = fmt(t.rs.lead, { n: stops.length, c: name, h: hrs(sharedMinutes(stops)) });
  return (
    <main className="app">
      <Header locale={l} currency={requestCurrency()} />
      <div className="ess">
        <span className="ess-h">🔗 {t.rs.title}</span>
        {stops.length === 0 ? <p className="ess-card ess-muted">{t.rs.invalid}</p> : <>
          <h1 className="arv-h">{lead}</h1>
          {from && <p className="ess-sub">{fmt(t.rs.from, { p: from })}</p>}
          <section className="ess-card">
            <ol className="ft-list rs-list">
              {stops.map((s, i) => (
                <li key={s.id}>
                  <span className="ft-n num">{i + 1}</span>
                  <span className="ess-tx">
                    {i > 0 && <small className="rs-leg">{MODE_ICON[s.leg.m]} {s.leg.m === "walk" ? t.walk : t[s.leg.m]}{s.leg.line ? ` · ${lineText(s.leg.line, l)}` : ""} · {s.leg.min} min</small>}
                    <b>{stopName(s, l)}{s.top ? " ★" : ""}</b>
                    <small>{fmt(t.rs.visit, { v: s.v })} · {(l === "pt" ? s.pt : s.en).slice(0, 110)}{(l === "pt" ? s.pt : s.en).length > 110 ? "…" : ""}</small>
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <a className="btn tram press" href={sharedMapUrl(stops)} target="_blank" rel="noopener noreferrer">🗺️ {t.rs.openMap}</a>
          <a className="ios-row press" href={`/${l}/c/${city.id}`}><span className="ios-tx"><b>{t.rs.doIt}</b><small>{t.rs.doItSub}</small></span><span aria-hidden="true">›</span></a>
          <ShareAgain label={t.rs.forward} title={t.rs.title} text={fmt(t.rs.msg, { n: stops.length, c: name, h: hrs(sharedMinutes(stops)) })} copied={t.rs.copied} />
        </>}
      </div>
    </main>
  );
}
