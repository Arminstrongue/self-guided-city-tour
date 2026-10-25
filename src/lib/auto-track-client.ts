"use client";
/** Estado do registo automático no telemóvel (localStorage) e eventos para os ecrãs se atualizarem. */
import { blankState, closeDay, dayOf, resolve, stepsOf, type TState } from "./auto-track";

export const ON_KEY = "sgct:auto:on";
export const STATE_KEY = "sgct:auto:v1";
export const EVENT = "sgct:auto";

export function autoOn(): boolean { try { return localStorage.getItem(ON_KEY) === "1"; } catch { return false; } }
export function loadState(): TState {
  try { const s = JSON.parse(localStorage.getItem(STATE_KEY) ?? "null") as TState | null; if (s?.v === 1) return s.anchor ? s : { ...s, pending: s.pending.filter((p) => p.k !== "place" && p.k !== "visit") }; } catch { /* ignorar */ }
  return blankState(dayOf(Date.now()));
}
export function saveState(s: TState) {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch { /* cheio: perde só o trajeto mais antigo */ }
  window.dispatchEvent(new Event(EVENT));
}
/** iOS pede autorização para o sensor de movimento (só num toque do utilizador). */
export async function askMotion(): Promise<boolean> {
  const D = (window as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent;
  if (D?.requestPermission) { try { return (await D.requestPermission()) === "granted"; } catch { return false; } }
  return true;
}
export function setAutoOn(on: boolean) {
  try { if (on) localStorage.setItem(ON_KEY, "1"); else localStorage.removeItem(ON_KEY); } catch { /* ignorar */ }
  window.dispatchEvent(new Event(EVENT));
}
/** «Terminar e guardar o percurso de hoje»: põe já a pergunta de confirmação. */
export function finishToday() { const s = loadState(); saveState(closeDay(s, s.day)); }
export const answer = (key: string, ok: boolean) => saveState(resolve(loadState(), key, ok));
export const summary = (s: TState) => ({ km: Math.round(s.km * 10) / 10, steps: stepsOf(s), places: s.places.length });
