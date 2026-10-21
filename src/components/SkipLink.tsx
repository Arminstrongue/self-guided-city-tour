"use client";
/** "Saltar para o conteúdo": primeiro elemento focável da página, para quem navega por teclado ou leitor de ecrã. */
export function SkipLink({ label }: { label: string }) {
  return <a className="skip-link" href="#main" onClick={(e) => {
    const m = document.querySelector<HTMLElement>("main"); if (!m) return;
    e.preventDefault(); if (!m.hasAttribute("tabindex")) m.tabIndex = -1; m.focus(); m.scrollIntoView();
  }}>{label}</a>;
}
