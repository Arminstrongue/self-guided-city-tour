"use client";
/** Erro no próprio esqueleto da página (raro): mesmo comportamento, sem depender do layout. */
import { useEffect } from "react";
import { chunkAttempts, freshReload, isChunkError, reloadOnce, reportClientError, retryDelay } from "@/lib/client-error";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    if (isChunkError(error)) {
      if (reloadOnce()) return;
      const d = retryDelay(chunkAttempts());
      if (d !== null) { const id = setTimeout(() => void freshReload(), d); return () => clearTimeout(id); }
    }
    reportClientError(error, error.digest);
  }, [error]);
  return (
    <html lang="en"><body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#f2f2f7", fontFamily: "-apple-system,system-ui,sans-serif", color: "#111" }}>
      <div style={{ maxWidth: 340, margin: 16, padding: 24, borderRadius: 20, background: "#fff", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,.08)" }}>
        <b style={{ fontSize: 19 }}>Something went wrong · Algo correu mal</b>
        <p style={{ opacity: .65, fontSize: 15 }}>Your data is safe. · Os seus dados estão guardados.</p>
        <button type="button" onClick={() => void freshReload()} style={{ width: "100%", padding: 14, border: 0, borderRadius: 14, background: "#111", color: "#fff", fontSize: 16, fontWeight: 600 }}>Reload · Recarregar</button>
        <small style={{ display: "block", marginTop: 12, opacity: .45, fontSize: 11 }}>{(error.digest ? `#${error.digest} · ` : "") + String(error.message).slice(0, 140)}</small>
      </div>
    </body></html>
  );
}
