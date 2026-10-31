"use client";
import { useDict } from "@/i18n/client-dict";
/** Área do comerciante (iOS): entrar por link no email, ver estatísticas, editar o anúncio e responder a pedidos. */
import { useState } from "react";
import { Camera, CreditCard, Eye, ExternalLink, Gift, Hand, Inbox, Languages, LogOut, Mail, Pause, Play, Plus, Trash2, X } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { MAX_OPTIONS, MAX_PHOTOS, PAYMENTS, bookKind, promoActive } from "@/lib/booking-core";
import { LOCALES } from "@/i18n/core";
import { langLabel } from "@/lib/lang-label";
import { RatingLine, ReviewList, type MReview } from "./MerchantReviews";
import { shrink } from "@/lib/photo-shrink";
import { toast } from "@/lib/toast";

export type PortalMerchant = {
  id: string; name: string; category: string; city: string; cityName: string; stopName: string; address: string | null;
  offer: string; hours: string | null; phone: string | null; bookingUrl: string | null; instagram: string | null; tiktok: string | null; facebook: string | null;
  bookMode: string; bookOptions: { name: string; price: string }[]; plan: "basic" | "featured" | "partner"; status: "pending" | "active" | "past_due" | "cancelled";
  paused: boolean; promo: { text: string; until: string } | null; languages: string[]; payments: string[]; rating: number | null; ratingCount: number; reviews: MReview[]; photoCount: number; rev: number; billing: boolean;
  stats: { views: number; taps: number; bookings: number; prev: { views: number; taps: number; bookings: number } };
};
export type PortalBooking = { id: string; merchantId: string; option: string; dateFrom: string; dateTo: string; time: string; people: number; units: number; name: string; email: string; phone: string; note: string; status: string; createdAt: string };

export function MerchantLogin({ t: tProp, locale, expired }: { t?: Dict; locale: Locale; expired: boolean }) {
  const t = useDict(tProp);
  const m = t.mp;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "err">("idle");
  const [dev, setDev] = useState<string | null>(null);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const r = await fetch("/api/merchants/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, locale }) }).then((x) => x.json()).catch(() => null) as { ok?: boolean; devLink?: string | null } | null;
    if (!r?.ok) return setState("err");
    setDev(r.devLink ?? null); setState("sent");
  }
  return (
    <div className="ess">
      <h1 className="arv-h">{m.title}</h1>
      <p className="ess-sub">{m.sub}</p>
      {expired && <p className="ess-off">{m.expired}</p>}
      <form className="ess-card" onSubmit={send}>
        <label className="mt-field"><span className="as-h mp-h">{m.emailL}</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@negocio.com" /></label>
        <button className="btn tram press" disabled={state === "busy"}><Mail size={18} aria-hidden="true" /> {m.send}</button>
        {state === "sent" && <p className="ess-muted" role="status">{m.sent}</p>}
        {state === "err" && <p className="err" role="alert">{t.tsError}</p>}
        {dev && <a className="ess-muted" href={dev}>DEV: {dev.slice(0, 60)}…</a>}
      </form>
    </div>
  );
}

