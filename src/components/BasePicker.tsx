"use client";
import { useState } from "react";
import { BedDouble, LocateFixed, Plane, Search } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import { FAR_KM, km, type Base } from "@/lib/route-cost";

/** Ponto de partida guardado por cidade (neste dispositivo). */
export const baseKey = (city: string) => `sgct:base:${city}`;
export function loadBase(city: string): Base {
  try { const v = JSON.parse(localStorage.getItem(baseKey(city)) ?? "null"); if (v?.kind === "place" && typeof v.lat === "number") return v; } catch { /* ignorar */ }
  return { kind: "airport" };
}
export function saveBase(city: string, b: Base) {
  try { localStorage.setItem(baseKey(city), JSON.stringify(b)); } catch { /* ignorar */ }
}
export const baseLabel = (b: Base, t: Dict) => (b.kind === "airport" ? t.bpAirport : b.here ? t.bpHereLabel : b.label);

type Hit = { label: string; sub: string; lat: number; lng: number };

/** Escolher de onde começa e acaba o percurso: aeroporto, onde estou ou o hotel (pesquisa por nome ou morada). */
export function BasePicker({ t, locale, city, cityName, center, value, onChange }: {
  t: Dict; locale: Locale; city: string; cityName: string; center: { lat: number; lng: number }; value: Base; onChange: (b: Base) => void;
}) {
  const [mode, setMode] = useState<"airport" | "here" | "hotel">(value.kind === "airport" ? "airport" : value.here ? "here" : "hotel");
  const [q, setQ] = useState(value.kind === "place" && !value.here ? value.label : "");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const pick = (b: Base) => { saveBase(city, b); onChange(b); };
  function here() {
    setMode("here"); setMsg(t.bpLocating);
    if (!navigator.geolocation) { setMsg(t.bpDenied); return; }
    navigator.geolocation.getCurrentPosition((p) => {
      const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      if (km(pos, center) > FAR_KM) { setMsg(fmt(t.bpFar, { c: cityName })); setMode("airport"); pick({ kind: "airport" }); return; }
      setMsg(""); pick({ kind: "place", ...pos, label: t.bpHereLabel, here: true });
    }, () => setMsg(t.bpDenied), { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 });
  }
  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim().length < 3) return;
    setBusy(true); setHits(null);
    const j = await fetch(`/api/geocode?city=${city}&lang=${locale}&q=${encodeURIComponent(q.trim())}`).then((r) => (r.ok ? r.json() : null)).catch(() => null) as { hits?: Hit[] } | null;
    setHits(j?.hits ?? []); setBusy(false);
  }

  return (
    <div className="bp">
      <span className="bp-h">{t.bpTitle}</span>
      <div className="bp-seg" role="radiogroup" aria-label={t.bpTitle}>
        <button type="button" role="radio" aria-checked={mode === "airport"} className={mode === "airport" ? "on" : ""} onClick={() => { setMode("airport"); setMsg(""); pick({ kind: "airport" }); }}><Plane size={15} aria-hidden="true" />{t.bpAirport}</button>
        <button type="button" role="radio" aria-checked={mode === "here"} className={mode === "here" ? "on" : ""} onClick={here}><LocateFixed size={15} aria-hidden="true" />{t.bpHere}</button>
        <button type="button" role="radio" aria-checked={mode === "hotel"} className={mode === "hotel" ? "on" : ""} onClick={() => { setMode("hotel"); setMsg(""); }}><BedDouble size={15} aria-hidden="true" />{t.bpHotel}</button>
      </div>
      {mode === "hotel" && (
        <form className="bp-q" onSubmit={search}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.bpHotelPh} aria-label={t.bpHotelPh} autoComplete="off" />
          <button className="btn tram" disabled={busy || q.trim().length < 3}><Search size={16} aria-hidden="true" /><span className="sr-only">{t.bpSearch}</span></button>
        </form>
      )}
      {mode === "hotel" && hits && (hits.length ? (
        <div className="bp-hits">
          {hits.map((h, i) => (
            <button key={i} type="button" className={`bp-hit press ${value.kind === "place" && value.lat === h.lat && value.lng === h.lng ? "on" : ""}`}
              onClick={() => { setQ(h.label); setHits(null); pick({ kind: "place", lat: h.lat, lng: h.lng, label: h.label }); }}>
              <b>{h.label}</b>{h.sub && <small>{h.sub}</small>}
            </button>
          ))}
        </div>
      ) : <p className="hint">{t.bpNone}</p>)}
      {mode === "hotel" && !hits && value.kind === "place" && !value.here && <p className="bp-ok">✓ {value.label}</p>}
      {mode === "here" && !msg && value.kind === "place" && value.here && <p className="bp-ok">✓ {t.bpHereLabel}</p>}
      {msg && <p className="hint">{msg}</p>}
    </div>
  );
}
