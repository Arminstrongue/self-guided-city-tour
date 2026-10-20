"use client";
/** Carteira do viajante: passes, reservas de guias, memórias, carimbos e interesses — na conta, em qualquer dispositivo. */
import { useEffect, useMemo, useState } from "react";
import { fmt, INTL_LOCALE, type Dict, type Locale } from "@/i18n/dictionaries";
import { deleteMemory, listMemories, syncLocalToAccount, type Memory } from "@/lib/diary";
import { HOBBIES, HOBBY_ICON, type Hobby } from "@/lib/explore";
import type { Wallet } from "@/lib/wallet";
import { COUNTRY_CODES, flag } from "@/data/countries";

type Mem = Memory & { local?: boolean };

function left(ms: number, locale: Locale) {
  const h = Math.max(0, Math.round(ms / 3600_000));
  const rtf = new Intl.NumberFormat(INTL_LOCALE[locale], { style: "unit", unit: h >= 48 ? "day" : "hour", unitDisplay: "long" });
  return rtf.format(h >= 48 ? Math.round(h / 24) : h);
}

export function WalletView({ t, locale, cities, free, countryOf }: { t: Dict; locale: Locale; cities: Record<string, string>; free: string[]; countryOf: Record<string, string> }) {
  const [w, setW] = useState<Wallet | null | "anon">(null);
  const [local, setLocal] = useState<Mem[]>([]);
  const [synced, setSynced] = useState(0);
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false); const [dev, setDev] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/me", { cache: "no-store" }).catch(() => null);
    if (r?.ok) {
      const n = await syncLocalToAccount().catch(() => 0); // memórias deste dispositivo passam para a conta
      if (n) { setSynced(n); const again = await fetch("/api/me", { cache: "no-store" }); setW(await again.json()); } else setW(await r.json());
      setLocal(await listMemories());
    } else { setW("anon"); setLocal((await listMemories()).map((m) => ({ ...m, local: true }))); }
  }
  useEffect(() => { void load(); const f = () => void load(); window.addEventListener("sgct:diary", f); return () => window.removeEventListener("sgct:diary", f); }, []);

  const signed = w && w !== "anon" ? w : null;
  const memories: Mem[] = useMemo(() => [...(signed?.memories ?? []), ...local.map((m) => ({ ...m, local: true }))].sort((a, b) => b.at - a.at), [signed, local]);
  const stamps = useMemo(() => { const m = new Map<string, { name: string; n: number }>(); for (const x of memories) m.set(x.city, { name: x.cityName, n: (m.get(x.city)?.n ?? 0) + 1 }); return [...m.entries()]; }, [memories]);
  const now = Date.now();
  const dt = new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const d = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short", year: "numeric" });
  const eur = (c: number) => new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency: "EUR" }).format(c / 100);

  async function setHobby(h: Hobby) {
    if (!signed) return;
    const next = signed.hobbies.includes(h) ? signed.hobbies.filter((x) => x !== h) : [...signed.hobbies, h];
    setW({ ...signed, hobbies: next });
    try { localStorage.setItem("sgct:hobbies", JSON.stringify(next)); } catch { /* ignorar */ }
    await fetch("/api/me/prefs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hobbies: next }) }).catch(() => null);
  }
  async function remove(m: Mem) {
    if (m.local) await deleteMemory(m.id); else await fetch(`/api/me/memories/${m.id}`, { method: "DELETE" }).catch(() => null);
    void load();
  }
  async function share(x: Mem) {
    const text = `${x.title} · ${x.cityName}${x.note ? ` — ${x.note}` : ""}\nselfguidedcitytour.com/${x.city}`;
    try {
      if (x.photo && navigator.canShare) {
        const file = new File([await (await fetch(x.photo)).blob()], "memory.jpg", { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; }
      }
      if (navigator.share) await navigator.share({ text }); else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    } catch { /* cancelado */ }
  }

  const passes = signed?.passes ?? [];
  return (
    <div className="stack" style={{ gap: 18 }}>
      <section className="gp-hero">
        <div className="gp-hero-top">
          <span className="label" style={{ color: "rgba(255,255,255,.7)" }}>👛 {t.wallet}</span>
          {signed && <form action={`/api/me/logout?locale=${locale}`} method="post"><button className="gp-out">{t.wSignOut}</button></form>}
        </div>
        <h1 className="gp-name">{t.wallet}</h1>
        <span className="gp-meta">{signed ? fmt(t.wSignedAs, { email: signed.email }) : t.walletSub}</span>
        <span className="gp-meta">{fmt(t.diaryStamps, { n: stamps.length, m: memories.length })}</span>
        {stamps.length > 0 && <div className="dy-stamps">{stamps.map(([id, c]) => <span key={id} className="dy-stamp"><b>{c.name}</b><small>{c.n}</small></span>)}</div>}
      </section>

      {synced > 0 && <p className="note">✓ {fmt(t.wSynced, { n: synced })}</p>}

      {w === "anon" && (
        <section className="card stack wl-sign">
          <b style={{ fontSize: 18 }}>🔐 {t.wSignTitle}</b>
          <p className="hint" style={{ margin: 0 }}>{t.wSignSub}</p>
          {sent ? <p>✓ {fmt(t.wSent, { email })} {dev && <a href={dev}>dev</a>}</p> : (
            <form className="row" style={{ gap: 8, flexWrap: "nowrap" }} onSubmit={async (e) => {
              e.preventDefault();
              const r = await fetch("/api/me/link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, locale }) }).catch(() => null);
              const j = r?.ok ? await r.json() : null; if (j) { setSent(true); setDev(j.devLink ?? null); }
            }}>
              <div className="field" style={{ flex: 1, margin: 0 }}><input type="email" required placeholder="email@example.com" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
              <button className="btn press" style={{ width: "auto", whiteSpace: "nowrap" }}>{t.wSignBtn}</button>
            </form>
          )}
        </section>
      )}

      <section className="stack" style={{ gap: 10 }}>
        <h2 className="gp-h2">🎟 {t.wPasses}</h2>
        {passes.map((p) => {
          const active = new Date(p.expiresAt).getTime() > now;
          const href = p.scope === "all" ? `/${locale}#cities` : `/${locale}/tour/${p.city}`;
          return (
            <a key={p.id} href={href} className={`card wl-pass ${active ? "on" : "off"}`}>
              <span className="wl-pass-l">
                <span className="label">{p.scope === "all" ? t.wAllCities : p.plan === "trip" ? "3 days" : "48 h"}</span>
                <b className="wl-city">{p.scope === "all" ? `🌍 ${t.wAllCities}` : cities[p.city ?? ""] ?? p.city}</b>
                <span className="hint">{d.format(new Date(p.createdAt))} · {eur(p.amountCents)}{p.flightNo ? ` · ${fmt(t.wFlight, { f: p.flightNo })}` : ""}</span>
              </span>
              <span className="wl-pass-r"><span className={`pill ${active ? "active" : "cancelled"}`}>{active ? fmt(t.wActive, { t: left(new Date(p.expiresAt).getTime() - now, locale) }) : t.wExpired}</span>{active && <b className="wl-open">{t.wOpen} →</b>}</span>
            </a>
          );
        })}
        {free.filter((id) => cities[id]).map((id) => (
          <a key={id} href={`/${locale}/tour/${id}`} className="card wl-pass on">
            <span className="wl-pass-l"><span className="label">🎁 {t.wFree}</span><b className="wl-city">{cities[id]}</b></span>
            <span className="wl-pass-r"><b className="wl-open">{t.wOpen} →</b></span>
          </a>
        ))}
        {signed && passes.length === 0 && <a className="btn ghost press" href={`/${locale}#cities`}>{t.wBuy}</a>}
      </section>

      {signed && signed.bookings.length > 0 && (
        <section className="stack" style={{ gap: 10 }}>
          <h2 className="gp-h2">🧑‍💼 {t.wBookings}</h2>
          {signed.bookings.map((b) => (
            <a key={b.id} href={`/${locale}/g/${b.guideId}`} className="card bk" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="row-between"><b style={{ fontSize: 17 }}>{b.guide}</b><span className={`chip st-${b.status}`}>{t.gpBs[b.status as keyof typeof t.gpBs] ?? b.status}</span></div>
              <span className="bk-when">📅 {dt.format(new Date(b.startAt))} · {b.hours} h · {b.people} 👤 · {cities[b.city] ?? b.city}</span>
              {"guidePhone" in b && b.guidePhone && <span className="hint">📞 {t.wGuideContact}: {b.guidePhone}</span>}
              {"meeting" in b && b.meeting && <span className="hint">📍 {t.wMeet}: {b.meeting}</span>}
            </a>
          ))}
        </section>
      )}

      {signed && <Plans t={t} locale={locale} cities={cities} plans={signed.plans} />}

      {signed && <Visited t={t} locale={locale} wallet={signed} cities={cities} countryOf={countryOf} memories={memories} onChange={(visited) => setW({ ...signed, visited })} />}

      {signed && (
        <section className="card stack" style={{ gap: 10, padding: 16 }}>
          <b>{t.wInterests}</b>
          <div className="ex-chips">{HOBBIES.map((h) => <button key={h} className={signed.hobbies.includes(h) ? "on" : ""} aria-pressed={signed.hobbies.includes(h)} onClick={() => void setHobby(h)}>{HOBBY_ICON[h]} {t.hob[h]}</button>)}</div>
        </section>
      )}

      <section className="stack" style={{ gap: 10 }}>
        <h2 className="gp-h2">📔 {t.wMemories}</h2>
        {memories.length === 0 && w !== null && <div className="card gp-empty"><span aria-hidden="true">📔</span><b>{t.diaryEmpty}</b><a className="btn press" href={`/${locale}#cities`} style={{ width: "auto", marginTop: 8 }}>{t.diaryExplore}</a></div>}
        <div className="wl-mems">
          {memories.map((x) => (
            <article key={x.id} className="card dy-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {x.photo && <img src={x.photo} alt="" loading="lazy" />}
              <div className="stack" style={{ gap: 4, padding: 14 }}>
                <span className="label" style={{ color: "var(--cobalt)" }}>📍 {x.cityName}{x.local ? ` · ${t.wLocalOnly}` : ""}</span>
                <b>{x.title}</b>
                <span className="hint">{d.format(new Date(x.at))}</span>
                {x.note && <p style={{ margin: 0 }}>{x.note}</p>}
                <div className="ex-acts">
                  <button onClick={() => void share(x)}>↗ {t.diaryShare}</button>
                  <a href="https://www.tiktok.com/upload" target="_blank" rel="noreferrer">♪ TikTok</a>
                  <button onClick={() => void remove(x)}>🗑 {t.diaryDelete}</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------- Planos de viagem ---------- */
function Plans({ t, locale, cities, plans }: { t: Dict; locale: Locale; cities: Record<string, string>; plans: Wallet["plans"] }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", city: Object.keys(cities)[0] ?? "", other: "", start: "", days: 2 });
  const [busy, setBusy] = useState(false);
  const d = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short" });
  async function create(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const other = f.city === "__other";
    const cityName = other ? f.other.trim() : cities[f.city];
    const r = await fetch("/api/me/plans", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: f.title.trim() || cityName, city: other ? null : f.city, cityName, startDate: f.start || null, days: f.days }) }).catch(() => null);
    const j = r?.ok ? await r.json() : null;
    if (j?.id) window.location.href = `/${locale}/plan/${j.id}`; else setBusy(false);
  }
  return (
    <section className="stack" style={{ gap: 10 }}>
      <div className="row-between"><h2 className="gp-h2">🗺 {t.plTitle}</h2><button className="link-btn" onClick={() => setOpen(!open)}>{t.plNew}</button></div>
      {open && (
        <form className="card stack wl-form" onSubmit={create}>
          <div className="field"><label htmlFor="pn">{t.plName}</label><input id="pn" value={f.title} maxLength={120} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={f.city === "__other" ? f.other : cities[f.city]} /></div>
          <div className="grid2">
            <div className="field"><label htmlFor="pc">{t.plCity}</label>
              <select id="pc" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>
                {Object.entries(cities).sort((a, b) => a[1].localeCompare(b[1])).map(([id, n]) => <option key={id} value={id}>{n}</option>)}
                <option value="__other">{t.plOther}</option>
              </select></div>
            {f.city === "__other" && <div className="field"><label htmlFor="po">{t.plOtherName}</label><input id="po" required value={f.other} maxLength={80} onChange={(e) => setF({ ...f, other: e.target.value })} /></div>}
          </div>
          <div className="grid2">
            <div className="field"><label htmlFor="ps">{t.plStart}</label><input id="ps" type="date" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></div>
            <div className="field"><label htmlFor="pd">{t.plDays}</label><select id="pd" value={f.days} onChange={(e) => setF({ ...f, days: Number(e.target.value) })}>{Array.from({ length: 14 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          </div>
          <button className="btn press" disabled={busy || (f.city === "__other" && !f.other.trim())}>{t.plCreate}</button>
        </form>
      )}
      {plans.map((p) => (
        <a key={p.id} href={`/${locale}/plan/${p.id}`} className="card wl-pass on">
          <span className="wl-pass-l"><span className="label">📍 {p.cityName}{p.startDate ? ` · ${d.format(new Date(`${p.startDate}T12:00:00`))}` : ""}</span><b className="wl-city">{p.title}</b><span className="hint">{p.days === 1 ? fmt(t.plDay, { n: 1 }) : fmt(t.plDaysN, { n: p.days })} · {fmt(t.plItems, { n: p.count })}</span></span>
          <span className="wl-pass-r"><b className="wl-open">→</b></span>
        </a>
      ))}
      {!plans.length && !open && <button className="btn ghost press" onClick={() => setOpen(true)}>{t.plNew}</button>}
    </section>
  );
}

/* ---------- Cidades visitadas ---------- */
function Visited({ t, locale, wallet, cities, countryOf, memories, onChange }: { t: Dict; locale: Locale; wallet: Wallet; cities: Record<string, string>; countryOf: Record<string, string>; memories: { city: string; cityName: string }[]; onChange: (v: Wallet["visited"]) => void }) {
  const [open, setOpen] = useState<"visited" | "wish" | null>(null);
  const [f, setF] = useState({ name: "", country: "", year: "" });
  const region = useMemo(() => { try { return new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "region" }); } catch { return null; } }, [locale]);
  const countries = useMemo(() => COUNTRY_CODES.map((c) => ({ c, n: region?.of(c) ?? c })).sort((a, b) => a.n.localeCompare(b.n)), [region]);
  // Visitadas com a app (passes e memórias) + as que o viajante acrescentou; "quero visitar" à parte.
  const auto = useMemo(() => {
    const m = new Map<string, { name: string; country: string }>();
    for (const p of wallet.passes) if (p.city && cities[p.city]) m.set(p.city, { name: cities[p.city], country: countryOf[p.city] ?? "" });
    for (const x of memories) if (!m.has(x.city)) m.set(x.city, { name: x.cityName, country: countryOf[x.city] ?? "" });
    return [...m.values()];
  }, [wallet.passes, memories, cities, countryOf]);
  const been = useMemo(() => {
    const seen = new Set(auto.map((a) => a.name.toLowerCase()));
    return [...auto.map((a) => ({ ...a, mine: false, at: 0, year: undefined as number | undefined })), ...wallet.visited.filter((v) => !v.want && !seen.has(v.name.toLowerCase())).map((v) => ({ ...v, mine: true }))];
  }, [auto, wallet.visited]);
  const wish = wallet.visited.filter((v) => v.want);
  const nCountries = new Set(been.map((a) => a.country).filter(Boolean)).size;
  const same = (a: { name: string; country: string }, b: { name: string; country: string }) => a.name === b.name && a.country === b.country;
  async function save(visited: Wallet["visited"]) {
    onChange(visited);
    await fetch("/api/me/prefs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visited }) }).catch(() => null);
  }
  const ourId = (name: string) => Object.entries(cities).find(([, n]) => n.toLowerCase() === name.toLowerCase())?.[0];
  return (
    <section className="stack" style={{ gap: 12 }}>
      <div className="row-between"><h2 className="gp-h2">🌍 {t.vTitle}</h2><span className="hint">{fmt(t.vStats, { c: been.length, p: nCountries })}</span></div>
      <div className="vs-grid">{been.map((v) => (
        <span key={`${v.name}-${v.country}`} className={`vs-chip ${v.mine ? "" : "auto"}`}>
          <span aria-hidden="true">{flag(v.country)}</span><b>{v.name}</b>{v.year ? <small>{v.year}</small> : !v.mine ? <small>{t.vAuto}</small> : null}
          {v.mine && <button aria-label="✕" onClick={() => void save(wallet.visited.filter((x) => !same(x, v)))}>✕</button>}
        </span>
      ))}</div>

      <div className="row-between" style={{ marginTop: 6 }}><h2 className="gp-h2" style={{ fontSize: 18 }}>✈️ {t.vWishTitle}</h2><span className="hint">{wish.length}</span></div>
      {wish.length > 0 && <div className="vs-grid">{wish.map((v) => {
        const id = ourId(v.name);
        return (
          <span key={`w-${v.name}-${v.country}`} className="vs-chip wish">
            <span aria-hidden="true">{flag(v.country)}</span><b>{v.name}</b>{v.year ? <small>{v.year}</small> : null}
            {id && <a href={`/${locale}/c/${id}`} title={t.wOpen}>→</a>}
            <button title={t.vBeen} onClick={() => void save(wallet.visited.map((x) => (same(x, v) ? { name: x.name, country: x.country, at: Date.now(), year: new Date().getFullYear() } : x)))}>✓</button>
            <button aria-label="✕" onClick={() => void save(wallet.visited.filter((x) => !same(x, v)))}>✕</button>
          </span>
        );
      })}</div>}

      {open ? (
        <form className="card stack wl-form" onSubmit={(e) => { e.preventDefault(); if (!f.name.trim() || !f.country) return; void save([...wallet.visited.filter((x) => !same(x, { name: f.name.trim(), country: f.country })), { name: f.name.trim(), country: f.country, ...(f.year ? { year: Number(f.year) } : {}), ...(open === "wish" ? { want: true } : {}), at: Date.now() }]); setF({ name: "", country: f.country, year: "" }); setOpen(null); }}>
          <div className="ex-tabs" role="tablist">
            <button type="button" className={open === "visited" ? "on" : ""} onClick={() => setOpen("visited")}>🌍 {t.vKindBeen}</button>
            <button type="button" className={open === "wish" ? "on" : ""} onClick={() => setOpen("wish")}>✈️ {t.vKindWish}</button>
          </div>
          <div className="grid2">
            <div className="field"><label htmlFor="vc">{t.vCity}</label><input id="vc" required value={f.name} maxLength={80} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="vk">{t.vCountry}</label><select id="vk" required value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })}><option value="" />{countries.map((x) => <option key={x.c} value={x.c}>{flag(x.c)} {x.n}</option>)}</select></div>
          </div>
          <div className="field"><label htmlFor="vy">{open === "wish" ? t.vYearWish : t.vYear}</label><input id="vy" inputMode="numeric" maxLength={4} value={f.year} onChange={(e) => setF({ ...f, year: e.target.value.replace(/\D/g, "") })} /></div>
          <div className="grid2"><button type="button" className="btn ghost press" onClick={() => setOpen(null)}>{t.exCancel}</button><button className="btn press">{t.vSave}</button></div>
        </form>
      ) : (
        <div className="grid2">
          <button className="btn ghost press" onClick={() => setOpen("visited")}>{t.vAdd}</button>
          <button className="btn ghost press" onClick={() => setOpen("wish")}>{t.vAddWish}</button>
        </div>
      )}
    </section>
  );
}
