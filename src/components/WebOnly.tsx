"use client";
import { useEffect, useState } from "react";

/**
 * Mostra o conteúdo só no navegador. Dentro das apps iOS/Android (Capacitor) mostra `fallback`:
 * as lojas exigem regras próprias para vender conteúdo digital, por isso a compra fica na web.
 */
export function WebOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [native, setNative] = useState(false);
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    setNative(Boolean(cap?.isNativePlatform?.()));
  }, []);
  // Antes de o React arrancar, a classe web-only já esconde a compra nas apps (o atributo data-platform é posto antes de pintar).
  return <>{native ? fallback ?? null : <div className="web-only" style={{ display: "contents" }}>{children}</div>}</>;
}
