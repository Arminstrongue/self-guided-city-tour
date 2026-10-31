"use client";
/**
 * Preferências de transporte (como no Google Maps): meios preferidos e opção de percurso.
 * Ficam no mesmo sítio que as outras preferências de viagem ("sgct:travel"), e na conta quando há sessão.
 */
import { useEffect, useState } from "react";
import type { RouteOpt, TransitMode, TravelPrefs } from "./db/schema";
import { signedStatus } from "./signed";

export type { RouteOpt, TransitMode };
export const ALL_MODES: TransitMode[] = ["train", "metro", "tram", "bus", "ferry"];
export type TransitPrefs = { modes: TransitMode[]; route: RouteOpt; wheel: boolean };
const KEY = "sgct:travel";
const EVT = "sgct:transit";

function readTravel(): TravelPrefs { try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") as TravelPrefs; } catch { return {}; } }
export function readTransit(): TransitPrefs {
  const t = readTravel();
  return { modes: t.modes?.length ? t.modes : ALL_MODES, route: t.route ?? "best", wheel: t.route === "wheel" || Boolean(t.access?.includes("wheelchair")) };
}
export async function saveTransit(next: { modes?: TransitMode[]; route?: RouteOpt }) {
  const travel: TravelPrefs = { ...readTravel(), ...next };
  try { localStorage.setItem(KEY, JSON.stringify(travel)); } catch { /* ignorar */ }
  window.dispatchEvent(new Event(EVT));
  if ((await signedStatus()) === true) void fetch("/api/me/prefs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ travel }) }).catch(() => null);
}
export function useTransitPrefs(): TransitPrefs {
  const [p, setP] = useState<TransitPrefs>({ modes: ALL_MODES, route: "best", wheel: false });
  useEffect(() => {
    const up = () => setP(readTransit());
    up(); window.addEventListener(EVT, up); window.addEventListener("storage", up);
    return () => { window.removeEventListener(EVT, up); window.removeEventListener("storage", up); };
  }, []);
  return p;
}
