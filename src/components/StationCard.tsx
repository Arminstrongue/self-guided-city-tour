"use client";
/**
 * Manchester Piccadilly: como ler os painéis e o que fazer quando a plataforma muda.
 * Fotografias próprias da VOYBU (pessoas desfocadas). Aparece no bilhete de comboio que passa por Piccadilly.
 */
import { useState } from "react";
import type { Dict } from "@/i18n/dictionaries";
import { PICCADILLY_PHOTOS } from "@/data/rail-stations";

export function PiccadillyCard({ t }: { t: Dict }) {
  const p = t.pic;
  const [big, setBig] = useState<string | null>(null);
  return (
    <section className="pic card" aria-label={p.title}>
      <button type="button" className="pic-ph" onClick={() => setBig(`${PICCADILLY_PHOTOS.concourse}.webp`)} aria-label={p.photoAlt}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${PICCADILLY_PHOTOS.concourse}-480.webp`} srcSet={`${PICCADILLY_PHOTOS.concourse}-480.webp 480w, ${PICCADILLY_PHOTOS.concourse}.webp 1600w`} sizes="(max-width: 600px) 100vw, 560px" alt={p.photoAlt} loading="lazy" decoding="async" />
        <span className="pic-credit">VOYBU</span>
      </button>
      <div className="pic-b">
        <b className="pic-t">🚉 {p.title}</b>
        <p className="pic-warn">⚠️ {p.sub}</p>
        <div className="pic-row">
          <button type="button" className="pic-board" onClick={() => setBig(`${PICCADILLY_PHOTOS.board}.webp`)} aria-label={p.boardAlt}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${PICCADILLY_PHOTOS.board}-480.webp`} alt={p.boardAlt} loading="lazy" decoding="async" />
          </button>
          <ul className="pic-list">
            <li>{p.b1}</li>
            <li>{p.b2}</li>
            <li>{p.b3}</li>
          </ul>
        </div>
        <p className="pic-staff">🙋 {p.b4}</p>
      </div>
      {big && (
        <div className="pic-zoom" role="dialog" aria-label={p.title} onClick={() => setBig(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={big} alt="" />
          <button type="button" className="pic-x" aria-label={t.close} onClick={() => setBig(null)}>×</button>
        </div>
      )}
    </section>
  );
}
