"use client";
import { signedStatus } from "@/lib/signed";
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
import Portal from "./Portal";
import { BackLink } from "./BackLink";
import { RULE_ICON, WARN, officialRulesUrl, placeRules } from "@/lib/place-rules";
import { PlaceSheet, type SheetPlace } from "./PlaceSheet";
import { ExportBar } from "./ExportBar";
import type { IcsEvent } from "@/lib/ics";
import { notifId, type Reminder, type TripDoc } from "@/lib/trip-export";
import { zonedToDate } from "@/lib/zoned";
import { TipsButton } from "./TravelTips";
import { tipsFor } from "@/data/travel-tips";

type Plan = { id: string; title: string; city: string | null; cityName: string; startDate: string | null; days: number; items: PlanItem[] };
const uid = () => Math.random().toString(36).slice(2, 10);

export function PlanView({ t: tProp, locale, plan: initial, moments, tz = "UTC" }: { t?: Dict; locale: Locale; plan: Plan; moments: MomentView[]; tz?: string }) {
  const t = useDict(tProp);
  const [rulesOf, setRulesOf] = useState<PlanItem | null>(null);
  const [plan, setPlan] = useState(initial);
  const [day, setDay] = useState(1);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [adding, setAdding] = useState<"places" | "custom" | null>(null);
  const [custom, setCustom] = useState({ title: "", time: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(false); // segundo toque confirma (sem diálogos do navegador)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Guarda na conta pouco depois de cada alteração; ao sair da página, guarda logo o que estiver pendente.
  const pending = useRef<Plan | null>(null);
  const put = (p: Plan, keepalive = false) => fetch(`/api/me/plans/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, keepalive,
    body: JSON.stringify({ title: p.title, startDate: p.startDate, days: p.days, items: p.items }) }).catch(() => null);
  function save(next: Partial<Plan>) {
    const merged = { ...plan, ...next };
    setPlan(merged);
    pending.current = merged;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { pending.current = null; void put(merged); }, 500);
  }
  useEffect(() => {
    const flush = () => { if (pending.current) { void put(pending.current, true); pending.current = null; } };
    window.addEventListener("pagehide", flush);
    return () => { window.removeEventListener("pagehide", flush); flush(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function loadPlaces(): Promise<Place[]> {
    if (places || !plan.city) return places ?? [];
    const r = await fetch(`/api/explore?city=${plan.city}&locale=${locale}`).catch(() => null);
    const j = r?.ok ? await r.json() : null;
    const p: Place[] = j?.places ?? [];
    setPlaces(p);
    return p;
  }
  useEffect(() => { if (adding === "places") void loadPlaces(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [adding]);
  // Pesquisa: filtra as sugestões e, a partir de 3 letras, procura também no mapa da cidade.
  // Preferência guardada neste telemóvel: lista escondida ou com todos os detalhes abertos.
  const [pref, setPrefState] = useState<{ hidden?: boolean; all?: boolean }>({});
  useEffect(() => { try { setPrefState(JSON.parse(localStorage.getItem("sgct:plan-view") ?? "{}") ?? {}); } catch { /* ignorar */ } }, []);
  const setPref = (p: { hidden?: boolean; all?: boolean }) => setPrefState((x) => { const n = { ...x, ...p }; try { localStorage.setItem("sgct:plan-view", JSON.stringify(n)); } catch { /* ignorar */ } return n; });
  const listHidden = Boolean(pref.hidden), allOpen = Boolean(pref.all);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [showPlace, setShowPlace] = useState<{ p: SheetPlace; add: { title: string; icon: string; lat: number; lng: number; kind: "moment" | "place" } } | null>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<{ label: string; sub: string; lat: number; lng: number }[] | null>(null);
  useEffect(() => {
    setHits(null);
    if (!plan.city || q.trim().length < 3) return;
    const id = setTimeout(() => {
      fetch(`/api/geocode?city=${plan.city}&lang=${locale}&q=${encodeURIComponent(q.trim())}`).then((r) => (r.ok ? r.json() : null))
        .then((j: { hits?: { label: string; sub: string; lat: number; lng: number }[] } | null) => setHits(j?.hits ?? [])).catch(() => setHits([]));
    }, 450);
    return () => clearTimeout(id);
  }, [q, plan.city, locale]);
  const norm = (x: string) => x.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

  async function auto() {
    setBusy(true);
    const p = await loadPlaces();
    const prefs = (await signedStatus()) === false ? null : await fetch("/api/me/prefs").then((r) => (r.ok ? r.json() : null)).catch(() => null);
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

  // Calendário, PDF, WhatsApp e lembretes do plano (horas no fuso da cidade).
  const dDate = (n: number) => { const d = new Date(`${plan.startDate}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n - 1); return d.toISOString().slice(0, 10); };
  const dItems = (n: number) => plan.items.filter((x) => x.day === n).sort((a, b) => (a.time ?? "99").localeCompare(b.time ?? "99"));
  const dayLabel = (n: number) => plan.startDate ? `${fmt(t.xo.day, { n })} · ${new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${dDate(n)}T12:00:00Z`))}` : fmt(t.xo.day, { n });
  const days = Array.from({ length: plan.days }, (_, k) => k + 1);
  const exp = {
    doc: (): TripDoc => ({ title: plan.title, subtitle: plan.cityName || undefined, footer: "VOYBU · voybu.com",
      sections: days.map((n) => ({ heading: dayLabel(n), rows: dItems(n).map((x) => ({ time: x.time, text: `${x.icon ?? "📍"} ${x.title}`, sub: x.note || undefined })) })).filter((d) => d.rows.length) }),
    events: (): IcsEvent[] | null => {
      if (!plan.startDate) return null;
      return days.flatMap((n) => {
        const items = dItems(n);
        const timed = items.filter((x) => x.time).map((x) => ({ uid: `plan-${plan.id}-${x.id}`, title: `${x.icon ?? "📍"} ${x.title}`, start: zonedToDate(`${dDate(n)}T${x.time}`, tz),
          location: x.lat !== undefined ? `${x.lat},${x.lng}` : plan.cityName, description: x.note, alarms: [30] }));
        const loose = items.filter((x) => !x.time);
        return [...timed, ...(loose.length ? [{ uid: `plan-${plan.id}-d${n}`, title: `${plan.title} · ${fmt(t.xo.day, { n })}`, start: new Date(), allDay: dDate(n), location: plan.cityName,
          description: loose.map((x) => `• ${x.title}`).join("\n") }] : [])];
      });
    },
    reminders: (): Reminder[] => !plan.startDate ? [] : days.flatMap((n) => {
      const items = dItems(n);
      const morning = items.length ? [{ id: notifId(`${plan.id}:d${n}`), at: zonedToDate(`${dDate(n)}T09:00`, tz), title: `${plan.title} · ${fmt(t.xo.day, { n })}`, body: items.map((x) => x.title).join(" · ").slice(0, 180) }] : [];
      return [...morning, ...items.filter((x) => x.time).map((x) => ({ id: notifId(`${plan.id}:${x.id}`), at: new Date(zonedToDate(`${dDate(n)}T${x.time}`, tz).getTime() - 30 * 60_000), title: `${x.icon ?? "📍"} ${x.title}`, body: fmt(t.xo.starts, { x: x.time! }) }))];
    })
  };

  return (
    <div className="stack" style={{ gap: 16 }}>
      <BackLink fallback={`/${locale}/wallet#plans`} label={t.plBack.replace(/^\s*←\s*/, "")} />
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
            {fmt(t.plDay, { n })}{dayDate(n) ? <small style={{ display: "block", fontWeight: 500 }} suppressHydrationWarning>{dayDate(n)}</small> : null}
          </button>
        ))}
      </div>

      <div className="stack" style={{ gap: 8 }}>
        {dayItems.length === 0 && <p className="hint">{t.plEmptyDay}</p>}
        {/* Lista compacta: uma linha por lugar; tocar abre os detalhes. A lista inteira também se esconde. */}
        {dayItems.length > 0 && (
          <div className="plv-bar">
            <button type="button" className="plv-tog" aria-expanded={!listHidden} onClick={() => setPref({ hidden: !listHidden })}>
              <span aria-hidden="true">{listHidden ? "▸" : "▾"}</span> {fmt(t.plv.places, { n: dayItems.length })}
            </button>
            {!listHidden && <button type="button" className="link-btn" onClick={() => { setPref({ all: !allOpen }); setOpenIds(new Set()); }}>{allOpen ? t.plv.none : t.plv.all}</button>}
            {listHidden && <button type="button" className="link-btn" onClick={() => setPref({ hidden: false })}>{t.plv.show}</button>}
          </div>
        )}
        {!listHidden && dayItems.map((i) => {
          const rules = placeRules(i.title, i.icon);
          const open = allOpen || openIds.has(i.id);
          const warn = rules.some((r) => WARN.has(r));
          const toggle = () => setOpenIds((s) => { const n = new Set(s); if (n.has(i.id)) n.delete(i.id); else n.add(i.id); return n; });
          return (
          <div key={i.id} className={`card pl-item ${open ? "open" : "compact"}`}>
            <input className="pl-time" type="time" value={i.time ?? ""} aria-label={t.plTime} onChange={(e) => update(i.id, { time: e.target.value || undefined })} />
            <span className="ex-ic sm" aria-hidden="true">{i.icon ?? "📍"}</span>
            <div className="stack" style={{ gap: 2, minWidth: 0, flex: 1 }}>
              <button type="button" className="pl-head" aria-expanded={open} onClick={toggle} aria-label={`${t.plv.more}: ${i.title}`}>
                <b className="ad-ellip">{i.title}</b>
                {!open && warn && <span className="pl-dot" aria-hidden="true">⚠️</span>}
                <span className="pl-chev" aria-hidden="true">{open ? "▴" : "▾"}</span>
              </button>
              {open && <>
                {i.note && <span className="hint">{i.note}</span>}
                {rules.length > 0 && (
                  <button type="button" className="pa-chips press" onClick={() => setRulesOf(i)} aria-label={`${t.pa.title}: ${i.title}`}>
                    {rules.slice(0, 2).map((r) => <span key={r} className={`pa-chip${WARN.has(r) ? " warn" : ""}`}>{RULE_ICON[r]} {t.pa[r]}</span>)}
                    {rules.length > 2 && <span className="pa-chip more">{fmt(t.pa.more, { n: rules.length - 2 })}</span>}
                  </button>
                )}
                <span className="ex-acts sm">
                  {i.lat !== undefined && <a href={`https://www.google.com/maps/dir/?api=1&destination=${i.lat},${i.lng}&travelmode=walking`} target="_blank" rel="noreferrer">🧭 {t.exGo}</a>}
                  {plan.days > 1 && <select aria-label={t.plDays} value={i.day} onChange={(e) => update(i.id, { day: Number(e.target.value) })}>{Array.from({ length: plan.days }, (_, k) => k + 1).map((n) => <option key={n} value={n}>{fmt(t.plDay, { n })}</option>)}</select>}
                  <button onClick={() => remove(i.id)}>🗑</button>
                </span>
              </>}
            </div>
          </div>
          );
        })}
        {route && <a className="btn ghost press" href={route} target="_blank" rel="noreferrer">{t.plRoute}</a>}
      </div>

      <div className="grid2">
        {plan.city && <button className="btn press" onClick={() => setAdding("places")}>{t.plAddPlaces}</button>}
        <button className="btn ghost press" onClick={() => setAdding("custom")}>{t.plAddCustom}</button>
      </div>

      {adding === "places" && (
        <div className="ex-modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setAdding(null); }}>
          <div className="card stack ex-sheet" style={{ maxHeight: "85vh" }}>
            <div className="row-between"><b>{t.plAddPlaces} · {fmt(t.plDay, { n: day })}</b><button className="link-btn" onClick={() => { setAdding(null); setQ(""); }} aria-label={t.close}>✕</button></div>
            <label className="pl-search"><span aria-hidden="true">🔍</span>
              <input type="text" inputMode="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.plSearch} aria-label={t.plSearch} autoComplete="off" enterKeyHint="search" />
              {q && <button type="button" className="link-btn" onClick={() => setQ("")} aria-label={t.close}>✕</button>}
            </label>
            {[...moments.map((m) => ({ key: `m:${m.id}`, title: m.title, icon: m.icon, lat: m.lat, lng: m.lng, sub: m.text, kind: "moment" as const, sheet: { name: m.title, lat: m.lat, lng: m.lng, icon: m.icon, text: m.text } as SheetPlace })),
              ...(places ?? []).slice(0, q ? 400 : 80).map((p) => ({ key: p.id, title: p.name, icon: CAT_ICON[p.cat], lat: p.lat, lng: p.lng, sub: p.rating ? `★ ${p.rating.toFixed(1)} · ${t.cat[p.cat]}` : t.cat[p.cat], kind: "place" as const,
                sheet: { name: p.name, lat: p.lat, lng: p.lng, icon: CAT_ICON[p.cat], catLabel: t.cat[p.cat], rating: p.rating, reviews: p.reviews, openNow: p.openNow, hours: p.hours, fee: p.fee, web: p.web, gmaps: p.gmaps, photo: p.photo, wiki: p.wiki } as SheetPlace }))]
              .filter((c) => !q.trim() || norm(`${c.title} ${c.sub}`).includes(norm(q.trim())))
              .map((c) => (
                // Tocar no lugar abre a ficha (foto, horário, descrição); o "+" continua a juntar logo ao plano.
                <div key={c.key} className="ex-row tap" role="button" tabIndex={0} aria-label={`${t.pi.more}: ${c.title}`}
                  onClick={(e) => { if ((e.target as HTMLElement).closest("button:not(.ex-row)")) return; setShowPlace({ p: c.sheet, add: { title: c.title, icon: c.icon, lat: c.lat, lng: c.lng, kind: c.kind } }); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) setShowPlace({ p: c.sheet, add: { title: c.title, icon: c.icon, lat: c.lat, lng: c.lng, kind: c.kind } }); }}>
                  <span className="ex-ic sm" aria-hidden="true">{c.icon}</span>
                  <div className="stack" style={{ gap: 2, minWidth: 0, flex: 1 }}><b className="ad-ellip">{c.title}</b><span className="hint ad-ellip">{c.sub}</span></div>
                  <button className="mini" disabled={inPlan.has(c.title)} onClick={() => add({ title: c.title, icon: c.icon, lat: c.lat, lng: c.lng, kind: c.kind })}>{inPlan.has(c.title) ? "✓" : "+"}</button>
                </div>
              ))}
            {places === null && <p className="hint">{t.exLoading}</p>}
            {q.trim().length >= 3 && <>
              <span className="label">📍 {t.plOnMap}</span>
              {hits === null ? <p className="hint">{t.exLoading}</p> : hits.length === 0 ? <p className="hint">{t.plNoMatch}</p> : hits.map((h, i) => (
                <div key={`g${i}`} className="ex-row">
                  <span className="ex-ic sm" aria-hidden="true">📍</span>
                  <div className="stack" style={{ gap: 2, minWidth: 0, flex: 1 }}><b className="ad-ellip">{h.label}</b><span className="hint ad-ellip">{h.sub}</span></div>
                  <button className="mini" disabled={inPlan.has(h.label)} onClick={() => add({ title: h.label.slice(0, 80), icon: "📍", lat: h.lat, lng: h.lng, kind: "place" })}>{inPlan.has(h.label) ? "✓" : "+"}</button>
                </div>
              ))}
            </>}
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
        <TipsButton t={t} tips={tipsFor({ cities: plan.city ? [plan.city] : [], mode: "plan" })} />
        <ExportBar t={t} name={plan.title} doc={exp.doc} events={exp.events} reminders={exp.reminders} />
        <button className="btn ghost press" onClick={() => void share()}>↗ {t.plShare}</button>
        <button className={`btn ghost press ${del ? "danger" : ""}`} onClick={async () => { if (!del) { setDel(true); setTimeout(() => setDel(false), 4000); return; } await fetch(`/api/me/plans/${plan.id}`, { method: "DELETE" }).catch(() => null); window.location.href = `/${locale}/wallet`; }}>🗑 {del ? `${t.plDelete}?` : t.plDelete}</button>
      </div>

      {showPlace && <PlaceSheet t={t} locale={locale} place={showPlace.p} inPlan={inPlan.has(showPlace.add.title)} onAdd={() => add(showPlace.add)} onClose={() => setShowPlace(null)} />}
      {rulesOf && (
        <Portal><div className="as-bg" onClick={() => setRulesOf(null)}>
          <div className="as wt-sheet" role="dialog" aria-modal="true" aria-label={t.pa.title} onClick={(e) => e.stopPropagation()}>
            <span className="as-grab" aria-hidden="true" />
            <div className="nn-sh-h"><span /><b>{t.pa.title}</b><button type="button" className="mu2-x nn-x" onClick={() => setRulesOf(null)} aria-label={t.close}>✕</button></div>
            <p className="pa-place">{rulesOf.icon ?? "📍"} {rulesOf.title}</p>
            <div className="as-group">
              {placeRules(rulesOf.title, rulesOf.icon).map((r) => (
                <div key={r} className="as-row pa-row">
                  <span className="pa-ic" aria-hidden="true">{RULE_ICON[r]}</span>
                  <span className="as-tx"><span>{t.pa[r]}{WARN.has(r) ? " ⚠️" : ""}</span><small>{t.pa[`${r}L` as keyof Dict["pa"]]}</small></span>
                </div>
              ))}
            </div>
            <p className="pa-note">{t.pa.note}</p>
            <a className="nn-more" href={officialRulesUrl(rulesOf.title, plan.cityName)} target="_blank" rel="noopener noreferrer">{t.pa.official} ↗</a>
          </div>
        </div></Portal>
      )}
    </div>
  );
}
