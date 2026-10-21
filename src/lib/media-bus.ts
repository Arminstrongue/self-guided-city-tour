"use client";
/**
 * Som no feed e nas histórias: um só vídeo ou música a tocar de cada vez, e o "som ligado/desligado"
 * partilhado (ligar num liga nos outros, como no Instagram e no TikTok).
 */
let muted = true;
const subs = new Set<(m: boolean) => void>();
const playing = new Set<HTMLMediaElement>();

export const isMuted = () => muted;
export function setMuted(m: boolean) { muted = m; subs.forEach((f) => f(m)); }
export function onMuted(f: (m: boolean) => void) { subs.add(f); return () => { subs.delete(f); }; }

/** Toca este elemento e pausa os outros. */
export function claim(el: HTMLMediaElement) {
  playing.forEach((o) => { if (o !== el) o.pause(); });
  playing.add(el);
  return el.play().catch(() => { if (el instanceof HTMLVideoElement) { el.muted = true; setMuted(true); return el.play().catch(() => null); } return null; });
}
export function release(el: HTMLMediaElement) { playing.delete(el); }
