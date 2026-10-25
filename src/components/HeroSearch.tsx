"use client";
/** Cartão de pesquisa no topo da página inicial: roteiros e cidades, escalas ou experiências → o fluxo certo da app. */
import { useMemo, useRef, useState } from "react";
import { useDict } from "@/i18n/client-dict";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import { ArrowRight, Clock, Compass, Map as MapIcon, MapPin, Plane, Sparkles, Users } from "lucide-react";

type C = { id: string; name: string; country: string; flag: string };
type Tab = "routes" | "layover" | "exp";
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const WHO_GROUPS: Record<string, string> = { solo: "sights,food,art", couple: "sights,food,art", family: "sights,family,nature", friends: "sights,food,night" };
export const HERO_EXP = ["sights", "food", "art", "nature", "night"] as const;

export function HeroSearch({ t: tProp, locale, cities }: { t?: Dict; locale: Locale; cities: C[] }) {
  const t = useDict(tProp);
  const h = t.hx;
  const [tab, setTab] = useState<Tab>("routes");
  const [q, setQ] = useState("");
  const [city, setCity] = useState<C | null>(null);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");
  const [who, setWho] = useState("");
  const [exp, setExp] = useState("");
  const [lay, setLay] = useState("");
  const [err, setErr] = useState(false);
  const box = useRef<HTMLInputElement>(null);
  const hits = useMemo(() => {
    const w = fold(q.trim()).split(/\s+/).filter(Boolean);
    return (w.length ? cities.filter((c) => w.every((x) => fold(`${c.name} ${c.country}`).includes(x))) : cities).slice(0, 7);
  }, [q, cities]);
  const pick = (c: C) => { setCity(c); setQ(c.name); setOpen(false); setErr(false); };

  function go(e: React.FormEvent) {
    e.preventDefault();
    const c = city ?? (hits.length === 1 || (hits[0] && fold(hits[0].name) === fold(q.trim())) ? hits[0] : null);
    if (!c) { setErr(true); box.current?.focus(); setOpen(true); return; }
    const days = Number(time) || 0;
    let url = `/${locale}/start?city=${c.id}`;
    if (tab === "layover") url = `/${locale}/layover?city=${c.id}${lay ? `&h=${lay}` : ""}`;
    if (tab === "routes" && days > 1) url = `/${locale}/plan/new?city=${c.id}&days=${days}&g=${WHO_GROUPS[who] ?? WHO_GROUPS.solo}`;
    if (tab === "exp") url = `/${locale}/plan/new?city=${c.id}&days=${Math.max(1, days)}&g=${exp || "sights"}${who === "family" ? ",family" : ""}`;
    try { localStorage.setItem("sgct:city", c.id); } catch { /* ignorar */ }
    window.location.href = url;
  }

  const TABS: [Tab, typeof MapIcon, string][] = [["routes", MapIcon, h.tabs.routes], ["layover", Plane, h.tabs.layover], ["exp", Sparkles, h.tabs.exp]];
  return (
    <form className="hs" onSubmit={go} role="search">
      <div className="hs-tabs" role="tablist">
        {TABS.map(([k, Ic, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
            <Ic size={16} aria-hidden="true" />{label}
          </button>
        ))}
      </div>
      <div className="hs-field hs-city">
        <MapPin size={18} aria-hidden="true" />
        <input ref={box} value={q} placeholder={tab === "layover" ? h.layoverPh : h.cityPh} aria-label={tab === "layover" ? h.layoverPh : h.cityPh} autoComplete="off"
          role="combobox" aria-expanded={open} aria-controls="hs-list"
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => { setQ(e.target.value); setCity(null); setOpen(true); }}
          onKeyDown={(e) => { if (e.key === "Enter" && open && hits[0] && !city) { e.preventDefault(); pick(hits[0]); } }} />
        {open && hits.length > 0 && (
          <ul className="hs-list" id="hs-list" role="listbox">
            {hits.map((c) => <li key={c.id} role="option" aria-selected={city?.id === c.id}><button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(c)}><span aria-hidden="true">{c.flag}</span><b>{c.name}</b><small>{c.country}</small></button></li>)}
          </ul>
        )}
      </div>
      <div className="hs-row">
        {tab !== "layover" && (
          <label className="hs-field"><Clock size={18} aria-hidden="true" />
            <select value={time} onChange={(e) => setTime(e.target.value)} aria-label={h.timePh}>
              <option value="">{h.timePh}</option>
              {(["3h", "5h", "day"] as const).map((k) => <option key={k} value={k}>{h.times[k]}</option>)}
              {(["2", "3", "5", "7"] as const).map((k) => <option key={k} value={k}>{h.times[k]}</option>)}
            </select>
          </label>
        )}
        {tab === "exp" ? (
          <label className="hs-field"><Compass size={18} aria-hidden="true" />
            <select value={exp} onChange={(e) => setExp(e.target.value)} aria-label={h.expPh}>
              <option value="">{h.expPh}</option>
              {HERO_EXP.map((k) => <option key={k} value={k}>{h.exp[k]}</option>)}
            </select>
          </label>
        ) : tab === "routes" ? (
          <label className="hs-field"><Users size={18} aria-hidden="true" />
            <select value={who} onChange={(e) => setWho(e.target.value)} aria-label={h.whoPh}>
              <option value="">{h.whoPh}</option>
              {(["solo", "couple", "family", "friends"] as const).map((k) => <option key={k} value={k}>{h.who[k]}</option>)}
            </select>
          </label>
        ) : (
          <label className="hs-field"><Clock size={18} aria-hidden="true" />
            <select value={lay} onChange={(e) => setLay(e.target.value)} aria-label={t.ly.hours}>
              <option value="">{t.ly.hours}</option>
              {[3, 6, 9, 12].map((h) => <option key={h} value={h}>{fmt(t.ly.hoursN, { n: String(h) })}{h === 12 ? "+" : ""} · {t.ly.bucket[String(h) as "3"]}</option>)}
            </select>
          </label>
        )}
      </div>
      {err && <p className="hs-err" role="alert">{h.needCity}</p>}
      <button className="hs-go press" type="submit"><Compass size={18} aria-hidden="true" />{tab === "layover" ? h.ctaLayover : tab === "exp" ? h.ctaExp : h.cta}<ArrowRight size={18} aria-hidden="true" /></button>
      <a className="hs-all" href="#cities">{h.all} →</a>
    </form>
  );
}
