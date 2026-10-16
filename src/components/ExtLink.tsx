"use client";
import type { AnchorHTMLAttributes } from "react";

type Cap = { Capacitor?: { isNativePlatform?: () => boolean } };

/** Abre uma ligação externa dentro da app: navegador interno nas apps iOS/Android, novo separador na web. */
export async function openLink(url: string) {
  const cap = (window as unknown as Cap).Capacitor;
  if (cap?.isNativePlatform?.()) {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url, presentationStyle: "popover" });
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function ExtLink({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a {...rest} href={href} target="_blank" rel="noopener noreferrer"
      onClick={(e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); void openLink(href); }}>
      {children}
    </a>
  );
}
