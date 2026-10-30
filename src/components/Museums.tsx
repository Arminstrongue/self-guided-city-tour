"use client";
import { useEffect, useState } from "react";
import type { City, Stop } from "@/data/cities";
import type { Museum } from "@/data/museums";
import { openNow } from "@/data/museums";
import type { Dict } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import { ExtLink } from "./ExtLink";
import { OWN_CREDIT, OWN_MUSEUM_PHOTOS, ownSrc } from "@/data/own-photos";

/** Museus com horário de hoje, estado (aberto/fechado), preço e reserva. */
export function MuseumsTab({ city, museums, t, money, onMap, locale }: {
  city: City; museums: Museum[]; t: Dict; money: (v: number) => React.ReactNode;
  onMap: (m: Museum) => void; locale: string;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const i = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(i); }, []);
  const tx = (m: Museum) => (locale === "pt" ? m.pt : m.en);
  if (!museums.length) return <p className="hint">—</p>;
  return (
    <div className="stack">
      {[...museums].sort((a, b) => a.price - b.price).map((m) => {
        const st = now ? openNow(m, city.tz ?? "UTC", now) : null;
        return (
          <div key={m.id} className="card stack" style={{ gap: 6, padding: 14 }}>
            <div className="row-between">
              <b>🏛 {m.n}</b>
              <span className="cost-tag num" style={{ color: m.price ? "var(--warn)" : "var(--good)" }}>{m.price ? money(m.price) : t.free}</span>
            </div>
            {st && (
              <p className={st.open ? "ok-txt" : "bad-txt"}>
                <b>{st.open ? t.openNow : st.today ? t.closedNow : t.closedTodayM}</b>
                {st.today && ` · ${fmt(t.todayHours, { o: st.today[0], c: st.today[1] })}`}
              </p>
            )}
            {(OWN_MUSEUM_PHOTOS[m.id] ?? []).length > 0 && (
              <div className="mu-photos" role="list">
                {OWN_MUSEUM_PHOTOS[m.id].map((p) => (
                  <a key={p.file} role="listitem" href={ownSrc(city.id, p.file)} target="_blank" rel="noopener noreferrer" title={locale === "pt" ? p.pt : p.en}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ownSrc(city.id, p.file, true)} alt={locale === "pt" ? p.pt : p.en} loading="lazy" decoding="async" />
                  </a>
                ))}
              </div>
            )}
            {(OWN_MUSEUM_PHOTOS[m.id] ?? []).length > 0 && <small className="mu-credit">📷 {OWN_CREDIT}</small>}
            <p className="hint">{tx(m)}{m.book ? ` · ${t.book}` : ""}</p>
            <div className="acts">
              <button type="button" onClick={() => onMap(m)}>{t.map}</button>
              <ExtLink href={m.url}>{t.officialSite} ↗</ExtLink>
            </div>
          </div>
        );
      })}
      <p className="hint">{t.priceRef}</p>
    </div>
  );
}

/** Sugestão de 3 dias para férias curtas. */
export function DayPlan({ core, extra, museums, t, extName }: { core: Stop[]; extra: Stop[]; museums: Museum[]; t: Dict; extName: string }) {
  const half = Math.ceil(museums.length / 2);
  const days = [
    { title: t.day1, items: core.map((s) => s.n) },
    { title: extra.length ? fmt(t.day2, { x: extName }) : t.day2b, items: [...extra.map((s) => s.n), ...museums.slice(0, half).map((m) => `🏛 ${m.n}`)] },
    { title: t.day3, items: [...museums.slice(half).map((m) => `🏛 ${m.n}`), `🍽 ${t.eatTitle}`] }
  ];
  return (
    <div className="card stack" style={{ gap: 10, padding: 14 }}>
      <b>🧳 {t.dayPlanTitle}</b>
      {days.map((d, i) => (
        <div key={i}>
          <span className="label">{fmt(t.dayN, { n: i + 1 })} · {d.title}</span>
          <p>{d.items.join(" · ")}</p>
        </div>
      ))}
    </div>
  );
}
