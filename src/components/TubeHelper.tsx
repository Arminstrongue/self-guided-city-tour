"use client";
/**
 * "Que metro apanho?" (Londres): escolhe de onde e para onde; diz a linha, o sentido, o ramal, o destino a procurar
 * na frente do comboio, quantas paragens e onde mudar. Para o viajante nunca se sentir perdido nas plataformas.
 */
import { useMemo, useState } from "react";
import type { Dict } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import { TUBE_STATIONS, tubeAdvice, type TubeLeg } from "@/data/tube";
import Portal from "./Portal";
import { SheetX } from "./WinNav";

const LINE_COLOR: Record<TubeLeg["line"], string> = { northern: "#000000", victoria: "#0098d4" };

export function TubeHelperButton({ t }: { t: Dict }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="ios-row press tb-row" onClick={() => setOpen(true)}>
        <span className="ios-ic tb-ic" aria-hidden="true">🚇</span>
        <span className="ios-tx"><b>{t.tb.title}</b><small>{t.tb.sub}</small></span>
        <span className="ios-chev" aria-hidden="true">›</span>
      </button>
      {open && <TubeHelper t={t} onClose={() => setOpen(false)} />}
    </>
  );
}

export function TubeHelper({ t, onClose, from: from0 = "", to: to0 = "" }: { t: Dict; onClose: () => void; from?: string; to?: string }) {
  const b = t.tb;
  const [from, setFrom] = useState(from0);
  const [to, setTo] = useState(to0);
  const adv = useMemo(() => tubeAdvice(from, to), [from, to]);
  const lineName = (l: TubeLeg["line"]) => (l === "northern" ? b.northern : b.victoria);
  const dirName = (l: TubeLeg) => (l.dir === "N" ? b.nb : b.sb);
  return (
    <Portal><div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack tb" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={b.title}>
        <SheetX onClose={onClose} label={t.close} />
        <b style={{ fontSize: 19 }}>🚇 {b.title}</b>
        <datalist id="tb-st">{TUBE_STATIONS.map((s) => <option key={s} value={s} />)}</datalist>
        <div className="tb-pick">
          <div className="field"><label htmlFor="tb-from">{b.from}</label><input id="tb-from" list="tb-st" value={from} onChange={(e) => setFrom(e.target.value)} autoComplete="off" placeholder="Kennington" /></div>
          <button type="button" className="tb-swap press" onClick={() => { setFrom(to); setTo(from); }} aria-label={b.swap}>⇅</button>
          <div className="field"><label htmlFor="tb-to">{b.to}</label><input id="tb-to" list="tb-st" value={to} onChange={(e) => setTo(e.target.value)} autoComplete="off" placeholder="Euston" /></div>
        </div>
        {from && to && !adv && <p className="hint">{b.none}</p>}
        {adv && (
          <ol className="tb-legs">
            {adv.legs.map((l, i) => (
              <li key={i}>
                {i > 0 && <p className="tb-change">🔁 {fmt(b.change, { s: l.from })}</p>}
                <div className="tb-leg" style={{ ["--tb" as string]: LINE_COLOR[l.line] }}>
                  <div className="tb-lh"><span className="tb-line">{lineName(l.line)}</span><b>{dirName(l)}</b>{l.via && <span className="tb-via">{l.via === "cx" ? b.viaCx : b.viaBank}</span>}</div>
                  <p className="tb-big">{fmt(b.lookFor, { d: l.ends.join(` ${b.or} `) })}</p>
                  <p className="tb-meta num">{fmt(b.stops, { n: l.stops, s: l.to })}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
        <ul className="tb-tips">
          <li>👀 {b.tipDest}</li>
          <li>💳 {b.tipCard}</li>
          {adv?.legs.some((l) => l.line === "northern") && <li>🔀 {b.tipNorthern}</li>}
          <li>🙋 {b.tipStaff}</li>
          <li>🌙 {b.tipNight}</li>
        </ul>
        <small className="hint">{b.note}</small>
      </div>
    </div></Portal>
  );
}
