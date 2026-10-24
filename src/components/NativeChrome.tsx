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
    // Todas as ligações externas (sites oficiais, mapas, bilhetes) abrem dentro da app, no navegador interno.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      let url: URL;
      try { url = new URL(a.href, location.href); } catch { return; }
      if (!/^https?:$/.test(url.protocol) || url.origin === location.origin) return;
      e.preventDefault();
      void import("@capacitor/browser").then(({ Browser }) => Browser.open({ url: url.href, presentationStyle: "popover" })).catch(() => { location.href = url.href; });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
