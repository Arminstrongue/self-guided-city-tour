"use client";
/** Em vez do ecrã preto "Application error": recupera sozinho depois de uma atualização, ou deixa tentar de novo. */
import { useEffect } from "react";
import { isChunkError, reloadOnce, reportClientError } from "@/lib/client-error";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const chunk = isChunkError(error);
  useEffect(() => {
    if (chunk && reloadOnce()) return;
    reportClientError(error, error.digest);
  }, [error, chunk]);
  const pt = typeof document !== "undefined" && document.documentElement.lang.startsWith("pt");
  return (
    <div className="err-page" role="alert">
      <div className="err-card">
        <span className="err-ic" aria-hidden="true">↻</span>
        <b>{chunk ? (pt ? "Nova versão disponível" : "A new version is available") : pt ? "Algo correu mal" : "Something went wrong"}</b>
        <p>{chunk ? (pt ? "A atualizar a app…" : "Updating the app…") : pt ? "Os seus dados estão guardados. Tente de novo." : "Your data is safe. Please try again."}</p>
        <button type="button" className="btn press" onClick={() => (chunk ? location.reload() : reset())}>{pt ? "Tentar de novo" : "Try again"}</button>
        <button type="button" className="link-btn" onClick={() => { location.href = location.pathname.split("/").slice(0, 2).join("/") || "/"; }}>{pt ? "Ir para o início" : "Go to home"}</button>
        <small className="err-code">{(error.digest ? `#${error.digest} · ` : "") + String(error.message || error.name).slice(0, 140)}</small>
      </div>
    </div>
  );
}
