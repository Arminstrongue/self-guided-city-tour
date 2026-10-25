"use client";
import { useEffect, useState } from "react";
import { track } from "@/lib/track";
import type { Dict, Locale } from "@/i18n/dictionaries";
import type { Offer } from "@/lib/merchants";
import { fmt } from "@/i18n/core";
import Portal from "./Portal";
import { SheetX } from "./WinNav";
import { promoActive } from "@/lib/booking";
import { INTL_LOCALE } from "@/i18n/core";
import { langLabel } from "@/lib/lang-label";

const photo = (id: string, i = 0, v = 0) => `/api/merchants/photo/${id}?i=${i}${v ? `&v=${v}` : ""}`;
const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);

/** Negócio parceiro numa paragem: foto, oferta e (se aceitar) pedido de reserva de mesa, quarto, carro, etc. */
export function OfferCard({ o, t, locale }: { o: Offer; t: Dict; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const cat = t.cats[o.category as keyof Dict["cats"]] ?? o.category;
  return (
    <>
      <button type="button" className="offer mb-offer press" onClick={() => setOpen(true)}>
        {o.photos > 0 && <img className="mb-thumb" src={photo(o.id, 0, o.rev)} alt="" loading="lazy" />}
        <div style={{ flex: 1, minWidth: 0, textAlign: "start" }}>
          <span className="cat">{cat}</span>
          <b>{o.name}</b>{o.offer}
          {promoActive(o.promo) && <div className="mb-promo">🎁 {promoActive(o.promo)!.text}</div>}
          {o.book && <div className="mb-cta">{t.mbReq[o.book]} ›</div>}
        </div>
        {o.featured && <span className="feat">{t.featured}</span>}
      </button>
      {open && <OfferSheet o={o} t={t} locale={locale} cat={cat} onClose={() => setOpen(false)} />}
    </>
  );
}

function OfferSheet({ o, t, locale, cat, onClose }: { o: Offer; t: Dict; locale: Locale; cat: string; onClose: () => void }) {
  const [form, setForm] = useState(false);
  const wa = o.phone ? `https://wa.me/${o.phone.replace(/\D/g, "")}` : null;
  // Estatísticas do negócio (Área do comerciante): vistas e contactos, anónimos.
  useEffect(() => { track("offer_view", { stop: o.id, locale }); }, [o.id, locale]);
  const tap = () => track("offer_tap", { stop: o.id, locale });
  return (
    <Portal><div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={o.name}>
        <SheetX onClose={onClose} label={t.close} />
        {o.photos > 0 && (
          <div className="mb-gallery" aria-label={fmt(t.mbPhotos, { b: o.name })}>
            {Array.from({ length: o.photos }, (_, i) => <img key={i} src={photo(o.id, i, o.rev)} alt="" loading={i ? "lazy" : "eager"} />)}
          </div>
        )}
        <span className="label">{cat} · <span className="ad-tag">{t.adPartner}</span></span>
        <b style={{ fontSize: 20 }}>{o.name}</b>
        <p style={{ margin: 0 }}>{o.offer}</p>
        {promoActive(o.promo) && <p className="mb-promo big" style={{ margin: 0 }}>🎁 {promoActive(o.promo)!.text} · {fmt(t.mp.promoBadge, { d: new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short" }).format(new Date(`${o.promo!.until}T12:00:00`)) })}</p>}
        {o.languages.length > 0 && <p className="hint" style={{ margin: 0 }}>🗣 {t.mp.speaks}: {o.languages.map((l) => langLabel(l, locale)).join(" · ")}</p>}
        {o.payments.length > 0 && <p className="hint" style={{ margin: 0 }}>💳 {o.payments.map((k) => t.mp.pay[k as keyof Dict["mp"]["pay"]] ?? k).join(" · ")}</p>}
        {o.hours && <p className="hint" style={{ margin: 0 }}>🕒 {o.hours}</p>}
        {o.address && <p className="hint" style={{ margin: 0 }}>📍 {o.address}{o.lat !== null && o.lng !== null && <> · <a href={`https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`} target="_blank" rel="noopener noreferrer">{t.directions}</a></>}</p>}
        {o.options.length > 0 && (
          <ul className="mb-opts">{o.options.map((x) => <li key={x.name}><span>{x.name}</span>{x.price && <b>{x.price}</b>}</li>)}</ul>
        )}
        {form && o.book ? <BookForm o={o} t={t} locale={locale} /> : (
          <div className="stack" style={{ gap: 8 }}>
            {o.book && <button type="button" className="btn tram press" onClick={() => { tap(); setForm(true); }}>{t.mbReq[o.book]}</button>}
            {o.bookingUrl && <a className="btn ghost press" href={o.bookingUrl} onClick={tap} target="_blank" rel="noopener noreferrer nofollow">{t.mbOwnSite} ↗</a>}
            <div className="mb-links" onClick={tap}>
              {wa && <a className="press" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
              {o.phone && <a className="press" href={`tel:${o.phone}`}>{t.mbCall}</a>}
              {o.instagram && <a className="press" href={`https://instagram.com/${o.instagram}`} target="_blank" rel="noopener noreferrer">Instagram</a>}
              {o.tiktok && <a className="press" href={`https://www.tiktok.com/@${o.tiktok}`} target="_blank" rel="noopener noreferrer">TikTok</a>}
            </div>
          </div>
        )}
      </div>
    </div></Portal>
  );
}

function BookForm({ o, t, locale }: { o: Offer; t: Dict; locale: Locale }) {
  const kind = o.book!;
  const d0 = today();
  const [b, setB] = useState({
    option: "", dateFrom: d0, dateTo: kind === "room" ? plusDays(d0, 1) : kind === "car" ? plusDays(d0, 2) : "",
    time: kind === "room" ? "" : "19:30", people: 2, units: 1, name: "", email: "", phone: "", note: ""
  });
  const [state, setState] = useState<"idle" | "busy" | "done" | "err" | "bad" | "off">("idle");
  const set = (k: keyof typeof b, v: string | number) => setB((p) => ({ ...p, [k]: v }));
  const twoDates = kind === "room" || kind === "car";

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (b.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(b.email) || (twoDates && (!b.dateTo || b.dateTo < b.dateFrom))) return setState("bad");
    setState("busy");
    const r = await fetch("/api/merchants/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, merchantId: o.id, locale }) }).catch(() => null);
    if (r?.ok) return setState("done");
    setState(r?.status === 404 ? "off" : r?.status === 400 ? "bad" : "err");
  }

  if (state === "done") return <p className="oc-sum ok" role="status">{fmt(t.mbSent, { b: o.name })}</p>;
  const num = (k: "people" | "units", label: string, max: number) => (
    <div className="field"><label htmlFor={`mb-${k}`}>{label}</label>
      <select id={`mb-${k}`} value={b[k]} onChange={(e) => set(k, Number(e.target.value))}>
        {Array.from({ length: max }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
      </select></div>
  );
  return (
    <form className="stack" style={{ gap: 10 }} onSubmit={send} noValidate>
      <b>{t.mbReq[kind]}</b>
      {o.options.length > 0 && (
        <div className="field"><label htmlFor="mb-opt">{t.mbChoose}</label>
          <select id="mb-opt" value={b.option} onChange={(e) => set("option", e.target.value)}>
            <option value="">{t.mbAny}</option>
            {o.options.map((x) => <option key={x.name} value={x.name}>{x.price ? `${x.name} · ${x.price}` : x.name}</option>)}
          </select></div>
      )}
      <div className="grid2">
        <div className="field"><label htmlFor="mb-from">{kind === "room" ? t.mbCheckin : kind === "car" ? t.mbPickup : t.mbDate}</label>
          <input id="mb-from" type="date" min={d0} value={b.dateFrom} onChange={(e) => { const v = e.target.value; setB((p) => ({ ...p, dateFrom: v, dateTo: twoDates && p.dateTo <= v ? plusDays(v, 1) : p.dateTo })); }} /></div>
        {twoDates
          ? <div className="field"><label htmlFor="mb-to">{kind === "room" ? t.mbCheckout : t.mbReturn}</label>
              <input id="mb-to" type="date" min={kind === "room" ? plusDays(b.dateFrom, 1) : b.dateFrom} value={b.dateTo} onChange={(e) => set("dateTo", e.target.value)} /></div>
          : <div className="field"><label htmlFor="mb-time">{t.mbTime}</label>
              <input id="mb-time" type="time" value={b.time} onChange={(e) => set("time", e.target.value)} /></div>}
      </div>
      <div className="grid2">
        {kind === "car" && <div className="field"><label htmlFor="mb-time">{t.mbTime}</label><input id="mb-time" type="time" value={b.time} onChange={(e) => set("time", e.target.value)} /></div>}
        {kind === "room" && <>{num("people", t.mbGuests, 12)}{num("units", t.mbRooms, 6)}</>}
        {(kind === "table" || kind === "slot") && num("people", t.mbPeople, 20)}
        {kind === "bag" && num("units", t.mbBags, 10)}
      </div>
      <div className="field"><label htmlFor="mb-name">{t.mbName}</label><input id="mb-name" autoComplete="name" value={b.name} maxLength={80} onChange={(e) => set("name", e.target.value)} /></div>
      <div className="grid2">
        <div className="field"><label htmlFor="mb-email">{t.mbEmail}</label><input id="mb-email" type="email" autoComplete="email" value={b.email} maxLength={200} onChange={(e) => set("email", e.target.value)} /></div>
        <div className="field"><label htmlFor="mb-phone">{t.mbPhone}</label><input id="mb-phone" type="tel" autoComplete="tel" value={b.phone} maxLength={30} onChange={(e) => set("phone", e.target.value)} /></div>
      </div>
      <div className="field"><label htmlFor="mb-note">{t.mbNote}</label><textarea id="mb-note" rows={2} maxLength={500} value={b.note} onChange={(e) => set("note", e.target.value)} /></div>
      {state === "bad" && <p className="err" role="alert">{t.mbErr}</p>}
      {state === "off" && <p className="err" role="alert">{t.mbUnavailable}</p>}
      {state === "err" && <p className="err" role="alert">{t.tsError}</p>}
      <button className="btn tram press" type="submit" disabled={state === "busy"}>{t.mbSend}</button>
      <p className="hint">{t.mbHow}</p>
    </form>
  );
}
