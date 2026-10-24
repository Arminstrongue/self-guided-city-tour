"use client";
import { useDict } from "@/i18n/client-dict";
/**
 * Encontro do grupo: marcar um ponto e uma hora e partilhar um link. Quem abre vê o local, a contagem decrescente
 * e o caminho a pé. Tudo vai no próprio link (sem conta, sem servidor), por isso funciona para qualquer pessoa.
 */
import { useEffect, useState } from "react";
import { Clock, LocateFixed, MapPin, Navigation, Share2 } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { toast } from "@/lib/toast";

export type MeetPlace = { id: string; name: string; lat: number; lng: number };
type Meet = { lat: number; lng: number; at: number; p: string; n: string };

export function meetHref(locale: string, m: Meet) {
  const q = new URLSearchParams({ lat: m.lat.toFixed(5), lng: m.lng.toFixed(5), at: String(m.at), p: m.p.slice(0, 80) });
  if (m.n.trim()) q.set("n", m.n.trim().slice(0, 140));
  return `/${locale}/meet?${q.toString()}`;
}
export function parseMeet(sp: URLSearchParams): Meet | null {
  const lat = Number(sp.get("lat")), lng = Number(sp.get("lng")), at = Number(sp.get("at"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(at) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || !sp.get("lat")) return null;
  return { lat, lng, at, p: (sp.get("p") ?? "").slice(0, 80), n: (sp.get("n") ?? "").slice(0, 140) };
}
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/** Formulário: onde (paragens do plano ou a minha posição), a que horas e uma nota. */
export function MeetMaker({ t, locale, places, onDone }: { t: Dict; locale: Locale; places: MeetPlace[]; onDone?: () => void }) {
  const d = t.dx;
  const [where, setWhere] = useState<string>(places[0]?.id ?? "here");
  const [here, setHere] = useState<MeetPlace | null>(null);
  const [time, setTime] = useState(() => hhmm(new Date(Math.ceil((Date.now() + 30 * 60000) / (15 * 60000)) * 15 * 60000)));
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  function locate() {
    setWhere("here");
    navigator.geolocation?.getCurrentPosition((p) => setHere({ id: "here", name: d.meetHere, lat: p.coords.latitude, lng: p.coords.longitude }),
      () => toast(t.bpDenied, { tone: "err" }), { enableHighAccuracy: true, timeout: 12000 });
  }
  const place = where === "here" ? here : places.find((p) => p.id === where) ?? null;
  async function share() {
    if (!place) return;
    const [h, m] = time.split(":").map(Number);
    const at = new Date(); at.setHours(h, m, 0, 0);
    if (at.getTime() < Date.now() - 5 * 60000) at.setDate(at.getDate() + 1); // hora já passou → amanhã
    const url = location.origin + meetHref(locale, { lat: place.lat, lng: place.lng, at: at.getTime(), p: place.name, n: note });
    const text = `📍 ${d.meetTitle}: ${place.name} · ${time}${note.trim() ? ` — ${note.trim()}` : ""}`;
    setBusy(true);
    try {
      if (navigator.share) await navigator.share({ title: d.meetTitle, text, url });
      else { await navigator.clipboard.writeText(`${text}\n${url}`); toast(d.meetCopied); }
      onDone?.();
    } catch { /* partilha cancelada */ }
    setBusy(false);
  }
  return (
    <div className="mt-make">
      <span className="as-h">{d.meetWhere}</span>
      <div className="ios-group mt-places">
        <button type="button" className="ios-row press" aria-pressed={where === "here"} onClick={locate}>
          <LocateFixed size={18} aria-hidden="true" /><span className="ios-tx"><b>{d.meetHere}</b>{where === "here" && !here && <small>{d.locating}</small>}</span>{where === "here" && <span className="mt-ok">✓</span>}
        </button>
        {places.map((p) => (
          <button key={p.id} type="button" className="ios-row press" aria-pressed={where === p.id} onClick={() => setWhere(p.id)}>
            <MapPin size={18} aria-hidden="true" /><span className="ios-tx"><b>{p.name}</b></span>{where === p.id && <span className="mt-ok">✓</span>}
          </button>
        ))}
      </div>
      <label className="mt-field"><span className="as-h">{d.meetWhen}</span><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
      <label className="mt-field"><span className="as-h">{d.meetNote}</span><input value={note} maxLength={140} onChange={(e) => setNote(e.target.value)} placeholder="…" /></label>
      <button type="button" className="btn tram press" disabled={!place || busy} onClick={() => void share()}><Share2 size={18} aria-hidden="true" /> {d.meetShare}</button>
    </div>
  );
}

/** Página do encontro (quem recebe o link) ou, sem dados no link, o formulário para marcar um. */
export function MeetView({ t: tProp, locale }: { t?: Dict; locale: Locale }) {
  const t = useDict(tProp);
  const d = t.dx;
  const [m, setM] = useState<Meet | null | undefined>(undefined);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { setM(parseMeet(new URLSearchParams(location.search))); const i = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(i); }, []);
  if (m === undefined) return null;
  if (!m) return <div className="ess"><h1 className="arv-h">{d.meetMake}</h1><p className="ess-sub">{d.meetSub}</p><MeetMaker t={t} locale={locale} places={[]} /></div>;
  const mins = Math.round((m.at - now) / 60000);
  const when = new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(m.at));
  return (
    <div className="ess">
      <span className="ess-h"><MapPin size={18} aria-hidden="true" /> {d.meetTitle}</span>
      <h1 className="arv-h">{m.p || d.meetTitle}</h1>
      <section className="ess-card mt-time">
        <span className="ess-h"><Clock size={18} aria-hidden="true" /> {when}</span>
        <b className="mt-count num">{mins > 0 ? fmt(d.meetIn, { m: mins }) : mins >= -10 ? d.meetNow : fmt(d.meetPast, { m: -mins })}</b>
        {m.n && <p className="ess-muted">“{m.n}”</p>}
      </section>
      <a className="btn tram press" href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}&travelmode=walking`} target="_blank" rel="noopener noreferrer"><Navigation size={18} aria-hidden="true" /> {d.meetGo}</a>
      <a className="btn ghost press" href={`/${locale}/meet`}>{d.meetMake}</a>
    </div>
  );
}
