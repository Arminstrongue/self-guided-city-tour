"use client";
import { useState } from "react";
import type { Stop } from "@/data/cities";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { dropToFit, hop } from "@/lib/route-cost";

type LL = { lat: number; lng: number };

/**
 * "O plano mudou": estou atrasado, quero uma pausa, saltar este local, preciso de regressar.
 * Recalcula o que ainda cabe e explica; nunca altera nada sem o viajante confirmar.
 */
export function PlanChanged({ t, locale, left, remaining, deadline, endSet, onSetEnd, onSkip, back, now }: {
  t: Dict; locale: Locale; left: Stop[]; remaining: number; deadline: Date | null; endSet: boolean;
  onSetEnd: (hhmm: string) => void; onSkip: (ids: string[]) => void;
  back: { label: string; to: LL; from: LL | null }; now: number;
}) {
  const [mode, setMode] = useState<null | "late" | "pause" | "back" | "skipped">(null);
  const [extra, setExtra] = useState(0);
  const [end, setEnd] = useState("");
  const [skippedName, setSkippedName] = useState("");
  const hm = (ms: number) => new Date(ms).toLocaleTimeString(INTL_LOCALE[locale], { hour: "2-digit", minute: "2-digit" });
  if (!left.length) return null;
  const finish = now + (remaining + extra) * 60_000;
  const slack = deadline ? Math.round((deadline.getTime() - finish) / 60_000) : null;
  const fix = slack !== null && slack < 0 ? dropToFit(left, -slack) : null;
  const names = (ids: string[]) => ids.map((id) => left.find((s) => s.id === id)?.n ?? id).join(", ");
  const h = back.from ? hop(back.from, back.to) : null;
  const dir = `https://www.google.com/maps/dir/?api=1&destination=${back.to.lat},${back.to.lng}&travelmode=${h?.m === "walk" ? "walking" : "transit"}`;

  const verdict = (
    <>
      {slack === null ? <p className="pc-msg">{fmt(t.pcNewBack, { t: hm(finish) })}</p>
        : slack >= 0 ? <p className="pc-msg ok">{fmt(t.pcOk, { t: hm(finish), m: slack })}</p>
          : fix ? <div className="pc-msg warn"><p>{fmt(t.pcDrop, { s: names(fix.ids), m: fix.saved })}</p><button className="btn press" onClick={() => { onSkip(fix.ids); setMode(null); setExtra(0); }}>{t.pcDropBtn}</button></div>
            : <p className="pc-msg bad">{t.pcNoTime}</p>}
      {!endSet && (
        <form className="pc-end" onSubmit={(e) => { e.preventDefault(); if (/^\d{2}:\d{2}$/.test(end)) onSetEnd(end); }}>
          <label htmlFor="pc-end">{t.pcSetEnd}</label>
          <input id="pc-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          <button className="btn ghost" disabled={!end}>{t.pcEndSave}</button>
        </form>
      )}
      <p className="hint">{t.pcEst}</p>
    </>
  );

  return (
    <div className="card pc">
      <b className="pc-h">{t.pcTitle}</b>
      <div className="pc-acts">
        <button className={`press ${mode === "late" ? "on" : ""}`} onClick={() => { setMode("late"); setExtra(15); }}>⏰ {t.pcLate}</button>
        <button className={`press ${mode === "pause" ? "on" : ""}`} onClick={() => { setMode("pause"); setExtra(30); }}>☕ {t.pcPause}</button>
        <button className="press" onClick={() => { setSkippedName(left[0].n); onSkip([left[0].id]); setMode("skipped"); setExtra(0); }}>⏭ {t.pcSkip}</button>
        <button className={`press ${mode === "back" ? "on" : ""}`} onClick={() => { setMode("back"); setExtra(0); }}>↩ {t.pcBack}</button>
      </div>
      {(mode === "late" || mode === "pause") && (
        <>
          <div className="pc-mins" role="radiogroup" aria-label={t.pcHowMuch}>
            <span className="hint">{t.pcHowMuch}</span>
            {[15, 30, 45, 60].map((m) => <button key={m} type="button" role="radio" aria-checked={extra === m} className={extra === m ? "on" : ""} onClick={() => setExtra(m)}>{m} min</button>)}
          </div>
          {verdict}
        </>
      )}
      {mode === "skipped" && (<><p className="pc-msg">{fmt(t.pcSkippedMsg, { s: skippedName })}</p>{verdict}</>)}
      {mode === "back" && (
        <div className="pc-back">
          <b>{fmt(t.pcBackTo, { p: back.label })}</b>
          {h && <p className="hint">{fmt(t.pcBackEst, { m: h.min, how: h.m === "walk" ? t.walk : t.bpTransit })}</p>}
          <a className="btn tram press" href={dir} target="_blank" rel="noreferrer">{t.directions}</a>
        </div>
      )}
    </div>
  );
}
