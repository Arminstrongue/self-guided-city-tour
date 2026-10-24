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
const CHUNK_KEY = "sgct:chunk-reload";
type RetryState = { n: number; t: number };
function retryState(): RetryState {
  try { const v = JSON.parse(sessionStorage.getItem(CHUNK_KEY) || "null") as RetryState | null; if (v && Date.now() - v.t < 180_000) return v; } catch { /* ignorar */ }
  return { n: 0, t: 0 };
}
/** Quantas vezes já recarregámos por causa de uma nova versão (nos últimos 3 minutos). */
export const chunkAttempts = () => retryState().n;
/** Espera antes da próxima tentativa: logo, 3 s, 6 s, 12 s, 20 s, 30 s; depois desiste (null). */
export const retryDelay = (n: number): number | null => (n > 5 ? null : [0, 3, 6, 12, 20, 30][n] * 1000);

/** Recarrega a página sem a cópia antiga guardada (a não ser sem rede: aí a cópia offline é o que vale). */
export async function freshReload() {
  try { sessionStorage.setItem(CHUNK_KEY, JSON.stringify({ n: retryState().n + 1, t: Date.now() })); } catch { /* ignorar */ }
  if (navigator.onLine && "caches" in window) {
    try {
      for (const k of await caches.keys()) {
        if (/offline|tiles/i.test(k)) continue;
        const c = await caches.open(k);
        await c.delete(location.href); await c.delete(location.pathname);
      }
    } catch { /* ignorar */ }
  }
  location.reload();
}

/** Primeira falha: recarrega já. As seguintes ficam para o ecrã de erro (com espera crescente). */
export function reloadOnce(): boolean {
  if (retryState().n > 0) return false;
  void freshReload();
  return true;
}
