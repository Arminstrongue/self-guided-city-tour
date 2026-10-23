"use client";
import { useEffect, useState } from "react";
import { BedDouble, LocateFixed, Plane, Search, Ship, TrainFront, Home } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import { FAR_KM, km } from "@/lib/route-cost";
import { AIRPORT, END_FOR_MODE, endpointReady, sameEnd, type Breakdown, type Endpoint, type Mode, type PlaceKind, type Trip } from "@/lib/trip";

type Hit = { label: string; sub: string; lat: number; lng: number };
type Kind = Endpoint["kind"];
const ICON: Record<Kind, string> = { airport: "✈", station: "🚆", port: "🛳", hotel: "🏨", address: "📍", here: "📍" };

export const endLabel = (e: Endpoint, t: Dict) => (e.kind === "airport" ? t.bpAirport : e.kind === "here" ? t.bpHereLabel : e.label);
export const endIcon = (e: Endpoint) => ICON[e.kind];

/** Pesquisa de uma estação, terminal, hotel ou morada na cidade. */
function PlaceSearch({ t, locale, city, kind, onPick }: { t: Dict; locale: Locale; city: string; kind: Exclude<PlaceKind, "here" | "address">; onPick: (e: Endpoint) => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [busy, setBusy] = useState(false);
  // Estações e terminais: a lista da cidade aparece logo, sem escrever; escrever filtra a lista.
  const [list, setList] = useState<Hit[] | null>(null);
  useEffect(() => {
    if (kind === "hotel") return;
    let live = true; setList(null);
    fetch(`/api/stations?city=${city}&kind=${kind}&lang=${locale}`).then((r) => (r.ok ? r.json() : null)).then((j: { hits?: Hit[] } | null) => { if (live) setList(j?.hits ?? []); }).catch(() => { if (live) setList([]); });
    return () => { live = false; };
  }, [city, kind, locale]);
  const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const shown = list?.filter((h) => !q.trim() || norm(`${h.label} ${h.sub}`).includes(norm(q.trim())));
  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim().length < 3) return;
    setBusy(true); setHits(null);
    const j = await fetch(`/api/geocode?city=${city}&lang=${locale}&q=${encodeURIComponent(q.trim())}`).then((r) => (r.ok ? r.json() : null)).catch(() => null) as { hits?: Hit[] } | null;
    setHits(j?.hits ?? []); setBusy(false);
  }
  return (
    <>
      <form className="bp-q" onSubmit={search}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.tpSearchPh[kind]} aria-label={t.tpSearchPh[kind]} autoComplete="off" />
        <button className="btn tram" disabled={busy || q.trim().length < 3}><Search size={16} aria-hidden="true" /><span className="sr-only">{t.bpSearch}</span></button>
      </form>
      {!hits && kind !== "hotel" && (list === null ? <p className="hint">…</p> : shown && shown.length > 0 && (
        <div className="bp-hits ios-group">
          {shown.map((h, i) => (
            <button key={i} type="button" className="bp-hit press" onClick={() => { setQ(h.label); setList([]); onPick({ kind, lat: h.lat, lng: h.lng, label: h.label }); }}>
              <b>{h.label}</b>{h.sub && <small>{h.sub}</small>}
            </button>
          ))}
        </div>
      ))}
      {hits && (hits.length ? (
        <div className="bp-hits">
          {hits.map((h, i) => (
            <button key={i} type="button" className="bp-hit press" onClick={() => { setHits(null); setQ(h.label); onPick({ kind, lat: h.lat, lng: h.lng, label: h.label }); }}>
              <b>{h.label}</b>{h.sub && <small>{h.sub}</small>}
            </button>
          ))}
        </div>
      ) : <p className="hint">{t.bpNone}</p>)}
    </>
  );
}

/** Escolher um ponto (início ou fim). `kinds` limita as opções (ex.: comboio → só estação). */
function EndpointChooser({ t, locale, city, cityName, center, value, kinds, onChange }: {
  t: Dict; locale: Locale; city: string; cityName: string; center: { lat: number; lng: number }; value: Endpoint; kinds: Kind[]; onChange: (e: Endpoint) => void;
}) {
  const [want, setWant] = useState<Kind>(value.kind);
  const [msg, setMsg] = useState("");
  function here() {
    setWant("here"); setMsg(t.bpLocating);
    if (!navigator.geolocation) { setMsg(t.bpDenied); return; }
    navigator.geolocation.getCurrentPosition((p) => {
      const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      if (km(pos, center) > FAR_KM) { setMsg(fmt(t.bpFar, { c: cityName })); return; }
      setMsg(""); onChange({ kind: "here", ...pos, label: t.bpHereLabel });
    }, () => setMsg(t.bpDenied), { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 });
  }
  const icon = (k: Kind) => k === "airport" ? <Plane size={15} aria-hidden="true" /> : k === "station" ? <TrainFront size={15} aria-hidden="true" /> : k === "port" ? <Ship size={15} aria-hidden="true" /> : k === "here" ? <LocateFixed size={15} aria-hidden="true" /> : <BedDouble size={15} aria-hidden="true" />;
  const searchKind = want === "station" || want === "port" || want === "hotel" ? want : null;
  return (
    <>
      {kinds.length > 1 && (
        <div className="bp-seg tp-seg" role="radiogroup">
          {kinds.map((k) => (
            <button key={k} type="button" role="radio" aria-checked={want === k} className={want === k ? "on" : ""}
              onClick={() => { setMsg(""); if (k === "airport") { setWant(k); onChange(AIRPORT); } else if (k === "here") here(); else setWant(k); }}>
              {icon(k)}{t.tpKinds[k === "address" ? "hotel" : k]}
            </button>
          ))}
        </div>
      )}
      {searchKind && <PlaceSearch t={t} locale={locale} city={city} kind={searchKind} onPick={onChange} />}
      {value.kind !== "airport" && value.kind === want && endpointReady(value) && <p className="bp-ok">✓ {endIcon(value)} {endLabel(value, t)}</p>}
      {msg && <p className="hint">{msg}</p>}
    </>
  );
}

