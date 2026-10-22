"use client";
/** Partes interativas do marketplace de guias: registo/edição, link de entrada, reserva, portal e avaliação. */
import { useMemo, useState } from "react";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";

type CityOpt = { id: string; name: string };
const LANGS = ["pt", "en", "es", "fr", "de", "it", "nl", "zh", "ar", "ja", "ru", "tr", "ko", "hi", "pl", "uk"];

/** Reduz a foto no telemóvel (máx. 480 px, JPEG) antes de enviar: fica com ~40 KB. */
async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
    const side = Math.min(img.width, img.height), out = Math.min(480, side);
    const c = document.createElement("canvas"); c.width = out; c.height = out;
    c.getContext("2d")!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, out, out);
    let q = 0.82, data = c.toDataURL("image/jpeg", q);
    while (data.length > 100_000 && q > 0.4) { q -= 0.1; data = c.toDataURL("image/jpeg", q); }
    return data;
  } finally { URL.revokeObjectURL(url); }
}

export type GuideFormValue = { name: string; email?: string; phone: string; city: string; languages: string[]; bio: string; hourly: string; maxPeople: string; meetingPoint: string; licenseNo: string; photo?: string | null;
  activityRegNo: string; insurer: string; policyNo: string; taxId: string; taxCountry: string; address: string; birthDate: string };

