"use client";
/** Avisos curtos no fundo do ecrã ("Guardado", "Publicado", "Apagado · Anular"). Qualquer componente chama toast(). */
export type Toast = { id: number; text: string; icon?: string; action?: { label: string; run: () => void }; ms?: number; tone?: "ok" | "err" };
const subs = new Set<(t: Toast) => void>();
let seq = 0;
export function toast(text: string, o: Omit<Toast, "id" | "text"> = {}) {
  const t: Toast = { id: ++seq, text, ...o };
  subs.forEach((f) => f(t));
  return t.id;
}
export function onToast(f: (t: Toast) => void) { subs.add(f); return () => { subs.delete(f); }; }

/**
 * Ação com "Anular": a interface muda já (optimista) e o pedido ao servidor só segue quando o aviso
 * desaparece sem que o utilizador toque em Anular.
 */
export function withUndo(text: string, undoLabel: string, o: { apply: () => void; revert: () => void; commit: () => Promise<unknown> | void; ms?: number; icon?: string }) {
  o.apply();
  let undone = false;
  const ms = o.ms ?? 5000;
  toast(text, { icon: o.icon, ms, action: { label: undoLabel, run: () => { undone = true; o.revert(); } } });
  setTimeout(() => { if (!undone) void o.commit(); }, ms + 150);
}
