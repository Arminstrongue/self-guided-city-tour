"use client";
/** "Escolha o que gosta" — primeira personalização (estilo TikTok): 3 a 10 interesses afinam roteiros, feed e vídeos. */
import { useState } from "react";
import { fmt } from "@/i18n/core";
import type { Dict } from "@/i18n/dictionaries";
import { HOBBIES, HOBBY_ICON, type Hobby } from "@/lib/explore";

export const ONBOARDED = "sgct:onboarded";

export function InterestsOnboarding({ t, initial = [], onDone }: { t: Dict; initial?: string[]; onDone: (h: Hobby[] | null) => void }) {
  const [sel, setSel] = useState<Hobby[]>(initial.filter((h): h is Hobby => (HOBBIES as readonly string[]).includes(h)));
  const [busy, setBusy] = useState(false);
  const toggle = (h: Hobby) => setSel(sel.includes(h) ? sel.filter((x) => x !== h) : sel.length >= 10 ? sel : [...sel, h]);
  async function finish(list: Hobby[] | null) {
    try { localStorage.setItem(ONBOARDED, "1"); if (list) localStorage.setItem("sgct:hobbies", JSON.stringify(list)); } catch { /* ignorar */ }
    if (list) {
      setBusy(true);
      await fetch("/api/me/prefs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hobbies: list }) }).catch(() => null);
    }
    onDone(list);
  }
  const pct = Math.min(100, Math.round((sel.length / 3) * 100));
  return (
    <div className="ob" role="dialog" aria-modal="true" aria-labelledby="ob-t">
      <div className="ob-scroll">
        <h1 id="ob-t" className="ob-t">{t.obTitle}</h1>
        <p className="ob-sub">{t.obSub}</p>
        <div className="ob-list">
          {HOBBIES.map((h) => {
            const on = sel.includes(h);
            return (
              <button key={h} type="button" className={`ob-row ${on ? "on" : ""}`} aria-pressed={on} onClick={() => toggle(h)}>
                <span className="ob-ic" aria-hidden="true">{HOBBY_ICON[h]}</span>
                <span className="ob-l">{t.hob[h]}</span>
                <span className="ob-dot" aria-hidden="true">{on ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>
      </div>
      <footer className="ob-foot">
        <div className="ob-prog-l"><span>{t.obStep}</span><b>{sel.length >= 3 ? t.obReady : t.obGo}</b></div>
        <div className="ob-prog"><i style={{ width: `${pct}%` }} /></div>
        <div className="ob-btns">
          <button type="button" className="ob-skip" onClick={() => void finish(null)}>{t.obSkip}</button>
          <button type="button" className="ob-next" disabled={sel.length === 0 || busy} onClick={() => void finish(sel)}>{fmt(t.obNext, { n: sel.length })}</button>
        </div>
      </footer>
    </div>
  );
}
