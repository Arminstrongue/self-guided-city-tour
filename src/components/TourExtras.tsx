"use client";
/** Peças do roteiro: escolher o roteiro pelo tempo, GPS e regresso, voo em direto, meteorologia, áudio e guia prático. */
import { useEffect, useRef, useState } from "react";
import type { City, Stop } from "@/data/cities";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/dictionaries";
import { FAR_KM, km, returnEstimate, walkMin, type RouteOption } from "@/lib/route-cost";
import { AIRPORT_BUFFER_MIN } from "@/lib/pricing";
import { PRACTICAL } from "@/data/practical";
import type { Weather } from "@/lib/weather";
import type { FlightStatus } from "@/lib/flight";
import { ExitCheck, NAT_KEY } from "./ExitCheck";
import { ExtLink } from "./ExtLink";

const hrs = (m: number) => { const v = Math.max(0, Math.round(m)); return `${Math.floor(v / 60)} h ${String(v % 60).padStart(2, "0")}`; };

/* ---------- Roteiro pelo tempo livre ---------- */

export function RouteFit({ options, value, onChange, availMin, t, extName }: {
  options: RouteOption[]; value: string; onChange: (k: string) => void; availMin: number | null; t: Dict; extName: string;
}) {
  return (
    <div className="field">
      <label htmlFor="lvl"><b>{t.fitTitle}</b></label>
      <select id="lvl" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const ok = availMin === null ? null : o.plan.minutesTour <= availMin;
          const label = fmt(t.fitOpt, { n: o.plan.stops.length, h: hrs(o.plan.minutesTour) }) + (o.key === "ext" ? ` (${fmt(t.withExt, { x: extName })})` : "");
          return <option key={o.key} value={o.key}>{label}{ok === null ? "" : ok ? ` ✓ ${t.fitsTag}` : ` · ${t.tooLong}`}</option>;
        })}
      </select>
    </div>
  );
}

/* ---------- GPS e "Voltar já" ---------- */

type Pos = { lat: number; lng: number };

