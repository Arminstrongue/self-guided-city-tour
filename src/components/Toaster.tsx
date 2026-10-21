"use client";
import { useEffect, useState } from "react";
import { onToast, type Toast } from "@/lib/toast";

/** Mostra os avisos de toast() (um de cada vez, o mais recente por cima). Anunciado aos leitores de ecrã. */
export function Toaster() {
  const [list, setList] = useState<Toast[]>([]);
  useEffect(() => onToast((t) => {
    setList((l) => [...l.slice(-2), t]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== t.id)), t.ms ?? 2600);
  }), []);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className={`toast ${t.tone ?? ""}`}>
          {t.icon && <span aria-hidden="true">{t.icon}</span>}
          <span className="toast-t">{t.text}</span>
          {t.action && <button type="button" onClick={() => { t.action!.run(); setList((l) => l.filter((x) => x.id !== t.id)); }}>{t.action.label}</button>}
        </div>
      ))}
    </div>
  );
}
