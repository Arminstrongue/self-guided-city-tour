"use client";
import { useNative } from "@/lib/use-native";
import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { hop } from "@/lib/route-cost";
import { loadReservations, type Reservation } from "@/lib/trip-local";
import { loadTrip } from "./trip-store";
import { RES_ICON, resWhen, TicketSheet } from "./Reservations";

type LL = { lat: number; lng: number };
export type Progress = { city: string; name: string; next: string; i: number; total: number; at: number };
type Booking = { id: string; guide: string; guideId: string; startAt: string; city: string; meeting?: string | null; status: string };
/** Margem antes de uma hora marcada (minutos). */
const MARGIN = 15;

/** Posição atual só se o viajante já autorizou (não pede autorização ao abrir). */
async function quietPos(): Promise<LL | null> {
  try {
    const p = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
    if (p?.state !== "granted") return null;
    return await new Promise((ok) => navigator.geolocation.getCurrentPosition((x) => ok({ lat: x.coords.latitude, lng: x.coords.longitude }), () => ok(null), { maximumAge: 300000, timeout: 8000 }));
  } catch { return null; }
}

/**
 * "Agora": responde a "o que faço agora, como chego, o que preciso e quanto tempo tenho".
 * Junta reservas e bilhetes, visitas com guia e o roteiro em curso; diz de onde vem cada informação.
 */
