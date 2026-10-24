"use client";
/** Em vez do ecrã preto "Application error": recupera sozinho depois de uma atualização, ou deixa tentar de novo. */
import { useEffect, useState } from "react";
import { chunkAttempts, freshReload, isChunkError, reloadOnce, reportClientError, retryDelay } from "@/lib/client-error";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const chunk = isChunkError(error);
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!chunk) { reportClientError(error, error.digest); return; }
    if (reloadOnce()) return;
    // Nova versão a entrar no ar: tenta de novo sozinho, com espera crescente, durante uns minutos.
    const d = retryDelay(chunkAttempts());
    if (d === null) { reportClientError(error, error.digest); return; }
    let s = Math.round(d / 1000); setLeft(s);
    const id = setInterval(() => { s -= 1; setLeft(s); if (s <= 0) { clearInterval(id); void freshReload(); } }, 1000);
    return () => clearInterval(id);
  }, [error, chunk]);
  const pt = typeof document !== "undefined" && document.documentElement.lang.startsWith("pt");
  const retrying = chunk && left !== null && left > 0;
  return (
    <div className="err-page" role="alert">
      <div className="err-card">
        <span className={`err-ic${chunk ? " spin" : ""}`} aria-hidden="true">↻</span>
        <b>{chunk ? (pt ? "Estamos a atualizar a app" : "We're updating the app") : pt ? "Algo correu mal" : "Something went wrong"}</b>
        <p>{chunk
          ? (pt ? "Há uma versão nova com melhorias. Abre sozinha dentro de momentos." : "A new version with improvements is on its way. It will open by itself in a moment.")
          : pt ? "Os seus dados estão guardados. Tente de novo." : "Your data is safe. Please try again."}</p>
        {retrying && <p className="hint" aria-live="polite">{pt ? `Nova tentativa em ${left} s…` : `Trying again in ${left} s…`}</p>}
        <button type="button" className="btn press" onClick={() => (chunk ? void freshReload() : reset())}>{pt ? "Tentar agora" : "Try now"}</button>
        <button type="button" className="link-btn" onClick={() => { location.href = location.pathname.split("/").slice(0, 2).join("/") || "/"; }}>{pt ? "Ir para o início" : "Go to home"}</button>
        {!chunk && <small className="err-code">{(error.digest ? `#${error.digest} · ` : "") + String(error.message || error.name).slice(0, 140)}</small>}
      </div>
    </div>
  );
}