export function GuideForm({ t, locale, cities, initial, mode, declared = false }: { t: Dict; locale: Locale; cities: CityOpt[]; initial?: Partial<GuideFormValue>; mode: "join" | "edit"; declared?: boolean }) {
  const [v, setV] = useState<GuideFormValue>({ name: "", email: "", phone: "", city: cities[0]?.id ?? "", languages: [locale === "pt" ? "pt" : "en"], bio: "", hourly: "35", maxPeople: "6", meetingPoint: "", licenseNo: "",
    activityRegNo: "", insurer: "", policyNo: "", taxId: "", taxCountry: locale === "pt" ? "PT" : "", address: "", birthDate: "", ...initial });
  const [indep, setIndep] = useState(declared);
  const [photo, setPhoto] = useState<string | null | undefined>(undefined);
  const [terms, setTerms] = useState(mode === "edit");
  const [bad, setBad] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [devLink, setDevLink] = useState<string | null>(null);
  const langNames = useMemo(() => { try { return new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "language" }); } catch { return null; } }, [locale]);
  const set = (k: keyof GuideFormValue) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.value });
  const err = (k: string) => (bad.includes(k) ? "bad" : "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy"); setBad([]);
    const body = { ...v, taxCountry: v.taxCountry.trim().toUpperCase(), hourly: Number(v.hourly.replace(",", ".")), maxPeople: Number(v.maxPeople), locale, terms, independent: indep, ...(photo !== undefined ? { photo } : {}) };
    const r = await fetch(mode === "join" ? "/api/guides" : "/api/guides/me", { method: mode === "join" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok) { setState("done"); setDevLink(j.devLink ?? null); if (mode === "edit") setTimeout(() => location.reload(), 600); return; }
    setBad(j.fields ?? []); setState("error");
  }

  if (mode === "join" && state === "done") {
    return <div className="card stack" style={{ padding: 16 }}><b>✓ {t.gjSent}</b>{devLink && <a href={devLink}>{devLink}</a>}</div>;
  }
  const shown = photo === undefined ? v.photo : photo;
  return (
    <form className="stack g-form" onSubmit={submit} noValidate>
      <div className="row" style={{ gap: 14, alignItems: "center", flexWrap: "nowrap" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {shown ? <img src={shown} alt="" width={72} height={72} style={{ borderRadius: "50%", objectFit: "cover" }} /> : <span className="g-ini" style={{ width: 72, height: 72, fontSize: 28 }}>{(v.name || "?").charAt(0).toUpperCase()}</span>}
        <label className="btn ghost" style={{ padding: "10px 16px", fontSize: 14, width: "auto", cursor: "pointer" }}>📷 {t.gjPhoto}
          <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await shrink(f)); }} />
        </label>
      </div>
      <div className="grid2">
        <div className={`field ${err("name")}`}><label htmlFor="gn">{t.gjName}</label><input id="gn" value={v.name} onChange={set("name")} autoComplete="name" /></div>
        {mode === "join"
          ? <div className={`field ${err("email")}`}><label htmlFor="ge">{t.gjEmail}</label><input id="ge" type="email" value={v.email} onChange={set("email")} autoComplete="email" /></div>
          : <div className="field"><label htmlFor="gph">{t.gjPhone}</label><input id="gph" value={v.phone} onChange={set("phone")} autoComplete="tel" /></div>}
      </div>
      {mode === "join" && <div className="field"><label htmlFor="gph2">{t.gjPhone}</label><input id="gph2" value={v.phone} onChange={set("phone")} autoComplete="tel" /></div>}
      <div className="grid2">
        <div className={`field ${err("city")}`}><label htmlFor="gc">{t.gjCity}</label>
          <select id="gc" value={v.city} onChange={set("city")}>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className={`field ${err("hourly")}`}><label htmlFor="gh">{t.gjHourly}</label><input id="gh" inputMode="decimal" value={v.hourly} onChange={set("hourly")} /></div>
      </div>
      <div className={`field ${err("languages")}`}><label>{t.gjLangs}</label>
        <div className="g-langpick">{LANGS.map((l) => (
          <button type="button" key={l} className={v.languages.includes(l) ? "on" : ""} aria-pressed={v.languages.includes(l)}
            onClick={() => setV({ ...v, languages: v.languages.includes(l) ? v.languages.filter((x) => x !== l) : [...v.languages, l] })}>{langNames?.of(l) ?? l}</button>
        ))}</div></div>
      <div className={`field ${err("bio")}`}><label htmlFor="gb">{t.gjBio}</label><textarea id="gb" rows={5} maxLength={1200} value={v.bio} onChange={set("bio")} /><span className="hint num">{v.bio.trim().length}/40+</span></div>
      <div className="grid2">
        <div className={`field ${err("maxPeople")}`}><label htmlFor="gm">{t.gjMax}</label><input id="gm" inputMode="numeric" value={v.maxPeople} onChange={set("maxPeople")} /></div>
        <div className={`field ${err("licenseNo")}`}><label htmlFor="gl">{t.gjLicense}</label><input id="gl" value={v.licenseNo} onChange={set("licenseNo")} /></div>
      </div>
      <div className="field"><label htmlFor="gmp">{t.gjMeet}</label><input id="gmp" value={v.meetingPoint} onChange={set("meetingPoint")} minLength={15} maxLength={200} /><span className="hint">{t.gjMeetHint}</span></div>
      <fieldset className="g-pro">
        <legend>🔒 {t.gjProTitle}</legend>
        <p className="hint">{t.gjProHint}</p>
        <div className={`field ${err("activityRegNo")}`}><label htmlFor="gr">{t.gjReg}</label><input id="gr" value={v.activityRegNo} onChange={set("activityRegNo")} /></div>
        <div className="grid2">
          <div className={`field ${err("insurer")}`}><label htmlFor="gi">{t.gjInsurer}</label><input id="gi" value={v.insurer} onChange={set("insurer")} /></div>
          <div className={`field ${err("policyNo")}`}><label htmlFor="gpo">{t.gjPolicy}</label><input id="gpo" value={v.policyNo} onChange={set("policyNo")} /></div>
        </div>
        <div className="grid2">
          <div className={`field ${err("taxId")}`}><label htmlFor="gt">{t.gjTaxId}</label><input id="gt" value={v.taxId} onChange={set("taxId")} autoComplete="off" /></div>
          <div className={`field ${err("taxCountry")}`}><label htmlFor="gtc">{t.gjTaxCountry}</label><input id="gtc" maxLength={2} value={v.taxCountry} onChange={set("taxCountry")} style={{ textTransform: "uppercase" }} /></div>
        </div>
        <div className={`field ${err("address")}`}><label htmlFor="ga">{t.gjAddress}</label><input id="ga" value={v.address} onChange={set("address")} autoComplete="street-address" /></div>
        <div className={`field ${err("birthDate")}`}><label htmlFor="gbd">{t.gjBirth}</label><input id="gbd" type="date" value={v.birthDate} onChange={set("birthDate")} autoComplete="bday" /></div>
        {!declared && <label className={`consent ${err("independent")}`}><input type="checkbox" checked={indep} onChange={(e) => setIndep(e.target.checked)} /> <span>{t.gjIndep}</span></label>}
      </fieldset>
      {mode === "join" && <label className={`consent ${err("terms")}`}><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> <span>{t.gjTerms} <a href={`/${locale}/legal/guides`} target="_blank" rel="noreferrer">{t.gjTermsLink}</a></span></label>}
      {state === "error" && <p className="err">{t.gjErr}</p>}
      {mode === "edit" && state === "done" && <p className="hint">✓ {t.gpSaved}</p>}
      <button className="btn press" disabled={state === "busy"}>{mode === "join" ? t.gjSubmit : t.gpSave}</button>
    </form>
  );
}

