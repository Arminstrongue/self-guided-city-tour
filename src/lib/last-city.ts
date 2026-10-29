"use client";
/** Última cidade que o viajante abriu neste telemóvel (página da cidade, roteiro, planeador). */
const KEY = "sgct:city";
export function rememberCity(id: string) {
  try { if (id) localStorage.setItem(KEY, id); } catch { /* ignorar */ }
}
export function lastCity(): string {
  try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; }
}
