"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";
import { isChunkError, reloadOnce, reportClientError } from "@/lib/client-error";

/** Conta (uma vez por sessão, sem dados pessoais) quando a página dá um erro no navegador. */
export function ErrorTracker() {
  useEffect(() => {
    const on = (ev: ErrorEvent | PromiseRejectionEvent) => {
      const err = "reason" in ev ? ev.reason : ev.error ?? ev.message;
      if (isChunkError(err) && reloadOnce()) return; // separador antigo depois de uma atualização
      track("client_error", {}, "session");
      reportClientError(err);
    };
    window.addEventListener("error", on);
    window.addEventListener("unhandledrejection", on);
    return () => { window.removeEventListener("error", on); window.removeEventListener("unhandledrejection", on); };
  }, []);
  return null;
}