export function MerchantPortal({ t: tProp, locale, email, merchants, bookings: initBookings }: { t?: Dict; locale: Locale; email: string; merchants: PortalMerchant[]; bookings: PortalBooking[] }) {
  const t = useDict(tProp);
  const m = t.mp;
  const [sel, setSel] = useState(merchants[0]?.id ?? "");
  const [bookings, setBookings] = useState(initBookings);
  const cur = merchants.find((x) => x.id === sel);
  async function logout() { await fetch("/api/merchants/logout", { method: "POST" }).catch(() => null); location.reload(); }
  async function answer(id: string, status: "confirmed" | "declined") {
    const r = await fetch("/api/merchants/manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ booking: id, status }) }).catch(() => null);
    if (!r?.ok) { toast(t.tsError, { tone: "err" }); return; }
    setBookings((b) => b.map((x) => (x.id === id ? { ...x, status } : x)));
  }
  return (
    <div className="ess">
      <div className="mp-top">
        <h1 className="arv-h">{m.title}</h1>
        <button type="button" className="mu2-x mp-out" onClick={() => void logout()} aria-label={m.logout} title={m.logout}><LogOut size={18} aria-hidden="true" /></button>
      </div>
      <p className="ess-sub">{email}</p>
      {merchants.length === 0 && <p className="ess-card ess-muted">{m.none}</p>}
      {merchants.length > 1 && (
        <div className="ios-seg ft-seg" role="tablist">
          {merchants.map((x) => <button key={x.id} type="button" role="tab" aria-selected={x.id === sel} className={x.id === sel ? "on" : ""} onClick={() => setSel(x.id)}>{x.name}</button>)}
        </div>
      )}
      {cur && <Editor key={cur.id} t={t} locale={locale} x={cur} />}
      {cur && <Requests t={t} locale={locale} list={bookings.filter((b) => b.merchantId === cur.id)} onAnswer={answer} />}
    </div>
  );
}

function Editor({ t, locale, x }: { t: Dict; locale: Locale; x: PortalMerchant }) {
  const m = t.mp;
  const [f, setF] = useState({ offer: x.offer, hours: x.hours ?? "", phone: x.phone ?? "", bookingUrl: x.bookingUrl ?? "", instagram: x.instagram ?? "", tiktok: x.tiktok ?? "", facebook: x.facebook ?? "", bookMode: x.bookMode, bookOptions: x.bookOptions,
    promoText: promoActive(x.promo)?.text ?? "", promoUntil: promoActive(x.promo)?.until ?? new Date(Date.now() + 14 * 86400_000).toISOString().slice(0, 10), languages: x.languages, payments: x.payments });
  const [photos, setPhotos] = useState<string[]>(Array.from({ length: x.photoCount }, (_, i) => `keep:${i}`));
  const [paused, setPaused] = useState(x.paused);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const kind = bookKind(x.category);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => { setF((p) => ({ ...p, [k]: v })); setDirty(true); };
  const status = { pending: m.stPending, active: m.stActive, past_due: m.stPastDue, cancelled: m.stCancelled }[x.status];
  const planName = { basic: "Basic", featured: t.featured, partner: "QR Partner" }[x.plan];
  const src = (p: string) => (p.startsWith("keep:") ? `/api/merchants/photo/${x.id}?i=${p.slice(5)}&v=${x.rev}` : p);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    const r = await fetch("/api/merchants/manage", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: x.id, ...body }) })
      .then(async (res) => ({ ok: res.ok, j: await res.json().catch(() => ({})) as { error?: string } })).catch(() => null);
    setBusy(false);
    if (!r?.ok) { toast(r?.j.error === "offensive" ? m.offensive : t.tsError, { tone: "err" }); return false; }
    return true;
  }
  async function save() {
    const { promoText, promoUntil, ...rest } = f;
    const ok = await patch({ ...rest, bookOptions: f.bookOptions.filter((o) => o.name.trim()), ...(photos.length ? { photos } : {}), promo: promoText.trim() ? { text: promoText.trim(), until: promoUntil } : null });
    if (ok) { toast(m.saved); setDirty(false); }
  }
  async function togglePause() {
    if (await patch({ paused: !paused })) { setPaused(!paused); toast(m.saved); }
  }
  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    const add = await Promise.all(Array.from(files).slice(0, room).map((file) => shrink(file).catch(() => null)));
    setPhotos((p) => [...p, ...add.filter((s): s is string => Boolean(s))]); setDirty(true);
  }
  async function billing() {
    const r = await fetch("/api/merchants/billing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: x.id, locale }) }).then((res) => res.json()).catch(() => null) as { url?: string } | null;
    if (r?.url) location.href = r.url; else toast(t.tsError, { tone: "err" });
  }
  const nf = new Intl.NumberFormat(INTL_LOCALE[locale]);

  return (
    <>
      <section className="ess-card">
        <span className="ess-h">{t.cats[x.category as keyof Dict["cats"]] ?? x.category} · {x.cityName}</span>
        <b className="ess-big">{x.name}</b>
        <small className="ess-muted">📍 {x.address ?? x.stopName}</small>
        <div className="mp-badges">
          <span className={`mp-badge ${x.status === "active" && !paused ? "on" : ""}`}>{paused ? m.paused : status}</span>
          <span className="mp-badge">{fmt(m.plan, { p: planName })}</span>
        </div>
      </section>

      <section className="ess-card">
        <span className="ess-h">{m.stats}</span>
        <div className="mp-stats">
          {([["views", Eye, m.views], ["taps", Hand, m.taps], ["bookings", Inbox, m.bookings]] as const).map(([k, Ic, label]) => {
            const cur = x.stats[k], prev = x.stats.prev[k];
            const delta = prev ? Math.round(((cur - prev) / prev) * 100) : null;
            return <div key={k}><Ic size={18} aria-hidden="true" /><b className="num">{nf.format(cur)}</b><small>{label}</small>
              {delta !== null && <small className={`mp-delta ${delta > 0 ? "up" : delta < 0 ? "down" : ""}`}>{delta > 0 ? "▲" : delta < 0 ? "▼" : "="} {Math.abs(delta)}%</small>}</div>;
          })}
        </div>
        {(() => { const hasPrev = x.stats.prev.views + x.stats.prev.taps + x.stats.prev.bookings > 0; const parts = [hasPrev ? m.period : "", x.stats.views > 0 ? fmt(m.rate, { n: Math.round((x.stats.taps / x.stats.views) * 100) }) : ""].filter(Boolean); return parts.length ? <small className="ess-muted">{parts.join(" · ")}</small> : null; })()}
      </section>

      <section className="ess-card">
        <span className="ess-h">✓ {t.mr.verified}</span>
        {x.ratingCount ? <><RatingLine t={t} locale={locale} rating={x.rating} count={x.ratingCount} /><ReviewList t={t} locale={locale} list={x.reviews} /></> : <p className="ess-muted" style={{ margin: 0 }}>{t.mr.none}</p>}
        <small className="ess-muted">{t.mr.portalNote}</small>
      </section>

      <section className="ess-card mp-form">
        <label className="mt-field"><span className="as-h mp-h">{m.offer}</span>
          <textarea rows={2} maxLength={140} value={f.offer} onChange={(e) => set("offer", e.target.value)} /></label>
        <label className="mt-field"><span className="as-h mp-h">{m.hours}</span>
          <input maxLength={160} value={f.hours} placeholder={m.hoursPh} onChange={(e) => set("hours", e.target.value)} /></label>
        <label className="mt-field"><span className="as-h mp-h">{m.phone}</span>
          <input type="tel" maxLength={30} value={f.phone} placeholder="+44 …" onChange={(e) => set("phone", e.target.value)} /></label>
        <label className="mt-field"><span className="as-h mp-h">{m.site}</span>
          <input type="url" maxLength={300} value={f.bookingUrl} placeholder="https://" onChange={(e) => set("bookingUrl", e.target.value)} /></label>
        <span className="as-h mp-h">{m.socials}</span>
        <div className="mp-socials">
          {(["instagram", "tiktok", "facebook"] as const).map((k) => (
            <label key={k} className="mp-soc"><span>{k === "instagram" ? "Instagram" : k === "tiktok" ? "TikTok" : "Facebook"}</span>
              <input maxLength={120} value={f[k]} placeholder="@" onChange={(e) => set(k, e.target.value)} /></label>
          ))}
        </div>
      </section>

      <section className="ess-card mp-form">
        <span className="ess-h"><Gift size={18} aria-hidden="true" /> {m.promo}</span>
        <label className="mt-field"><span className="as-h mp-h">{m.promoText}</span>
          <input maxLength={80} value={f.promoText} placeholder={m.promoPh} onChange={(e) => set("promoText", e.target.value)} /></label>
        <label className="mt-field"><span className="as-h mp-h">{m.promoUntil}</span>
          <input type="date" value={f.promoUntil} min={new Date().toISOString().slice(0, 10)} max={new Date(Date.now() + 90 * 86400_000).toISOString().slice(0, 10)} onChange={(e) => set("promoUntil", e.target.value)} /></label>
        <small className="ess-muted">{m.promoNote}</small>
      </section>

      <section className="ess-card mp-form">
        <span className="ess-h"><Languages size={18} aria-hidden="true" /> {m.langs}</span>
        <div className="mp-chips">{LOCALES.map((l) => {
          const on = f.languages.includes(l);
          return <button key={l} type="button" aria-pressed={on} className={`mp-chip ${on ? "on" : ""}`} onClick={() => set("languages", on ? f.languages.filter((y) => y !== l) : [...f.languages, l])}>{langLabel(l, locale)}</button>;
        })}</div>
        <span className="ess-h" style={{ marginTop: 6 }}><CreditCard size={18} aria-hidden="true" /> {m.pays}</span>
        <div className="mp-chips">{PAYMENTS.map((k) => {
          const on = f.payments.includes(k);
          return <button key={k} type="button" aria-pressed={on} className={`mp-chip ${on ? "on" : ""}`} onClick={() => set("payments", on ? f.payments.filter((y) => y !== k) : [...f.payments, k])}>{m.pay[k]}</button>;
        })}</div>
      </section>

      {kind && (
        <section className="ess-card mp-form">
          <span className="ess-h">{m.booking}</span>
          <label className="mp-switch"><span>{m.bookOn}</span>
            <input type="checkbox" role="switch" checked={f.bookMode === "request"} onChange={(e) => set("bookMode", e.target.checked ? "request" : "none")} /></label>
          {f.bookMode === "request" && <>
            <span className="as-h mp-h">{m.options}</span>
            {f.bookOptions.map((o, i) => (
              <div key={i} className="mp-opt">
                <input aria-label={m.optName} placeholder={m.optName} maxLength={60} value={o.name} onChange={(e) => set("bookOptions", f.bookOptions.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))} />
                <input aria-label={m.optPrice} placeholder={m.optPrice} maxLength={40} value={o.price} onChange={(e) => set("bookOptions", f.bookOptions.map((y, j) => (j === i ? { ...y, price: e.target.value } : y)))} />
                <button type="button" className="mu2-x mp-x" aria-label={t.close} onClick={() => set("bookOptions", f.bookOptions.filter((_, j) => j !== i))}><X size={16} aria-hidden="true" /></button>
              </div>
            ))}
            {f.bookOptions.length < MAX_OPTIONS && <button type="button" className="ios-link" onClick={() => set("bookOptions", [...f.bookOptions, { name: "", price: "" }])}><Plus size={14} aria-hidden="true" /> {m.addOpt}</button>}
          </>}
        </section>
      )}

      <section className="ess-card">
        <span className="ess-h"><Camera size={18} aria-hidden="true" /> {m.photos}</span>
        <div className="mp-photos">
          {photos.map((p, i) => (
            <span key={p.slice(0, 40) + i} className="mp-ph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src(p)} alt="" />
              {photos.length > 1 && <button type="button" className="mp-ph-x" aria-label={t.mPhotoRemove} onClick={() => { setPhotos(photos.filter((_, j) => j !== i)); setDirty(true); }}><Trash2 size={14} aria-hidden="true" /></button>}
            </span>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="mp-ph mp-add"><Plus size={22} aria-hidden="true" /><small>{m.addPhoto}</small>
              <input type="file" accept="image/*" multiple hidden onChange={(e) => void addPhotos(e.target.files)} /></label>
          )}
        </div>
      </section>

      <button type="button" className="btn tram press mp-save" disabled={busy || !dirty} onClick={() => void save()}>{busy ? "…" : m.save}</button>

      <div className="ios-group">
        <button type="button" className="ios-row press" onClick={() => void togglePause()} disabled={busy}>
          {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
          <span className="ios-tx"><b>{paused ? m.unpause : m.pause}</b><small>{m.pauseSub}</small></span>
        </button>
        {x.billing && <button type="button" className="ios-row press" onClick={() => void billing()}><ExternalLink size={18} aria-hidden="true" /><span className="ios-tx"><b>{m.billing}</b><small>{fmt(m.plan, { p: planName })}</small></span></button>}
        <a className="ios-row press" href={`/${locale}/c/${x.city}`}><Eye size={18} aria-hidden="true" /><span className="ios-tx"><b>{m.viewApp}</b></span></a>
        <a className="ios-row press" href={`/${locale}/contact`}><Mail size={18} aria-hidden="true" /><span className="ios-tx"><b>{m.contact}</b><small>{m.fixed}</small></span></a>
      </div>
    </>
  );
}

function Requests({ t, locale, list, onAnswer }: { t: Dict; locale: Locale; list: PortalBooking[]; onAnswer: (id: string, s: "confirmed" | "declined") => void }) {
  const m = t.mp;
  const df = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short" });
  const d = (s: string) => (s ? df.format(new Date(`${s}T12:00:00`)) : "");
  const st = (s: string) => (s === "confirmed" ? m.sConfirmed : s === "declined" ? m.sDeclined : m.sNew);
  return (
    <section className="ess-card">
      <span className="ess-h"><Inbox size={18} aria-hidden="true" /> {m.requests}</span>
      {list.length === 0 ? <p className="ess-muted">{m.noReq}</p> : (
        <ul className="ess-list mp-req">{list.map((b) => (
          <li key={b.id}>
            <span className="ess-tx">
              <b>{b.name}{b.option ? ` · ${b.option}` : ""}</b>
              <small>{d(b.dateFrom)}{b.dateTo ? ` → ${d(b.dateTo)}` : ""}{b.time ? ` · ${b.time}` : ""} · {b.people}👤{b.units > 1 ? ` · ×${b.units}` : ""}</small>
              {b.note && <small>“{b.note}”</small>}
              <small><a href={`mailto:${b.email}`}>{b.email}</a>{b.phone ? <> · <a href={`tel:${b.phone}`}>{b.phone}</a></> : null}</small>
            </span>
            {b.status === "new" ? (
              <span className="mp-ans">
                <button type="button" className="btn tram press" onClick={() => onAnswer(b.id, "confirmed")}>{m.confirm}</button>
                <button type="button" className="btn ghost press" onClick={() => onAnswer(b.id, "declined")}>{m.decline}</button>
              </span>
            ) : <span className={`mp-badge ${b.status === "confirmed" ? "on" : ""}`}>{st(b.status)}</span>}
          </li>
        ))}</ul>
      )}
    </section>
  );
}
