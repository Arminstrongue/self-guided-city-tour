"use client";
import { useEffect, useState } from "react";

/** true dentro das apps iOS/Android (Capacitor). Nas lojas não se vende conteúdo digital fora do sistema de pagamento delas. */
export function useNative() {
  const [native, setNative] = useState(false);
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    setNative(Boolean(cap?.isNativePlatform?.()));
  }, []);
  return native;
}
