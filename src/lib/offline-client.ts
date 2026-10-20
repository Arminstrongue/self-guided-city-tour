"use client";
/**
 * Descarregar uma cidade para usar sem internet: a página do roteiro (com scripts e estilos),
 * fotografias, meteorologia, sugestões e taxas de câmbio ficam guardadas pelo service worker.
 * O mapa guarda os mosaicos que o viajante já viu (o OpenStreetMap não permite pré-descarregar).
 */
import type { Locale } from "@/i18n/dictionaries";

const KEY = "sgct:offline";
export type OfflineInfo = { at: number; n: number; failed: number; bytes: number; urls?: string[] };

export function offlineList(): Record<string, OfflineInfo> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") ?? {}; } catch { return {}; }
}
function setList(v: Record<string, OfflineInfo>) {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignorar */ }
  window.dispatchEvent(new Event("sgct:offline"));
}

/** O service worker está a controlar a página (só em produção). */
export async function offlineReady() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return false;
  const r = await navigator.serviceWorker.getRegistration().catch(() => undefined);
  return Boolean(r?.active);
}

async function post(msg: { type: string; urls: string[] }, onMsg: (d: Record<string, number | boolean>) => void) {
  const r = await navigator.serviceWorker.ready;
  return new Promise<Record<string, number | boolean>>((resolve) => {
    const ch = new MessageChannel();
    ch.port1.onmessage = (e) => { onMsg(e.data); if (e.data?.finished) resolve(e.data); };
    r.active!.postMessage(msg, [ch.port2]);
  });
}

async function urlsFor(city: string, locale: Locale) {
  const urls = [
    `/${locale}/tour/${city}`,
    `/api/media?city=${city}`, `/api/media?city=${city}&cover=1`,
    `/api/weather?city=${city}`, `/api/explore?city=${city}&locale=${locale}`, "/api/fx"
  ];
  // Fotografias das paragens e da capa.
  const m = await fetch(`/api/media?city=${city}`).then((r) => (r.ok ? r.json() : null)).catch(() => null) as { cover?: { thumb: string; url: string }[]; stops?: Record<string, { thumb: string } | null> } | null;
  for (const s of Object.values(m?.stops ?? {})) if (s?.thumb) urls.push(s.thumb, s.thumb.replace("/500px-", "/960px-"));
  const c = await fetch(`/api/media?city=${city}&cover=1`).then((r) => (r.ok ? r.json() : null)).catch(() => null) as { cover?: { thumb: string; url: string }[] } | null;
  for (const p of (c?.cover ?? []).slice(0, 6)) urls.push(p.url);
  return urls;
}

export async function saveCity(city: string, locale: Locale, onProgress: (done: number, total: number) => void) {
  const urls = await urlsFor(city, locale);
  const res = await post({ type: "offline-save", urls }, (d) => { if (typeof d.done === "number" && typeof d.total === "number") onProgress(d.done, d.total); });
  const info: OfflineInfo = { at: Date.now(), n: Number(res.done) - Number(res.failed), failed: Number(res.failed), bytes: Number(res.bytes) || 0, urls };
  setList({ ...offlineList(), [city]: info });
  return info;
}

export async function removeCity(city: string, locale: Locale) {
  const cur = offlineList();
  const urls = cur[city]?.urls ?? [`/${locale}/tour/${city}`];
  await post({ type: "offline-remove", urls }, () => undefined).catch(() => null);
  delete cur[city];
  setList(cur);
}

/** Ao terminar a sessão: apaga as cópias de páginas e dados pessoais guardadas para uso offline. */
export async function clearPersonalCache() {
  try { for (const k of await caches.keys()) if (k.endsWith("-pages")) await caches.delete(k); } catch { /* ignorar */ }
}