/**
 * Onde começa, como sai da cidade e onde tem de terminar. Comboio → o fim é uma estação; navio → um terminal;
 * avião → o aeroporto; "fico na cidade" → o fim é o mesmo ponto do início (ou outro, se quiser).
 */
export function TripPicker({ t, locale, city, cityName, center, value, onChange }: {
  t: Dict; locale: Locale; city: string; cityName: string; center: { lat: number; lng: number }; value: Trip; onChange: (v: Trip) => void;
}) {
  const [other, setOther] = useState(value.mode === "stay" && !sameEnd(value.start, value.end));
  const set = (p: Partial<Trip>) => onChange({ ...value, ...p });
  function pickMode(mode: Mode) {
    const need = END_FOR_MODE[mode];
    // O fim acompanha a modalidade: nunca fica o aeroporto quando a partida é de comboio ou navio.
    let end: Endpoint = value.end;
    if (need === "airport") end = AIRPORT;
    else if (need) end = value.end.kind === need ? value.end : value.start.kind === need ? value.start : { kind: need, lat: NaN, lng: NaN, label: "" };
    else end = other ? value.end : value.start;
    set({ mode, end });
  }
  const needKind = END_FOR_MODE[value.mode];
  const endMissing = value.end.kind !== "airport" && !Number.isFinite(value.end.lat);
  const startKinds: Kind[] = ["airport", "station", "port", "hotel", "here"];
  return (
    <div className="bp tp">
      <span className="bp-h">{t.tpStart}</span>
      <EndpointChooser t={t} locale={locale} city={city} cityName={cityName} center={center} value={value.start} kinds={startKinds}
        onChange={(s) => onChange({ ...value, start: s, end: value.mode === "stay" && !other ? s : value.end })} />

      <span className="bp-h">{t.tpLeave}</span>
      <div className="bp-seg tp-seg" role="radiogroup" aria-label={t.tpLeave}>
        {(["plane", "train", "ship", "stay"] as const).map((m) => (
          <button key={m} type="button" role="radio" aria-checked={value.mode === m} className={value.mode === m ? "on" : ""} onClick={() => pickMode(m)}>
            {m === "plane" ? <Plane size={15} aria-hidden="true" /> : m === "train" ? <TrainFront size={15} aria-hidden="true" /> : m === "ship" ? <Ship size={15} aria-hidden="true" /> : <Home size={15} aria-hidden="true" />}{t.tpModes[m]}
          </button>
        ))}
      </div>

      <span className="bp-h">{t.tpEnd}</span>
      {needKind === "airport" && <p className="bp-ok">✓ ✈ {t.bpAirport}</p>}
      {(needKind === "station" || needKind === "port") && (
        <>
          {endMissing && <p className="tp-need">{needKind === "station" ? t.tpNeedStation : t.tpNeedPort}</p>}
          <EndpointChooser key={needKind} t={t} locale={locale} city={city} cityName={cityName} center={center} value={endMissing ? { kind: needKind, lat: NaN, lng: NaN, label: "" } : value.end} kinds={[needKind]} onChange={(e) => set({ end: e })} />
        </>
      )}
      {!needKind && (
        <>
          <div className="bp-seg tp-seg" role="radiogroup">
            <button type="button" role="radio" aria-checked={!other} className={!other ? "on" : ""} onClick={() => { setOther(false); set({ end: value.start }); }}>{t.tpSameAsStart}</button>
            <button type="button" role="radio" aria-checked={other} className={other ? "on" : ""} onClick={() => setOther(true)}>{t.tpElsewhere}</button>
          </div>
          {other ? <EndpointChooser t={t} locale={locale} city={city} cityName={cityName} center={center} value={value.end} kinds={["airport", "station", "port", "hotel"]} onChange={(e) => set({ end: e })} />
            : <p className="bp-ok">✓ {endIcon(value.start)} {endLabel(value.start, t)}</p>}
        </>
      )}
    </div>
  );
}

/** Tempo dentro da cidade, ida, regresso, margem e total: a mesma tabela em todos os ecrãs. */
export function TimeBreakdown({ b, t, trip, hrs }: { b: Breakdown; t: Dict; trip: Pick<Trip, "start" | "end" | "mode">; hrs: (m: number) => string }) {
  return (
    <dl className="bd">
      <div><dt>{t.bdTour}</dt><dd className="num">{hrs(b.tour)}</dd></div>
      <div><dt>{fmt(t.bdTo, { p: endLabel(trip.start, t) })}</dt><dd className="num">+{b.to} min</dd></div>
      <div><dt>{fmt(t.bdBack, { p: endLabel(trip.end, t) })}</dt><dd className="num">+{b.back} min</dd></div>
      <div className="bd-total"><dt>{t.bdSubtotal}</dt><dd className="num">{hrs(b.total)}</dd></div>
      {b.buffer > 0 && <div><dt>{t.bdBuffer}</dt><dd className="num">+{b.buffer < 60 ? `${b.buffer} min` : hrs(b.buffer)}</dd></div>}
      {b.buffer > 0 && <div className="bd-total"><dt>{t.bdTotal}</dt><dd className="num">{hrs(b.needed)}</dd></div>}
    </dl>
  );
}
