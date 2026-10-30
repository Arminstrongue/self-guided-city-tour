"use client";
/**
 * Registo automático (só depois de o viajante o ligar): segue a posição e os passos enquanto a app está aberta,
 * deteta cidade, paragens e sítios onde parou, e pergunta sempre antes de guardar (cartão por cima da barra).
 */
import { useEffect, useRef, useState } from "react";
import { MapPin, Route, X } from "lucide-react";
import { useDict } from "@/i18n/client-dict";
import { fmt } from "@/i18n/core";
import { toast } from "@/lib/toast";
import { step, type LiteCity, type Pending } from "@/lib/auto-track";
import { EVENT, answer, autoOn, loadState, saveState } from "@/lib/auto-track-client";

const CITIES_KEY = "sgct:auto:cities";

async function liteCities(lang: string): Promise<LiteCity[]> {
  try { const c = JSON.parse(localStorage.getItem(CITIES_KEY) ?? "null") as { at: number; l: string; v: LiteCity[] } | null; if (c && c.l === lang && Date.now() - c.at < 7 * 86400e3) return c.v; } catch { /* ignorar */ }
  const v = await fetch(`/api/track/cities?lang=${lang}`).then((r) => (r.ok ? r.json() : [])).catch(() => []) as LiteCity[];
  try { localStorage.setItem(CITIES_KEY, JSON.stringify({ at: Date.now(), l: lang, v })); } catch { /* ignorar */ }
  return v;
}

