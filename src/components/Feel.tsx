"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Sensação da app: vibração curta ao tocar em botões (telemóveis que o permitem) e uma transição suave ao mudar de
 * ecrã. Respeita "reduzir movimento" do sistema e não vibra se o viajante o tiver desligado nas definições.
 */
export function Feel() {
  const path = usePathname();
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const onDown = (e: PointerEvent) => {
      if (reduce || e.pointerType === "mouse") return;
      const el = (e.target as Element | null)?.closest?.("button, .btn, .press, [role=tab], a.arv-card, .tabs button");
      if (!el || (el as HTMLButtonElement).disabled) return;
      try { if (localStorage.getItem("sgct:haptics") === "off") return; } catch { /* ignorar */ }
      try { navigator.vibrate?.(8); } catch { /* sem vibração */ }
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
  // Ao mudar de página dentro da app: o conteúdo entra com um fade curto.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    main.classList.remove("page-in"); void (main as HTMLElement).offsetWidth; main.classList.add("page-in");
  }, [path]);
  return null;
}
