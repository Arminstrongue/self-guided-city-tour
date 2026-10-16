"use client";
import { useEffect } from "react";

/** Regista o service worker em produção (roteiro offline). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => { /* sem service worker: a app funciona na mesma */ });
  }, []);
  return null;
}
