"use client";
/** "Bom saber": dicas para poupar e viajar com conforto. Abre sozinha uma vez por sessão (ao escolher comboio/autocarro) e com o botão ℹ️. */
import { useEffect, useState } from "react";
import type { Dict } from "@/i18n/dictionaries";
import type { Tip } from "@/data/travel-tips";
import Portal from "./Portal";

export function TipsSheet({ t, tips, onClose }: { t: Dict; tips: Tip[]; onClose: () => void }) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <Portal><div className="as-bg" onClick={onClose}>
      <div className="as ps tt" role="dialog" aria-modal="true" aria-label={t.tt.title} onClick={(e) => e.stopPropagation()}>
        <span className="as-grab" aria-hidden="true" />
        <div className="ps-h"><span className="ps-ic" aria-hidden="true">ℹ️</span><div className="stack" style={{ gap: 2, flex: 1 }}><b className="ps-n">{t.tt.title}</b><span className="hint">{t.tt.sub}</span></div>
          <button type="button" className="mu2-x ps-x" onClick={onClose} aria-label={t.close}>✕</button></div>
        <ul className="tt-list">
          {tips.map((x) => (
            <li key={x.id}><span aria-hidden="true">{x.icon}</span><p>{t.tt[x.id]}{x.src && <> <a href={x.src} target="_blank" rel="noopener noreferrer">{t.tt.src} ↗</a></>}</p></li>
          ))}
        </ul>
        <button type="button" className="btn press" onClick={onClose}>OK</button>
      </div>
    </div></Portal>
  );
}

/** Botão ℹ️ e abertura automática (uma vez por sessão para cada `autoKey`). */
export function TipsButton({ t, tips, autoKey }: { t: Dict; tips: Tip[]; autoKey?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!autoKey || !tips.length) return;
    try { const k = `sgct:tips:${autoKey}`; if (!sessionStorage.getItem(k)) { sessionStorage.setItem(k, "1"); setOpen(true); } } catch { /* sem armazenamento: não abre sozinho */ }
  }, [autoKey, tips.length]);
  if (!tips.length) return null;
  return <>
    <button type="button" className="tt-btn press" onClick={() => setOpen(true)}>ℹ️ {t.tt.title}</button>
    {open && <TipsSheet t={t} tips={tips} onClose={() => setOpen(false)} />}
  </>;
}
