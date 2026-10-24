"use client";
/** Reporta um erro do navegador ao servidor (só a mensagem, a página e o código; nada pessoal). */
export function reportClientError(e: unknown, digest?: string) {
  try {
    const m = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    const body = JSON.stringify({ m, p: location.pathname + location.hash, d: digest ?? "" });
    if (!navigator.sendBeacon?.("/api/client-error", new Blob([body], { type: "application/json" })))
      void fetch("/api/client-error", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => null);
  } catch { /* ignorar */ }
}

/** Depois de uma nova versão, um separador antigo pede ficheiros que já não existem: recarrega uma vez. */
export function isChunkError(e: unknown) {
  const s = e instanceof Error ? `${e.name} ${e.message}` : String(e);
  return /ChunkLoadError|Loading chunk|Loading CSS chunk|dynamically imported module|Importing a module script failed|dictionary not loaded/i.test(s);
}
export function reloadOnce(): boolean {
  try {
    const k = "sgct:chunk-reload", last = Number(sessionStorage.getItem(k) ?? 0);
    if (Date.now() - last < 30_000) return false;
    sessionStorage.setItem(k, String(Date.now()));
  } catch { /* sem armazenamento */ }
  location.reload();
  return true;
}
