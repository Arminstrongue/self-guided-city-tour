"use client";
/**
 * Ferramentas durante o passeio, numa fila ao estilo iOS: Pausa, Bagagem, Encontro do grupo e Tempo livre.
 * Estado guardado no telemóvel por cidade (sgct:pause:<c>, sgct:bag:<c>), funciona sem rede exceto as listas "perto".
 */
import { useEffect, useState } from "react";
import { Coffee, Luggage, Timer, Users, X } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import Portal from "./Portal";
import { MeetMaker, type MeetPlace } from "./Meet";

type Near = { id: number; lat: number; lng: number; m: number; name: string; hours: string };
const read = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };
const write = (k: string, v: unknown) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignorar */ } };

function NearList({ t, kind, label }: { t: Dict; kind: string; label: string }) {
  const [items, setItems] = useState<Near[] | null>(null);
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((p) => {
      fetch(`/api/nearby?kind=${kind}&lat=${p.coords.latitude}&lng=${p.coords.longitude}`).then((r) => (r.ok ? r.json() : null))
        .then((j: { items?: Near[] } | null) => setItems(j?.items ?? [])).catch(() => setItems([]));
    }, () => setItems([]), { enableHighAccuracy: true, timeout: 12000 });
  }, [kind]);
  return (
    <div className="as-sec">
      <span className="as-h">{label}</span>
      <div className="as-group">
        {items === null && <div className="as-row"><span className="as-tx"><small>{t.dx.locating}</small></span></div>}
        {items?.length === 0 && <div className="as-row"><span className="as-tx"><small>{t.dx.none}</small></span></div>}
        {items?.slice(0, 5).map((x) => (
          <a key={x.id} className="as-row" href={`https://www.google.com/maps/dir/?api=1&destination=${x.lat},${x.lng}&travelmode=walking`} target="_blank" rel="noopener noreferrer">
            <span className="as-tx"><span>{x.name || label}</span>{x.hours && <small>{x.hours}</small>}</span><small className="num">{x.m < 1000 ? `${x.m} m` : `${(x.m / 1000).toFixed(1)} km`}</small>
          </a>
        ))}
      </div>
    </div>
  );
}

export function WalkTools({ t, locale, cityId, places, slack }: { t: Dict; locale: Locale; cityId: string; places: MeetPlace[]; slack: number | null }) {
  const d = t.dx;
  const [pause, setPause] = useState<number | null>(null);
  const [bag, setBag] = useState(false);
  const [sheet, setSheet] = useState<"pause" | "bag" | "meet" | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { setPause(read<number | null>(`sgct:pause:${cityId}`, null)); setBag(read(`sgct:bag:${cityId}`, false)); }, [cityId]);
  useEffect(() => { if (!pause) return; const i = setInterval(() => setNow(Date.now()), 20000); return () => clearInterval(i); }, [pause]);
  const pausedMin = pause ? Math.max(0, Math.round((now - pause) / 60000)) : 0;
  const startPause = () => { const at = Date.now(); setPause(at); setNow(at); write(`sgct:pause:${cityId}`, at); setSheet("pause"); };
  const endPause = () => { setPause(null); write(`sgct:pause:${cityId}`, null); setSheet(null); };
  const setBagOn = (v: boolean) => { setBag(v); write(`sgct:bag:${cityId}`, v || null); };
  const c = places[0];
  const freeHref = `/${locale}/free?city=${cityId}${bag ? "&bag=1" : ""}`;

  const tiles = [
    { k: "pause", I: Coffee, label: pause ? `${d.pause} · ${pausedMin} min` : d.pause, on: Boolean(pause), run: () => (pause ? setSheet("pause") : startPause()) },
    { k: "bag", I: Luggage, label: bag ? d.bagOn : d.bag, on: bag, run: () => { if (!bag) setBagOn(true); setSheet("bag"); } },
    { k: "meet", I: Users, label: d.meet, on: false, run: () => setSheet("meet") },
    { k: "free", I: Timer, label: d.free, on: false, href: freeHref }
  ];
  return (
    <section className="wt" aria-label={d.tools}>
      <div className="wt-row">
        {tiles.map((x) => {
          const inner = <><span className="wt-ic"><x.I size={20} aria-hidden="true" /></span><small>{x.label}</small></>;
          return x.href ? <a key={x.k} className="wt-i press" href={x.href}>{inner}</a>
            : <button key={x.k} type="button" className={`wt-i press ${x.on ? "on" : ""}`} aria-pressed={x.on} onClick={x.run}>{inner}</button>;
        })}
      </div>
      {pause && sheet !== "pause" && (
        <button type="button" className="wt-bar press" onClick={() => setSheet("pause")}><Coffee size={16} aria-hidden="true" /> {fmt(d.pausing, { m: pausedMin })}<b>{d.resume}</b></button>
      )}

      {sheet && (
        <Portal><div className="as-bg" onClick={() => setSheet(null)}>
          <div className="as wt-sheet" role="dialog" aria-modal="true" aria-label={d[sheet]} onClick={(e) => e.stopPropagation()}>
            <span className="as-grab" aria-hidden="true" />
            <div className="nn-sh-h"><span /><b>{d[sheet]}</b><button type="button" className="mu2-x nn-x" onClick={() => setSheet(null)} aria-label={t.close}><X size={18} aria-hidden="true" /></button></div>
            {sheet === "pause" && <>
              <div className="as-sec"><div className="as-group as-msg wt-msg">
                <b className="num">{fmt(d.pausing, { m: pausedMin })}</b>
                {slack !== null && <small>{slack > 0 ? fmt(d.slack, { m: slack }) : d.tight}</small>}
              </div></div>
              <NearList t={t} kind="rest" label={d.rest} />
              <NearList t={t} kind="toilets" label={t.nn.items.toilet} />
              <button type="button" className="btn tram press wt-go" onClick={endPause}>{d.resume}</button>
            </>}
            {sheet === "bag" && <>
              <div className="as-sec"><div className="as-group as-msg wt-msg"><b>🧳 {d.bagOn}</b><small>{d.bagHint}</small></div></div>
              <NearList t={t} kind="luggage" label={d.bagStore} />
              <a className="nn-more" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("luggage storage")}${c ? `&center=${c.lat},${c.lng}` : ""}`} target="_blank" rel="noopener noreferrer">{t.arv.openMaps} ↗</a>
              <button type="button" className="as-cancel" onClick={() => { setBagOn(false); setSheet(null); }}>{d.off}</button>
            </>}
            {sheet === "meet" && <div className="as-sec"><MeetMaker t={t} locale={locale} places={places} onDone={() => setSheet(null)} /></div>}
          </div>
        </div></Portal>
      )}
    </section>
  );
}
