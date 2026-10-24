"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";
import { chunkAttempts, freshReload, isChunkError, reloadOnce, reportClientError, retryDelay } from "@/lib/client-error";

/** Conta (uma vez por sessão, sem dados pessoais) quando a página dá um erro no navegador. */
export function ErrorTracker() {
  useEffect(() => {
    let pending = false;
    const on = (ev: ErrorEvent | PromiseRejectionEvent) => {
      const err = "reason" in ev ? ev.reason : ev.error ?? ev.message;
      if (isChunkError(err)) {
        if (reloadOnce()) return; // separador antigo depois de uma atualização
        // A versão nova ainda está a entrar no ar: tenta de novo daqui a pouco (uma só vez agendada).
        const d = retryDelay(chunkAttempts());
        if (d !== null && !pending) { pending = true; setTimeout(() => void freshReload(), d); return; }
      }
      track("client_error", {}, "session");
      reportClientError(err);
    };
    window.addEventListener("error", on);
    window.addEventListener("unhandledrejection", on);
    return () => { window.removeEventListener("error", on); window.removeEventListener("unhandledrejection", on); };
  }, []);
  return null;
}
