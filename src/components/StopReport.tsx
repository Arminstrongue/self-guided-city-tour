"use client";
import { useState } from "react";
import type { Dict } from "@/i18n/dictionaries";
import Portal from "./Portal";
import { SheetX } from "./WinNav";

const KINDS = ["entrance", "closed", "price", "access", "other"] as const;
type Kind = (typeof KINDS)[number];

/** "Reportar um problema" numa paragem: vai para verificação; com vários relatos, a paragem mostra um aviso. */
export function StopReport({ t, city, stop, name }: { t: Dict; city: string; stop: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind | null>(null);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "err">("idle");
  async function send() {
    if (!kind) return;
    setState("busy");
    const r = await fetch("/api/stop-reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ city, stop, kind, note }) }).catch(() => null);
    setState(r?.ok ? "done" : "err");
  }
  return (
    <>
      <button type="button" className="link-btn sr-btn" onClick={() => { setOpen(true); setState("idle"); setKind(null); setNote(""); }}>⚑ {t.rpBtn}</button>
      {open && (
        <Portal><div className="sheet-bg" onClick={() => setOpen(false)}>
          <div className="sheet stack" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={t.rpBtn}>
            <SheetX onClose={() => setOpen(false)} label={t.close} />
            <b style={{ fontSize: 18 }}>⚑ {t.rpTitle}</b>
            <span className="hint">{name}</span>
            {state === "done" ? <p className="oc-sum ok">{t.rpThanks}</p> : (
              <>
                <div className="rp-kinds" role="radiogroup">
                  {KINDS.map((k) => <button key={k} type="button" role="radio" aria-checked={kind === k} className={`rp-k press ${kind === k ? "on" : ""}`} onClick={() => setKind(k)}>{t.rpKinds[k]}</button>)}
                </div>
                <textarea className="rp-note" rows={3} maxLength={500} placeholder={t.rpNotePh} value={note} onChange={(e) => setNote(e.target.value)} />
                <button className="btn tram press" disabled={!kind || state === "busy"} onClick={() => void send()}>{t.rpSend}</button>
                {state === "err" && <p className="err">{t.tsError}</p>}
                <p className="hint">{t.rpHow}</p>
              </>
            )}
          </div>
        </div></Portal>
      )}
    </>
  );
}