export function GuideRelink({ t, locale }: { t: Dict; locale: Locale }) {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false); const [dev, setDev] = useState<string | null>(null);
  return (
    <form className="row" style={{ gap: 8, flexWrap: "nowrap" }} onSubmit={async (e) => {
      e.preventDefault();
      const r = await fetch("/api/guides", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, locale }) }).catch(() => null);
      const j = r ? await r.json().catch(() => ({})) : {}; setSent(true); setDev(j.devLink ?? null);
    }}>
      {sent ? <p className="hint">✓ {t.gjSent} {dev && <a href={dev}>{dev}</a>}</p> : <>
        <div className="field" style={{ flex: 1, margin: 0 }}><input type="email" required placeholder={t.gjEmail} aria-label={t.gjEmail} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <button className="btn ghost" style={{ padding: "10px 16px", width: "auto", whiteSpace: "nowrap" }}>{t.gjLinkBtn}</button></>}
    </form>
  );
}

/** Pedido de reserva: data/hora no fuso da cidade, duração, pessoas e contacto → checkout Stripe. */
export function BookGuide({ t, locale, guide, tz }: { t: Dict; locale: Locale; guide: { id: string; name: string; hourlyCents: number; maxPeople: number }; tz?: string }) {
  const [date, setDate] = useState(""); const [time, setTime] = useState("10:00");
  const [hours, setHours] = useState(3); const [people, setPeople] = useState(2);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState(""); const [note, setNote] = useState("");
  const [terms, setTerms] = useState(false); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const total = new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency: "EUR" }).format((guide.hourlyCents * hours) / 100);
  const minDate = new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
  // Prazo real de resposta do guia: 48 h, mas nunca depois de 1 h antes do passeio (igual ao servidor).
  const replyBy = (() => {
    const at = toUtc(); if (!at) return "";
    const by = Math.min(Date.now() + 48 * 3600_000, at.getTime() - 3600_000);
    return new Intl.DateTimeFormat(INTL_LOCALE[locale], { timeZone: tz, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(by));
  })();

  /** Converte "data + hora local da cidade" para instante UTC. */
  function toUtc(): Date | null {
    if (!date || !time) return null;
    const guess = new Date(`${date}T${time}:00Z`);
    if (!tz) return guess;
    try {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(guess);
      const g = (k: string) => Number(parts.find((p) => p.type === k)?.value);
      const asLocal = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"));
      return new Date(guess.getTime() - (asLocal - guess.getTime()));
    } catch { return guess; }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    const at = toUtc();
    if (!at || at.getTime() < Date.now() + 3 * 3600_000) return setMsg(t.gdTooSoon);
    if (!terms || name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email)) return setMsg(t.gdErr);
    setBusy(true);
    const r = await fetch("/api/guides/book", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guideId: guide.id, startAt: at.toISOString(), hours, people, name, email, phone, note, locale, terms }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok && j.url) { window.location.href = j.url; return; }
    setBusy(false); setMsg(j.error === "busy" ? t.gdBusy : j.error === "too_soon" ? t.gdTooSoon : t.gdErr);
  }

  return (
    <form className="stack" onSubmit={submit} noValidate id="book">
      <div className="grid2">
        <div className="field"><label htmlFor="bd">{t.gdDate}</label><input id="bd" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="field"><label htmlFor="bt">&nbsp;</label><input id="bt" type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} /></div>
      </div>
      <div className="grid2">
        <div className="field"><label htmlFor="bh">{t.gdHours}</label><select id="bh" value={hours} onChange={(e) => setHours(Number(e.target.value))}>{[1, 2, 3, 4, 5, 6, 8].map((h) => <option key={h} value={h}>{h} h</option>)}</select></div>
        <div className="field"><label htmlFor="bp">{t.gdPeople}</label><select id="bp" value={people} onChange={(e) => setPeople(Number(e.target.value))}>{Array.from({ length: guide.maxPeople }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
      </div>
      <div className="grid2">
        <div className="field"><label htmlFor="bn">{t.gdName}</label><input id="bn" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
        <div className="field"><label htmlFor="be">{t.gdEmail}</label><input id="be" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
      </div>
      <div className="field"><label htmlFor="bph">{t.gdPhone}</label><input id="bph" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></div>
      <div className="field"><label htmlFor="bno">{t.gdNote}</label><textarea id="bno" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></div>
      <div className="row-between"><b>{t.gdTotal}</b><b className="num" style={{ fontSize: 22 }}>{total}</b></div>
      {replyBy && <p className="note">⏳ {fmt(t.gdReplyBy, { g: guide.name, t: replyBy })}</p>}
      <label className="consent"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> <span>{t.gdTerms2}</span></label>
      {msg && <p className="err">{msg}</p>}
      <button className="btn tram press" disabled={busy}>{t.gdPay}</button>
      <p className="hint">🔒 {t.gdSafe}</p>
    </form>
  );
}

