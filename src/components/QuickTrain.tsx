"use client";
/**
 * "Já estou num comboio": seguir a viagem sem reserva. A estação de partida vem da localização (a mais próxima);
 * o viajante só escolhe para onde vai (e, se souber, a hora de chegada). Fica só neste telemóvel.
 */
import { useEffect, useMemo, useState } from "react";
import type { Dict } from "@/i18n/dictionaries";
import type { Reservation } from "@/lib/trip-local";
import { LINE_STATIONS, normStation } from "@/data/rail-lines";
import { RAIL_STATIONS, STATIONS_WITH_COORDS } from "@/data/rail-stations";
import Portal from "./Portal";
import { askNotify } from "./JourneyFollow";
import { SheetX } from "./WinNav";

export const ADHOC_KEY = "sgct:jf-adhoc";
const OPS = ["Northern", "Avanti West Coast", "TransPennine Express", "CrossCountry", "Transport for Wales", "London Northwestern", "East Midlands Railway"];
type Pos = { lat: number; lng: number };
const dist = (a: Pos, b: Pos) => {
  const x = ((b.lng - a.lng) * Math.PI / 180) * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180), y = (b.lat - a.lat) * Math.PI / 180;
  return Math.sqrt(x * x + y * y) * 6371000;
};
const allStations = () => [...new Map([...LINE_STATIONS, ...STATIONS_WITH_COORDS].map((c) => [normStation(c.n), c])).values()];
const deviceTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "UTC"; } };
const hhmm = (d: Date, tz: string) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
const ymd = (d: Date, tz: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);

export function loadAdhoc(id: string): Reservation | null {
  try { const r = JSON.parse(localStorage.getItem(ADHOC_KEY) ?? "null") as Reservation | null; return r?.id === id ? r : null; } catch { return null; }
}

export function QuickTrain({ t, onStart, onClose }: { t: Dict; onStart: (r: Reservation) => void; onClose: () => void }) {
  const j = t.jf;
  const [pos, setPos] = useState<Pos | null>(null);
  const [geo, setGeo] = useState<"wait" | "ok" | "off">("wait");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [op, setOp] = useState("");
  const [arr, setArr] = useState("");
  const [err, setErr] = useState("");
  const stations = useMemo(allStations, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) { setGeo("off"); return; }
    navigator.geolocation.getCurrentPosition((p) => {
      const me = { lat: p.coords.latitude, lng: p.coords.longitude };
      setPos(me); setGeo("ok");
      const near = stations.map((s) => ({ s, d: dist(me, s) })).sort((a, b) => a.d - b.d)[0];
      if (near && near.d < 15_000) setFrom(near.s.n); // no comboio pode já ter passado a estação: até ~15 km
    }, () => setGeo("off"), { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 });
  }, [stations]);

  const start = () => {
    setErr("");
    const dest = stations.find((s) => normStation(s.n) === normStation(to));
    const fromSt = stations.find((s) => normStation(s.n) === normStation(from));
    if (!to.trim() || !from.trim()) { setErr(j.qtNeed); return; }
    const tz = deviceTz(), now = new Date();
    let arrHm = arr;
    if (!arrHm) {
      const a = pos ?? fromSt, b = dest;
      if (!a || !b) { setErr(j.qtNeedArr); return; }
      // Estimativa: distância por linha (~1,25× em linha reta) a ~60 km/h, mais 3 min. Indicada como estimativa.
      const min = Math.round((dist(a, b) * 1.25) / 1000) + 3;
      arrHm = hhmm(new Date(now.getTime() + min * 60_000), tz);
    }
    // A partida "agora" (ou há pouco): a localização corrige o resto.
    const depD = new Date(now.getTime() - 60_000);
    const dep = hhmm(depD, tz);
    const r: Reservation = {
      id: `adhoc-${now.getTime()}`, kind: "transport", title: `🚆 ${from} → ${to}`, city: "", localAt: `${ymd(depD, tz)}T${dep}`, tz,
      startsAt: new Date(now.getTime() - 60_000).toISOString(), place: "", lat: null, lng: null, ref: "", notes: arr ? "" : j.qtEst, photo: "", photos: [], paid: true,
      journey: { legs: [{ from, to, dep, arr: arrHm, op: op || undefined }] }
    };
    try { localStorage.setItem(ADHOC_KEY, JSON.stringify(r)); } catch { /* ignorar */ }
    onStart(r);
  };

  return (
    <Portal><div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={j.qtTitle}>
        <SheetX onClose={onClose} label={t.close} />
        <b style={{ fontSize: 18 }}>🚆 {j.qtTitle}</b>
        <p className="hint">{geo === "wait" ? j.qtLocating : geo === "off" ? j.gpsOff : from ? j.qtFound : j.qtNoStation}</p>
        <datalist id="qt-st">{[...new Set([...RAIL_STATIONS, ...stations.map((s) => s.n)])].sort().map((n) => <option key={n} value={n} />)}</datalist>
        <div className="field"><label htmlFor="qt-from">{t.jr.from}</label><input id="qt-from" list="qt-st" value={from} onChange={(e) => setFrom(e.target.value)} autoComplete="off" /></div>
        <div className="field"><label htmlFor="qt-to">{t.jr.to}</label><input id="qt-to" list="qt-st" value={to} onChange={(e) => setTo(e.target.value)} autoComplete="off" autoFocus /></div>
        <div className="field"><label htmlFor="qt-op">{t.jr.op}</label>
          <select id="qt-op" value={op} onChange={(e) => setOp(e.target.value)}><option value="">—</option>{OPS.map((o) => <option key={o}>{o}</option>)}</select></div>
        <div className="field"><label htmlFor="qt-arr">{j.qtArr}</label><input id="qt-arr" type="time" value={arr} onChange={(e) => setArr(e.target.value)} /></div>
        <small className="hint">{j.qtHint}</small>
        {err && <p className="err" role="alert">{err}</p>}
        <button type="button" className="btn press jf-start" onClick={() => { askNotify(); start(); }}>▶ {j.start}</button>
      </div>
    </div></Portal>
  );
}
