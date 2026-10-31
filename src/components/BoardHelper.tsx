"use client";
/**
 * "Ler o painel": muitos viajantes não percebem que a sua estação pode não ser o nome grande do painel (é o destino
 * final do comboio) mas estar na lista "Calling at", muitas vezes abreviada. Aqui: o que procurar (nomes como aparecem),
 * um painel de exemplo com cada parte explicada na sua língua, os comboios em tempo real que param na sua estação
 * (quando há chave National Rail) e um dicionário das palavras dos painéis.
 */
import { useEffect, useMemo, useState } from "react";
import type { Dict } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import { boardNames, sameStation } from "@/data/board-words";
import { RAIL_STATIONS } from "@/data/rail-stations";
import { crsOf } from "@/data/crs";
import type { LiveBoard } from "@/lib/rail-live";
import Portal from "./Portal";
import { SheetX } from "./WinNav";

export function BoardHelperButton({ t, from, to, className = "" }: { t: Dict; from?: string; to?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={`btn ghost press bd-open ${className}`} onClick={() => setOpen(true)}>📋 {t.bd.btn}</button>
      {open && <BoardHelper t={t} from={from} to={to} onClose={() => setOpen(false)} />}
    </>
  );
}

const GLOSS = ["callingAt", "pleaseWait", "boarding", "preparing", "platform", "onTime", "delayed", "cancelled", "expected", "coaches", "frontCoaches", "shortPlatform", "doors", "further", "fastest"] as const;
const BOARD_EN: Record<(typeof GLOSS)[number], string> = {
  callingAt: "Calling at", pleaseWait: "Please wait", boarding: "Boarding", preparing: "Preparing", platform: "Platform / Plat", onTime: "On time",
  delayed: "Delayed", cancelled: "Cancelled", expected: "Exp 10:12", coaches: "This train has 10 coaches", frontCoaches: "Front 5 coaches for …",
  shortPlatform: "Short platform", doors: "Train doors will close 2 minutes before departure", further: "Further departures", fastest: "Next fastest"
};

export function BoardHelper({ t, from: from0 = "", to: to0 = "", onClose }: { t: Dict; from?: string; to?: string; onClose: () => void }) {
  const b = t.bd;
  const [from, setFrom] = useState(from0);
  const [to, setTo] = useState(to0);
  const names = useMemo(() => boardNames(to), [to]);
  const show = names[names.length > 1 ? 1 : 0] ?? "";   // a forma abreviada, quando existe, é a que mais aparece
  const [live, setLive] = useState<LiveBoard | null | "off">(null);
  const fc = crsOf(from), tc = crsOf(to);

  useEffect(() => {
    setLive(null);
    if (!fc || !tc || fc === tc) return;
    let on = true;
    fetch(`/api/rail/board?crs=${fc}&to=${tc}`).then((r) => (r.ok ? r.json() : null)).then((j: LiveBoard | null) => { if (on) setLive(j ?? "off"); }).catch(() => { if (on) setLive("off"); });
    return () => { on = false; };
  }, [fc, tc]);

  const status = (etd: string, cancelled: boolean) => cancelled ? `❌ ${b.g.cancelled.replace(/\.$/, "")}` : etd === "On time" ? `✅ ${b.g.onTime.replace(/\.$/, "")}` : etd === "Delayed" ? `⏳ ${b.g.delayed.replace(/\.$/, "")}` : /^\d\d:\d\d$/.test(etd) ? `⏳ ${fmt(b.expAt, { t: etd })}` : etd;

  return (
    <Portal><div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack bdh" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={b.title}>
        <SheetX onClose={onClose} label={t.close} />
        <b style={{ fontSize: 19 }}>📋 {b.title}</b>
        <datalist id="bd-st">{RAIL_STATIONS.map((s) => <option key={s} value={s} />)}</datalist>
        <div className="grid2">
          <div className="field"><label htmlFor="bd-from">{b.at}</label><input id="bd-from" list="bd-st" value={from} onChange={(e) => setFrom(e.target.value)} autoComplete="off" /></div>
          <div className="field"><label htmlFor="bd-to">{b.goingTo}</label><input id="bd-to" list="bd-st" value={to} onChange={(e) => setTo(e.target.value)} autoComplete="off" /></div>
        </div>

        {to.trim() && (
          <section className="bd-look">
            <b>{b.lookFor}</b>
            <div className="bd-names">{names.map((n) => <span key={n} className="bd-name">{n}</span>)}</div>
            <p className="bd-key">💡 {fmt(b.keyIdea, { s: show })}</p>
          </section>
        )}

        {/* Painel de exemplo (desenho da VOYBU) com as partes numeradas e explicadas. */}
        <section className="bd-demo" aria-label={b.demo}>
          <div className="bd-tile">
            <div className="bd-tile-top"><span className="num"><i>1</i>10:02</span><span><i>3</i>Boarding</span></div>
            <b className="bd-final"><i>2</i>{to.trim() && show ? b.someFinal : "Liverpool Lime St"}</b>
            <span className="bd-pf"><i>4</i>Platform 5 →</span>
            <div className="bd-calls">
              <small><i>5</i>Calling at:</small>
              <span><span>Milton Keynes Ctl</span><span className="num">10:14</span></span>
              <span className={to.trim() ? "you" : ""}><span>{to.trim() && show ? show : "Crewe"}</span><span className="num">11:25</span></span>
              <span><span>…</span><span /></span>
            </div>
            <small className="bd-coach"><i>6</i>This train has 10 coaches · ▭▭▭▭▭▭▭▭▭▭</small>
          </div>
          <ol className="bd-parts">
            <li><i>1</i>{b.p1}</li><li><i>2</i>{b.p2}</li><li><i>3</i>{b.p3}</li><li><i>4</i>{b.p4}</li><li><i>5</i>{b.p5}</li><li><i>6</i>{b.p6}</li>
          </ol>
        </section>

        {fc && tc && fc !== tc && (
          <section className="bd-live">
            <b>🚆 {fmt(b.liveTitle, { s: to })}</b>
            {live === null ? <p className="hint">…</p> : live === "off" || !live.services.length ? <p className="hint">{live === "off" ? b.liveOff : b.liveNone}</p> : (
              <ul>
                {live.services.slice(0, 6).map((s, i) => {
                  const stop = s.calls.find((c) => c.crs === tc || sameStation(c.n, to));
                  return (
                    <li key={i}>
                      <span className="bd-lt num">{s.std}</span>
                      <span className="bd-lb">
                        <b>{fmt(b.toFinal, { s: s.to })}</b>
                        {stop && s.to && !sameStation(s.to, to) && <small className="you">{fmt(b.stopsAt, { s: stop.n, t: stop.st })}</small>}
                        <small>{status(s.etd, s.cancelled)} · {s.platform ? fmt(b.pfIs, { p: s.platform }) : b.pfWait} · {s.operator}</small>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        <details className="bd-gloss">
          <summary>📖 {b.glossTitle}</summary>
          <dl>{GLOSS.map((k) => <div key={k}><dt lang="en">{BOARD_EN[k]}</dt><dd>{b.g[k]}</dd></div>)}</dl>
        </details>
        <p className="pic-staff">🙋 {b.staff}</p>
      </div>
    </div></Portal>
  );
}
