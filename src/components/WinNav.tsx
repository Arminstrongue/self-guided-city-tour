"use client";
import { useEffect } from "react";
import { goBack } from "./BackLink";

/** Botão ✕ para fechar folhas/janelas; também fecha com a tecla Esc. */
export function SheetX({ onClose, label = "Close" }: { onClose: () => void; label?: string }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return <button type="button" className="sheet-x" aria-label={label} title={label} onClick={onClose}>✕</button>;
}

/** Barra de navegação: ← voltar, → avançar, ✕ fechar (volta à wallet). */
export function WinNav({ closeHref, title, labels }: { closeHref: string; title?: string; labels: { back: string; fwd: string; close: string } }) {
  return (
    <nav className="win-nav" aria-label="Navigation">
      <button type="button" aria-label={labels.back} title={labels.back} onClick={() => goBack(closeHref)}>←</button>
      <button type="button" aria-label={labels.fwd} title={labels.fwd} onClick={() => history.forward()}>→</button>
      {title && <b className="win-t">{title}</b>}
      <a href={closeHref} aria-label={labels.close} title={labels.close}>✕</a>
    </nav>
  );
}
