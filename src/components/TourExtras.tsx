"use client";
import { zonedToDate } from "@/lib/zoned";
import { cityNowLocal } from "@/lib/trip";
import { lineText } from "@/data/stop-names";
/** Peças do roteiro: escolher o roteiro pelo tempo, GPS e regresso, voo em direto, meteorologia, áudio e guia prático. */
import { useEffect, useRef, useState } from "react";
import type { City, Leg, Stop } from "@/data/cities";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { FAR_KM, km, returnEstimate, walkMin, type RouteOption } from "@/lib/route-cost";
import { AIRPORT_BUFFER_MIN } from "@/lib/pricing";
import type { Weather } from "@/lib/weather";
import type { FlightStatus } from "@/lib/flight";
import { ExtLink } from "./ExtLink";
import Portal from "./Portal";
import { SheetX } from "./WinNav";
import { Share2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { routeSharePath } from "@/lib/route-share";
import { suggestNext, type SgStop } from "@/lib/next-suggest";

const hrs = (m: number) => { const v = Math.max(0, Math.round(m)); return `${Math.floor(v / 60)} h ${String(v % 60).padStart(2, "0")}`; };

/* ---------- Roteiro pelo tempo livre ---------- */

const MODE_ICON: Record<Leg["m"], string> = { walk: "🚶", metro: "🚇", tram: "🚊", bus: "🚌", train: "🚆", ferry: "⛴", car: "🚕" };

export function RouteFit({ options, value, onChange, availMin, t, extName, locale, single, money, from, tz, ticket, night = false, share }: {
  options: RouteOption[]; value: string; onChange: (k: string) => void; availMin: number | null; t: Dict; extName: string;
  locale: Locale; single: number; money: (v: number) => string; from: { lat: number; lng: number; n: string } | null; tz: string; ticket?: string; night?: boolean;
  /** Partilhar o roteiro escolhido com amigos (link com as paragens; nunca a posição). */
  share?: { cityId: string; cityName: string; fromName: string | null };
}) {
  const [times, setTimes] = useState<{ a: { lat: number; lng: number; n: string }; b: Stop } | null>(null);
  // Estilo iOS: escolha compacta da duração (pílulas) e, por baixo, as paragens do roteiro escolhido com nome.
  const i = Math.max(0, options.findIndex((o) => o.key === value));
  const cur = options[i];
  const prev = new Set(i > 0 ? options[i - 1].plan.stops.map((s) => s.id) : []);
  const ok = (o: RouteOption) => (availMin === null ? null : o.plan.minutesTour <= availMin);
  async function shareRoute(o: RouteOption) {
    if (!share) return;
    const url = location.origin + routeSharePath(locale, share.cityId, o.plan.stops.map((s) => s.id), share.fromName);
    const text = fmt(t.rs.msg, { n: o.plan.stops.length, c: share.cityName, h: hrs(o.plan.minutesTour) });
    try {
      if (navigator.share) await navigator.share({ title: t.rs.title, text, url });
      else { await navigator.clipboard.writeText(`${text}\n${url}`); toast(t.rs.copied); }
    } catch { /* partilha cancelada */ }
  }
  return (
    <div className="rf">
      <span className="rf-t">{t.fitTitle}</span>
      <div className="rf-pills" role="radiogroup" aria-label={t.fitTitle}>
        {options.map((o) => {
          const f = ok(o);
          return (
            <button key={o.key} type="button" role="radio" aria-checked={o.key === value} className={`rf-p${o.key === value ? " on" : ""}${f === false ? " no" : ""}`} onClick={() => onChange(o.key)}>
              <b className="num">{hrs(o.plan.minutesTour)}</b>
              <small>{fmt(t.fitOpt, { n: o.plan.stops.length, h: "" }).replace(/\s*·\s*$/, "")}</small>
              {f === true && <i className="rf-dot" role="img" aria-label={t.fitsTag} />}
              {f === false && <span className="sr-only">{t.tooLong}</span>}
            </button>
          );
        })}
      </div>
      {cur && (
        <div className="rf-card">
          <div className="rf-sum">
            <span>{t.rfStops}</span>
            {cur.key === "ext" && <small>+ {extName}</small>}
            {ok(cur) === false && <small className="rf-warn">{t.tooLong}</small>}
          </div>
          {night && <p className="rf-night">🌙 {t.tg.night}</p>}
          <ol className="rf-list">
            {cur.plan.stops.map((s, k) => {
              const l = s.leg, price = (l.r ?? 0) * single + (l.f ?? 0);
              const a = k === 0 ? from : { lat: cur.plan.stops[k - 1].lat, lng: cur.plan.stops[k - 1].lng, n: cur.plan.stops[k - 1].n };
              return (
                <li key={s.id} className={i > 0 && !prev.has(s.id) ? "new" : ""}>
                  <span className="rf-n num">{k + 1}</span>
                  <span className="rf-name">{s.n}
                    {night && s.o && <small className="rf-out">🌙 {t.tg.outside}</small>}
                    <small className="rf-leg">{MODE_ICON[l.m]} {l.m === "walk" ? t.walk : t[l.m]}{l.line ? ` · ${lineText(l.line, locale)}` : ""} · {l.min} min · {price > 0 ? money(price) : t.free}</small>
                  </span>
                  {l.m !== "walk" && a && <button type="button" className="rf-tbtn" onClick={() => setTimes({ a, b: s })}>{t.rfTimes}</button>}
                  {i > 0 && !prev.has(s.id) && <span className="rf-new">+</span>}
                </li>
              );
            })}
          </ol>
          {share && (
            <button type="button" className="rf-share press" onClick={() => void shareRoute(cur)}>
              <Share2 size={18} aria-hidden="true" />
              <span className="ios-tx"><b>{t.rs.share}</b><small>{t.rs.shareSub}</small></span>
            </button>
          )}
        </div>
      )}
      {times && <TransitSheet a={times.a} b={times.b} t={t} locale={locale} tz={tz} onClose={() => setTimes(null)}
        fallback={{ how: `${MODE_ICON[times.b.leg.m]} ${t[times.b.leg.m]}${times.b.leg.line ? ` · ${lineText(times.b.leg.line, locale)}` : ""}`, min: times.b.leg.min,
          price: (times.b.leg.r ?? 0) * single + (times.b.leg.f ?? 0) > 0 ? money((times.b.leg.r ?? 0) * single + (times.b.leg.f ?? 0)) : t.free, ticket: ticket ?? "" }} />}
    </div>
  );
}

type TLine = { name: string; vehicle: string; color: string; from: string; to: string; headsign: string; dep: string; stops: number };
type TOpt = { dep: string; arr: string; min: number; fare: string; walkMin: number; lines: TLine[] };

/** Próximas ligações em transportes públicos entre duas paragens: linhas, horas, duração e preço. */
function TransitSheet({ a, b, t, locale, tz, onClose, fallback }: {
  a: { lat: number; lng: number; n: string }; b: Stop; t: Dict; locale: Locale; tz: string; onClose: () => void;
  fallback: { how: string; min: number; price: string; ticket: string };
}) {
  const [opts, setOpts] = useState<TOpt[] | null>(null);
  useEffect(() => {
    let live = true;
    fetch(`/api/transit?from=${a.lat},${a.lng}&to=${b.lat},${b.lng}&lang=${locale}`).then((r) => (r.ok ? r.json() : null))
      .then((j: { options?: TOpt[] } | null) => { if (live) setOpts(j?.options ?? []); }).catch(() => { if (live) setOpts([]); });
    return () => { live = false; };
  }, [a.lat, a.lng, b.lat, b.lng, locale]);
  const hm = (iso: string) => (iso ? new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "");
  const maps = `https://www.google.com/maps/dir/?api=1&origin=${a.lat},${a.lng}&destination=${b.lat},${b.lng}&travelmode=transit`;
  return (
    <Portal><div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack" style={{ gap: 14 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={t.trTitle}>
        <SheetX onClose={onClose} label={t.close} />
        <div className="stack" style={{ gap: 2 }}><b style={{ fontSize: 20 }}>{t.trTitle}</b><span className="hint">{fmt(t.trFrom, { a: a.n, b: b.n })}</span></div>
        {opts === null ? <p className="hint">…</p> : opts.length === 0 ? (
          // Sem horários ao vivo: a informação habitual do trajeto (identificada como tal), em vez de um beco sem saída.
          <div className="tr-static">
            <b>{t.trs.title}</b>
            <ul className="ios-group">
              <li className="ios-li"><span className="ios-tx"><b>{fallback.how}</b><small>{fallback.min} min · {fallback.price}</small></span></li>
              {fallback.ticket && <li className="ios-li"><span className="ios-tx"><small>{fmt(t.trs.ticket, { x: fallback.ticket })}</small></span></li>}
              <li className="ios-li"><span className="ios-tx"><small>{t.trs.buy}</small></span></li>
            </ul>
            <p className="hint">{t.trs.note}</p>
          </div>
        ) : (
          <ul className="ios-group">
            {opts.map((o, k) => (
              <li key={k} className="tr-o">
                <div className="tr-h"><b className="num">{hm(o.dep)} → {hm(o.arr)}</b><span className="num">{o.min} min{o.fare ? ` · ${o.fare}` : ""}</span></div>
                <div className="tr-lines">
                  {o.lines.map((l, j) => (
                    <span key={j} className="tr-l">
                      <i className="tr-chip" style={l.color ? { background: l.color, color: "#fff" } : undefined}>{l.name || l.vehicle}</i>
                      <small>{hm(l.dep)} · {l.from}{l.headsign ? ` → ${l.headsign}` : ""}{l.stops ? ` · ${fmt(t.trStops, { n: l.stops })}` : ""}</small>
                    </span>
                  ))}
                  {o.walkMin > 0 && <small className="hint">🚶 {fmt(t.trWalk, { n: o.walkMin })}</small>}
                </div>
              </li>
            ))}
          </ul>
        )}
        <ExtLink href={maps} className="btn ghost">{t.trMaps} ↗</ExtLink>
        <p className="hint">{t.trSrc}</p>
      </div>
    </div></Portal>
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
    if (watch.current !== null) return; // já está a seguir: tocar outra vez não abre um segundo GPS (bateria)
    watch.current = navigator.geolocation.watchPosition(
      (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setState("on"); },
      // Só "recusado" quando a pessoa recusou; sem sinal ou demora não é recusa (o GPS continua a tentar).
      (e) => { if (e.code === 1) setState("denied"); },
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
      <p className="hint">{fmt(t.backLine, { l: lineText(city.ret.core.line, locale) })}</p>
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
    const i = setInterval(() => { if (document.visibilityState === "visible") void load(); }, 10 * 60_000);
    return () => clearInterval(i);
  }, [enabled, flightNo, flightAt, city.tz, city.ap?.iata]);

  useEffect(() => {
    if (!flightAt) return;
    // Sempre na hora da cidade (não na do telemóvel), como no resto da app.
    setWhen(cityNowLocal(city.tz ?? "UTC", 0, flightAt.getTime()));
  }, [flightAt, city.tz]);

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
          const d = zonedToDate(when, city.tz ?? "UTC");
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

// Um só pedido de meteorologia por cidade (o cartão do tempo e a sugestão "para agora" partilham-no; renova a cada 15 min).
const wxMemo = new Map<string, { at: number; p: Promise<(Weather & { error?: string }) | null> }>();
function getWeather(id: string) {
  const m = wxMemo.get(id);
  if (m && Date.now() - m.at < 15 * 60_000) return m.p;
  const p: Promise<(Weather & { error?: string }) | null> = fetch(`/api/weather?city=${id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  wxMemo.set(id, { at: Date.now(), p });
  return p;
}

export function WeatherCard({ cityId, t, locale }: { cityId: string; t: Dict; locale?: Locale }) {
  const [w, setW] = useState<Weather | null>(null);
  useEffect(() => {
    void getWeather(cityId).then((j) => { if (j && !j.error) setW(j); });
  }, [cityId]);
  if (!w?.now) return null;
  const next = w.hours.slice(0, 8);
  const wet = next.find((h) => h.rain >= 50);
  const temps = next.map((h) => h.temp);
  return (
    <div className="weather">
      <span className="num"><b>{iconFor(w.now.code)} {fmt(t.wNow, { t: w.now.temp })}</b>{Math.min(...temps) !== Math.max(...temps) ? <> · {fmt(t.wRange, { min: Math.min(...temps), max: Math.max(...temps) })}</> : null}</span>
      <span className="hint">{wet ? fmt(t.wRain, { h: wet.t.slice(11, 16) }) : t.wDry}</span>
      {w.at && Date.now() - w.at > 45 * 60_000 && <span className="hint stale">{fmt(t.lvUpdated, { t: new Date(w.at).toLocaleTimeString(locale ? INTL_LOCALE[locale] : undefined, { hour: "2-digit", minute: "2-digit" }) })}</span>}
      <span className="hint wx-src"><a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Weather data by Open-Meteo.com</a></span>
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
type MuseumLite = { id: string; n: string; lat: number; lng: number; price: number; h: [number[], string, string][]; book?: boolean; url: string };

export function NextCard({ city, stops, done, museums, today, money, onDone, onOpen, t, locale, startHop, backLabel, pos, onward }: {
  city: City; stops: Stop[]; done: Record<string, boolean>; museums: MuseumLite[]; today: number; pos?: { lat: number; lng: number } | null;
  startHop?: { m: "walk" | "metro"; min: number } | null; backLabel?: string;
  money: (v: number) => string; onDone: (id: string) => void; onOpen: (id: string) => void; t: Dict; locale: Locale;
 onward?: React.ReactNode;}) {
  const idx = stops.findIndex((s) => !done[s.id]);
  // Tempo nas próximas horas (chuva ou calor), para a sugestão "para agora".
  const [wx, setWx] = useState<{ rain: boolean; hot: boolean } | null>(null);
  useEffect(() => {
    void getWeather(city.id).then((w) => {
      if (!w || w.error || !w.hours) return;
      const next = w.hours.slice(0, 3);
      setWx({ rain: next.some((h) => h.rain >= 60), hot: next.some((h) => h.temp >= 32) });
    }).catch(() => null);
  }, [city.id]);
  // "Cheguei" longe da paragem: pergunta antes de marcar.
  const [far, setFar] = useState<{ id: string; d: number } | null>(null);
  const markHere = (s: Stop) => {
    const decide = (p: { lat: number; lng: number } | null) => { const d = p ? km(p, s) : null; if (d !== null && d > 0.4) setFar({ id: s.id, d }); else onDone(s.id); };
    if (pos) return decide(pos);
    // Sem posição ainda: pede-a uma vez; se não houver (recusada ou sem GPS), confia no viajante.
    if (!navigator.geolocation) return decide(null);
    navigator.geolocation.getCurrentPosition((g) => decide({ lat: g.coords.latitude, lng: g.coords.longitude }), () => decide(null), { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 });
  };
  if (idx < 0) {
    return (
      <div className="card nx nx-done">
        <b>{t.nxDoneT}</b>
        <p className="hint">{backLabel ?? fmt(t.nxDoneS, { l: lineText(city.ret.core.line, locale) })}</p>
        {onward}
      </div>
    );
  }
  const s = stops[idx];
  const leg: Leg = idx === 0 ? (startHop ? { m: startHop.m === "walk" ? "walk" : "metro", min: startHop.min } : city.air) : s.leg;
  const after = stops.slice(idx + 1).find((x) => !done[x.id]);
  const how = leg.m === "walk" ? `${t.walk} · ${leg.min} min` : idx === 0 && startHop ? `${t.bpTransit} · ~${leg.min} min` : `${t[leg.m]}${leg.line ? ` · ${lineText(leg.line, locale)}` : ""} · ${leg.min} min`;
  const mus = museums.map((m) => ({ m, d: km(m, s) })).filter((x) => x.d < 0.35).sort((a, b) => a.d - b.d)[0]?.m;
  const closedToday = Boolean(s.cl?.includes(today));
  let status: { cls: string; txt: string } | null = null;
  if (closedToday) status = { cls: "bad", txt: t.nxClosedToday };
  else if (mus) {
    const block = mus.h.find(([d]) => d.includes(today));
    const hm = new Intl.DateTimeFormat("en-GB", { timeZone: city.tz ?? "UTC", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).replace(/^24/, "00");
    if (!block) status = { cls: "bad", txt: t.nxClosedToday };
    else if (hm >= block[1] && hm < block[2]) status = { cls: "ok", txt: fmt(t.nxOpenUntil, { t: block[2] }) };
    else status = { cls: "warn", txt: fmt(t.nxClosedNow, { a: block[1], b: block[2] }) };
  }
  const mode = leg.m === "walk" ? "walking" : "transit";
  const dir = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=${mode}`;
  const hmNow = new Intl.DateTimeFormat("en-GB", { timeZone: city.tz ?? "UTC", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).replace(/^24/, "00");
  const remaining: SgStop[] = stops.filter((x) => !done[x.id]).map((x) => {
    const mm = museums.map((m) => ({ m, d: km(m, x) })).filter((y) => y.d < 0.35).sort((u, v) => u.d - v.d)[0]?.m;
    const b = mm?.h.find(([d]) => d.includes(today));
    return { id: x.id, n: x.n, lat: x.lat, lng: x.lng, v: x.v, closedToday: Boolean(x.cl?.includes(today)) || Boolean(mm && !b), hours: b ? [b[1], b[2]] as [string, string] : null };
  });
  const sg = suggestNext({ remaining, pos, nowHM: hmNow, rainSoon: wx?.rain, hot: wx?.hot });
  const sgStop = sg ? stops.find((x) => x.id === sg.id) : null;
  const sgWhy = sg ? (sg.reason === "closing" ? fmt(t.sgClosing, { t: sg.closes ?? "" }) : sg.reason === "rain" ? t.sgRain : sg.reason === "heat" ? t.sgHeat : fmt(t.sgNear, { m: sg.walkMin ?? 1 })) : "";
  const farStop = far ? stops.find((x) => x.id === far.id) : null;
  return (
    <div className="card nx" aria-live="polite">
      <div className="nx-top">
        <span className="nx-label">{t.nxLabel}</span>
        <span className="nx-step">{fmt(t.nxStep, { n: idx + 1, N: stops.length })}</span>
      </div>
      <button className="nx-name" onClick={() => onOpen(s.id)}><b>{s.n}</b><small>{s.a} · {s.v} min</small></button>
      <div className="nx-rows">
        <div className="nx-row"><span aria-hidden="true">{leg.m === "walk" ? "🚶" : leg.m === "car" ? "🚕" : "🚇"}</span><span><small>{t.nxHow}</small>{how}</span></div>
        {status && <div className={`nx-row ${status.cls}`}><span aria-hidden="true">🕒</span><span>{status.txt}</span></div>}
        {(s.o || (mus && mus.price > 0)) && (
          <div className="nx-row"><span aria-hidden="true">🎟</span><span>
            {t.nxEntry}{mus && mus.price > 0 ? ` · ${money(mus.price)}` : ` · ${t.optPaid}`}
            {mus?.book ? ` · ${t.nxBook}` : ""}
            {mus && <> · <ExtLink href={mus.url}>{t.nxTickets}</ExtLink></>}
          </span></div>
        )}
        {after && <div className="nx-row dim"><span aria-hidden="true">↪</span><span>{fmt(t.nxThen, { s: after.n })}</span></div>}
      </div>
      {sgStop && sg && sg.id !== s.id && (
        <button type="button" className="nx-sg press" onClick={() => onOpen(sgStop.id)}>
          <span aria-hidden="true">✨</span><span><small>{t.sgTitle}</small><b>{sgStop.n}</b><em>{sgWhy}</em></span><span className="nx-sg-go">{t.sgGo} ›</span>
        </button>
      )}
      {sgStop && sg && sg.id === s.id && <p className="nx-sg-note">✨ {sgWhy}</p>}
      {far && farStop ? (
        <div className="nx-far" role="alertdialog" aria-live="assertive">
          <p>{fmt(t.nxFar, { d: far.d < 1 ? `${Math.round(far.d * 1000)} m` : `${far.d.toFixed(1)} km`, s: farStop.n })}</p>
          <div className="nx-acts"><button className="btn tram" onClick={() => setFar(null)}>{t.nxFarNo}</button><button className="btn ghost" onClick={() => { onDone(far.id); setFar(null); }}>{t.nxFarYes}</button></div>
        </div>
      ) : (
      <div className="nx-acts">
        <ExtLink className="btn tram" href={dir}>{t.directions}</ExtLink>
        <button className="btn ghost" onClick={() => markHere(s)}>{t.nxHere}</button>
      </div>
      )}
    </div>
  );
}
