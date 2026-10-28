"use client";
import { useEffect, useState } from "react";
import { BedDouble, LocateFixed, Plane, Search, Ship, TrainFront, Home, Footprints, Bus } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import { FAR_KM, km } from "@/lib/route-cost";
import { NextCityPick } from "./Onward";
import { fuzzyFilter, matchScore } from "@/lib/fuzzy";
/** Resultados do mapa: os que combinam com o que se escreveu primeiro (sem esconder os outros). */
const fuzzyFirst = <T extends { label: string; sub: string }>(hits: T[], q: string) => [...hits].sort((a, b) => matchScore(q, `${b.label} ${b.sub}`) - matchScore(q, `${a.label} ${a.sub}`));
import { TerminalPick } from "./TerminalPick";
import type { CityPoint } from "@/lib/nearby";
import { AIRPORT, END_FOR_MODE, endpointReady, sameEnd, type Breakdown, type Endpoint, type Mode, type Origin, type PlaceKind, type Trip } from "@/lib/trip";
import { cachedReservations } from "@/lib/trip-local";
import { TipsButton } from "./TravelTips";
import { tipsFor } from "@/data/travel-tips";

type Hit = { label: string; sub: string; lat: number; lng: number };
type Kind = Endpoint["kind"];
const ICON: Record<Kind, string> = { airport: "✈", station: "🚆", bus: "🚌", port: "🛳", hotel: "🏨", address: "📍", here: "📍" };

export const endLabel = (e: Endpoint, t: Dict) => (e.kind === "airport" ? (e.terminal ? `${t.bpAirport} · ${/^[0-9A-Z]{1,3}$/.test(e.terminal) ? `T${e.terminal}` : e.terminal}` : t.bpAirport) : e.kind === "here" ? t.bpHereLabel
  : e.platform ? `${e.label} · ${e.kind === "bus" ? t.pf.standShort : t.pf.short} ${e.platform}` : e.label);

/** Plataforma (estação) ou cais (autocarros), opcional: número curto com letras (ex.: 5, 13A). */
function PlatformPick({ t, value, onChange }: { t: Dict; value: Endpoint; onChange: (e: Endpoint) => void }) {
  if (value.kind !== "station" && value.kind !== "bus") return null;
  if (!endpointReady(value)) return null;
  const label = value.kind === "bus" ? t.pf.stand : t.pf.platform;
  return (
    <label className="pf-pick">
      <span className="pf-l">{label} <small>({t.tpOptional})</small></span>
      <input value={value.platform ?? ""} inputMode="text" autoCapitalize="characters" autoComplete="off" maxLength={5} placeholder={t.pf.ph} aria-label={label}
        onChange={(ev) => { const v = ev.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5); const { platform: _p, ...rest } = value; onChange(v ? { ...rest, platform: v } : rest); }} />
      <small className="hint">{t.pf.hint}</small>
    </label>
  );
}
export const endIcon = (e: Endpoint) => ICON[e.kind];

