"use client";
import { BackLink } from "./BackLink";
import { useDict } from "@/i18n/client-dict";
import { SheetX } from "@/components/WinNav";
/** Agenda da cidade dentro da carteira: eventos dos próximos 30 dias e o que vale sempre a pena, sem sair da app. */
import { useEffect, useMemo, useState } from "react";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import type { CityEvent } from "@/lib/events";
import type { MomentView } from "./Explore";
import { AddToPlan } from "./Explore";
import { WHEN_ICON } from "@/data/moments";
import { loadWish, saveWish, toggleWish, wishKey, type Wish } from "@/lib/wishlist";
import Portal from "@/components/Portal";

type Range = "all" | "today" | "tomorrow" | "weekend";
const KINDS: CityEvent["kind"][] = ["music", "sport", "arts", "family", "film", "other"];
const KIND_ICON: Record<CityEvent["kind"], string> = { music: "🎵", sport: "⚽", arts: "🎭", family: "🧸", film: "🎬", other: "🎟" };

/** Data local (AAAA-MM-DD) da cidade, com deslocamento em dias. */
function localDay(tz: string | undefined, plus = 0) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: tz ?? "UTC" }).format(new Date(Date.now() + plus * 86400_000));
}

export function AgendaView({ t: tProp, locale, cityId, cities, moments, tz, openId }: { t?: Dict; locale: Locale; cityId: string; cities: Record<string, string>; moments: MomentView[]; tz?: string; openId?: string }) {
  const t = useDict(tProp);
  const [events, setEvents] = useState<CityEvent[] | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [range, setRange] = useState<Range>("all");
  const [kind, setKind] = useState<CityEvent["kind"] | "all">("all");
  const [open, setOpen] = useState<CityEvent | null>(null);
  const [toPlan, setToPlan] = useState<{ title: string; lat: number; lng: number; icon: string; kind: "moment" | "place" } | null>(null);
  const [wish, setWish] = useState<Wish[]>([]);
  const [msg, setMsg] = useState("");
  useEffect(() => { void loadWish().then((r) => setWish(r.list)); }, []);
  useEffect(() => {
    setEvents(null);
    fetch(`/api/events?city=${cityId}`).then((r) => (r.ok ? r.json() : null)).then((j) => {
      const list = (j?.events ?? []) as CityEvent[];
      setEvents(list); setEnabled(Boolean(j?.enabled));
      if (openId) setOpen(list.find((e) => e.id === openId) ?? null);
    }).catch(() => setEvents([]));
  }, [cityId, openId]);
  useEffect(() => { try { localStorage.setItem("sgct:agenda-city", cityId); } catch { /* ignorar */ } }, [cityId]);

  const today = localDay(tz), tomorrow = localDay(tz, 1);
  const weekend = useMemo(() => Array.from({ length: 7 }, (_, i) => localDay(tz, i)).filter((d) => [5, 6, 0].includes(new Date(`${d}T12:00:00Z`).getUTCDay())), [tz]);
  const on = (e: CityEvent, d: string) => e.localDate === d || (Boolean(e.until) && e.localDate <= d && d <= e.until!);
  const list = (events ?? []).filter((e) => (kind === "all" || e.kind === kind) && (range === "all" || (range === "today" ? on(e, today) : range === "tomorrow" ? on(e, tomorrow) : weekend.some((d) => on(e, d)))));
  // Agrupado por dia em ordem de data; sessões já começadas que continuam aparecem em "hoje".
  const days = useMemo(() => {
    const m = new Map<string, CityEvent[]>();
    for (const e of list) { const d = e.localDate < today ? today : e.localDate; if (e.localDate < today && !(e.until && e.until >= today)) continue; m.set(d, [...(m.get(d) ?? []), e]); }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [list, today]);
  const kinds = KINDS.filter((k) => (events ?? []).some((e) => e.kind === k));
  const dayFmt = new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "long", day: "numeric", month: "long" });
  const shortFmt = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short" });
  const money = (n: number, c: string) => { try { return new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n); } catch { return `${n} ${c}`; } };
  const price = (e: CityEvent) => (e.free ? `🆓 ${t.exFreeEntry}` : e.priceMin && e.currency
    ? `🎟 ${e.priceMax ? `${money(e.priceMin, e.currency)} – ${money(e.priceMax, e.currency)}` : fmt(t.exFrom, { p: money(e.priceMin, e.currency) })}` : `🎟 ${t.evPriceSite}`);
  const badStatus = (e: CityEvent) => e.status && e.status !== "onsale";
  const wished = (title: string) => wish.some((x) => wishKey(x) === wishKey({ city: cityId, title }));
  function heart(e: CityEvent) {
    if (e.lat === null || e.lng === null) return;
    const next = toggleWish(wish, { city: cityId, cityName: cities[cityId], title: e.name, lat: e.lat, lng: e.lng, icon: KIND_ICON[e.kind] });
    setWish(next); void saveWish(next);
  }
  async function share(e: CityEvent) {
    const url = `${location.origin}/${locale}/wallet/agenda?city=${cityId}&ev=${e.id}`;
    try { if (navigator.share) await navigator.share({ title: e.name, url }); else window.open(`https://wa.me/?text=${encodeURIComponent(`${e.name} ${url}`)}`, "_blank", "noopener"); } catch { /* cancelado */ }
  }

  return (
    <div className="stack ag" style={{ gap: 14 }}>
      <BackLink className="link-btn" fallback={`/${locale}/wallet`} label={t.wallet} />
      <section className="gp-hero ag-hero">
        <span className="label" style={{ color: "rgba(255,255,255,.7)" }}>📅 {t.evTitle}</span>
        <h1 className="gp-name">{cities[cityId]}</h1>
        <span className="gp-meta">{events === null ? t.exLoading : enabled ? fmt(t.evCount, { n: events.length }) : `${moments.length} ✨ ${t.evAlways}`}</span>
      </section>

      <div className="ex-chips scroll">{Object.entries(cities).sort(([a], [b]) => Number(b === cityId) - Number(a === cityId)).map(([id, n]) => <a key={id} className={id === cityId ? "on" : ""} href={`/${locale}/wallet/agenda?city=${id}`}>{n}</a>)}</div>

      {enabled && (events?.length ?? 0) > 0 && <>
        <div className="wl-tabs" role="tablist" style={{ position: "static" }}>
          {(["all", "today", "tomorrow", "weekend"] as Range[]).map((r) => <button key={r} role="tab" aria-selected={range === r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>{t.evRange[r]}</button>)}
        </div>
        {kinds.length > 1 && <div className="ex-chips scroll">
          <button className={kind === "all" ? "on" : ""} onClick={() => setKind("all")}>{t.nwAll}</button>
          {kinds.map((k) => <button key={k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{KIND_ICON[k]} {t.evKind[k]}</button>)}
        </div>}
      </>}

      {events === null && [0, 1, 2].map((i) => <div key={i} className="card ag-ev"><span className="ag-img skel" /><span className="stack" style={{ gap: 6, flex: 1 }}><span className="nw-skel" style={{ width: "50%" }} /><span className="nw-skel" /></span></div>)}
      {events !== null && list.length === 0 && <p className="hint">{enabled ? t.exEventsNone : t.evSoon}</p>}

      {days.map(([day, evs]) => (
        <section key={day} className="stack" style={{ gap: 8 }}>
          <b className="ex-day">{day === today ? t.evRange.today : day === tomorrow ? t.evRange.tomorrow : dayFmt.format(new Date(`${day}T12:00:00`))}</b>
          {evs.map((e) => (
            <button key={e.id} className="card ag-ev press" onClick={() => setOpen(e)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {e.image ? <img className="ag-img" src={e.image} alt="" loading="lazy" /> : <span className="ag-img">{KIND_ICON[e.kind]}</span>}
              <span className="stack" style={{ gap: 2, minWidth: 0, flex: 1, textAlign: "start" }}>
                <span className="label" style={{ color: "var(--cobalt)" }}>{KIND_ICON[e.kind]} {e.genre ?? t.evKind[e.kind]}{e.localTime ? ` · ${e.localTime}` : ""}</span>
                <b className="ex-ev-t">{e.name}</b>
                <span className="hint ad-ellip">{e.venue ?? ""}{e.adults ? ` · ${t.evAdults}` : ""}</span>
                {badStatus(e) && <span className="ag-status">{t.evStatus[e.status!]}</span>}
                {e.until && <span className="ag-runs">🔁 {fmt(t.evUntil, { d: shortFmt.format(new Date(`${e.until}T12:00:00`)), n: e.runs ?? 2 })}</span>}
                <span className={`ag-price ${e.free ? "free" : e.priceMin ? "" : "unk"}`}>{price(e)}</span>
              </span>
              {wished(e.name) && <span aria-hidden="true">❤️</span>}
            </button>
          ))}
        </section>
      ))}

      {moments.length > 0 && (
        <section className="stack" style={{ gap: 8 }}>
          <h2 className="gp-h2">✨ {t.evAlways}</h2>
          <div className="wl-strip">{moments.map((m) => (
            <div key={m.id} className="wl-mini ag-m">
              <span className="wl-mini-ic">{m.icon}</span>
              <span className="hint" style={{ fontSize: 12 }}>{WHEN_ICON[m.when]} {t.when[m.when]}</span>
              <b>{m.title}</b>
              <span className="ag-m-acts">
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`} target="_blank" rel="noreferrer">🧭</a>
                <button onClick={() => setToPlan({ title: m.title, lat: m.lat, lng: m.lng, icon: m.icon, kind: "moment" })}>🗺 {t.plAddTo}</button>
              </span>
            </div>
          ))}</div>
        </section>
      )}
      {enabled && <p className="hint" style={{ fontSize: 12 }}>{t.evSrc}</p>}
      {msg && <p className="note">✓ {msg}</p>}

      {open && (
        <Portal><div className="sheet-bg" onClick={() => setOpen(null)}>
          <div className="sheet ag-sheet" role="dialog" aria-modal="true" onClick={(x) => x.stopPropagation()}>
            <SheetX onClose={() => setOpen(null)} label={t.close} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {open.image && <img className="ag-cover" src={open.image} alt="" />}
            <div className="stack" style={{ gap: 8, padding: 18 }}>
              <span className="label" style={{ color: "var(--cobalt)" }}>{KIND_ICON[open.kind]} {t.evKind[open.kind]}</span>
              <b style={{ fontSize: 20, lineHeight: 1.25 }}>{open.name}</b>
              <span>📅 {dayFmt.format(new Date(`${open.localDate}T12:00:00`))}{open.localTime ? ` · ${open.localTime}` : ""}</span>
              {open.until && <span>🔁 {fmt(t.evUntil, { d: shortFmt.format(new Date(`${open.until}T12:00:00`)), n: open.runs ?? 2 })}</span>}
              {open.genre && <span>🏷 {open.genre}</span>}
              {open.venue && <span>📍 {open.venue}{open.address && <small className="hint" style={{ display: "block" }}>{open.address}</small>}</span>}
              {open.adults && <span>🔞 {t.evAdults}</span>}
              {open.status && <span className={`ag-status ${open.status === "onsale" ? "ok" : ""}`} style={{ alignSelf: "flex-start" }}>{t.evStatus[open.status]}</span>}
              <span className={`ag-price ${open.free ? "free" : open.priceMin ? "" : "unk"}`}>{price(open)}</span>
              {!open.free && !open.priceMin && <small className="hint">{t.evPriceWhy}</small>}
              {open.info && <div className="ag-more"><b>{t.evAbout}</b><p>{open.info}</p></div>}
              {open.note && <div className="ag-more"><b>{t.evNote}</b><p>{open.note}</p></div>}
              <div className="grid2" style={{ marginTop: 6 }}>
                <a className="btn press" href={open.url} target="_blank" rel="noopener noreferrer">🎟 {t.exTickets}</a>
                {open.lat !== null && open.lng !== null ? <a className="btn ghost press" href={`https://www.google.com/maps/dir/?api=1&destination=${open.lat},${open.lng}`} target="_blank" rel="noreferrer">🧭 {t.exGo}</a> : <span />}
              </div>
              <div className="ex-acts">
                {open.lat !== null && open.lng !== null && <button className={wished(open.name) ? "wish on" : "wish"} onClick={() => heart(open)}>{wished(open.name) ? "❤️" : "🤍"} {t.wlWish}</button>}
                {open.lat !== null && open.lng !== null && <button onClick={() => { setToPlan({ title: open.name, lat: open.lat!, lng: open.lng!, icon: KIND_ICON[open.kind], kind: "place" }); setOpen(null); }}>🗺 {t.plAddTo}</button>}
                <button onClick={() => void share(open)}>↪ {t.diaryShare}</button>
              </div>
              <button className="link-btn" onClick={() => setOpen(null)}>{t.close}</button>
            </div>
          </div>
        </div></Portal>
      )}
      {toPlan && <AddToPlan t={t} locale={locale} cityId={cityId} cityName={cities[cityId]} item={toPlan} onClose={(m) => { setToPlan(null); if (m) { setMsg(m); setTimeout(() => setMsg(""), 3000); } }} />}
    </div>
  );
}