export function PayoutsButton({ t, locale, ready }: { t: Dict; locale: Locale; ready: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <button className={`btn ${ready ? "ghost" : "tram"} press`} disabled={busy} onClick={async () => {
      setBusy(true);
      const r = await fetch(`/api/guides/payouts?locale=${locale}`, { method: "POST" }).catch(() => null);
      const j = r ? await r.json().catch(() => ({})) : {};
      if (j.url) window.location.href = j.url; else setBusy(false);
    }}>{ready ? t.gpPayOpen : t.gpPay}</button>
  );
}

export function RespondButtons({ t, id }: { t: Dict; id: string }) {
  const [busy, setBusy] = useState(false);
  const go = async (accept: boolean) => {
    setBusy(true);
    await fetch(`/api/guides/bookings/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accept }) }).catch(() => null);
    location.reload();
  };
  return (
    <div className="grid2">
      <button className="btn tram press" disabled={busy} onClick={() => void go(true)}>{t.gpAccept}</button>
      <button className="btn ghost press" disabled={busy} onClick={() => void go(false)}>{t.gpDecline}</button>
    </div>
  );
}

export function GuideReviewForm({ t, bookingId, token, guide }: { t: Dict; bookingId: string; token: string; guide: string }) {
  const [stars, setStars] = useState(0); const [comment, setComment] = useState(""); const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  if (state === "done") return <div className="card stack" style={{ padding: 16 }}><b>✓ {t.gdRateThanks}</b></div>;
  return (
    <div className="card stack rate" style={{ gap: 12, padding: 16 }}>
      <b style={{ fontSize: 18 }}>{fmt(t.gdRateTitle, { g: guide })}</b>
      <div className="star-pick" role="radiogroup">{[1, 2, 3, 4, 5].map((k) => <button key={k} role="radio" aria-checked={stars === k} aria-label={`${k} / 5`} className={k <= stars ? "on" : ""} onClick={() => setStars(k)}>★</button>)}</div>
      <textarea rows={3} maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t.gdComment} />
      {state === "error" && <p className="err">{t.gdErr}</p>}
      <button className="btn press" disabled={!stars || state === "busy"} onClick={async () => {
        setState("busy");
        const r = await fetch("/api/guides/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, token, stars, comment }) }).catch(() => null);
        setState(r?.ok ? "done" : "error");
      }}>{t.gdRateSend}</button>
    </div>
  );
}

export function ShareProfile({ t, url, title }: { t: Dict; url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className="btn ghost press" onClick={async () => {
      try { if (navigator.share) { await navigator.share({ title, url }); return; } } catch { return; }
      try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { window.prompt("", url); }
    }}>{copied ? `✓ ${t.gpCopied}` : `↗ ${t.gpShare}`}</button>
  );
}
