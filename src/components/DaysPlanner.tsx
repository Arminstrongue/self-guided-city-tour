"use client";
/** Roteiro de vários dias: dias + interesses → plano dia a dia com lugares reais; guardar na Minha viagem. */
import { Locked } from "./Locked";
import { useEffect, useMemo, useState } from "react";
import { useDict } from "@/i18n/client-dict";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import type { PlanItem } from "@/lib/db/schema";
import { autoPlan, perDay, candidates, dayRoute, groupsToHobbies, stopCandidates, DAY_GROUPS, type DayGroup } from "@/lib/autoplan";
import { HOBBIES, type Place } from "@/lib/explore";
import type { MomentView } from "./Explore";
import { BackLink } from "./BackLink";
import { toast } from "@/lib/toast";
import { Minus, Plus, Sparkles, Map as MapIcon, X } from "lucide-react";

type CityIn = { id: string; name: string; stops: { id: string; name: string; lat: number; lng: number; top: boolean; access?: boolean }[] };
type Travel = { types?: string[]; pace?: "calm" | "balanced" | "intense"; access?: string[] };
const readTravel = (): Travel => { try { return JSON.parse(localStorage.getItem("sgct:travel") ?? "{}"); } catch { return {}; } };
export const DRAFT_KEY = "sgct:plan-draft";
const GROUP_ICON: Record<DayGroup, string> = { sights: "🏛", leisure: "🌿", food: "🍽", art: "🎨", nature: "🏖", night: "🌙", shopping: "🛍", family: "🧸" };
const ORDER = Object.keys(DAY_GROUPS) as DayGroup[];

/** Grupos a partir dos interesses já guardados no telemóvel (se houver); por omissão, passeios, gastronomia e arte. */
function initialGroups(): DayGroup[] {
  try {
    const h = JSON.parse(localStorage.getItem("sgct:hobbies") ?? "[]") as string[];
    const g = ORDER.filter((k) => (DAY_GROUPS[k] as readonly string[]).some((x) => h.includes(x)));
    if (g.length) return g;
  } catch { /* sem armazenamento */ }
  return ["sights", "food", "art"];
}

