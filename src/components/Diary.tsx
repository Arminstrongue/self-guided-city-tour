"use client";
/** Diário de viagem: carimbos por cidade e memórias (foto, nota, lugar), guardados só no dispositivo. */
import { useEffect, useMemo, useState } from "react";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { deleteMemory, listMemories, type Memory } from "@/lib/diary";

export function Diary({ t, locale }: { t: Dict; locale: Locale }) {
  const [items, setItems] = useState<Memory[] | null>(null);
  const load = () => void listMemories().then(setItems);
  useEffect(() => { load(); window.addEventListener("sgct:diary", load); return () => window.removeEventListener("sgct:diary", load); }, []);
  const cities = useMemo(() => {
    const m = new Map<string, { name: string; list: Memory[] }>();
    for (const x of items ?? []) m.set(x.city, { name: x.cityName, list: [...(m.get(x.city)?.list ?? []), x] });
    return [...m.entries()];
  }, [items]);
  const when = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short", year: "numeric" });

  async function share(x: Memory) {
    const text = `${x.title} · ${x.cityName}${x.note ? ` — ${x.note}` : ""}\nhellotravell.com/${x.city}`;
    try {
      if (x.photo && navigator.canShare) {
        const blob = await (await fetch(x.photo)).blob();
        const file = new File([blob], "memory.jpg", { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; }
      }
      if (navigator.share) await navigator.share({ text }); else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    } catch { /* cancelado */ }
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <section className="gp-hero">
        <span className="label" style={{ color: "rgba(255,255,255,.7)" }}>📔 {t.diary}</span>
        <h1 className="gp-name">{t.diaryTitle}</h1>
        <span className="gp-meta">{items ? fmt(t.diaryStamps, { n: cities.length, m: items.length }) : "…"}</span>
        {cities.length > 0 && <div className="dy-stamps">{cities.map(([id, c]) => <span key={id} className="dy-stamp"><b>{c.name}</b><small>{c.list.length}</small></span>)}</div>}
        <span className="gp-meta" style={{ fontSize: 13 }}>{t.diarySub}</span>
      </section>
      {items && items.length === 0 && <div className="card gp-empty"><span aria-hidden="true">📔</span><b>{t.diaryEmpty}</b><a className="btn press" href={`/${locale}#cities`} style={{ width: "auto", marginTop: 8 }}>{t.diaryExplore}</a></div>}
      {cities.map(([id, c]) => (
        <section key={id} className="stack" style={{ gap: 10 }}>
          <h2 className="gp-h2">📍 {c.name}</h2>
          {c.list.map((x) => (
            <article key={x.id} className="card dy-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {x.photo && <img src={x.photo} alt="" />}
              <div className="stack" style={{ gap: 4, padding: 14 }}>
                <b>{x.title}</b>
                <span className="hint">{when.format(new Date(x.at))}</span>
                {x.note && <p style={{ margin: 0 }}>{x.note}</p>}
                <div className="ex-acts">
                  <button onClick={() => void share(x)}>↗ {t.diaryShare}</button>
                  <a href={`https://www.tiktok.com/upload`} target="_blank" rel="noreferrer">♪ TikTok</a>
                  <button onClick={async () => { await deleteMemory(x.id); load(); }}>🗑 {t.diaryDelete}</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
