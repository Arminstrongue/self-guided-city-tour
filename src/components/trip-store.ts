"use client";
/** Plano de viagem guardado por cidade neste dispositivo (com migração do antigo "ponto de partida"). */
import { AIRPORT, defaultTrip, parseTrip, type Endpoint, type Trip } from "@/lib/trip";

export const tripKey = (city: string) => `sgct:trip:${city}`;

export function loadTrip(city: string): Trip {
  try {
    const v = parseTrip(JSON.parse(localStorage.getItem(tripKey(city)) ?? "null"));
    if (v) return v;
    // Antes: só havia um ponto (início = fim) e a partida de voo de "Posso sair?".
    const b = JSON.parse(localStorage.getItem(`sgct:base:${city}`) ?? "null");
    const dep = localStorage.getItem("sgct:dep") ?? "";
    const place: Endpoint | null = b?.kind === "place" && typeof b.lat === "number" ? { kind: b.here ? "here" : "hotel", lat: b.lat, lng: b.lng, label: String(b.label ?? "") } : null;
    const deadline = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dep.slice(0, 16)) ? dep.slice(0, 16) : "";
    if (place) return { ...defaultTrip(), start: place, end: deadline ? AIRPORT : place, mode: deadline ? "plane" : "stay", deadline };
    return { ...defaultTrip(), deadline };
  } catch { return defaultTrip(); }
}

export function saveTrip(city: string, t: Trip) {
  try {
    localStorage.setItem(tripKey(city), JSON.stringify(t));
    window.dispatchEvent(new CustomEvent("sgct:trip", { detail: city }));
  } catch { /* sem armazenamento */ }
}
