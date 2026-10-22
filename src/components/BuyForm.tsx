"use client";
import { track } from "@/lib/track";
import { useEffect, useState } from "react";
import { loadTrip, saveTrip } from "./trip-store";
import { cityNowLocal, defaultTrip, type Trip } from "@/lib/trip";
import { zonedToDate } from "@/lib/zoned";
import { endLabel } from "./TripPicker";
const signIn = (...a: Parameters<typeof import("next-auth/react").signIn>) => import("next-auth/react").then((m) => m.signIn(...a));
import type { Dict } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Locale } from "@/i18n/dictionaries";
import { dualMoney, type FxContext } from "@/lib/currency";

type Props = {
  locale: Locale; cityId: string; cityName: string; refCode: string;
  providers: { id: string; name: string }[]; sessionEmail: string | null;
  prices: { city: number; trip: number; all: number }; fx: FxContext; t: Dict;
  /** Fuso da cidade: as horas do formulário são sempre na hora local da cidade. */
  tz: string;
};


export function BuyForm({ locale, cityId, cityName, refCode, providers, sessionEmail, prices, fx, t, tz }: Props) {
  // Dois perfis: escala (voo obrigatório) e férias curtas (voo de regresso opcional).
  const [mode, setMode] = useState<"layover" | "trip">("layover");
  const [plan, setPlan] = useState<"city" | "trip" | "all">("city");
  const pickMode = (m: "layover" | "trip") => { setMode(m); setPlan(m === "trip" ? "trip" : "city"); };
  const [email, setEmail] = useState(sessionEmail ?? "");
  const [name, setName] = useState("");
  // Plano de viagem (planeador / "Posso sair?"): modalidade e UMA hora de partida, na hora local da cidade.
  const [trip, setTrip] = useState<Trip>(defaultTrip());
  const flight = trip.deadline;
  const setFlight = (v: string) => { const nt = { ...trip, deadline: v }; setTrip(nt); saveTrip(cityId, nt); };
  useEffect(() => {
    const sync = () => setTrip(loadTrip(cityId));
    sync();
    const on = (e: Event) => { if ((e as CustomEvent).detail === cityId) sync(); };
    window.addEventListener("sgct:trip", on);
    return () => window.removeEventListener("sgct:trip", on);
  }, [cityId]);
  const tm = trip.mode;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [flightNo, setFlightNo] = useState("");
  // Preço em euros; se o viajante usar outra moeda, mostra-se também o valor aproximado nela.
  const price = (c: number) => dualMoney(c / 100, "EUR", fx, INTL_LOCALE[locale]);
  // Convites: desconto de amigo no primeiro passe e crédito ganho a convidar (estimativa; o Stripe mostra o valor final).
  const [refl, setRefl] = useState<{ inviter: string | null; friendPct: number; credit: number; email: string | null } | null>(null);
  useEffect(() => { fetch("/api/referral", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then(setRefl).catch(() => null); }, []);
  const final = (c: number) => {
    let a = c - Math.round(c * (refl?.friendPct ?? 0) / 100);
    if (refl?.credit && refl.email && refl.email === email.trim().toLowerCase()) a -= Math.min(refl.credit, Math.max(0, a - 50));
    return a;
  };
  const priceTag = (c: number) => { const f = final(c); const p = price(f); const tag = p.local ? <>{p.local}<span className="price-local">{p.main}</span></> : p.main; return f < c ? <><s className="price-was">{price(c).main}</s> {tag}</> : tag; };
  const chosen = price(final(prices[plan]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t.errEmail);
    const when = flight ? zonedToDate(flight, tz) : null;
    const needFlight = mode === "layover" && tm !== "stay";
    if ((needFlight && !when) || (when && (isNaN(when.getTime()) || when.getTime() < Date.now()))) return setError(t.errDep);
    const fno = tm === "plane" ? flightNo.toUpperCase().replace(/[^A-Z0-9]/g, "") : "";
    if (fno && !/^([A-Z]{2}|[A-Z]\d|\d[A-Z])\d{1,4}[A-Z]?$/.test(fno)) return setError(t.errFlightNo);
    if (!consent) return setError(t.errConsent);
    setBusy(true);
    try {
      track("checkout_start", { city: cityId, locale, ref: refCode || undefined });
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: cityId, plan, email, name, flightAt: when ? when.toISOString() : undefined, flightNo: fno || undefined, locale, ref: refCode || undefined, consent, trip })
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "checkout");
      window.location.href = data.url;
    } catch {
      setError(t.errGeneric); setBusy(false);
    }
  }

  return (
    <form className="stack" onSubmit={submit} noValidate>
      {providers.length > 0 && !sessionEmail && (
        <>
          <span className="label">{t.signInWith}</span>
          <div className="socials">
            {providers.map((p) => (
              <button key={p.id} type="button" className="social" onClick={() => signIn(p.id)}>{p.name}</button>
            ))}
          </div>
          <div className="or">{t.orEmail}</div>
        </>
      )}
      {refl?.inviter && <p className="note ref-note">🎁 {fmt(t.rfFriend, { n: `@${refl.inviter}`, p: refl.friendPct })}</p>}
      {refl && refl.credit > 0 && refl.email && refl.email === email.trim().toLowerCase() && <p className="note ref-note">💳 {fmt(t.rfCreditApplied, { c: price(refl.credit).main })}</p>}
      <div className="mode-switch" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "layover"} onClick={() => pickMode("layover")}>⏱ {t.modeLayover}</button>
        <button type="button" role="tab" aria-selected={mode === "trip"} onClick={() => pickMode("trip")}>🧳 {t.modeTrip}</button>
      </div>
      <div className="plans" role="radiogroup">
        {mode === "layover" ? (
          <button type="button" className="plan" aria-pressed={plan === "city"} onClick={() => setPlan("city")}>
            <span className="dot" /><div><b>{fmt(t.planCity, { city: cityName })}</b><p className="hint">{t.planCityDesc}</p></div>
            <span className="price num">{priceTag(prices.city)}</span>
          </button>
        ) : (
          <button type="button" className="plan" aria-pressed={plan === "trip"} onClick={() => setPlan("trip")}>
            <span className="dot" /><div><b>{fmt(t.planTrip, { city: cityName })}</b><p className="hint">{t.planTripDesc}</p></div>
            <span className="price num">{priceTag(prices.trip)}</span>
          </button>
        )}
        <button type="button" className="plan" aria-pressed={plan === "all"} onClick={() => setPlan("all")}>
          <span className="dot" /><div><b>{t.planAll}</b><p className="hint">{t.planAllDesc}</p></div>
          <span className="price num">{priceTag(prices.all)}</span>
        </button>
      </div>
      {chosen.local && <p className="hint">{fmt(t.fxNote, { cur: fx.cur, base: chosen.main })}</p>}
      <p className="hint">⏱ {fmt(t.tpActivate, { h: plan === "all" ? t.tpDur30d : plan === "trip" ? t.tpDur72 : t.tpDur48 })}</p>
      <div className="field"><label htmlFor="email">{t.email}</label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      <div className="field"><label htmlFor="name">{t.name}</label>
        <input id="name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <p className="hint">{endLabel(trip.start, t)} → {endLabel(trip.end, t)} · {t.tpModes[tm]} · <a href={`/${locale}/start?city=${cityId}`}>{t.bpChange}</a></p>
      <div className="field"><label htmlFor="flight">{t.tpDepField[tm]}{mode === "trip" || tm === "stay" ? ` (${t.tpOptional})` : ""}</label>
        <input id="flight" type="datetime-local" min={cityNowLocal(tz)} value={flight} onChange={(e) => setFlight(e.target.value)} required={mode === "layover" && tm !== "stay"} />
        <span className="hint">{t.tpDepHint[tm]} {fmt(t.tpCityTime, { c: cityName })}</span></div>
      {tm === "plane" && (
        <div className="field"><label htmlFor="fno">{t.flightNo}</label>
          <input id="fno" autoCapitalize="characters" autoComplete="off" placeholder="TP1234" maxLength={10} value={flightNo} onChange={(e) => setFlightNo(e.target.value)} />
          <span className="hint">{t.flightNoHint}</span></div>
      )}
      {tm === "plane" && <p className="note">{t.entryNote}</p>}
      <label className="consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> <span>{t.consent}</span></label>
      <p className="hint">{t.termsNote.split(/(\{terms\}|\{privacy\})/).map((part, i) => part === "{terms}" ? <a key={i} href={`/${locale}/legal/terms`} target="_blank">{t.lTerms}</a> : part === "{privacy}" ? <a key={i} href={`/${locale}/legal/privacy`} target="_blank">{t.lPrivacy}</a> : part)}</p>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn tram" type="submit" disabled={busy}>
        {busy ? t.redirecting : `${t.pay} ${chosen.local ?? chosen.main}`}
      </button>
    </form>
  );
}
