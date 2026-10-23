"use client";
/**
 * "De que precisa agora?": quatro entradas para quem acabou de chegar, está perdido ou tem uma necessidade imediata.
 * "Preciso de algo perto" abre o mapa com pesquisas úteis à volta do viajante (não lista estabelecimentos comerciais).
 */
import { useEffect, useState } from "react";
import { fmt } from "@/i18n/core";
import { arrivalsFor } from "@/data/arrivals";
import { BatteryCharging, ChevronRight, CloudOff, History, Timer, Compass, Cross, Droplets, Landmark, Luggage, MapPinned, Pill, PlaneLanding, Search, Toilet, Utensils, Wifi, X } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import Portal from "./Portal";

const NEAR: { k: keyof Dict["nn"]["items"]; q: string; I: typeof Toilet }[] = [
  { k: "toilet", q: "public toilet", I: Toilet }, { k: "water", q: "drinking water fountain", I: Droplets }, { k: "luggage", q: "luggage storage", I: Luggage },
  { k: "food", q: "restaurants open now", I: Utensils }, { k: "pharmacy", q: "pharmacy", I: Pill }, { k: "wifi", q: "free wifi", I: Wifi },
  { k: "charge", q: "phone charging station", I: BatteryCharging }, { k: "atm", q: "atm", I: Landmark }, { k: "hospital", q: "urgent care hospital", I: Cross }
];

type NearItem = { id: number; lat: number; lng: number; m: number; name: string; hours: string; fee: string; price: string; wheelchair: string; changing: boolean; indoor: boolean };
const API: Partial<Record<keyof Dict["nn"]["items"], string>> = { luggage: "luggage", toilet: "toilets", water: "water", pharmacy: "pharmacy", atm: "atm", wifi: "wifi", charge: "charge" };

export function NearSheet({ t, onClose }: { t: Dict; onClose: () => void }) {
  const [kind, setKind] = useState<keyof Dict["nn"]["items"] | null>(null);
  const [items, setItems] = useState<NearItem[] | null>(null);
  const [err, setErr] = useState("");
  function pick(k: keyof Dict["nn"]["items"], q: string) {
    if (!API[k]) { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, "_blank", "noopener"); return; }
    setKind(k); setItems(null); setErr("");
    navigator.geolocation?.getCurrentPosition((p) => {
      fetch(`/api/nearby?kind=${API[k]}&lat=${p.coords.latitude}&lng=${p.coords.longitude}`).then((r) => (r.ok ? r.json() : null))
        .then((j: { items?: NearItem[] } | null) => setItems(j?.items ?? [])).catch(() => setItems([]));
    }, () => { setErr(t.bpDenied); setItems([]); }, { enableHighAccuracy: true, timeout: 12000 });
  }
  const q = NEAR.find((n) => n.k === kind)?.q ?? "";
  if (kind) return (
    <Portal><div className="as-bg" onClick={onClose}>
      <div className="as nn-sheet" role="dialog" aria-modal="true" aria-label={t.nn.items[kind]} onClick={(e) => e.stopPropagation()}>
        <span className="as-grab" aria-hidden="true" />
        <div className="nn-sh-h"><button type="button" className="mu2-x nn-x" onClick={() => setKind(null)} aria-label={t.arv.back}><ChevronRight size={18} style={{ transform: "rotate(180deg)" }} aria-hidden="true" /></button><b>{t.nn.items[kind]}</b><button type="button" className="mu2-x nn-x" onClick={onClose} aria-label={t.close}><X size={18} aria-hidden="true" /></button></div>
        <div className="as-group nn-res">
          {items === null ? <p className="nn-load">…</p> : items.length === 0 ? <p className="nn-load">{err || t.bpNone}</p> : items.map((x) => (
            <a key={x.id} className="as-row" href={`https://www.google.com/maps/dir/?api=1&destination=${x.lat},${x.lng}&travelmode=walking`} target="_blank" rel="noopener noreferrer">
              <span className="as-tx"><span>{x.name || t.nn.items[kind]}</span>
                <small>{x.m < 1000 ? `${x.m} m` : `${(x.m / 1000).toFixed(1)} km`} · ≈ {Math.max(1, Math.round(x.m / 80))} min{x.hours ? ` · ${x.hours}` : ""}{x.fee === "yes" ? ` · 💷${x.price ? ` ${x.price}` : ""}` : x.fee === "no" ? " · ✓ free" : ""}{x.wheelchair === "yes" ? " · ♿" : ""}{x.changing ? " · 🚼" : ""}</small></span>
              <ChevronRight size={18} className="as-chev" aria-hidden="true" />
            </a>
          ))}
        </div>
        <a className="nn-more" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer">{t.arv.openMaps} ↗</a>
        <p className="nn-note">{t.nn.nearNote} · © OpenStreetMap</p>
      </div>
    </div></Portal>
  );
  return (
    <Portal><div className="as-bg" onClick={onClose}>
      <div className="as nn-sheet" role="dialog" aria-modal="true" aria-label={t.nn.near} onClick={(e) => e.stopPropagation()}>
        <span className="as-grab" aria-hidden="true" />
        <div className="nn-sh-h"><b>{t.nn.near}</b><button type="button" className="mu2-x nn-x" onClick={onClose} aria-label={t.close}><X size={18} aria-hidden="true" /></button></div>
        <div className="nn-grid">
          {NEAR.map((n) => (
            <button key={n.k} type="button" className="nn-near press" onClick={() => pick(n.k, n.q)}>
              <span className="nn-near-ic"><n.I size={22} aria-hidden="true" /></span><span>{t.nn.items[n.k]}</span>
            </button>
          ))}
        </div>
        <p className="nn-note">{t.nn.nearNote}</p>
      </div>
    </div></Portal>
  );
}

