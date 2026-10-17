"use client";
import { useEffect } from "react";

/** Nas apps iOS/Android: texto da barra de estado segundo o tema do telemóvel e marca a plataforma no <html> para ajustes de CSS. */
export function NativeChrome() {
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string } }).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    document.documentElement.dataset.platform = cap.getPlatform?.() ?? "native";
    void import("@capacitor/status-bar").then(async ({ StatusBar, Style }) => {
      await StatusBar.setStyle({ style: Style.Default });
    }).catch(() => undefined);
  }, []);
  return null;
}
