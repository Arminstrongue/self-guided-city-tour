"use client";
import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { zonedToDate } from "@/lib/zoned";
import { compressPhoto, loadReservations, removeReservation, saveReservation, type Reservation, type ResInput } from "@/lib/trip-local";
import Portal from "./Portal";
import { SheetX } from "./WinNav";

export const RES_ICON: Record<string, string> = { hotel: "🏨", ticket: "🎟", food: "🍽", transport: "🚆", tour: "🧭", other: "📌" };
const KINDS = ["hotel", "ticket", "food", "transport", "tour", "other"] as const;
const deviceTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "UTC"; } };

/** Hora local do destino, como está no bilhete (e o dia, se não for hoje). */
export function resWhen(r: Reservation, locale: Locale) {
  const d = new Date(r.startsAt);
  const day = new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: r.tz, weekday: "short", day: "numeric", month: "short" }).format(d);
  const hm = new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: r.tz, hour: "2-digit", minute: "2-digit" }).format(d);
  return { day, hm };
}

/** O bilhete em ecrã inteiro: foto, referência em letra grande, local e hora (indicada pelo viajante). */
export function TicketSheet({ r, t, locale, onClose }: { r: Reservation; t: Dict; locale: Locale; onClose: () => void }) {
  const w = resWhen(r, locale);
  return (
    <Portal><div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack tk" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={r.title}>
        <SheetX onClose={onClose} label={t.close} />
        <b style={{ fontSize: 18 }}>{RES_ICON[r.kind]} {r.title}</b>
        <span className="hint">{w.day} · <b>{w.hm}</b> <span className="is-tag">{t.isYou}</span></span>
        {r.ref && <div className="tk-ref"><small>{t.rsRef}</small><b>{r.ref}</b></div>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {r.photo && <img className="tk-img" src={r.photo} alt={t.rsPhoto} />}
        {r.place && <p>📍 {r.place}</p>}
        {r.notes && <p className="hint">{r.notes}</p>}
        <span className={`chip ${r.paid ? "walk" : "paid"}`}>{r.paid ? t.rsPaid : t.rsToPay}</span>
        {(r.lat !== null && r.lng !== null) || r.place ? (
          <a className="btn tram press" target="_blank" rel="noreferrer"
            href={r.lat !== null && r.lng !== null ? `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.place)}`}>{t.directions}</a>
        ) : null}
      </div>
    </div></Portal>
  );
}

type Hit = { label: string; sub: string; lat: number; lng: number };

/** Cidade do plano escolhido ou do roteiro mais recente neste telemóvel (se existir na lista). */
function contextCity(cities: Record<string, string>): string {
  try {
    const p = JSON.parse(localStorage.getItem("sgct:planned") ?? "null") as { city?: string } | null;
    const prog = Object.values(JSON.parse(localStorage.getItem("sgct:progress") ?? "{}") as Record<string, { city: string; at: number }>).sort((a, b) => b.at - a.at)[0];
    for (const c of [prog?.city, p?.city]) if (c && cities[c]) return c;
  } catch { /* ignorar */ }
  return "";
}

/** Adicionar ou editar uma reserva. Mostra no fim o que ficou guardado, para o viajante confirmar. */
function Editor({ t, locale, cities, tzOf, signed, initial, onClose }: {
  t: Dict; locale: Locale; cities: Record<string, string>; tzOf: Record<string, string>; signed: boolean; initial: Reservation | null; onClose: (changed: boolean) => void;
}) {
  // Cidade pelo contexto (plano escolhido ou roteiro em curso); sem cidade, o fuso tem de ser escolhido (nunca assumido).
  const [f, setF] = useState<ResInput>(() => initial ? { ...initial } : { kind: "ticket", title: "", city: contextCity(cities), localAt: "", tz: "", place: "", lat: null, lng: null, ref: "", notes: "", photo: "", paid: false });
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (p: Partial<ResInput>) => setF((x) => ({ ...x, ...p }));
  const tz = f.city && tzOf[f.city] ? tzOf[f.city] : f.tz;
  const zones = [...new Set([deviceTz(), ...Object.values(tzOf)])].sort();
  const when = f.localAt && tz ? zonedToDate(f.localAt, tz) : null;
  async function find() {
    if (!f.city || f.place.trim().length < 3) return;
    const j = await fetch(`/api/geocode?city=${f.city}&lang=${locale}&q=${encodeURIComponent(f.place.trim())}`).then((r) => (r.ok ? r.json() : null)).catch(() => null) as { hits?: Hit[] } | null;
    setHits(j?.hits ?? []);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (!f.city && !f.tz) { setErr(t.rsTzErr); return; }
    if (!f.title.trim() || !when || isNaN(when.getTime())) { setErr(t.rsErr); return; }
    setBusy(true);
    const r = await saveReservation(signed, { ...f, tz }, when.toISOString(), initial?.id);
    setBusy(false);
    if (!r) { setErr(t.tsError); return; }
    onClose(true);
  }
  return (
    <Portal><div className="sheet-bg" onClick={() => onClose(false)}>
      <form className="sheet stack rs-ed" style={{ gap: 10 }} onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <SheetX onClose={() => onClose(false)} label={t.close} />
        <b style={{ fontSize: 18 }}>{initial ? t.rsEdit : t.rsAdd}</b>
        <div className="rs-kinds">{KINDS.map((k) => <button key={k} type="button" className={f.kind === k ? "on" : ""} onClick={() => set({ kind: k })}>{RES_ICON[k]} {t.rsKinds[k]}</button>)}</div>
        <div className="field"><label htmlFor="rs-t">{t.rsTitle}</label><input id="rs-t" value={f.title} maxLength={120} onChange={(e) => set({ title: e.target.value })} placeholder={t.rsTitlePh} required /></div>
        <div className="grid2">
          <div className="field"><label htmlFor="rs-c">{t.rsCity}</label>
            <select id="rs-c" value={f.city} onChange={(e) => set({ city: e.target.value })}>
              <option value="">{t.rsOtherCity}</option>
              {Object.entries(cities).sort((a, b) => a[1].localeCompare(b[1])).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
            </select></div>
          <div className="field"><label htmlFor="rs-w">{t.rsWhen}</label><input id="rs-w" type="datetime-local" value={f.localAt} onChange={(e) => set({ localAt: e.target.value })} required /></div>
        </div>
        {f.city ? <p className="hint">{fmt(t.rsTzNote, { z: tz })}</p> : (
          <div className="field"><label htmlFor="rs-tz">{t.rsTzPick}</label>
            <select id="rs-tz" value={f.tz} onChange={(e) => set({ tz: e.target.value })} required>
              <option value="">—</option>
              {zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}
            </select></div>
        )}
        <div className="field"><label htmlFor="rs-p">{t.rsPlace}</label>
          <div className="bp-q"><input id="rs-p" value={f.place} maxLength={200} onChange={(e) => set({ place: e.target.value, lat: null, lng: null })} placeholder={t.rsPlacePh} />
            {f.city && <button type="button" className="btn ghost" onClick={() => void find()}>{t.bpSearch}</button>}</div></div>
        {hits && (hits.length ? <div className="bp-hits">{hits.map((h, i) => <button type="button" key={i} className="bp-hit" onClick={() => { set({ place: `${h.label}${h.sub ? `, ${h.sub}` : ""}`, lat: h.lat, lng: h.lng }); setHits(null); }}><b>{h.label}</b><small>{h.sub}</small></button>)}</div> : <p className="hint">{t.bpNone}</p>)}
        {f.lat !== null && <p className="bp-ok">✓ {t.rsPinned}</p>}
        <div className="field"><label htmlFor="rs-r">{t.rsRef}</label><input id="rs-r" value={f.ref} maxLength={80} onChange={(e) => set({ ref: e.target.value })} /></div>
        <label className="rs-paid"><input type="checkbox" checked={f.paid} onChange={(e) => set({ paid: e.target.checked })} /> <span>{t.rsPaid}</span></label>
        <div className="field"><label htmlFor="rs-ph">{t.rsPhoto}</label>
          <input id="rs-ph" type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) set({ photo: await compressPhoto(file).catch(() => "") }); }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {f.photo && <span className="row" style={{ gap: 8 }}><img src={f.photo} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }} /><button type="button" className="link-btn danger" onClick={() => set({ photo: "" })}>{t.ofRemove}</button></span>}
          <small className="hint">{t.rsPhotoNote}</small></div>
        <div className="field"><label htmlFor="rs-n">{t.rsNotes}</label><textarea id="rs-n" rows={2} maxLength={600} value={f.notes} onChange={(e) => set({ notes: e.target.value })} placeholder={t.rsNotesPh} /></div>
        {when && !isNaN(when.getTime()) && f.title && (
          <div className="rs-check"><small>{t.rsCheck}</small>
            <b>{RES_ICON[f.kind]} {f.title}</b>
            <span>{new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: tz, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(when)} · {f.city ? cities[f.city] : tz}</span>
            {f.place && <span>📍 {f.place}</span>}
          </div>
        )}
        {err && <p className="err">{err}</p>}
        <button className="btn tram press" disabled={busy}>{t.rsSave}</button>
        {!signed && <p className="hint">{t.rsLocal}</p>}
      </form>
    </div></Portal>
  );
}

