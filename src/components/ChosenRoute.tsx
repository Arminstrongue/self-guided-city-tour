"use client";
import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { tripWindow, whenLabel, type Breakdown, type Trip } from "@/lib/trip";
import { TimeBreakdown, endIcon, endLabel } from "./TripPicker";
import { loadTrip } from "./trip-store";

type Planned = { city: string; key: string; n: number; h: string; names?: string[]; cost?: string; bd?: Breakdown };
const hrs = (m: number) => `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, "0")}`;

/**
 * "O seu roteiro": o que o viajante escolheu no planeador domina o resumo da compra (paragens, tempos, custo de
 * transporte dessa versão, início e fim). Sem escolha, mostra o resumo geral da cidade (`children`).
 */
export function ChosenRoute({ t, locale, city, tz, coreN, extN, children }: { t: Dict; locale: Locale; city: string; tz: string; coreN: number; extN: number; children?: React.ReactNode }) {
  const [p, setP] = useState<Planned | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  useEffect(() => {
    try { const v = JSON.parse(localStorage.getItem("sgct:planned") ?? "null"); if (v?.city === city) setP(v); } catch { /* ignorar */ }
    const sync = () => setTrip(loadTrip(city));
    sync();
    const on = (e: Event) => { if ((e as CustomEvent).detail === city) sync(); };
    window.addEventListener("sgct:trip", on);
    return () => window.removeEventListener("sgct:trip", on);
  }, [city]);
  if (!p || !trip) return <>{children}</>;
  const w = tripWindow(trip, tz);
  const when = (ms: number) => whenLabel(ms, tz, INTL_LOCALE[locale], { today: t.tpToday, tomorrow: t.tpTomorrow });
  return (
    <div className="card cr" role="note">
      <div className="cr-h"><span className="cr-k">⏱ {t.crTitle}</span><a href={`/${locale}/start?city=${city}`} className="link-btn">{t.bpChange}</a></div>
      <b style={{ fontSize: 18 }}>{fmt(t.tpChosen, { n: p.n })}</b>
      <span className="hint">{endIcon(trip.start)} {endLabel(trip.start, t)} → {endIcon(trip.end)} {endLabel(trip.end, t)} · {t.tpModes[trip.mode]}</span>
      {trip.startAt && <span className="hint">{fmt(t.tpStartsAt, { t: when(w.start) })}</span>}
      {p.bd && <TimeBreakdown b={p.bd} t={t} trip={trip} hrs={hrs} />}
      {p.cost && <span>{fmt(t.bkTransport, { c: p.cost })}</span>}
      {p.names && <ol className="cr-stops">{p.names.map((n, i) => <li key={n + i}>{n}</li>)}</ol>}
      <span className="hint">{fmt(t.tpVersions, { n: coreN })}{extN > 0 ? ` · ${fmt(t.tpExtVersion, { n: extN })}` : ""}</span>
      <p className="hint">{t.bkIncl}</p>
      <span className="hint">{t.crNote}</span>
    </div>
  );
}