/** Pesquisa de uma estação, terminal, hotel ou morada na cidade. */
function PlaceSearch({ t, locale, city, kind, onPick, anywhere = false }: { t: Dict; locale: Locale; city: string; kind: Exclude<PlaceKind, "here" | "address">; onPick: (e: Endpoint) => void; anywhere?: boolean }) {
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
  // Palavras incompletas, em qualquer ordem e com um erro de letra ("Manchester Piccadil" → Piccadilly).
  const shown = list ? fuzzyFilter(list, q, (h) => `${h.label} ${h.sub}`) : list;
  const [elsewhere, setElsewhere] = useState<{ city: string; name: string } | null>(null);
  // Escrever pesquisa sozinho (sem ter de tocar na lupa) quando a lista da cidade não tem o que procura.
  useEffect(() => {
    const v = q.trim();
    if (v.length < 4 || (shown && shown.length > 0)) return;
    const id = setTimeout(() => {
      setBusy(true);
      fetch(`/api/geocode?city=${city}&lang=${locale}&kind=${kind}${anywhere ? "&scope=any" : ""}&q=${encodeURIComponent(v)}`).then((r) => (r.ok ? r.json() : null)).catch(() => null)
        .then((j: { hits?: Hit[]; elsewhere?: { city: string; name: string } | null } | null) => { setHits(fuzzyFirst(j?.hits ?? [], v)); setElsewhere(j?.elsewhere ?? null); setBusy(false); });
    }, 800);
    return () => clearTimeout(id);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps
  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim().length < 3) return;
    setBusy(true); setHits(null);
    const j = await fetch(`/api/geocode?city=${city}&lang=${locale}&kind=${kind}${anywhere ? "&scope=any" : ""}&q=${encodeURIComponent(q.trim())}`).then((r) => (r.ok ? r.json() : null)).catch(() => null) as { hits?: Hit[]; elsewhere?: { city: string; name: string } | null } | null;
    setHits(fuzzyFirst(j?.hits ?? [], q.trim())); setElsewhere(j?.elsewhere ?? null); setBusy(false);
  }
  return (
    <>
      <form className="bp-q" onSubmit={search}>
        <input value={q} onChange={(e) => { setQ(e.target.value); setHits(null); setElsewhere(null); }} placeholder={t.tpSearchPh[kind]} aria-label={t.tpSearchPh[kind]} autoComplete="off" />
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
      {busy && !hits && <p className="hint">…</p>}
      {hits && (hits.length ? (
        <div className="bp-hits">
          {hits.map((h, i) => (
            <button key={i} type="button" className="bp-hit press" onClick={() => { setHits(null); setQ(h.label); onPick({ kind, lat: h.lat, lng: h.lng, label: h.label }); }}>
              <b>{h.label}</b>{h.sub && <small>{h.sub}</small>}
            </button>
          ))}
        </div>
      ) : elsewhere ? (
        // Fica noutra cidade da app (ex.: Manchester Piccadilly ao planear Londres): dizer onde e oferecer mudar.
        <div className="card note-card"><p>{fmt(t.arvElsewhere, { c: elsewhere.name })}</p><a className="btn tram press" href={`/${locale}/start?city=${elsewhere.city}`}>{fmt(t.arvSwitchBtn, { c: elsewhere.name })}</a></div>
      ) : <p className="hint">{t.bpNone}</p>)}
    </>
  );
}

/** Escolher um ponto (início ou fim). `kinds` limita as opções (ex.: comboio → só estação). */
function EndpointChooser({ t, locale, city, cityName, center, value, kinds, onChange, anywhere = false }: {
  t: Dict; locale: Locale; city: string; cityName: string; center: { lat: number; lng: number }; value: Endpoint; kinds: Kind[]; onChange: (e: Endpoint) => void; anywhere?: boolean;
}) {
  const [want, setWant] = useState<Kind>(value.kind);
  const [msg, setMsg] = useState("");
  function here() {
    setWant("here"); setMsg(t.bpLocating);
    if (!navigator.geolocation) { setMsg(t.bpDenied); return; }
    navigator.geolocation.getCurrentPosition((p) => {
      const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      if (!anywhere && km(pos, center) > FAR_KM) { setMsg(fmt(t.bpFar, { c: cityName })); return; }
      setMsg(""); onChange({ kind: "here", ...pos, label: t.bpHereLabel });
    }, () => setMsg(t.bpDenied), { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 });
  }
  const icon = (k: Kind) => k === "airport" ? <Plane size={15} aria-hidden="true" /> : k === "station" ? <TrainFront size={15} aria-hidden="true" /> : k === "bus" ? <Bus size={15} aria-hidden="true" /> : k === "port" ? <Ship size={15} aria-hidden="true" /> : k === "here" ? <LocateFixed size={15} aria-hidden="true" /> : <BedDouble size={15} aria-hidden="true" />;
  const searchKind = want === "station" || want === "bus" || want === "port" || want === "hotel" ? want : null;
  return (
    <>
      {kinds.length > 1 && (
        <div className="bp-seg tp-seg" role="radiogroup">
          {kinds.map((k) => (
            <button key={k} type="button" role="radio" aria-checked={want === k} className={want === k ? "on" : ""}
              onClick={() => {
                setMsg("");
                if (k === "airport") { setWant(k); onChange(AIRPORT); }
                else if (k === "here") here();
                // Mudar de tipo invalida logo a escolha anterior (nunca fica "✓ Aeroporto" com "Hotel" selecionado).
                else { setWant(k); if (value.kind !== k) onChange({ kind: k, lat: NaN, lng: NaN, label: "" }); }
              }}>
              {icon(k)}{t.tpKinds[k === "address" ? "hotel" : k]}
            </button>
          ))}
        </div>
      )}
      {searchKind && <PlaceSearch t={t} locale={locale} city={city} kind={searchKind} onPick={onChange} anywhere={anywhere} />}
      {value.kind !== "airport" && value.kind === want && endpointReady(value) && <p className="bp-ok">✓ {endIcon(value)} {endLabel(value, t)}</p>}
      {want !== "airport" && !msg && !(value.kind === want && endpointReady(value)) && <p className="tp-need">{t.tpChoose[want === "address" ? "hotel" : want]}</p>}
      {msg && <p className="hint">{msg}</p>}
    </>
  );
}

