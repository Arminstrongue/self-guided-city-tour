"use client";
import { useDict } from "@/i18n/client-dict";
/**
 * Essenciais offline: tudo o que um viajante precisa sem internet num só ecrã — alojamento (e regresso),
 * reservas com referência, plano, número de emergência e frases na língua local. Lê só dados do telemóvel.
 */
import { useEffect, useState } from "react";
import { BedDouble, CalendarClock, CloudOff, Download, Home, Phone, Route, Volume2, X } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { cachedReservations, type Reservation } from "@/lib/trip-local";
import { offlineReady, saveUrls } from "@/lib/offline-client";
import { LOCAL_LANG, PHRASES, PHRASE_KEYS, SPEECH_LANG, type PhraseKey } from "@/data/phrases";
import Portal from "./Portal";
import { BackLink } from "./BackLink";

export type EssCity = { id: string; name: string; country: string; emergency: string; emergencyTel: string };
type Place = { label: string; lat: number; lng: number };
type Planned = { city: string; n: number; h: string; base?: string; end?: string; names?: string[] };
const SAVED = "sgct:ess:saved";

export function EssentialsView({ t: tProp, locale, cities }: { t?: Dict; locale: Locale; cities: EssCity[] }) {
  const t = useDict(tProp);
  const e = t.ess;
  const [cityId, setCityId] = useState("lon");
  const [home, setHome] = useState<Place | null>(null);
  const [res, setRes] = useState<Reservation[]>([]);
  const [plan, setPlan] = useState<Planned | null>(null);
  const [big, setBig] = useState<{ text: string; mean: string } | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const [prog, setProg] = useState<[number, number] | null>(null);
  const [canSave, setCanSave] = useState(true);
  const [online, setOnline] = useState(true);
  // Destino: o do plano, do alojamento guardado ou da orientação em curso (Londres por defeito).
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("sgct:planned") ?? "null") as Planned | null;
      const a = JSON.parse(localStorage.getItem("sgct:arrive") ?? "null") as { city?: string } | null;
      const c = new URLSearchParams(location.search).get("city") ?? p?.city ?? a?.city ?? cities.find((x) => localStorage.getItem(`sgct:home:${x.id}`))?.id ?? "lon";
      setCityId(cities.some((x) => x.id === c) ? c : "lon");
      setPlan(p);
      setSaved(Number(localStorage.getItem(SAVED)) || null);
    } catch { /* ignorar */ }
    void offlineReady().then(setCanSave);
    setOnline(navigator.onLine);
    const on = () => setOnline(navigator.onLine);
    window.addEventListener("online", on); window.addEventListener("offline", on);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", on); };
  }, [cities]);
  useEffect(() => {
    try { setHome(JSON.parse(localStorage.getItem(`sgct:home:${cityId}`) ?? "null")); } catch { setHome(null); }
    setRes(cachedReservations().filter((r) => (!r.city || r.city === cityId) && new Date(r.startsAt).getTime() > Date.now() - 3 * 3600_000).slice(0, 6));
  }, [cityId]);

  const city = cities.find((c) => c.id === cityId) ?? cities[0];
  const lang = LOCAL_LANG[city.country] ?? "en";
  const ph = PHRASES[lang] ?? PHRASES.en;
  const langName = (() => { try { return new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "language" }).of(lang) ?? lang; } catch { return lang; } })();
  const df = new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const speak = (txt: string) => { try { const u = new SpeechSynthesisUtterance(txt); u.lang = SPEECH_LANG[lang] ?? lang; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { /* sem voz */ } };

  async function saveAll() {
    setProg([0, 1]);
    const urls = [`/${locale}/wallet/essentials`, `/${locale}/wallet/essentials?city=${cityId}`, `/${locale}/arrive`, `/${locale}/arrive?city=${cityId}`, `/${locale}/arrive?city=${cityId}&go=1`];
    const r = await saveUrls(urls, (d, n) => setProg([d, n])).catch(() => null);
    setProg(null);
    if (r && r.ok > 0) { const now = Date.now(); setSaved(now); try { localStorage.setItem(SAVED, String(now)); } catch { /* ignorar */ } }
  }

  return (
    <div className="ess">
      <BackLink fallback={`/${locale}/wallet`} label={t.navBack} />
      <h1 className="arv-h">{e.title}</h1>
      <p className="ess-sub">{e.sub}</p>
      {!online && <p className="ess-off"><CloudOff size={16} aria-hidden="true" /> {e.offline}</p>}
      <label className="arv-city"><span>{e.city}</span>
        <select value={cityId} onChange={(x) => setCityId(x.target.value)}>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      </label>

      <section className="ess-card">
        <span className="ess-h"><BedDouble size={18} aria-hidden="true" /> {e.home}</span>
        {home ? <>
          <b className="ess-big">{home.label}</b>
          <div className="ess-acts">
            <a className="btn tram press" href={`/${locale}/arrive?city=${cityId}&go=1`}><Home size={18} aria-hidden="true" /> {e.goHome}</a>
            <button type="button" className="btn ghost press" onClick={() => setBig({ text: home.label, mean: t.ph.take })}>{t.arv.show}</button>
          </div>
        </> : <p className="ess-muted">{e.noHome} <a href={`/${locale}/arrive?city=${cityId}`}>{t.nn.arrived} →</a></p>}
      </section>

      <section className="ess-card">
        <span className="ess-h"><CalendarClock size={18} aria-hidden="true" /> {e.res}</span>
        {res.length === 0 ? <p className="ess-muted">{e.noRes}</p> : (
          <ul className="ess-list">{res.map((r) => (
            <li key={r.id}>
              <span className="ess-tx"><b>{r.title}</b><small>{df.format(new Date(r.startsAt))}{r.place ? ` · ${r.place}` : ""}</small>{r.ref && <code className="ess-ref">{r.ref}</code>}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {r.photo && <img className="ess-ticket" src={r.photo} alt="" onClick={() => window.open(r.photo, "_blank")} />}
            </li>
          ))}</ul>
        )}
      </section>

      <section className="ess-card">
        <span className="ess-h"><Route size={18} aria-hidden="true" /> {e.plan}</span>
        {plan && plan.city === cityId ? <p className="ess-muted"><b>{fmt(t.fitOpt, { n: plan.n, h: plan.h })}</b>{plan.base ? ` · ${plan.base} → ${plan.end ?? plan.base}` : ""}<br /><a href={`/${locale}/tour/${cityId}`}>{t.openTour} →</a></p> : <p className="ess-muted">{e.noPlan}</p>}
      </section>

      <section className="ess-card ess-sos">
        <span className="ess-h"><Phone size={18} aria-hidden="true" /> {e.emergency}</span>
        {city.emergencyTel ? <a className="ess-tel num" href={`tel:${city.emergencyTel}`}>{city.emergency}</a> : <p className="ess-muted">112</p>}
      </section>

      <section className="ess-card">
        <span className="ess-h">💬 {fmt(e.phrases, { l: langName })}</span>
        <small className="ess-muted">{e.tapShow}</small>
        <ul className="ess-ph">{PHRASE_KEYS.map((k: PhraseKey) => (
          <li key={k}><button type="button" onClick={() => setBig({ text: ph[k], mean: t.ph[k] })}><b lang={lang}>{ph[k]}</b><small>{t.ph[k]}</small></button></li>
        ))}</ul>
      </section>

      <section className="ess-card">
        {canSave ? <button type="button" className="btn press" disabled={Boolean(prog)} onClick={() => void saveAll()}><Download size={18} aria-hidden="true" /> {prog ? fmt(e.saving, { d: prog[0], n: prog[1] }) : e.save}</button>
          : <p className="ess-muted">{e.appOnly}</p>}
        {saved && <small className="ess-muted">✓ {fmt(e.saved, { d: df.format(new Date(saved)) })}</small>}
      </section>

      {big && (
        <Portal><div className="arv-show" role="dialog" aria-modal="true" onClick={() => setBig(null)}>
          <button type="button" className="mu2-x arv-show-x" aria-label={t.close}><X size={20} aria-hidden="true" /></button>
          <b lang={lang}>{big.text}</b>
          <small>{big.mean}</small>
          <button type="button" className="btn ghost" onClick={(x) => { x.stopPropagation(); speak(big.text); }}><Volume2 size={18} aria-hidden="true" /> {t.arv.listen}</button>
        </div></Portal>
      )}
    </div>
  );
}
