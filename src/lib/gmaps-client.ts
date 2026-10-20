"use client";
/** Carrega o Google Maps JavaScript API uma só vez (a chave de navegador vem do servidor). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type G = any;
let gLoad: Promise<G> | null = null;
export function loadGoogle(key: string): Promise<G> {
  const w = window as unknown as { google?: G; __sgctG?: () => void };
  if (w.google?.maps?.Map) return Promise.resolve(w.google);
  if (!gLoad) gLoad = new Promise((ok, bad) => {
    w.__sgctG = () => ok(w.google);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__sgctG`;
    s.async = true; s.onerror = () => { gLoad = null; bad(new Error("maps")); };
    document.head.appendChild(s);
  });
  return gLoad;
}

