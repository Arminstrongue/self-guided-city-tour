"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import type { Dict } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE, type Locale } from "@/i18n/dictionaries";
import { dualMoney, type FxContext } from "@/lib/currency";

type Props = {
  locale: Locale; cityId: string; cityName: string; refCode: string;
  providers: { id: string; name: string }[]; sessionEmail: string | null;
  prices: { city: number; all: number }; fx: FxContext; t: Dict;
};

function defaultFlight(): string {
  const d = new Date(Date.now() + 8 * 3600e3); d.setMinutes(0, 0, 0);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function BuyForm({ locale, cityId, cityName, refCode, providers, sessionEmail, prices, fx, t }: Props) {
  const [plan, setPlan] = useState<"city" | "all">("city");
  const [email, setEmail] = useState(sessionEmail ?? "");
  const [name, setName] = useState("");
  const [flight, setFlight] = useState(defaultFlight);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  // Preço em euros; se o viajante usar outra moeda, mostra-se também o valor aproximado nela.
  const price = (c: number) => dualMoney(c / 100, "EUR", fx, INTL_LOCALE[locale]);
  const priceTag = (c: number) => { const p = price(c); return p.local ? <>{p.local}<span className="price-local">{p.main}</span></> : p.main; };
  const chosen = price(plan === "all" ? prices.all : prices.city);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t.errEmail);
    const when = new Date(flight);
    if (!flight || isNaN(when.getTime()) || when.getTime() < Date.now()) return setError(t.errDep);
    if (!consent) return setError(t.errConsent);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: cityId, plan, email, name, flightAt: when.toISOString(), locale, ref: refCode || undefined, consent })
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
      <div className="plans" role="radiogroup">
        <button type="button" className="plan" aria-pressed={plan === "city"} onClick={() => setPlan("city")}>
          <span className="dot" /><div><b>{fmt(t.planCity, { city: cityName })}</b><p className="hint">{t.planCityDesc}</p></div>
          <span className="price num">{priceTag(prices.city)}</span>
        </button>
        <button type="button" className="plan" aria-pressed={plan === "all"} onClick={() => setPlan("all")}>
          <span className="dot" /><div><b>{t.planAll}</b><p className="hint">{t.planAllDesc}</p></div>
          <span className="price num">{priceTag(prices.all)}</span>
        </button>
      </div>
      {chosen.local && <p className="hint">{fmt(t.fxNote, { cur: fx.cur, base: chosen.main })}</p>}
      <div className="field"><label htmlFor="email">{t.email}</label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      <div className="field"><label htmlFor="name">{t.name}</label>
        <input id="name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field"><label htmlFor="flight">{t.dep}</label>
        <input id="flight" type="datetime-local" value={flight} onChange={(e) => setFlight(e.target.value)} required />
        <span className="hint">{t.depHint}</span></div>
      <p className="note">{t.entryNote}</p>
      <label className="consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> <span>{t.consent}</span></label>
      <p className="hint">{t.termsNote.split(/(\{terms\}|\{privacy\})/).map((part, i) => part === "{terms}" ? <a key={i} href={`/${locale}/legal/terms`} target="_blank">{t.lTerms}</a> : part === "{privacy}" ? <a key={i} href={`/${locale}/legal/privacy`} target="_blank">{t.lPrivacy}</a> : part)}</p>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn tram" type="submit" disabled={busy}>
        {busy ? t.redirecting : `${t.pay} ${chosen.local ?? chosen.main}`}
      </button>
    </form>
  );
}
