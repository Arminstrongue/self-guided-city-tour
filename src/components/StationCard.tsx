"use client";
/**
 * Manchester Piccadilly: como ler os painéis e o que fazer quando a plataforma muda.
 * Fotografias próprias da VOYBU (pessoas desfocadas). Aparece no bilhete de comboio que passa por Piccadilly.
 */
import { useState } from "react";
import { BoardHelperButton } from "./BoardHelper";
import type { Dict } from "@/i18n/dictionaries";
import { EUSTON_PHOTOS, PICCADILLY_PHOTOS } from "@/data/rail-stations";

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
        <BoardHelperButton t={t} from="Manchester Piccadilly" />
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

/** Londres Euston: como ler os painéis (azul "Please wait" → verde "Boarding" com plataforma), comboios que se dividem e plataformas curtas. */
export function EustonCard({ t }: { t: Dict }) {
  const e = t.eus;
  const [big, setBig] = useState(false);
  return (
    <section className="pic card" aria-label={e.title}>
      <button type="button" className="pic-ph" onClick={() => setBig(true)} aria-label={e.photoAlt}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${EUSTON_PHOTOS.board}-480.webp`} srcSet={`${EUSTON_PHOTOS.board}-480.webp 480w, ${EUSTON_PHOTOS.board}.webp 1600w`} sizes="(max-width: 600px) 100vw, 560px" alt={e.photoAlt} loading="lazy" decoding="async" />
        <span className="pic-credit">VOYBU</span>
      </button>
      <div className="pic-b">
        <b className="pic-t">🚉 {e.title}</b>
        <ol className="eus-steps">
          <li><span className="eus-tag blue">{e.waitTag}</span>{e.wait}</li>
          <li><span className="eus-tag green">{e.goTag}</span>{e.go}</li>
          <li>🚃 {e.split}</li>
          <li>⚠️ {e.short}</li>
          <li>🚪 {e.doors}</li>
        </ol>
        <p className="pic-staff">🙋 {e.staff}</p>
        <BoardHelperButton t={t} from="London Euston" />
      </div>
      {big && (
        <div className="pic-zoom" role="dialog" aria-label={e.title} onClick={() => setBig(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${EUSTON_PHOTOS.board}.webp`} alt="" />
          <button type="button" className="pic-x" aria-label={t.close} onClick={() => setBig(false)}>×</button>
        </div>
      )}
    </section>
  );
}
