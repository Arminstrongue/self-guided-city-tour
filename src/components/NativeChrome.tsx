"use client";
import { useEffect } from "react";

/** Nas apps iOS/Android: barra de estado azul com texto claro e marca a plataforma no <html> para ajustes de CSS. */
export function NativeChrome() {
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string } }).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    document.documentElement.dataset.platform = cap.getPlatform?.() ?? "native";
    void import("@capacitor/status-bar").then(async ({ StatusBar, Style }) => {
      await StatusBar.setStyle({ style: Style.Dark });
      if (cap.getPlatform?.() === "android") { await StatusBar.setBackgroundColor({ color: "#1d4aa0" }); await StatusBar.setOverlaysWebView({ overlay: false }); }
    }).catch(() => undefined);
  }, []);
  return null;
}
