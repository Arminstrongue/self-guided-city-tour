"use client";
/** Rodapé discreto: escondido dentro da app (os termos ficam no Perfil → Definições) e, no site, recolhido numa linha. */
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const APP = /^\/[a-z]{2}\/(wallet|tour|plan|layover|start|arrive|i|u|g|v|admin|merchants\/manage|guides\/portal|agents\/portal)(\/|$)/;

export function SiteFooter({ line, label, children }: { line: string; label: string; children: ReactNode }) {
  const path = usePathname() ?? "";
  if (APP.test(path)) return null;
  return (
    <footer className="foot foot-min">
      <details>
        <summary><span>{line}</span><span className="foot-more">{label}</span></summary>
        <div className="foot-links">{children}</div>
      </details>
    </footer>
  );
}