/** Hora "HH:MM" + minutos, devolve "AAAA-MM-DDTHH:MM" (passa para o dia seguinte se for preciso). */
function addMin(day: string, hm: string, add: number): string {
  const [h, m] = hm.split(":").map(Number);
  const d = new Date(`${day}T00:00:00Z`); d.setUTCMinutes(h * 60 + m + add);
  return d.toISOString().slice(0, 16);
}
/** O bilhete que o utilizador guardou e que chega a esta estação (última perna do trajeto). */
export function arrivalTicket(arrival: Endpoint): { at: string; hm: string } | null {
  if (arrival.kind === "airport" || !arrival.label) return null;
  const label = arrival.label;
  const now = Date.now() - 6 * 3600_000;
  for (const r of cachedReservations()) {
    const legs = r.journey?.legs ?? [];
    if (r.kind !== "transport" || !legs.length || new Date(r.startsAt).getTime() < now) continue;
    const last = legs[legs.length - 1];
    if (!/^\d{1,2}:\d{2}$/.test(last.arr) || matchScore(last.to, label) < 0.6 && matchScore(label, last.to) < 0.6) continue;
    const day = r.localAt.slice(0, 10);
    // Chega depois da meia-noite quando a hora de chegada é anterior à de partida.
    const next = legs[0].dep && last.arr < legs[0].dep ? 1440 : 0;
    return { at: addMin(day, last.arr, next), hm: last.arr };
  }
  return null;
}

/** Começa fora da cidade: mostra o trajeto até lá (comboio/autocarro) e a seguir o percurso a pé a partir da chegada. */
function OriginInfo({ t, locale, origin, arrival, cityName, onStart, onRemove }: {
  t: Dict; locale: Locale; origin: Origin; arrival: Endpoint; cityName: string; onStart: (at: string) => void; onRemove: () => void;
}) {
  const [ticket, setTicket] = useState<{ at: string; hm: string } | null>(null);
  useEffect(() => { setTicket(arrivalTicket(arrival)); }, [arrival]);
  const pt = arrival.kind !== "airport" && endpointReady(arrival) ? arrival : null;
  const ready = arrival.kind === "airport" || !!pt;
  const name = arrival.kind === "airport" ? t.bpAirport : arrival.label;
  const dest = pt ? `${pt.lat},${pt.lng}` : encodeURIComponent(arrival.kind === "airport" ? `${cityName} airport` : cityName);
  const maps = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest}&travelmode=transit`;
  const dist = pt ? Math.round(km(origin, pt)) : null;
  const later = ticket ? addMin(ticket.at.slice(0, 10), ticket.at.slice(11), 15) : "";
  return (
    <div className="og-card">
      <div className="og-head">
        <span className="og-route">{ICON[arrival.kind]} {origin.label} → {ready ? name : cityName}</span>
        <button type="button" className="og-x" aria-label={t.og.remove} onClick={onRemove}>✕</button>
      </div>
      {dist != null && <p className="og-dist">{fmt(t.og.dist, { k: String(dist) })}</p>}
      <p className="hint">{fmt(t.og.note, { c: cityName })}</p>
      <div className="og-acts">
        <a className="btn ghost sm" href={maps} target="_blank" rel="noopener noreferrer">{t.og.plan} ↗</a>
        <a className="btn ghost sm" href={`/${locale}/wallet#res`}>{t.og.ticket}</a>
      </div>
      {ticket && (
        <div className="og-ticket">
          <p>{fmt(t.og.yours, { t: ticket.hm })}</p>
          <button type="button" className="btn sm" onClick={() => onStart(later)}>{fmt(t.og.useIt, { t: later.slice(11) })}</button>
        </div>
      )}
    </div>
  );
}

