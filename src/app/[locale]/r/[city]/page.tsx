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
import { hasCityAccess } from "@/lib/city-access";
import { LockedFor } from "@/components/LockedFor";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ locale: Locale; city: string }>; searchParams: Promise<Record<string, string | undefined>> };
const MODE_ICON: Record<Leg["m"], string> = { walk: "🚶", metro: "🚇", tram: "🚊", bus: "🚌", train: "🚆", ferry: "⛴", car: "🚕" };
const hrs = (m: number) => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;

async function load(p: P) {
  const params = await p.params, searchParams = await p.searchParams;
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
  const description = d.name;
  return { title, description, robots: { index: false }, openGraph: { title, description, type: "website" } };
}

/** Roteiro que um amigo partilhou: paragens, tempos, mapa e convite para o fazer com a VOYBU. */
export default async function SharedRoute(p: P) {
  const d = await load(p);
  if (!d) notFound();
  const { t, city, stops, name } = d;
  const l = (await p.params).locale;
  const from = ((await p.searchParams).p ?? "").slice(0, 60);
  // Sem passe: só o total; a ordem, os trajetos, os textos e o mapa abrem com o passe.
  const open = await hasCityAccess(city.id);
  const shown = open ? stops : [] as typeof stops;
  const lead = fmt(t.rs.lead, { n: stops.length, c: name, h: hrs(sharedMinutes(stops)) });
  return (
    <main className="app">
      <Header locale={l} currency={(await requestCurrency())} />
      <div className="ess">
        <span className="ess-h">🔗 {t.rs.title}</span>
        {stops.length === 0 ? <p className="ess-card ess-muted">{t.rs.invalid}</p> : <>
          <h1 className="arv-h">{lead}</h1>
          {from && <p className="ess-sub">{fmt(t.rs.from, { p: from })}</p>}
          {shown.length > 0 && <section className="ess-card">
            <ol className="ft-list rs-list">
              {shown.map((s, i) => (
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
          </section>}
          {!open && <LockedFor t={t} locale={l} city={city.id} cityName={name} what="route" more={stops.length - shown.length} />}
          {open && <a className="btn tram press" href={sharedMapUrl(stops)} target="_blank" rel="noopener noreferrer">🗺️ {t.rs.openMap}</a>}
          <a className="ios-row press" href={`/${l}/c/${city.id}`}><span className="ios-tx"><b>{t.rs.doIt}</b><small>{t.rs.doItSub}</small></span><span aria-hidden="true">›</span></a>
          <ShareAgain label={t.rs.forward} title={t.rs.title} text={fmt(t.rs.msg, { n: stops.length, c: name, h: hrs(sharedMinutes(stops)) })} copied={t.rs.copied} />
        </>}
      </div>
    </main>
  );
}
