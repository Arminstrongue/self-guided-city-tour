"use client";
/**
 * Página da cidade em separadores (Roteiro · Hoje · Segurança · Bom saber): a página fica curta e a informação pública
 * arrumada. O conteúdo de todos os separadores está na página (motores de pesquisa e leitores de ecrã veem tudo);
 * as ligações #... (ex.: #book, #safety) abrem o separador certo.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";

export function CityTabs({ tabs, children }: { tabs: { key: string; label: string }[]; children: ReactNode[] }) {
  const [on, setOn] = useState(tabs[0].key);
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const go = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      const panel = el?.closest<HTMLElement>("[data-panel]")?.dataset.panel ?? (tabs.some((x) => x.key === id) ? id : null);
      if (!panel) return;
      setOn(panel);
      requestAnimationFrame(() => (el ?? bar.current)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [tabs]);
  const pick = (k: string) => {
    setOn(k);
    try { history.replaceState(null, "", `#${k}`); } catch { /* ignorar */ }
    const top = bar.current ? bar.current.getBoundingClientRect().top + window.scrollY - 8 : 0;
    if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
  };
  return (
    <>
      <div className="ct-bar" ref={bar} role="tablist">
        {tabs.map((x) => (
          <button key={x.key} type="button" role="tab" id={`tab-${x.key}`} aria-selected={on === x.key} aria-controls={`panel-${x.key}`} className={on === x.key ? "on" : ""} onClick={() => pick(x.key)}>{x.label}</button>
        ))}
      </div>
      {tabs.map((x, i) => (
        <div key={x.key} id={`panel-${x.key}`} data-panel={x.key} role="tabpanel" aria-labelledby={`tab-${x.key}`} hidden={on !== x.key} className="ct-panel">
          {children[i]}
        </div>
      ))}
    </>
  );
}
