"use client";
/**
 * Voltar sempre ao ecrã anterior: se a pessoa chegou aqui de dentro da app (neste separador), usa o histórico
 * (a carteira volta ao mesmo separador, ex. Planos); se abriu o link diretamente, vai para `fallback`.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const KEY = "sgct:nav";
/** Conta as páginas visitadas dentro da app neste separador do navegador. */
export function NavTracker() {
  const path = usePathname();
  useEffect(() => {
    try { const n = Number(sessionStorage.getItem(KEY) || 0); sessionStorage.setItem(KEY, String(n + 1)); } catch { /* ignorar */ }
  }, [path]);
  return null;
}
export function canGoBack(): boolean {
  try { return Number(sessionStorage.getItem(KEY) || 0) > 1 && history.length > 1; } catch { return false; }
}
export function goBack(fallback: string) {
  if (canGoBack()) history.back(); else location.href = fallback;
}

export function BackLink({ fallback, label, className = "mini" }: { fallback: string; label: string; className?: string }) {
  return (
    <a className={className} href={fallback} onClick={(e) => { if (canGoBack()) { e.preventDefault(); history.back(); } }}>
      <span className="rtl-flip" aria-hidden="true">←</span> {label}
    </a>
  );
}
