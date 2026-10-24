"use client";
import { useDict } from "@/i18n/client-dict";
/** Plano de viagem: dias com lugares reais, criação automática pelos interesses, rota do dia e partilha. */
import { toast } from "@/lib/toast";
import { useEffect, useMemo, useRef, useState } from "react";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import type { PlanItem } from "@/lib/db/schema";
import { autoPlan, candidates, dayRoute } from "@/lib/autoplan";
import { CAT_ICON, HOBBIES, type Hobby, type Place } from "@/lib/explore";
import type { MomentView } from "./Explore";

type Plan = { id: string; title: string; city: string | null; cityName: string; startDate: string | null; days: number; items: PlanItem[] };
const uid = () => Math.random().toString(36).slice(2, 10);

export function PlanView({ t: tProp, locale, plan: initial, moments }: { t?: Dict; locale: Locale; plan: Plan; moments: MomentView[] }) {
  const t = useDict(tProp);
  const [plan, setPlan] = useState(initial);
  const [day, setDay] = useState(1);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [adding, setAdding] = useState<"places" | "custom" | null>(null);
  const [custom, setCustom] = useState({ title: "", time: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(false); // segundo toque confirma (sem diálogos do navegador)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Guarda na conta pouco depois de cada alteração.
  function save(next: Partial<Plan>) {
    const merged = { ...plan, ...next };
    setPlan(merged);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void fetch(`/api/me/plans/${plan.id}`, { method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: merged.title, startDate: merged.startDate, days: merged.days, items: merged.items }) }).catch(() => null);
    }, 500);
  }
  async function loadPlaces(): Promise<Place[]> {
    if (places || !plan.city) return places ?? [];
    const r = await fetch(`/api/explore?city=${plan.city}&locale=${locale}`).catch(() => null);
    const j = r?.ok ? await r.json() : null;
    const p: Place[] = j?.places ?? [];
    setPlaces(p);
    return p;
  }
  useEffect(() => { if (adding === "places") void loadPlaces(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [adding]);

  async function auto() {
    setBusy(true);
    const p = await loadPlaces();
    const prefs = await fetch("/api/me/prefs").then((r) => (r.ok ? r.json() : null)).catch(() => null);
    const hobbies = ((prefs?.hobbies ?? []) as string[]).filter((h): h is Hobby => (HOBBIES as readonly string[]).includes(h));
    const items = autoPlan(candidates(moments, p), hobbies, plan.days);
    save({ items: [...plan.items.filter((i) => i.kind === "custom"), ...items] });
    setBusy(false);
  }
  const add = (it: Omit<PlanItem, "id" | "day">) => save({ items: [...plan.items, { ...it, id: uid(), day }] });
  const update = (id: string, patch: Partial<PlanItem>) => save({ items: plan.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  const remove = (id: string) => save({ items: plan.items.filter((i) => i.id !== id) });

  const dayItems = useMemo(() => plan.items.filter((i) => i.day === day).sort((a, b) => (a.time ?? "99").localeCompare(b.time ?? "99")), [plan.items, day]);
  const dayDate = (n: number) => plan.startDate ? new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "short", day: "numeric", month: "short" }).format(new Date(new Date(`${plan.startDate}T12:00:00`).getTime() + (n - 1) * 86400_000)) : null;
  const route = dayRoute(dayItems);
  const inPlan = new Set(plan.items.map((i) => i.title));

  async function share() {
    const lines = [plan.title, ...Array.from({ length: plan.days }, (_, k) => k + 1).flatMap((n) => {
      const its = plan.items.filter((i) => i.day === n).sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
      return its.length ? [`\n${fmt(t.plDay, { n })}${dayDate(n) ? ` · ${dayDate(n)}` : ""}`, ...its.map((i) => `${i.time ?? "—"}  ${i.icon ?? "•"} ${i.title}`)] : [];
    }), `\n${window.location.host}${plan.city ? `/${plan.city}` : ""}`];
    const text = lines.join("\n");
    try { if (navigator.share) await navigator.share({ title: plan.title, text }); else { await navigator.clipboard.writeText(text); toast(t.tsCopied, { icon: "📋" }); } } catch { /* cancelado */ }
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <a className="mini" href={`/${locale}/wallet`}>{t.plBack}</a>
      <section className="gp-hero">
        <span className="label" style={{ color: "rgba(255,255,255,.7)" }}>🗺 {plan.cityName}</span>
        <input className="pl-title" value={plan.title} maxLength={120} aria-label={t.plName} onChange={(e) => save({ title: e.target.value })} />
        <div className="row" style={{ gap: 10 }}>
          <label className="pl-meta">📅 <input type="date" value={plan.startDate ?? ""} onChange={(e) => save({ startDate: e.target.value || null })} /></label>
          <label className="pl-meta">{t.plDays} <select value={plan.days} onChange={(e) => { const d = Number(e.target.value); save({ days: d, items: plan.items.filter((i) => i.day <= d) }); if (day > d) setDay(d); }}>{Array.from({ length: 14 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        </div>
        {plan.city && <><button className="btn gp-light press" disabled={busy} onClick={() => void auto()}>{busy ? "…" : t.plAuto}</button><span className="gp-meta" style={{ fontSize: 13 }}>{t.plAutoHint}</span></>}
      </section>

      <div className="ex-tabs" role="tablist">
        {Array.from({ length: plan.days }, (_, k) => k + 1).map((n) => (
          <button key={n} role="tab" aria-selected={day === n} className={day === n ? "on" : ""} onClick={() => setDay(n)}>
            {fmt(t.plDay, { n })}{dayDate(n) ? <small style={{ display: "block", fontWeight: 500 }}>{dayDate(n)}</small> : null}
          </button>
        ))}
      </div>

      <div className="stack" style={{ gap: 8 }}>
        {dayItems.length === 0 && <p className="hint">{t.plEmptyDay}</p>}
        {dayItems.map((i) => (
          <div key={i.id} className="card pl-item">
            <input className="pl-time" type="time" value={i.time ?? ""} aria-label={t.plTime} onChange={(e) => update(i.id, { time: e.target.value || undefined })} />
            <span className="ex-ic sm" aria-hidden="true">{i.icon ?? "📍"}</span>
            <div className="stack" style={{ gap: 2, minWidth: 0, flex: 1 }}>
              <b className="ad-ellip">{i.title}</b>
              {i.note && <span className="hint">{i.note}</span>}
              <span className="ex-acts sm">
                {i.lat !== undefined && <a href={`https://www.google.com/maps/dir/?api=1&destination=${i.lat},${i.lng}&travelmode=walking`} target="_blank" rel="noreferrer">🧭 {t.exGo}</a>}
                {plan.days > 1 && <select aria-label={t.plDays} value={i.day} onChange={(e) => update(i.id, { day: Number(e.target.value) })}>{Array.from({ length: plan.days }, (_, k) => k + 1).map((n) => <option key={n} value={n}>{fmt(t.plDay, { n })}</option>)}</select>}
                <button onClick={() => remove(i.id)}>🗑</button>
              </span>
            </div>
          </div>
        ))}
        {route && <a className="btn ghost press" href={route} target="_blank" rel="noreferrer">{t.plRoute}</a>}
      </div>

      <div className="grid2">
        {plan.city && <button className="btn press" onClick={() => setAdding("places")}>{t.plAddPlaces}</button>}
        <button className="btn ghost press" onClick={() => setAdding("custom")}>{t.plAddCustom}</button>
      </div>

      {adding === "places" && (
        <div className="ex-modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setAdding(null); }}>
          <div className="card stack ex-sheet" style={{ maxHeight: "85vh" }}>
            <div className="row-between"><b>{t.plAddPlaces} · {fmt(t.plDay, { n: day })}</b><button className="link-btn" onClick={() => setAdding(null)}>✕</button></div>
            {[...moments.map((m) => ({ key: `m:${m.id}`, title: m.title, icon: m.icon, lat: m.lat, lng: m.lng, sub: m.text, kind: "moment" as const })),
              ...(places ?? []).slice(0, 80).map((p) => ({ key: p.id, title: p.name, icon: CAT_ICON[p.cat], lat: p.lat, lng: p.lng, sub: p.rating ? `★ ${p.rating.toFixed(1)} · ${t.cat[p.cat]}` : t.cat[p.cat], kind: "place" as const }))]
              .map((c) => (
                <div key={c.key} className="ex-row">
                  <span className="ex-ic sm" aria-hidden="true">{c.icon}</span>
                  <div className="stack" style={{ gap: 2, minWidth: 0, flex: 1 }}><b className="ad-ellip">{c.title}</b><span className="hint ad-ellip">{c.sub}</span></div>
                  <button className="mini" disabled={inPlan.has(c.title)} onClick={() => add({ title: c.title, icon: c.icon, lat: c.lat, lng: c.lng, kind: c.kind })}>{inPlan.has(c.title) ? "✓" : "+"}</button>
                </div>
              ))}
            {places === null && <p className="hint">{t.exLoading}</p>}
          </div>
        </div>
      )}

      {adding === "custom" && (
        <form className="card stack wl-form" onSubmit={(e) => { e.preventDefault(); if (!custom.title.trim()) return; add({ title: custom.title.trim(), kind: "custom", icon: "📝", ...(custom.time ? { time: custom.time } : {}), ...(custom.note.trim() ? { note: custom.note.trim() } : {}) }); setCustom({ title: "", time: "", note: "" }); setAdding(null); }}>
          <div className="grid2">
            <div className="field"><label htmlFor="ct">{t.plName}</label><input id="ct" required value={custom.title} maxLength={160} onChange={(e) => setCustom({ ...custom, title: e.target.value })} /></div>
            <div className="field"><label htmlFor="ch">{t.plTime}</label><input id="ch" type="time" value={custom.time} onChange={(e) => setCustom({ ...custom, time: e.target.value })} /></div>
          </div>
          <div className="field"><textarea rows={2} maxLength={500} placeholder={t.exNote} value={custom.note} onChange={(e) => setCustom({ ...custom, note: e.target.value })} /></div>
          <div className="grid2"><button type="button" className="btn ghost press" onClick={() => setAdding(null)}>{t.exCancel}</button><button className="btn press">{t.vSave}</button></div>
        </form>
      )}

      <div className="grid2">
        <button className="btn ghost press" onClick={() => void share()}>↗ {t.plShare}</button>
        <button className={`btn ghost press ${del ? "danger" : ""}`} onClick={async () => { if (!del) { setDel(true); setTimeout(() => setDel(false), 4000); return; } await fetch(`/api/me/plans/${plan.id}`, { method: "DELETE" }).catch(() => null); window.location.href = `/${locale}/wallet`; }}>🗑 {del ? `${t.plDelete}?` : t.plDelete}</button>
      </div>
    </div>
  );
}