/** Lista de reservas e bilhetes (Minha viagem). */
export function Reservations({ t, locale, cities, tzOf, signed }: { t: Dict; locale: Locale; cities: Record<string, string>; tzOf: Record<string, string>; signed: boolean }) {
  const [list, setList] = useState<Reservation[] | null>(null);
  const [edit, setEdit] = useState<Reservation | null | "new">(null);
  const [show, setShow] = useState<Reservation | null>(null);
  const reload = () => void loadReservations(signed).then(setList);
  useEffect(reload, [signed]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <section className="stack" style={{ gap: 10 }}>
      <button className="btn press" onClick={() => setEdit("new")}>＋ {t.rsAdd}</button>
      {list && list.length === 0 && <div className="card gp-empty"><span aria-hidden="true">🎟</span><b>{t.rsEmpty}</b><span className="hint">{t.rsEmptySub}</span></div>}
      {list?.map((r) => {
        const w = resWhen(r, locale);
        return (
          <div key={r.id} className="card rs-item">
            <button className="rs-main press" onClick={() => setShow(r)}>
              <span className="rs-ic" aria-hidden="true">{RES_ICON[r.kind]}</span>
              <span className="stack" style={{ gap: 2, minWidth: 0 }}><b>{r.title}</b><span className="hint">{w.day} · {w.hm}{r.city && cities[r.city] ? ` · ${cities[r.city]}` : ""}</span>{r.place && <span className="hint ad-ellip">📍 {r.place}</span>}</span>
              {(r.photo || r.ref) && <span className="chip walk">{t.rsTicket}</span>}
            </button>
            <div className="rs-acts"><button className="link-btn" onClick={() => setEdit(r)}>{t.rsEdit}</button><button className="link-btn danger" onClick={async () => { await removeReservation(signed, r.id); reload(); }}>{t.ofRemove}</button></div>
          </div>
        );
      })}
      {edit && <Editor t={t} locale={locale} cities={cities} tzOf={tzOf} signed={signed} initial={edit === "new" ? null : edit} onClose={(c) => { setEdit(null); if (c) reload(); }} />}
      {show && <TicketSheet r={show} t={t} locale={locale} onClose={() => setShow(null)} />}
    </section>
  );
}
