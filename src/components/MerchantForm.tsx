"use client";
import { useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { INTL_LOCALE } from "@/i18n/dictionaries";

type CityOpt = { id: string; name: string; stops: { id: string; name: string }[] };
type Plan = "basic" | "featured" | "partner";

export function MerchantForm({ locale, t, cities, prices, agent }: { locale: Locale; t: Dict; cities: CityOpt[]; prices: Record<Plan, number>; agent?: string }) {
  const [f, setF] = useState({ name: "", category: "food", city: cities[0].id, stopId: cities[0].stops[0].id, offer: "", email: "", instagram: "", tiktok: "", facebook: "", plan: "featured" as Plan });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const city = cities.find((c) => c.id === f.city) ?? cities[0];
  const money = (c: number) => new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(c / 100);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.name.trim().length < 2 || f.offer.trim().length < 3 || !/^\S+@\S+\.\S+$/.test(f.email)) return setError(t.mErr);
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/merchants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, locale, agent: agent || undefined }) });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error();
      window.location.href = data.url;
    } catch { setError(t.errGeneric); setBusy(false); }
  }

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <div className="field"><label htmlFor="m-name">{t.mName}</label><input id="m-name" value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
      <div className="grid2">
        <div className="field"><label htmlFor="m-cat">{t.mCat}</label>
          <select id="m-cat" value={f.category} onChange={(e) => set("category", e.target.value)}>
            {Object.entries(t.cats).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
        <div className="field"><label htmlFor="m-city">{t.mCity}</label>
          <select id="m-city" value={f.city} onChange={(e) => { const c = cities.find((x) => x.id === e.target.value)!; setF((p) => ({ ...p, city: c.id, stopId: c.stops[0].id })); }}>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
      </div>
      <div className="field"><label htmlFor="m-stop">{t.mStop}</label>
        <select id="m-stop" value={f.stopId} onChange={(e) => set("stopId", e.target.value)}>
          {city.stops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select></div>
      <div className="field"><label htmlFor="m-offer">{t.mOffer}</label><input id="m-offer" placeholder={t.mOfferPh} value={f.offer} onChange={(e) => set("offer", e.target.value)} maxLength={140} /></div>
      <div className="field"><label htmlFor="m-email">{t.mEmail}</label><input id="m-email" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
      <span className="label">{t.mSocial}</span>
      <div className="grid2">
        <div className="field"><label htmlFor="m-ig">Instagram</label><input id="m-ig" placeholder="@" value={f.instagram} onChange={(e) => set("instagram", e.target.value)} /></div>
        <div className="field"><label htmlFor="m-tt">TikTok</label><input id="m-tt" placeholder="@" value={f.tiktok} onChange={(e) => set("tiktok", e.target.value)} /></div>
      </div>
      <div className="field"><label htmlFor="m-fb">Facebook</label><input id="m-fb" placeholder="facebook.com/…" value={f.facebook} onChange={(e) => set("facebook", e.target.value)} /></div>
      <span className="label">{t.mPlan}</span>
      <div className="plans">
        {(["basic", "featured", "partner"] as Plan[]).map((k) => {
          const p = t.mPlans[k];
          return (
            <button key={k} type="button" className="plan" aria-pressed={f.plan === k} onClick={() => set("plan", k)}>
              <span className="dot" />
              <div><b>{p[0]}</b><ul>{p.slice(1).map((x) => <li key={x}>{x}</li>)}</ul></div>
              <span className="price num">{prices[k] ? money(prices[k]) : t.mFree}{prices[k] ? <small>{t.perMonth}</small> : null}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn tram" type="submit" disabled={busy}>
        {busy ? t.redirecting : `${t.mSubmit}${prices[f.plan] ? ` · ${money(prices[f.plan])}${t.perMonth}` : ""}`}
      </button>
    </form>
  );
}