/**
 * Onde começa, como sai da cidade e onde tem de terminar. Comboio → o fim é uma estação; navio → um terminal;
 * avião → o aeroporto; "fico na cidade" → o fim é o mesmo ponto do início (ou outro, se quiser).
 */
export function TripPicker({ t, locale, city, cityName, center, value, onChange, cities, airport }: {
  t: Dict; locale: Locale; city: string; cityName: string; center: { lat: number; lng: number }; value: Trip; onChange: (v: Trip) => void;
  /** Cidades VOYBU para "Para onde vai a seguir?" (sem lista, o campo não aparece). */ cities?: CityPoint[];
  /** Código IATA do aeroporto da cidade (para escolher o terminal). */ airport?: string | null;
}) {
  const [other, setOther] = useState(value.mode === "stay" && !sameEnd(value.start, value.end));
  const set = (p: Partial<Trip>) => onChange({ ...value, ...p });
  function pickMode(mode: Mode) {
    const need = END_FOR_MODE[mode];
    // O fim acompanha a modalidade: nunca fica o aeroporto quando a partida é de comboio ou navio.
    let end: Endpoint = value.end;
    if (need === "airport") end = AIRPORT;
    else if (need) end = value.end.kind === need ? value.end : value.start.kind === need ? value.start : { kind: need, lat: NaN, lng: NaN, label: "" };
    else if (mode === "walk") {
      // A pé: termina num lugar à escolha (qualquer morada ou ponto de interesse), nunca no aeroporto por omissão.
      setOther(true);
      end = value.end.kind !== "airport" && endpointReady(value.end) && !sameEnd(value.end, value.start) ? value.end : { kind: "hotel", lat: NaN, lng: NaN, label: "" };
    }
    else end = other ? value.end : value.start;
    set({ mode, end, ...(mode === "stay" || mode === "walk" ? { next: undefined } : {}) });
  }
  const needKind = END_FOR_MODE[value.mode];
  const endMissing = value.end.kind !== "airport" && !Number.isFinite(value.end.lat);
  const startKinds: Kind[] = ["airport", "station", "bus", "port", "hotel", "here"];
  return (
    <div className="bp tp">
      <span className="bp-h">{t.tpStart}</span>
      {value.origin ? (
        <>
          <OriginInfo t={t} locale={locale} origin={value.origin} arrival={value.start} cityName={cityName}
            onStart={(at) => set({ startAt: at })} onRemove={() => set({ origin: undefined })} />
          <span className="bp-h">{fmt(t.og.arrive, { c: cityName })}</span>
          <EndpointChooser key="arrive" t={t} locale={locale} city={city} cityName={cityName} center={center} value={value.start} kinds={["station", "bus", "airport", "port"]}
            onChange={(s) => onChange({ ...value, start: s, end: value.mode === "stay" && !other ? s : value.end })} />
        </>
      ) : (
        <EndpointChooser key="start" t={t} locale={locale} city={city} cityName={cityName} center={center} value={value.start} kinds={startKinds} anywhere
          onChange={(s) => {
            if (s.kind !== "airport" && endpointReady(s) && km(s, center) > FAR_KM) {
              // Fora da cidade: guarda a origem e pede onde chega à cidade (estação, autocarro ou porto).
              const kind = s.kind === "bus" || s.kind === "port" ? s.kind : "station";
              const arrive: Endpoint = { kind, lat: NaN, lng: NaN, label: "" };
              onChange({ ...value, origin: { label: s.label || t.bpHereLabel, lat: s.lat, lng: s.lng }, start: arrive, end: value.mode === "stay" && !other ? arrive : value.end });
              return;
            }
            onChange({ ...value, start: s, end: value.mode === "stay" && !other ? s : value.end });
          }} />
      )}

      <span className="bp-h">{t.tpLeave}</span>
      <div className="bp-seg tp-modes" role="radiogroup" aria-label={t.tpLeave}>
        {(["plane", "train", "bus", "ship", "walk", "stay"] as const).map((m) => (
          <button key={m} type="button" role="radio" aria-checked={value.mode === m} className={value.mode === m ? "on" : ""} onClick={() => pickMode(m)}>
            {m === "plane" ? <Plane size={15} aria-hidden="true" /> : m === "train" ? <TrainFront size={15} aria-hidden="true" /> : m === "bus" ? <Bus size={15} aria-hidden="true" /> : m === "ship" ? <Ship size={15} aria-hidden="true" /> : m === "walk" ? <Footprints size={15} aria-hidden="true" /> : <Home size={15} aria-hidden="true" />}{t.tpModes[m]}
          </button>
        ))}
      </div>

      {(value.mode === "train" || value.mode === "bus") && <TipsButton t={t} tips={tipsFor({ cities: [city], mode: value.mode })} autoKey={`trip-${value.mode}`} />}

      <span className="bp-h">{t.tpEnd}</span>
      {needKind === "airport" && <p className="bp-ok">✓ ✈ {t.bpAirport}</p>}
      {(needKind === "station" || needKind === "port" || needKind === "bus") && (
        <>
          <p className="hint">{fmt(t.nxcStation, { c: cityName })}</p>
          <EndpointChooser key={needKind} t={t} locale={locale} city={city} cityName={cityName} center={center} value={endMissing ? { kind: needKind, lat: NaN, lng: NaN, label: "" } : value.end}
            kinds={needKind === "station" ? ["station", "airport"] : needKind === "bus" ? ["bus", "hotel", "station"] : [needKind]} onChange={(e) => set({ end: e })} />
          {value.end.kind === "airport" && <p className="bp-ok">✓ ✈ {t.bpAirport}</p>}
          <PlatformPick t={t} value={value.end} onChange={(e) => set({ end: e })} />
        </>
      )}
      {value.mode === "walk" && (
        <EndpointChooser key="walk" t={t} locale={locale} city={city} cityName={cityName} center={center} value={value.end} kinds={["hotel", "station", "port", "airport"]} onChange={(e) => set({ end: e })} />
      )}
      {!needKind && value.mode !== "walk" && (
        <>
          <div className="bp-seg tp-seg" role="radiogroup">
            <button type="button" role="radio" aria-checked={!other} className={!other ? "on" : ""} onClick={() => { setOther(false); set({ end: value.start }); }}>{t.tpSameAsStart}</button>
            <button type="button" role="radio" aria-checked={other} className={other ? "on" : ""} onClick={() => setOther(true)}>{t.tpElsewhere}</button>
          </div>
          {other ? <EndpointChooser t={t} locale={locale} city={city} cityName={cityName} center={center} value={value.end} kinds={["airport", "station", "port", "hotel"]} onChange={(e) => set({ end: e })} />
            : endpointReady(value.start) ? <p className="bp-ok">✓ {endIcon(value.start)} {endLabel(value.start, t)}</p> : <p className="hint">{t.tpNeedEnd}</p>}
        </>
      )}
      {value.end.kind === "airport" && (
        <TerminalPick t={t} locale={locale} iata={airport} value={value.end.terminal} onChange={(code) => set({ end: code ? { kind: "airport", terminal: code } : AIRPORT })} />
      )}
      {cities && cities.length > 0 && value.mode !== "stay" && value.mode !== "walk" && (
        <NextCityPick t={t} locale={locale} from={{ id: city, name: cityName, ...center }} cities={cities} value={value.next} onChange={(next) => set({ next })} />
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
