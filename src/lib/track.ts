"use client";
/** Envia um evento anónimo do funil (sem cookies). Falhas são ignoradas: as métricas nunca atrapalham o viajante. */
import type { EventName } from "./metrics";

function platform(): string {
  try {
    const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string; isNativePlatform?: () => boolean } }).Capacitor;
    return cap?.isNativePlatform?.() ? cap.getPlatform?.() ?? "app" : "web";
  } catch { return "web"; }
}

export function track(name: EventName, data: { city?: string; stop?: string; locale?: string; ref?: string } = {}, once?: "session" | "day") {
  try {
    if (once) {
      const store = once === "session" ? sessionStorage : localStorage;
      const key = `sgct:ev:${name}:${data.city ?? ""}:${once === "day" ? new Date().toISOString().slice(0, 10) : ""}`;
      if (store.getItem(key)) return;
      store.setItem(key, "1");
    }
  } catch { /* sem armazenamento: conta na mesma */ }
  try {
    const body = JSON.stringify({ name, platform: platform(), ...data });
    if (navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) return;
    void fetch("/api/events", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => undefined);
  } catch { /* ignorar */ }
}