export function DaysPlanner({ t: tProp, locale, cities, city, moments, initialDays, presetGroups = [], locked = false }: { t?: Dict; locale: Locale; cities: { id: string; name: string }[]; city: CityIn | null; locked?: boolean; moments: MomentView[]; initialDays: number; presetGroups?: DayGroup[] }) {
  const t = useDict(tProp);
  const d = t.dp;
  const [days, setDays] = useState(initialDays);
  const [start, setStart] = useState("");
  const [groups, setGroups] = useState<DayGroup[]>(["sights", "food", "art"]);
  const [items, setItems] = useState<PlanItem[] | null>(null);
  const [day, setDay] = useState(1);
  const [busy, setBusy] = useState(false);
  const [needSign, setNeedSign] = useState(false);
  useEffect(() => {
    const tr = readTravel();
    const g = presetGroups.length ? presetGroups : initialGroups();
    setGroups(!presetGroups.length && tr.types?.includes("family") && !g.includes("family") ? [...g, "family"] : g);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (g: DayGroup) => setGroups((x) => (x.includes(g) ? x.filter((y) => y !== g) : [...x, g]));
  async function build() {
    if (!city || !groups.length) return;
    setBusy(true);
    const r = await fetch(`/api/explore?city=${city.id}&locale=${locale}`).catch(() => null);
    const places: Place[] = r?.ok ? ((await r.json().catch(() => null))?.places ?? []) : [];
    const hobbies = groupsToHobbies(groups).filter((h) => (HOBBIES as readonly string[]).includes(h));
    // Preferências de viagem: sem escadas/subidas quando pedido; ritmo calmo = menos lugares por dia, intenso = mais.
    const tr = readTravel();
    const stops = tr.access?.length ? city.stops.filter((s) => !s.access) : city.stops;
    const cands = [...stopCandidates(stops), ...candidates(moments, places)];
    const base = perDay(cands.length, days);
    const cap = tr.pace === "calm" ? Math.min(base, 3) : tr.pace === "intense" ? Math.max(base, 5) : base;
    setItems(autoPlan(cands, hobbies, days, 1, cap));
    setDay(1); setBusy(false); setNeedSign(false);
    requestAnimationFrame(() => document.getElementById("dp-res")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  async function save() {
    if (!city || !items) return;
    setBusy(true);
    const body = { title: `${city.name} · ${fmt(t.plDaysN, { n: days })}`.slice(0, 120), city: city.id, cityName: city.name, startDate: start || null, days, items };
    const res = await fetch("/api/me/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    if (res?.status === 401) {
      // Sem conta: guarda o rascunho; ao entrar na carteira é gravado sozinho.
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(body)); } catch { /* ignorar */ }
      setNeedSign(true); setBusy(false); return;
    }
    const j = res?.ok ? await res.json().catch(() => null) : null;
    if (j?.id) { toast(d.saved); window.location.href = `/${locale}/plan/${j.id}`; return; }
    toast(t.tsError, { tone: "err" }); setBusy(false);
  }

  const dayItems = useMemo(() => (items ?? []).filter((i) => i.day === day).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? "")), [items, day]);
  const dateOf = (n: number) => (start ? new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "short", day: "numeric", month: "short" }).format(new Date(new Date(`${start}T12:00:00`).getTime() + (n - 1) * 86400_000)) : null);
  const route = dayRoute(dayItems);

  return (
    <section className="dp stack">
      <BackLink fallback={`/${locale}/start${city ? `?city=${city.id}` : ""}`} label={t.dp.back} />
      <div>
        <span className="eyebrow">✦ {d.eyebrow}</span>
        <h1 className="dp-h">{d.title}</h1>
        <p className="hint">{d.sub}</p>
      </div>

      <div className="card dp-card stack">
        <label className="field"><span className="bp-h">{t.plCity}</span>
          <select value={city?.id ?? ""} onChange={(e) => { window.location.href = `/${locale}/plan/new?city=${e.target.value}&days=${days}&g=${groups.join(",")}`; }}>
            {!city && <option value="">{t.qsSearch}</option>}
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>

        <div className="dp-row">
          <div className="stack" style={{ gap: 6 }}>
            <span className="bp-h">{d.days}</span>
            <div className="dp-step" role="group" aria-label={d.days}>
              <button type="button" aria-label="−" disabled={days <= 1} onClick={() => setDays(days - 1)}><Minus size={18} /></button>
              <b className="num">{days}</b>
              <button type="button" aria-label="+" disabled={days >= 14} onClick={() => setDays(days + 1)}><Plus size={18} /></button>
            </div>
          </div>
          <label className="field dp-date"><span className="bp-h">{d.start}</span><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        </div>

        <span className="bp-h">{d.interests}</span>
        <div className="dp-groups">
          {ORDER.map((g) => (
            <button key={g} type="button" aria-pressed={groups.includes(g)} className={`dp-g press ${groups.includes(g) ? "on" : ""}`} onClick={() => toggle(g)}>
              <span aria-hidden="true">{GROUP_ICON[g]}</span>{d.g[g]}
            </button>
          ))}
        </div>
        {!groups.length && <p className="hint">{d.pick}</p>}
        {locked && city ? <Locked t={t} locale={locale} city={city.id} cityName={city.name} what="plan" /> : (
        <button className="btn tram press" disabled={!city || !groups.length || busy} onClick={() => void build()}>
          <Sparkles size={18} aria-hidden="true" />{busy && !items ? d.building : fmt(d.build, { n: String(days) })}
        </button>)}
      </div>

      {items && city && (
        <div id="dp-res" className="stack dp-res" style={{ scrollMarginTop: 70 }}>
          <div className="dp-tabs" role="tablist">
            {Array.from({ length: days }, (_, k) => k + 1).map((n) => (
              <button key={n} role="tab" aria-selected={day === n} className={day === n ? "on" : ""} onClick={() => setDay(n)}>
                <b>{fmt(t.plDay, { n })}</b>{dateOf(n) && <small>{dateOf(n)}</small>}
              </button>
            ))}
          </div>
          {dayItems.length ? (
            <ol className="dp-list">
              {dayItems.map((i) => (
                <li key={i.id}>
                  <span className="dp-time num">{i.time}</span>
                  <span className="dp-ic" aria-hidden="true">{i.icon}</span>
                  <b>{i.title}</b>
                  <button type="button" className="dp-x" aria-label={d.remove} onClick={() => setItems((x) => (x ?? []).filter((y) => y.id !== i.id))}><X size={16} /></button>
                </li>
              ))}
            </ol>
          ) : <p className="hint">{d.empty}</p>}
          {route && <a className="btn ghost press" href={route} target="_blank" rel="noopener noreferrer"><MapIcon size={17} aria-hidden="true" />{d.map}</a>}
          <p className="hint">{d.note}</p>
          {needSign ? (
            <div className="card dp-sign stack">
              <p>{d.signIn}</p>
              <a className="btn tram press" href={`/${locale}/wallet`}>{d.signInBtn}</a>
            </div>
          ) : (
            <button className="btn tram press" disabled={busy} onClick={() => void save()}>{d.save}</button>
          )}
        </div>
      )}
    </section>
  );
}
