"use client";
/** Puxar para baixo no topo da página para atualizar (como no Instagram). Ignora toques dentro de folhas e visualizadores. */
import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

export function PullRefresh({ onRefresh, label }: { onRefresh: () => Promise<unknown>; label: string }) {
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const st = useRef<{ y: number; on: boolean } | null>(null);
  const cb = useRef(onRefresh); cb.current = onRefresh;
  const pullRef = useRef(0); pullRef.current = pull;
  useEffect(() => {
    const start = (e: TouchEvent) => {
      const el = e.target as HTMLElement;
      if (window.scrollY > 2 || el.closest?.(".sheet-bg,.st-view,.rl-view,.no-drag,input,textarea")) { st.current = null; return; }
      st.current = { y: e.touches[0].clientY, on: false };
    };
    const move = (e: TouchEvent) => {
      const s = st.current; if (!s) return;
      const dy = e.touches[0].clientY - s.y;
      if (dy <= 0 || window.scrollY > 2) { if (s.on) setPull(0); st.current = dy < 0 ? null : s; return; }
      s.on = true; setPull(Math.min(110, dy * 0.5));
    };
    const end = async () => {
      const s = st.current; st.current = null; if (!s?.on) return;
      if (pullRef.current >= 64) {
        setBusy(true); setPull(56);
        try { navigator.vibrate?.(8); } catch { /* sem vibração */ }
        await cb.current().catch(() => null);
        setBusy(false);
      }
      setPull(0);
    };
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", end);
    return () => { window.removeEventListener("touchstart", start); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", end); };
  }, []);
  if (!pull && !busy) return null;
  return (
    <div className="ptr" style={{ height: pull }} aria-live="polite">
      <span className={`ptr-i ${busy ? "spin" : ""}`} style={{ transform: busy ? undefined : `rotate(${pull * 3}deg)`, opacity: Math.min(1, pull / 64) }}>
        <RefreshCw size={20} aria-hidden="true" />
      </span>
      {busy && <span className="sr-only">{label}</span>}
    </div>
  );
}
