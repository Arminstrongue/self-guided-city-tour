"use client";
/** "Tenho X minutos livres": escolhe o tempo e o ponto de partida; mostra um mini-roteiro que volta ao início a tempo. */
import { useEffect, useMemo, useState } from "react";
import { Clock, LocateFixed, MapPinned, Navigation } from "lucide-react";
import type { Dict } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import { freeLoop, freeSingles, walkUrl, type FreeStop } from "@/lib/free-time";

const MINS = [20, 40, 60, 90, 120];
type P = { lat: number; lng: number };

export function FreeTime({ t, cityName, center, stops, initial }: { t: Dict; cityName: string; center: P; stops: FreeStop[]; initial?: { min?: number; at?: P; bag?: boolean } }) {
  const d = t.dx;
  const [min, setMin] = useState(initial?.min && MINS.includes(initial.min) ? initial.min : 40);
  const [from, setFrom] = useState<"here" | "center">(initial?.at ? "here" : "center");
  const [pos, setPos] = useState<P | null>(initial?.at ?? null);
  const [locating, setLocating] = useState(false);
  const [err, setErr] = useState("");
  const bag = Boolean(initial?.bag);
  function locate() {
    setFrom("here"); setErr("");
    if (!navigator.geolocation) { setErr(t.bpDenied); setFrom("center"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition((p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocating(false); },
      () => { setErr(t.bpDenied); setFrom("center"); setLocating(false); }, { enableHighAccuracy: true, timeout: 12000 });
  }
  useEffect(() => { if (initial?.at) setPos(initial.at); }, [initial?.at]);
  const start = from === "here" && pos ? pos : center;
  const slow = bag ? 1.25 : 1;
  const loop = useMemo(() => freeLoop(start, stops, min, slow), [start, stops, min, slow]);
  const singles = useMemo(() => freeSingles(start, stops, min, slow), [start, stops, min, slow]);

  return (
    <div className="ft">
      <h1 className="arv-h">{d.free}</h1>
      <p className="ess-sub">{d.freeSub} · {cityName}</p>
      <section className="ess-card">
        <span className="ess-h"><Clock size={18} aria-hidden="true" /> {d.freeTitle}</span>
        <div className="ios-seg ft-seg" role="radiogroup" aria-label={d.freeTitle}>
          {MINS.map((m) => <button key={m} type="button" role="radio" aria-checked={m === min} className={m === min ? "on" : ""} onClick={() => setMin(m)}>{m < 60 ? `${m} min` : m % 60 ? `${Math.floor(m / 60)} h ${m % 60}` : `${m / 60} h`}</button>)}
        </div>
        <span className="ess-h"><MapPinned size={18} aria-hidden="true" /> {d.freeFrom}</span>
        <div className="ios-seg ft-seg" role="radiogroup" aria-label={d.freeFrom}>
          <button type="button" role="radio" aria-checked={from === "here"} className={from === "here" ? "on" : ""} onClick={locate}><LocateFixed size={15} aria-hidden="true" /> {locating ? d.locating : d.freeHere}</button>
          <button type="button" role="radio" aria-checked={from === "center"} className={from === "center" ? "on" : ""} onClick={() => setFrom("center")}>{d.freeCenter}</button>
        </div>
        {err && <small className="ess-muted">{err}</small>}
        {bag && <small className="ess-muted">🧳 {d.bagOn}</small>}
      </section>

      {loop.stops.length === 0 ? <p className="ess-card ess-muted">{d.freeNone}</p> : (
        <section className="ess-card">
          <b className="ess-big">{fmt(d.freeLoop, { n: loop.stops.length, m: loop.total })}</b>
          <ol className="ft-list">
            {loop.stops.map((s, i) => (
              <li key={s.id}><span className="ft-n num">{i + 1}</span><span className="ess-tx"><b>{s.n}{s.top ? " ★" : ""}</b><small>{fmt(d.freeWalk, { w: s.walk, v: s.visit })}</small></span></li>
            ))}
          </ol>
          <small className="ess-muted">{d.freeBack} ({loop.back} min)</small>
          <a className="btn tram press" href={walkUrl(start, loop.stops)} target="_blank" rel="noopener noreferrer"><Navigation size={18} aria-hidden="true" /> {d.freeOpen}</a>
        </section>
      )}

      {singles.length > loop.stops.length && (
        <section className="ess-card">
          <span className="ess-h">{d.freeOne}</span>
          <div className="ios-group">
            {singles.map((s) => (
              <a key={s.id} className="ios-row press" href={walkUrl(start, [s])} target="_blank" rel="noopener noreferrer">
                <span className="ios-tx"><b>{s.n}{s.top ? " ★" : ""}</b><small>{fmt(d.freeWalk, { w: s.walk, v: s.visit })}</small></span>
                <span className="num ft-tot">{2 * s.walk + s.visit} min</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
