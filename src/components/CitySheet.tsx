"use client";
/**
 * Ficha de uma cidade visitada (ou a visitar): o passado (passes, memórias, planos) e o presente
 * (tempo agora, roteiro, o que há para fazer, feed da cidade).
 */
import { useEffect, useMemo, useState } from "react";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { flag } from "@/data/countries";
import type { Wallet } from "@/lib/wallet";
import type { Memory } from "@/lib/diary";
import { SheetX } from "@/components/WinNav";
import Portal from "@/components/Portal";

type Spot = { name: string; country: string; year?: number; mine: boolean; want?: boolean };
type Weather = { rainy: boolean; firstRain: string | null; max: number | null; min: number | null };

export function CitySheet({ t, locale, spot, id, wallet, memories, onClose }: {
  t: Dict; locale: Locale; spot: Spot; id: string | null; wallet: Wallet; memories: Memory[]; onClose: () => void;
}) {
  const [wx, setWx] = useState<Weather | null>(null);
  const region = useMemo(() => { try { return new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "region" }); } catch { return null; } }, [locale]);
  const df = (iso: string | number) => new Date(iso).toLocaleDateString(INTL_LOCALE[locale], { day: "numeric", month: "short", year: "numeric" });
  useEffect(() => { if (id) fetch(`/api/weather?city=${id}`).then((r) => (r.ok ? r.json() : null)).then(setWx).catch(() => null); }, [id]);
  const lower = spot.name.toLowerCase();
  const passes = wallet.passes.filter((p) => (id && p.city === id) || p.scope === "all");
  const cityPasses = passes.filter((p) => p.city === id);
  const active = passes.find((p) => Date.parse(p.expiresAt) > Date.now());
  const mems = memories.filter((m) => (id && m.city === id) || m.cityName.toLowerCase() === lower);
  const plans = wallet.plans.filter((p) => (id && p.city === id) || p.cityName.toLowerCase() === lower);
  const status = spot.want ? `✈️ ${t.vKindWish}${spot.year ? ` · ${spot.year}` : ""}` : spot.year ? fmt(t.csVisitedIn, { y: spot.year }) : !spot.mine ? `✓ ${t.vAuto}` : `✓ ${t.vKindBeen}`;

  return (
    <Portal><div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack cs" style={{ gap: 16 }} onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={onClose} label={t.close} />
        <header className="cs-hero">
          <span className="cs-flag" aria-hidden="true">{flag(spot.country)}</span>
          <div className="stack" style={{ gap: 2, minWidth: 0 }}>
            <h2 className="cs-name">{spot.name}</h2>
            <span className="cs-sub">{region?.of(spot.country) ?? spot.country}</span>
            <span className={`cs-pill ${spot.want ? "want" : ""}`}>{status}</span>
          </div>
        </header>

        {/* Agora */}
        {id && (
          <section className="stack" style={{ gap: 8 }}>
            <b className="cs-h">{t.csNow}</b>
            {wx && wx.max !== null && <p className="cs-wx">{wx.rainy ? "🌧" : "⛅️"} {Math.round(wx.min ?? wx.max)}° – {Math.round(wx.max)}°{wx.rainy && wx.firstRain ? ` · ${fmt(t.csRain, { h: wx.firstRain.slice(11, 16) })}` : ""}</p>}
            <div className="cs-acts">
              {active ? <a className="cs-act prime" href={`/${locale}/tour/${id}`}><span>🧭</span>{t.csOpenRoute}</a>
                : <a className="cs-act prime" href={`/${locale}/c/${id}`}><span>🧭</span>{t.csSeeRoute}</a>}
              <a className="cs-act" href={`/${locale}/wallet/agenda?city=${id}`}><span>🎟</span>{t.csWhatsOn}</a>
              <a className="cs-act" href={`/${locale}/wallet#feed:${id}`} onClick={onClose}><span>📸</span>{t.csFeed}</a>
            </div>
          </section>
        )}

        {/* O passado */}
        <section className="stack" style={{ gap: 10 }}>
          <b className="cs-h">{t.csHistory}</b>
          {cityPasses.length === 0 && mems.length === 0 && plans.length === 0 && <p className="hint" style={{ margin: 0 }}>{id ? t.csNothing : t.csNotInApp}</p>}
          {cityPasses.map((p) => {
            const live = Date.parse(p.expiresAt) > Date.now();
            return (
              <div key={p.id} className="cs-row">
                <span aria-hidden="true">🎟</span>
                <span className="stack" style={{ gap: 0, flex: 1, minWidth: 0 }}><b>{t.csPass}</b><small className="hint">{df(p.createdAt)}{p.flightNo ? ` · ✈️ ${p.flightNo}` : ""}</small></span>
                <small className={`cs-tag ${live ? "on" : ""}`}>{live ? t.csActive : t.csEnded}</small>
              </div>
            );
          })}
          {plans.map((p) => (
            <a key={p.id} className="cs-row" href={`/${locale}/plan/${p.id}`}>
              <span aria-hidden="true">🗺</span>
              <span className="stack" style={{ gap: 0, flex: 1, minWidth: 0 }}><b className="ad-ellip">{p.title}</b><small className="hint">{p.startDate ? df(p.startDate) : ""}{p.days ? ` · ${fmt(t.csDays, { n: p.days })}` : ""}</small></span>
              <span aria-hidden="true" className="hint">›</span>
            </a>
          ))}
          {mems.length > 0 && <>
            <small className="hint">📔 {fmt(t.csMemories, { n: mems.length })}</small>
            <div className="cs-mems">{mems.slice(0, 12).map((m) => (
              <figure key={m.id} className="cs-mem">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {m.photo ? <img src={m.photo} alt="" loading="lazy" /> : <span>📍</span>}
                <figcaption><b className="ad-ellip">{m.title}</b><small>{df(m.at)}</small></figcaption>
              </figure>
            ))}</div>
          </>}
        </section>
      </div>
    </div></Portal>
  );
}
