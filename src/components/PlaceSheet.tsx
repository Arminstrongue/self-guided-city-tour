"use client";
/** Ficha de um lugar: foto, avaliação, aberto agora, horário, entrada grátis, resumo da Wikipédia e ações (ir, site, juntar ao plano). */
import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { INTL_LOCALE } from "@/i18n/core";
import Portal from "./Portal";

export type SheetPlace = {
  name: string; lat: number; lng: number; icon: string; catLabel?: string;
  rating?: number; reviews?: number; openNow?: boolean; hours?: string; fee?: boolean; web?: string; gmaps?: string; photo?: string; wiki?: string;
  text?: string; // descrição própria (ex.: momentos da cidade)
};
type Info = { title: string; text: string; url: string; lang: string };

export function PlaceSheet({ t, locale, place: p, inPlan, onAdd, onClose }: { t: Dict; locale: Locale; place: SheetPlace; inPlan?: boolean; onAdd?: () => void; onClose: () => void }) {
  const [info, setInfo] = useState<Info | null | undefined>(p.text ? null : undefined);
  useEffect(() => {
    if (p.text) return;
    let live = true;
    const q = new URLSearchParams({ name: p.name, lat: String(p.lat), lng: String(p.lng), locale, ...(p.wiki ? { wiki: p.wiki } : {}) });
    fetch(`/api/place-info?${q}`).then((r) => (r.ok ? r.json() : null)).then((j: { info?: Info | null } | null) => { if (live) setInfo(j?.info ?? null); }).catch(() => { if (live) setInfo(null); });
    return () => { live = false; };
  }, [p.name, p.lat, p.lng, p.wiki, p.text, locale]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const go = p.gmaps ?? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=walking`;
  return (
    <Portal><div className="as-bg ps-bg" onClick={onClose}>
      <div className="as ps" role="dialog" aria-modal="true" aria-label={p.name} onClick={(e) => e.stopPropagation()}>
        <span className="as-grab" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.photo && <img className="ps-ph" src={`/api/explore/photo?n=${encodeURIComponent(p.photo)}`} alt="" />}
        <div className="ps-h">
          <span className="ps-ic" aria-hidden="true">{p.icon}</span>
          <div className="stack" style={{ gap: 2, minWidth: 0, flex: 1 }}>
            <b className="ps-n">{p.name}</b>
            <span className="hint">
              {p.rating ? <b className="ex-star">★ {p.rating.toFixed(1)}</b> : null}{p.rating && p.reviews ? ` (${p.reviews.toLocaleString(INTL_LOCALE[locale])})` : ""}
              {p.catLabel ? `${p.rating ? " · " : ""}${p.catLabel}` : ""}{p.fee === false ? ` · ${t.exFreeEntry}` : ""}
              {p.openNow === true && <b className="ex-open"> · {t.exOpen}</b>}{p.openNow === false && <span> · {t.exClosed}</span>}
            </span>
          </div>
          <button type="button" className="mu2-x ps-x" onClick={onClose} aria-label={t.close}>✕</button>
        </div>
        {p.hours && <p className="ps-hours"><b>{t.pi.hours}</b> {p.hours}</p>}
        <section className="ps-about" aria-live="polite">
          <b>{t.pi.about}</b>
          {p.text ? <p>{p.text}</p>
            : info === undefined ? <p className="hint">{t.pi.loading}</p>
            : info ? <><p lang={info.lang}>{info.text}</p><a className="ps-src" href={info.url} target="_blank" rel="noopener noreferrer">{t.pi.source} · CC BY-SA ↗</a></>
            : <p className="hint">{t.pi.none}</p>}
        </section>
        <div className="ps-acts">
          {onAdd && <button type="button" className="btn press" disabled={inPlan} onClick={onAdd}>{inPlan ? `✓ ${t.plAddTo.replace(/^\+\s*/, "")}` : t.plAddTo}</button>}
          <a className="btn ghost press" href={go} target="_blank" rel="noopener noreferrer">🧭 {t.exGo}</a>
          {p.web && <a className="btn ghost press" href={p.web} target="_blank" rel="noopener noreferrer">{t.exWeb} ↗</a>}
        </div>
      </div>
    </div></Portal>
  );
}