export function useGeo() {
  const [pos, setPos] = useState<Pos | null>(null);
  const [state, setState] = useState<"off" | "on" | "denied">("off");
  const watch = useRef<number | null>(null);
  function start() {
    if (!("geolocation" in navigator)) return setState("denied");
    watch.current = navigator.geolocation.watchPosition(
      (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setState("on"); },
      () => setState("denied"),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 20_000 }
    );
    try { localStorage.setItem("sgct:geo", "1"); } catch { /* ignorar */ }
  }
  useEffect(() => {
    try { if (localStorage.getItem("sgct:geo") === "1") start(); } catch { /* ignorar */ }
    return () => { if (watch.current !== null) navigator.geolocation.clearWatch(watch.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { pos, state, start };
}

export function BackNow({ city, cityName, flightAt, pos, geoState, onGeo, next, now, t, locale }: {
  city: City; cityName: string; flightAt: Date | null; pos: Pos | null; geoState: "off" | "on" | "denied"; onGeo: () => void;
  next: Stop | null; now: number; t: Dict; locale: Locale;
}) {
  const hm = (d: Date) => d.toLocaleTimeString(INTL_LOCALE[locale], { hour: "2-digit", minute: "2-digit" });
  const est = pos ? returnEstimate(city, pos) : null;
  const leaveAt = flightAt && est !== null ? new Date(flightAt.getTime() - (AIRPORT_BUFFER_MIN + est) * 60_000) : null;
  const late = leaveAt ? leaveAt.getTime() <= now : false;
  const dir = city.ap ? `https://www.google.com/maps/dir/?api=1&destination=${city.ap.lat},${city.ap.lng}&travelmode=transit` : null;
  const dist = (d: number) => (d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`);
  return (
    <div className={`card stack back-now ${late ? "late" : ""}`} style={{ gap: 8, padding: 14 }}>
      {geoState !== "on" ? (
        <button className="btn ghost" style={{ padding: 10, fontSize: 14 }} onClick={onGeo}>📍 {t.gpsOn}</button>
      ) : pos && city.stops[0] && km(pos, city.stops[0]) > FAR_KM ? (
        <p>📍 {fmt(t.gpsFar, { d: Math.round(km(pos, city.stops[0])), c: cityName })}</p>
      ) : next && pos ? (
        <p>📍 {fmt(t.gpsNext, { s: next.n, d: dist(km(pos, next)), w: walkMin(km(pos, next)) })}</p>
      ) : <p>📍 {t.gpsDone}</p>}
      {geoState === "denied" && <p className="hint">{t.gpsDenied}</p>}
      <b>✈ {t.backNow}</b>
      {est !== null && <p>{fmt(t.backEst, { m: est })} {leaveAt && (late ? <b className="bad-txt">{t.backLate}</b> : fmt(t.backLeave, { t: hm(leaveAt) }))}</p>}
      <p className="hint">{fmt(t.backLine, { l: city.ret.core.line ?? "" })}</p>
      {dir && <ExtLink className="btn tram" href={dir}>{t.backGo}</ExtLink>}
    </div>
  );
}

/* ---------- Estado do voo ---------- */

export type FlightOverride = { at: string; no: string };

export function FlightCard({ city, flightNo, flightAt, enabled, onUse, onEdit, t, locale }: {
  city: City; flightNo: string; flightAt: Date | null; enabled: boolean;
  onUse: (iso: string) => void; onEdit: (o: FlightOverride) => void; t: Dict; locale: Locale;
}) {
  const [s, setS] = useState<FlightStatus | null>(null);
  const [at, setAt] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [no, setNo] = useState(flightNo);
  const [when, setWhen] = useState("");
  const hm = (iso: string) => new Date(iso).toLocaleTimeString(INTL_LOCALE[locale], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    if (!enabled || !flightNo || !flightAt) return;
    const date = new Intl.DateTimeFormat("sv-SE", { timeZone: city.tz ?? "UTC" }).format(flightAt);
    const load = () => fetch(`/api/flight?no=${flightNo}&date=${date}&from=${city.ap?.iata ?? ""}`)
      .then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && !j.error) { setS(j); setAt(Date.now()); } }).catch(() => undefined);
    void load();
    const i = setInterval(load, 10 * 60_000);
    return () => clearInterval(i);
  }, [enabled, flightNo, flightAt, city.tz, city.ap?.iata]);

  useEffect(() => {
    if (!flightAt) return;
    const d = new Date(flightAt.getTime() - flightAt.getTimezoneOffset() * 60000);
    setWhen(d.toISOString().slice(0, 16));
  }, [flightAt]);

  const changed = s?.estimated && flightAt ? Math.round((Date.parse(s.estimated) - flightAt.getTime()) / 60000) : 0;
  const stLabel = s ? (t.fSt as Record<string, string>)[s.status.replace(/\s/g, "")] ?? s.status : "";
  const cancelled = s?.status.startsWith("Cancel");

  if (!flightNo && !editing) {
    return <button className="link-btn" onClick={() => setEditing(true)}>✈ {t.fEdit}</button>;
  }
  return (
    <div className={`card stack flight ${cancelled ? "late" : ""}`} style={{ gap: 6, padding: 14 }}>
      <div className="row-between">
        <b>✈ {fmt(t.fTitle, { n: flightNo || "—" })}{stLabel && ` · ${stLabel}`}</b>
        <button className="link-btn" onClick={() => setEditing(!editing)}>{t.fEdit}</button>
      </div>
      {s && (s.terminal || s.gate) && <p>{fmt(t.fGate, { te: s.terminal ?? "—", g: s.gate ?? "—" })}</p>}
      {s?.estimated && Math.abs(changed) >= 10 && (
        <>
          <p className={changed < 0 ? "bad-txt" : ""}><b>{changed > 0 ? fmt(t.fDelay, { m: changed, t: hm(s.estimated) }) : fmt(t.fEarly, { t: hm(s.estimated) })}</b></p>
          <button className="btn ghost" style={{ padding: 10, fontSize: 14 }} onClick={() => onUse(s.estimated!)}>{t.fUse}</button>
        </>
      )}
      {at && <p className="hint">{fmt(t.fUpdated, { t: new Date(at).toLocaleTimeString(INTL_LOCALE[locale], { hour: "2-digit", minute: "2-digit" }) })}</p>}
      {editing && (
        <form className="stack" style={{ gap: 8 }} onSubmit={(e) => {
          e.preventDefault();
          const d = new Date(when);
          if (isNaN(d.getTime())) return;
          onEdit({ at: d.toISOString(), no: no.toUpperCase().replace(/[^A-Z0-9]/g, "") });
          setEditing(false);
        }}>
          <div className="grid2">
            <div className="field"><label htmlFor="fno2">{t.flightNo}</label><input id="fno2" value={no} onChange={(e) => setNo(e.target.value)} placeholder="TP1234" /></div>
            <div className="field"><label htmlFor="fat2">{t.dep}</label><input id="fat2" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></div>
          </div>
          <button className="btn" type="submit">{t.fSave}</button>
        </form>
      )}
    </div>
  );
}

/* ---------- Meteorologia ---------- */

export function WeatherCard({ cityId, t }: { cityId: string; t: Dict }) {
  const [w, setW] = useState<Weather | null>(null);
  useEffect(() => {
    fetch(`/api/weather?city=${cityId}`).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && !j.error) setW(j); }).catch(() => undefined);
  }, [cityId]);
  if (!w?.now) return null;
  const next = w.hours.slice(0, 8);
  const wet = next.find((h) => h.rain >= 50);
  const temps = next.map((h) => h.temp);
  return (
    <div className="weather">
      <span className="num"><b>{iconFor(w.now.code)} {fmt(t.wNow, { t: w.now.temp })}</b> · {fmt(t.wRange, { min: Math.min(...temps), max: Math.max(...temps) })}</span>
      <span className="hint">{wet ? fmt(t.wRain, { h: wet.t.slice(11, 16) }) : t.wDry}</span>
    </div>
  );
}
function iconFor(code: number): string {
  if (code === 0) return "☀️"; if (code <= 3) return "⛅"; if (code <= 48) return "🌫️";
  if (code <= 67 || (code >= 80 && code <= 82)) return "🌧️"; if (code <= 77 || code === 85 || code === 86) return "❄️"; return "⛈️";
}

/* ---------- Horários: fechado hoje ---------- */

export function weekdayIn(tz: string | undefined, now: number): number {
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: tz ?? "UTC", weekday: "short" }).format(new Date(now));
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
}
export function dayNames(cl: number[], locale: Locale): string {
  const base = new Date(Date.UTC(2026, 0, 4)); // domingo
  return cl.map((d) => new Date(base.getTime() + d * 86400e3).toLocaleDateString(INTL_LOCALE[locale], { weekday: "long", timeZone: "UTC" })).join(", ");
}

/* ---------- Áudio-guia ---------- */

export function Speak({ text, lang, fallback, t }: { text: string; lang: string; fallback?: string; t: Dict }) {
  const [on, setOn] = useState(false);
  const [ok, setOk] = useState(false);
  const [note, setNote] = useState("");
  const cur = useRef<import("@/lib/speech").Speaking | null>(null);
  useEffect(() => { void import("@/lib/speech").then((m) => setOk(m.speechAvailable())); return () => cur.current?.stop(); }, []);
  if (!ok) return null;
  async function toggle() {
    if (on) { cur.current?.stop(); setOn(false); return; }
    setOn(true); setNote("");
    try {
      const { speak } = await import("@/lib/speech");
      const sp = await speak(text, lang, fallback);
      cur.current = sp;
      if (sp.usedLang !== lang.slice(0, 2)) setNote(t.audioFallback);
      await sp.done;
    } finally { setOn(false); }
  }
  return (
    <>
      <button onClick={toggle} aria-pressed={on}>{on ? `■ ${t.stopAudio}` : `🔊 ${t.listen}`}</button>
      {note && <span className="hint audio-note">{note}</span>}
    </>
  );
}

/* ---------- Guia prático ---------- */

export function CityGuide({ city, cityLabel, t, locale, money }: {
  city: City; cityLabel: string; t: Dict; locale: Locale; money: (v: number) => React.ReactNode;
}) {
  const g = PRACTICAL[city.id];
  const [nat, setNat] = useState("");
  useEffect(() => { try { setNat(localStorage.getItem(NAT_KEY) ?? ""); } catch { /* ignorar */ } }, []);
  const tx = (o: { pt: string; en: string }) => (locale === "pt" ? o.pt : o.en);
  let natName = "";
  let natLocal = "";
  try {
    natName = nat ? new Intl.DisplayNames(["en"], { type: "region" }).of(nat) ?? "" : "";
    natLocal = nat ? new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "region" }).of(nat) ?? "" : "";
  } catch { /* ignorar */ }
  const c = city.stops[0];
  const embassy = `https://www.google.com/maps/search/${encodeURIComponent(natName ? `embassy of ${natName}` : "embassy")}/@${c.lat},${c.lng},13z`;
  return (
    <div className="stack">
      <h2 style={{ fontSize: 22 }}>{fmt(t.guideTitle, { city: cityLabel })}</h2>
      <div className="card rows" style={{ paddingBlock: 6 }}>
        {g && <div><span>🚨 {t.emergency}</span><a className="num" href={`tel:${g.emergency.split(" ")[0]}`}><b>{g.emergency}</b></a></div>}
        {city.ap && <div><span>✈ {t.airportLbl}</span><span>{city.ap.iata} · {city.ap.name}</span></div>}
        <div><span>🏛 {t.embassy}</span><ExtLink href={embassy}>{natLocal || "Google Maps"} ↗</ExtLink></div>
      </div>
      {g && (
        <div className="card stack" style={{ gap: 10, padding: 14 }}>
          {g.tips.map((tip, i) => (
            <div key={i}><span className="label">{(t.tipK as Record<string, string>)[tip.k]}</span><p>{tx(tip)}</p></div>
          ))}
        </div>
      )}
      {g && (
        <div className="card stack" style={{ gap: 8, padding: 14 }}>
          <b>🍽 {t.eatTitle}</b>
          {g.food.map((f) => (
            <div key={f.n} className="row-between"><div><b>{f.n}</b><p className="hint">{tx(f)}</p></div><span className="num">~{money(f.p)}</span></div>
          ))}
          <p className="hint">{t.eatNote}</p>
        </div>
      )}
      <ExitCheck city={city} locale={locale} t={t} compact />
    </div>
  );
}

/* ---------- Comer: melhores avaliados e mais baratos (Google) ---------- */

type EatItem = { id: string; name: string; rating: number; reviews: number; price: number | null; openNow: boolean | null; type: string | null; url: string };

export function EatNearby({ cityId, stopId, locale, t }: { cityId: string; stopId: string; locale: Locale; t: Dict }) {
  const [items, setItems] = useState<EatItem[] | null>(null);
  useEffect(() => {
    let live = true;
    fetch(`/api/eat?city=${cityId}&stop=${stopId}&locale=${locale}`)
      .then((r) => (r.ok ? r.json() : null)).then((j) => { if (live) setItems(j?.places ?? null); }).catch(() => undefined);
    return () => { live = false; };
  }, [cityId, stopId, locale]);
  if (!items) return null; // sem chave da Google ou sem ligação: fica só a ligação "Comer perto daqui"
  const nf = new Intl.NumberFormat(INTL_LOCALE[locale]);
  return (
    <div className="eat-best">
      <span className="label">🍽 {t.eatBest}</span>
      {items.length === 0 ? <p className="hint">{t.eatNone}</p> : items.map((e) => (
        <ExtLink key={e.id} href={e.url} className="eat-row">
          <span className="eat-name">{e.name}{e.type ? <small> · {e.type}</small> : null}</span>
          <span className="eat-meta num">★ {e.rating.toFixed(1)} <small>({nf.format(e.reviews)})</small>{e.price !== null ? ` · ${"€".repeat(Math.max(1, e.price))}` : ""}{e.openNow ? ` · ${t.openNow}` : ""}</span>
        </ExtLink>
      ))}
      <p className="hint">{t.eatSrc}</p>
    </div>
  );
}