export function AutoTrack({ locale }: { locale: string }) {
  const t = useDict();
  const a = t.at;
  const [on, setOn] = useState(false);
  const [pending, setPending] = useState<Pending[]>([]);
  const [busy, setBusy] = useState(false);
  const cities = useRef<LiteCity[]>([]);
  // Estado partilhado com o painel de pontos (ligar/desligar, resumo do dia).
  useEffect(() => {
    const sync = () => { setOn(autoOn()); setPending(loadState().pending); };
    sync();
    window.addEventListener(EVENT, sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);

  // Posição (só com a app aberta) e passos pelo sensor de movimento.
  useEffect(() => {
    if (!on || !navigator.geolocation) return;
    let live = true;
    void liteCities(locale).then((c) => {
      if (!live) return;
      cities.current = c;
      // A 1.ª posição pode ter chegado antes das cidades: volta a avaliá-la.
      const st = loadState();
      if (st.last) saveState(step(st, { ...st.last, t: Date.now() }, c));
    });
    const id = navigator.geolocation.watchPosition((p) => {
      const s = step(loadState(), { lat: p.coords.latitude, lng: p.coords.longitude, t: p.timestamp || Date.now(), acc: p.coords.accuracy }, cities.current);
      saveState(s);
    }, (e) => { if (e.code === e.PERMISSION_DENIED) toast(a.denied, { tone: "err" }); }, { enableHighAccuracy: true, maximumAge: 15000, timeout: 30000 });
    // Passos: picos da aceleração (anda-se a ~1,5–2,5 passos/s).
    let hi = false, lastStep = 0, pend = 0, flushAt = Date.now();
    const motion = (e: DeviceMotionEvent) => {
      const g = e.accelerationIncludingGravity; if (!g || g.x === null || g.y === null || g.z === null) return;
      const m = Math.sqrt((g.x ?? 0) ** 2 + (g.y ?? 0) ** 2 + (g.z ?? 0) ** 2);
      const now = Date.now();
      if (!hi && m > 11.2 && now - lastStep > 280) { hi = true; lastStep = now; pend++; }
      else if (hi && m < 9.6) hi = false;
      if (pend && now - flushAt > 10000) { const s = loadState(); s.motionSteps += pend; pend = 0; flushAt = now; saveState(s); }
    };
    window.addEventListener("devicemotion", motion);
    return () => { live = false; navigator.geolocation.clearWatch(id); window.removeEventListener("devicemotion", motion); };
  }, [on, locale, a.denied]);

  // O percurso de cada dia guarda-se sozinho (sem perguntar): os totais de km e passos atualizam-se automaticamente.
  const saving = useRef(false);
  useEffect(() => {
    const j = pending.find((p) => p.k === "journey");
    if (!j || j.k !== "journey" || saving.current) return;
    saving.current = true;
    void fetch("/api/me/journeys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ day: j.day, city: j.city, cityName: j.cityName, km: j.km, steps: j.steps, places: j.places, path: j.path }) })
      .then((r) => { if (r.ok) { answer(j.key, true); window.dispatchEvent(new Event("sgct:points")); } })
      .catch(() => null).finally(() => { saving.current = false; });
  }, [pending]);

  // Nome do sítio onde parou (morada) antes de perguntar. As perguntas de percurso já não aparecem (guardam-se sozinhas).
  const cur = (pending.filter((p) => p.k !== "journey") as Pending[])[0] as Pending | undefined;
  useEffect(() => {
    if (!cur || cur.k !== "place" || cur.name) return;
    void fetch(`/api/revgeo?lat=${cur.lat}&lng=${cur.lng}&lang=${locale}`).then((r) => (r.ok ? r.json() : null)).then((j: { name?: string } | null) => {
      const s = loadState();
      s.pending = s.pending.map((p) => (p.key === cur.key && p.k === "place" ? { ...p, name: j?.name || `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}` } : p));
      saveState(s);
    }).catch(() => null);
  }, [cur, locale]);

  if (!cur || (cur.k === "place" && !cur.name)) return null;

  async function confirm(p: Pending) {
    setBusy(true);
    let ok = true;
    if (p.k === "city" || p.k === "visit") {
      const r = await fetch("/api/me/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ city: p.city, stop: p.k === "visit" ? p.stop : "", lat: p.lat, lng: p.lng }) }).catch(() => null);
      ok = Boolean(r?.ok); if (r?.status === 401) toast(a.signIn, { icon: "🔐" });
    } else if (p.k === "journey") {
      const r = await fetch("/api/me/journeys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ day: p.day, city: p.city, cityName: p.cityName, km: p.km, steps: p.steps, places: p.places, path: p.path }) }).catch(() => null);
      ok = Boolean(r?.ok); if (r?.status === 401) toast(a.signIn, { icon: "🔐" });
    }
    setBusy(false);
    if (p.k !== "place" && !ok) return; // fica a pergunta para tentar outra vez (ou entrar na conta)
    answer(p.key, true);
    toast(a.saved, { icon: "✓" });
    window.dispatchEvent(new Event("sgct:points"));
  }

  const d = cur.k === "journey" ? new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "short" }).format(new Date(`${cur.day}T12:00:00`)) : "";
  return (
    <div className="at-card" role="dialog" aria-live="polite" aria-label={a.title}>
      <span className="at-ic" aria-hidden="true">{cur.k === "journey" ? <Route size={20} /> : <MapPin size={20} />}</span>
      <span className="at-tx">
        <b>{cur.k === "city" ? fmt(a.cityQ, { c: cur.name }) : cur.k === "visit" ? fmt(a.visitQ, { p: cur.name }) : cur.k === "place" ? fmt(a.placeQ, { p: cur.name }) : fmt(a.journeyQ, { d })}</b>
        {cur.k === "journey" && <small>{fmt(a.journeySub, { km: cur.km.toLocaleString(locale), s: cur.steps.toLocaleString(locale), n: cur.places.length })}{cur.cityName ? ` · ${cur.cityName}` : ""}</small>}
        <span className="at-acts">
          <button type="button" className="at-ok press" disabled={busy} onClick={() => void confirm(cur)}>{a.confirm}</button>
          <button type="button" className="at-no press" disabled={busy} onClick={() => answer(cur.key, false)}>{a.ignore}</button>
        </span>
      </span>
      <button type="button" className="at-x" aria-label={a.ignore} onClick={() => answer(cur.key, false)}><X size={16} aria-hidden="true" /></button>
    </div>
  );
}
