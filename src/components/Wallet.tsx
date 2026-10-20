"use client";
/** Carteira do viajante: passes, reservas de guias, memórias, carimbos e interesses — na conta, em qualquer dispositivo. */
import { useEffect, useMemo, useState } from "react";
import { fmt, INTL_LOCALE, type Dict, type Locale } from "@/i18n/dictionaries";
import { deleteMemory, listMemories, syncLocalToAccount, type Memory } from "@/lib/diary";
import { HOBBIES, HOBBY_ICON, type Hobby } from "@/lib/explore";
import type { Wallet } from "@/lib/wallet";

type Mem = Memory & { local?: boolean };

function left(ms: number, locale: Locale) {
  const h = Math.max(0, Math.round(ms / 3600_000));
  const rtf = new Intl.NumberFormat(INTL_LOCALE[locale], { style: "unit", unit: h >= 48 ? "day" : "hour", unitDisplay: "long" });
  return rtf.format(h >= 48 ? Math.round(h / 24) : h);
}

export function WalletView({ t, locale, cities, free }: { t: Dict; locale: Locale; cities: Record<string, string>; free: string[] }) {
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
