"use client";
import { Minus, Plus } from "lucide-react";
import { fmt } from "@/i18n/core";
import { BUFFER_MIN, BUFFER_RANGE, bufferOf, type Trip } from "@/lib/trip";

type T = { bfLabel: string; bfRec: string; bfReset: string; bfLess: string; bfMore: string };
const dur = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${String(m % 60).padStart(2, "0")}` : ""}` : `${m} min`);

/** Margem antes da partida, ajustável (avião, comboio, autocarro, navio). A recomendada fica sempre visível. */
export function BufferPicker({ trip, onChange, t }: { trip: Trip; onChange: (v: Trip) => void; t: T }) {
  const r = BUFFER_RANGE[trip.mode];
  if (!r.max) return null;
  const cur = bufferOf(trip), rec = BUFFER_MIN[trip.mode];
  const set = (m: number) => { const v = Math.min(r.max, Math.max(r.min, m)); const { buffer: _old, ...rest } = trip; void _old; onChange(v === rec ? rest : { ...rest, buffer: v }); };
  return (
    <div className="bf">
      <span className="bf-l">{t.bfLabel}</span>
      <div className="bf-ctl">
        <button type="button" className="bf-b press" onClick={() => set(cur - r.step)} disabled={cur <= r.min} aria-label={t.bfLess}><Minus size={16} aria-hidden="true" /></button>
        <b className="bf-v num" aria-live="polite">{dur(cur)}</b>
        <button type="button" className="bf-b press" onClick={() => set(cur + r.step)} disabled={cur >= r.max} aria-label={t.bfMore}><Plus size={16} aria-hidden="true" /></button>
      </div>
      <small className="hint">{fmt(t.bfRec, { d: dur(rec) })}{cur !== rec && <> · <button type="button" className="bf-reset" onClick={() => set(rec)}>{t.bfReset}</button></>}</small>
    </div>
  );
}