export function NowPanel({ t, locale, cities, signed, bookings, planned, hasPass }: {
  t: Dict; locale: Locale; cities: Record<string, string>; signed: boolean; bookings: Booking[];
  planned: { city: string; n: number; h: string; open: boolean; base?: string; end?: string; mode?: "plane" | "train" | "bus" | "ship" | "stay" | "walk"; startAt?: string } | null; hasPass: boolean;
}) {
  const native = useNative();
  const [res, setRes] = useState<Reservation[]>([]);
  const [prog, setProg] = useState<Progress[]>([]);
  const [pos, setPos] = useState<LL | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [show, setShow] = useState<Reservation | null>(null);
  useEffect(() => {
    const r = () => void loadReservations(signed).then(setRes);
    r(); window.addEventListener("sgct:res", r);
    try { setProg(Object.values(JSON.parse(localStorage.getItem("sgct:progress") ?? "{}") as Record<string, Progress>)); } catch { /* ignorar */ }
    void quietPos().then(setPos);
    const i = setInterval(() => setNow(Date.now()), 60_000);
    return () => { window.removeEventListener("sgct:res", r); clearInterval(i); };
  }, [signed]);

  const hm = (d: Date) => d.toLocaleTimeString(INTL_LOCALE[locale], { hour: "2-digit", minute: "2-digit" });
  type Item = { at: number; kind: "res"; r: Reservation } | { at: number; kind: "guide"; b: Booking };
  const items: Item[] = [
    ...res.filter((r) => new Date(r.startsAt).getTime() > now - 30 * 60_000).map((r) => ({ at: new Date(r.startsAt).getTime(), kind: "res" as const, r })),
    ...bookings.filter((b) => b.status === "confirmed" && new Date(b.startAt).getTime() > now - 30 * 60_000).map((b) => ({ at: new Date(b.startAt).getTime(), kind: "guide" as const, b }))
  ].sort((a, b) => a.at - b.at);
  const tour = prog.filter((p) => p.i < p.total && now - p.at < 36 * 3600_000).sort((a, b) => b.at - a.at)[0] ?? null;
  const soon = items.find((x) => x.at - now < 6 * 3600_000) ?? null;
  const primary: Item | "tour" | null = soon ?? (tour ? "tour" : items[0] ?? null);
  const later = items.filter((x) => x !== primary).slice(0, 4);

  const fromFor = (city: string): LL | null => { if (pos) return pos; const b = city ? loadTrip(city).start : null; return b && b.kind !== "airport" ? b : null; };
  function resCard(r: Reservation) {
    const start = new Date(r.startsAt);
    const w = resWhen(r, locale);
    const to = r.lat !== null && r.lng !== null ? { lat: r.lat, lng: r.lng } : null;
    const from = to ? fromFor(r.city) : null;
    const h = to && from ? hop(from, to) : null;
    const leave = h ? new Date(start.getTime() - (h.min + MARGIN) * 60_000) : null;
    const late = leave && leave.getTime() < now;
    const dir = to ? `https://www.google.com/maps/dir/?api=1&destination=${to.lat},${to.lng}&travelmode=${h?.m === "walk" ? "walking" : "transit"}` : r.place ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.place)}` : null;
    return (
      <div className="card now-card">
        <span className="now-k">{RES_ICON[r.kind]} {t.rsKinds[r.kind as keyof Dict["rsKinds"]]}{r.city && cities[r.city] ? ` · ${cities[r.city]}` : ""}</span>
        <b className="now-t">{r.title}</b>
        <p className="now-row">🕒 {fmt(t.nwStarts, { t: w.hm, d: w.day })} <span className="is-tag">{t.isYou}</span></p>
        {leave ? <p className={`now-row ${late ? "bad" : ""}`}>🚶 {fmt(late ? t.nwLeaveNow : t.nwLeave, { t: hm(leave), m: h!.min, g: MARGIN })} <span className="is-tag">{t.isEst}</span></p>
          : <p className="now-row hint">{to ? t.nwNoFrom : t.nwNoPlace}</p>}
        {r.place && <p className="now-row">📍 {r.place}</p>}
        <p className="now-row">{r.photo || r.ref ? `🎟 ${t.nwNeedTicket}` : `ℹ️ ${t.nwNoTicket}`} · {r.paid ? t.rsPaid : t.rsToPay}</p>
        <div className="now-acts">
          {dir && <a className="btn tram press" href={dir} target="_blank" rel="noreferrer">{t.nwGo}</a>}
          <button className="btn ghost press" onClick={() => setShow(r)}>{r.photo || r.ref ? t.nwTicket : t.nwDetails}</button>
        </div>
      </div>
    );
  }
  function guideCard(b: Booking) {
    const start = new Date(b.startAt);
    return (
      <div className="card now-card">
        <span className="now-k">🧑‍💼 {t.wBookings} · {cities[b.city] ?? b.city}</span>
        <b className="now-t">{b.guide}</b>
        <p className="now-row">🕒 {hm(start)} <span className="is-tag">{t.isBooking}</span></p>
        {b.meeting && <p className="now-row">📍 {t.wMeet}: {b.meeting}</p>}
        <div className="now-acts"><a className="btn tram press" href={`/${locale}/g/${b.guideId}`}>{t.nwDetails}</a></div>
      </div>
    );
  }

  return (
    <section className="stack now" style={{ gap: 10 }} aria-labelledby="now-h">
      <h2 className="gp-h2 sm" id="now-h">{t.nowTitle}</h2>
      {primary === "tour" && tour ? (
        <div className="card now-card">
          <span className="now-k">🧭 {tour.name} · {fmt(t.nxStep, { n: tour.i + 1, N: tour.total })}</span>
          <b className="now-t">{fmt(t.nwNextStop, { s: tour.next })}</b>
          <div className="now-acts"><a className="btn tram press" href={`/${locale}/tour/${tour.city}`}>{t.nwContinue}</a></div>
        </div>
      ) : primary && typeof primary === "object" ? (primary.kind === "res" ? resCard(primary.r) : guideCard(primary.b))
        : planned && cities[planned.city] ? (
          <div className="card now-card">
            <span className="now-k">⏱ {t.wPlanned}</span>
            <b className="now-t">{cities[planned.city]} · {fmt(t.wPlannedSub, { n: planned.n, h: planned.h })}</b>
            {planned.base && planned.end && <span className="hint">{planned.base} → {planned.end}{planned.mode ? ` · ${t.tpModes[planned.mode]}` : ""}</span>}
            {planned.startAt && <span className="hint">{fmt(t.tpStartsAt, { t: planned.startAt.replace("T", " ") })}</span>}
            <div className="now-acts"><a className="btn tram press" href={`/${locale}/${planned.open ? "tour" : "c"}/${planned.city}${planned.open ? "" : native ? "" : "#book"}`}>{planned.open ? t.qsStart : native ? t.signIn : t.bookTitle}</a><a className="btn ghost press" href={`/${locale}/start?city=${planned.city}`}>{t.bpChange}</a></div>
          </div>
        ) : (
          <div className="card now-card now-empty">
            <b className="now-t">{t.nwEmptyT}</b>
            <p className="hint">{hasPass ? t.nwEmptyPass : t.nwEmptyS}</p>
            <div className="now-acts"><a className="btn tram press" href={`/${locale}/start`}>{t.hmBuild}</a></div>
          </div>
        )}
      {later.length > 0 && (
        <div className="stack" style={{ gap: 6 }}>
          <span className="bp-h">{t.nwLater}</span>
          {later.map((x) => x.kind === "res" ? (
            <button key={x.r.id} className="card now-mini press" onClick={() => setShow(x.r)}><span>{RES_ICON[x.r.kind]}</span><span className="stack" style={{ gap: 0, minWidth: 0 }}><b>{x.r.title}</b><small className="hint">{resWhen(x.r, locale).day} · {resWhen(x.r, locale).hm}</small></span></button>
          ) : (
            <a key={x.b.id} className="card now-mini press" href={`/${locale}/g/${x.b.guideId}`}><span>🧑‍💼</span><span className="stack" style={{ gap: 0 }}><b>{x.b.guide}</b><small className="hint">{hm(new Date(x.b.startAt))}</small></span></a>
          ))}
        </div>
      )}
      {show && <TicketSheet r={show} t={t} locale={locale} onClose={() => setShow(null)} />}
    </section>
  );
}
