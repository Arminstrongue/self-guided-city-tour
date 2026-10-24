"use client";
import { useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { INTL_LOCALE } from "@/i18n/core";
import { MAX_OPTIONS, MAX_PHOTOS, bookKind } from "@/lib/booking";
import { shrink } from "@/lib/photo-shrink";

type CityOpt = { id: string; name: string; stops: { id: string; name: string; lat: number; lng: number }[] };
type Hit = { label: string; sub: string; lat: number; lng: number };
type Plan = "basic" | "featured" | "partner";

export function MerchantForm({ locale, t, cities, prices, agent, partnerPct }: { locale: Locale; t: Dict; cities: CityOpt[]; prices: Record<Plan, number>; agent?: string; partnerPct: number }) {
  const [f, setF] = useState({ name: "", category: "food", city: cities[0].id, stopId: cities[0].stops[0].id, offer: "", email: "", instagram: "", tiktok: "", facebook: "", plan: "featured" as Plan });
  const [photos, setPhotos] = useState<string[]>([]);
  const [book, setBook] = useState({ on: true, options: [] as { name: string; price: string }[], url: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));
  const city = cities.find((c) => c.id === f.city) ?? cities[0];
  // Morada exata: pesquisa na cidade escolhida; ao escolher, sugere a paragem mais próxima (pode mudar).
  const [place, setPlace] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [aq, setAq] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [aBusy, setABusy] = useState(false);
  async function findAddress() {
    if (aq.trim().length < 3) return;
    setABusy(true); setHits(null);
    const j = await fetch(`/api/geocode?city=${f.city}&lang=${locale}&q=${encodeURIComponent(aq.trim())}`).then((r) => (r.ok ? r.json() : null)).catch(() => null) as { hits?: Hit[] } | null;
    setHits(j?.hits ?? []); setABusy(false);
  }
  function pickPlace(h: Hit) {
    const address = h.sub ? `${h.label}, ${h.sub}` : h.label;
    setPlace({ address: address.slice(0, 200), lat: h.lat, lng: h.lng }); setHits(null); setAq(address);
    const d = (s: { lat: number; lng: number }) => (s.lat - h.lat) ** 2 + ((s.lng - h.lng) * Math.cos((h.lat * Math.PI) / 180)) ** 2;
    const near = [...city.stops].sort((a, b) => d(a) - d(b))[0];
    if (near) setF((p) => ({ ...p, stopId: near.id }));
  }
  const kind = bookKind(f.category);
  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    const out: string[] = [];
    for (const file of Array.from(files).slice(0, room)) { try { out.push(await shrink(file)); } catch { /* ficheiro inválido */ } }
    setPhotos((p) => [...p, ...out].slice(0, MAX_PHOTOS));
  }
  const setOpt = (i: number, k: "name" | "price", v: string) => setBook((b) => ({ ...b, options: b.options.map((o, j) => (j === i ? { ...o, [k]: v } : o)) }));
  const money = (c: number) => new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(c / 100);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.name.trim().length < 2 || f.offer.trim().length < 3 || !/^\S+@\S+\.\S+$/.test(f.email)) return setError(t.mErr);
    if (!place) return setError(t.mAddrErr);
    if (!photos.length) return setError(t.mPhotoErr);
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/merchants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, locale, agent: agent || undefined, photos,
        bookMode: kind && book.on ? "request" : "none", bookOptions: kind ? book.options.filter((o) => o.name.trim()) : [], bookingUrl: book.url, phone: book.phone, address: place.address, lat: place.lat, lng: place.lng }) });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error();
      window.location.href = data.url;
    } catch { setError(t.errGeneric); setBusy(false); }
  }

  const pick = (category: string, plan: Plan) => {
    setF((p) => ({ ...p, category, plan }));
    document.getElementById("start")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <>
      <span className="label">{t.mWaysT}</span>
      <div className="mb-ways">
        <div className="mb-way"><b>🛏 {t.mWay1T}</b><p>{t.mWay1S}</p>
          <button type="button" className="btn ghost press" onClick={() => pick("hotel", "featured")}>{t.mWay1Btn}</button></div>
        <div className="mb-way"><b>📱 {t.mWay2T}</b><p>{t.mWay2S.replace("{p}", String(partnerPct))}</p>
          <button type="button" className="btn ghost press" onClick={() => pick("hotel", "partner")}>{t.mWay2Btn}</button></div>
      </div>

      <h2 id="plans" className="gp-h2" style={{ scrollMarginTop: 80, marginTop: 8 }}>{t.mPlansT}</h2>
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
      <p className="hint">{t.mPlansNote}</p>

      <form id="start" className="stack" style={{ scrollMarginTop: 80 }} onSubmit={submit} noValidate>
        <h2 className="gp-h2">{t.mStartT}</h2>
        <div className="field"><label htmlFor="m-name">{t.mName}</label><input id="m-name" value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div className="grid2">
          <div className="field"><label htmlFor="m-cat">{t.mCat}</label>
            <select id="m-cat" value={f.category} onChange={(e) => set("category", e.target.value)}>
              {Object.entries(t.cats).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
          <div className="field"><label htmlFor="m-city">{t.mCity}</label>
            <select id="m-city" value={f.city} onChange={(e) => { const c = cities.find((x) => x.id === e.target.value)!; setF((p) => ({ ...p, city: c.id, stopId: c.stops[0].id })); setPlace(null); setHits(null); setAq(""); }}>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
        </div>
        <div className="field"><label htmlFor="m-addr">{t.mAddr}</label>
          <div className="bp-q">
            <input id="m-addr" value={aq} onChange={(e) => { setAq(e.target.value); setPlace(null); }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void findAddress(); } }} placeholder={t.mAddrPh} autoComplete="street-address" />
            <button type="button" className="btn tram" disabled={aBusy || aq.trim().length < 3} onClick={() => void findAddress()}>⌕<span className="sr-only">{t.bpSearch}</span></button>
          </div>
          {hits && (hits.length ? <div className="bp-hits">{hits.map((h, k) => <button key={k} type="button" className="bp-hit press" onClick={() => pickPlace(h)}><b>{h.label}</b>{h.sub && <small>{h.sub}</small>}</button>)}</div> : <p className="hint">{t.bpNone}</p>)}
          {place && <p className="bp-ok">✓ {place.address} · <a href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`} target="_blank" rel="noopener noreferrer">{t.mAddrMap} ↗</a></p>}
          <span className="hint">{t.mAddrHint}</span>
        </div>
        <div className="field"><label htmlFor="m-stop">{t.mStop}</label>
          <select id="m-stop" value={f.stopId} onChange={(e) => set("stopId", e.target.value)}>
            {city.stops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select></div>
        <div className="field"><label htmlFor="m-offer">{t.mOffer}</label><input id="m-offer" placeholder={t.mOfferPh} value={f.offer} onChange={(e) => set("offer", e.target.value)} maxLength={140} /></div>
        <span className="label">{t.mPhotos}</span>
        <div className="mb-photos">
          {photos.map((p, i) => (
            <div key={i} className="mb-ph">
              <img src={p} alt="" />
              <button type="button" className="mb-x" aria-label={t.mPhotoRemove} onClick={() => setPhotos((a) => a.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="mb-ph mb-add press">
              <input type="file" accept="image/*" multiple hidden onChange={(e) => { void addPhotos(e.target.files); e.target.value = ""; }} />
              <span>＋</span><small>{t.mPhotoAdd}</small>
            </label>
          )}
        </div>
        <p className="hint">{t.mPhotosHint}</p>
        <div className="field"><label htmlFor="m-email">{t.mEmail}</label><input id="m-email" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
        <details className="mb-more">
          <summary>{t.mMore}</summary>
          <div className="stack">
            <div className="field"><label htmlFor="m-phone">{t.mPhone}</label><input id="m-phone" type="tel" inputMode="tel" placeholder="+351 …" value={book.phone} onChange={(e) => setBook((b) => ({ ...b, phone: e.target.value }))} maxLength={30} /></div>
            {kind && (
              <>
                <span className="label">{t.mBook}</span>
                <label className="mb-check"><input type="checkbox" checked={book.on} onChange={(e) => setBook((b) => ({ ...b, on: e.target.checked }))} /> {t.mBookOn}</label>
                {book.on && (
                  <>
                    <p className="hint">{t.mBookHow}</p>
                    <span className="hint" style={{ fontWeight: 600 }}>{t.mBookOpts[kind]}</span>
                    {book.options.map((o, i) => (
                      <div key={i} className="mb-opt">
                        <input aria-label={t.mBookOpts[kind]} placeholder={t.mOptNamePh[kind]} value={o.name} maxLength={60} onChange={(e) => setOpt(i, "name", e.target.value)} />
                        <input aria-label={t.mOptPrice} placeholder={t.mOptPricePh} value={o.price} maxLength={40} onChange={(e) => setOpt(i, "price", e.target.value)} />
                        <button type="button" className="mb-x" aria-label={t.mPhotoRemove} onClick={() => setBook((b) => ({ ...b, options: b.options.filter((_, j) => j !== i) }))}>×</button>
                      </div>
                    ))}
                    {book.options.length < MAX_OPTIONS && (
                      <button type="button" className="btn ghost press" onClick={() => setBook((b) => ({ ...b, options: [...b.options, { name: "", price: "" }] }))}>＋ {t.mOptAdd}</button>
                    )}
                  </>
                )}
                <div className="field"><label htmlFor="m-url">{t.mBookUrl}</label><input id="m-url" type="url" inputMode="url" placeholder="https://" value={book.url} onChange={(e) => setBook((b) => ({ ...b, url: e.target.value }))} maxLength={300} /></div>
              </>
            )}
            <span className="label">{t.mSocial}</span>
            <div className="grid2">
              <div className="field"><label htmlFor="m-ig">Instagram</label><input id="m-ig" placeholder="@" value={f.instagram} onChange={(e) => set("instagram", e.target.value)} /></div>
              <div className="field"><label htmlFor="m-tt">TikTok</label><input id="m-tt" placeholder="@" value={f.tiktok} onChange={(e) => set("tiktok", e.target.value)} /></div>
            </div>
            <div className="field"><label htmlFor="m-fb">Facebook</label><input id="m-fb" placeholder="facebook.com/…" value={f.facebook} onChange={(e) => set("facebook", e.target.value)} /></div>
          </div>
        </details>
        <span className="label">{t.mPreview}</span>
        <div className="offer mb-offer" style={{ borderStyle: "solid" }} aria-live="polite">
          {photos[0] ? <img className="mb-thumb" src={photos[0]} alt="" /> : <span className="mb-thumb mb-thumb-demo" aria-hidden="true">📷</span>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="cat">{t.cats[f.category as keyof Dict["cats"]] ?? f.category}</span>
            <b>{f.name.trim() || t.mName}</b>{f.offer.trim() || t.mOfferPh}
            {place && <div className="hint">📍 {place.address}</div>}
            {kind && book.on && <div className="mb-cta">{t.mbReq[kind]} ›</div>}
          </div>
          {f.plan !== "basic" && <span className="feat">{t.featured}</span>}
        </div>
        <span className="hint">{city.stops.find((x) => x.id === f.stopId)?.name ?? ""} · {city.name}</span>
        <span className="label">{t.mNextT}</span>
        <ul className="mb-next">
          <li>{f.plan === "basic" ? t.mNextFree : t.mNextPaid}</li>
          {kind && <li>{t.mNextBook}</li>}
          <li>{t.mEditCancel}</li>
        </ul>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn tram" type="submit" disabled={busy}>
          {busy ? t.redirecting : prices[f.plan] ? `${t.mSubmit} · ${money(prices[f.plan])}${t.perMonth}` : t.bzBtn}
        </button>
      </form>
    </>
  );
}
