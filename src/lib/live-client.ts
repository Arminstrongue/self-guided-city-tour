"use client";
/**
 * Ligação em tempo real no browser: uma só EventSource por página, partilhada por todos os componentes.
 * Se cair, o browser volta a ligar sozinho (retry: 3 s).
 */
import { useEffect } from "react";

export type LiveEvent =
  | { t: "msg"; peer: string; m: { id: string; text: string; ref: ({ kind: "story" | "post"; id: string; text: string } | { kind: "loc"; lat: number; lng: number }) | null; at: string; mine: boolean; read: boolean; photo?: boolean; audio?: boolean; reply?: { id: string; text: string; mine: boolean } | null; reactions?: { e: string; n: number; mine: boolean }[] } }
  | { t: "unsend"; peer: string; id: string }
  | { t: "typing"; peer: string }
  | { t: "read"; peer: string; at: string }
  | { t: "react"; peer: string; id: string; reactions: { e: string; n: number; mine: boolean }[] }
  | { t: "notif" }
  | { t: "video"; id: string; status: "ready" | "failed" };

let es: EventSource | null = null;
let users = 0;
const subs = new Set<(e: LiveEvent) => void>();

function open() {
  if (es || typeof EventSource === "undefined") return;
  es = new EventSource("/api/live");
  es.onmessage = (m) => { try { const ev = JSON.parse(m.data) as LiveEvent; subs.forEach((f) => f(ev)); } catch { /* ignorar */ } };
}

/** Liga a página ao tempo real enquanto o componente estiver montado. */
export function useLiveConnection(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    users++; open();
    return () => { users--; if (users <= 0 && es) { es.close(); es = null; users = 0; } };
  }, [enabled]);
}

/** Recebe eventos em tempo real (o callback deve ser estável ou usar refs). */
export function useLive(cb: (e: LiveEvent) => void) {
  useEffect(() => { subs.add(cb); return () => { subs.delete(cb); }; }, [cb]);
}