export function NeedNow({ t, locale, city = "lon", compact = false }: { t: Dict; locale: Locale; city?: string; compact?: boolean }) {
  const [near, setNear] = useState(false);
  const tiles = [
    { k: "arr", I: PlaneLanding, label: t.nn.arrived, sub: t.nn.arrivedSub, href: `/${locale}/arrive?city=${city}`, main: true },
    { k: "go", I: MapPinned, label: t.nn.go, sub: t.nn.goSub, href: `/${locale}/arrive?city=${city}&go=1` },
    { k: "near", I: Search, label: t.nn.near, sub: t.nn.nearSub, run: () => setNear(true) },
    { k: "exp", I: Compass, label: t.nn.explore, sub: t.nn.exploreSub, href: `/${locale}/start?city=${city}` },
    { k: "free", I: Timer, label: t.dx.free, sub: t.dx.freeSub, href: `/${locale}/free?city=${city}` },
    { k: "ess", I: CloudOff, label: t.ess.essentials, sub: t.ess.sub, href: `/${locale}/wallet/essentials?city=${city}` }
  ];
  return (
    <section className={`nn ${compact ? "compact" : ""}`} aria-labelledby="nn-h">
      <h2 id="nn-h" className="nn-h">{t.nn.title}</h2>
      <Resume t={t} locale={locale} />
      <div className="nn-tiles">
        {tiles.map((x) => {
          const inner = <><span className="nn-ic"><x.I size={22} aria-hidden="true" /></span><span className="nn-tx"><b>{x.label}</b><small>{x.sub}</small></span><ChevronRight size={18} className="nn-chev" aria-hidden="true" /></>;
          return x.href ? <a key={x.k} className={`nn-tile press ${x.main ? "main" : ""}`} href={x.href}>{inner}</a>
            : <button key={x.k} type="button" className="nn-tile press" onClick={x.run}>{inner}</button>;
        })}
      </div>
      {near && <NearSheet t={t} onClose={() => setNear(false)} />}
    </section>
  );
}

/** "Continuar onde ficou": orientação a meio (últimas 12 h) ou passeio em curso (últimas 24 h). */
function Resume({ t, locale }: { t: Dict; locale: Locale }) {
  const [r, setR] = useState<{ href: string; label: string } | null>(null);
  useEffect(() => {
    try {
      const a = JSON.parse(localStorage.getItem("sgct:arrive") ?? "null") as { city: string; point: string | null; dest: { label: string } | null; step: number; at: number } | null;
      const g = JSON.parse(localStorage.getItem("sgct:last-tour") ?? "null") as { id: string; name: string; done: number; n: number; at: number } | null;
      const arrOk = a && a.point && Date.now() - a.at < 12 * 3600_000;
      const tourOk = g && g.done < g.n && Date.now() - g.at < 24 * 3600_000 && localStorage.getItem(`sgct:go:${g.id}`) !== "false";
      if (arrOk && (!tourOk || a.at >= g.at)) {
        const pt = arrivalsFor(a.city).find((x) => x.id === a.point);
        setR({ href: `/${locale}/arrive?city=${a.city}`, label: fmt(t.ess.resumeArr, { i: a.step + 1, x: a.dest?.label ?? pt?.name ?? "" }) });
      } else if (tourOk) setR({ href: `/${locale}/tour/${g.id}`, label: fmt(t.ess.resumeTour, { x: `${g.name} · ${g.done}/${g.n}` }) });
    } catch { /* ignorar */ }
  }, [t, locale]);
  if (!r) return null;
  return <a className="nn-resume press" href={r.href}><History size={20} aria-hidden="true" /><span>{t.ess.resume}<br /><small style={{ fontWeight: 400, opacity: .75 }}>{r.label}</small></span><ChevronRight size={18} aria-hidden="true" /></a>;
}
