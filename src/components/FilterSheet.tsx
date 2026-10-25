"use client";
/** Folha de filtros (estilo apps de viagem): secções com botões, "Limpar tudo" e "Ver N resultados" fixos em baixo. */
import type { ReactNode } from "react";
import Portal from "./Portal";
import { SheetX } from "./WinNav";

export type FSection = { key: string; title: string; options: { value: string; label: string }[]; multi?: boolean };

export function FilterSheet({ title, sections, value, onChange, onReset, onClose, showLabel, resetLabel, closeLabel, applied }: {
  title: string; sections: FSection[]; value: Record<string, string[]>; onChange: (key: string, v: string[]) => void;
  onReset: () => void; onClose: () => void; showLabel: string; resetLabel: string; closeLabel: string; applied?: ReactNode;
}) {
  return (
    <Portal><div className="sheet-bg" onClick={onClose}>
      <div className="sheet fsx" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="fsx-h"><SheetX onClose={onClose} label={closeLabel} /><b>{title}</b><span /></div>
        <div className="fsx-b">
          {applied}
          {sections.filter((s) => s.options.length).map((s) => (
            <section key={s.key} className="fsx-sec">
              <h3>{s.title}</h3>
              <div className="fsx-opts" role={s.multi === false ? "radiogroup" : "group"} aria-label={s.title}>
                {s.options.map((o) => {
                  const on = (value[s.key] ?? []).includes(o.value);
                  return (
                    <button key={o.value} type="button" role={s.multi === false ? "radio" : undefined} aria-checked={s.multi === false ? on : undefined} aria-pressed={s.multi === false ? undefined : on}
                      className={on ? "on" : ""} onClick={() => {
                        const cur = value[s.key] ?? [];
                        onChange(s.key, s.multi === false ? (on ? [] : [o.value]) : on ? cur.filter((x) => x !== o.value) : [...cur, o.value]);
                      }}>{o.label}</button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        <div className="fsx-f">
          <button type="button" className="fsx-reset" onClick={onReset}>{resetLabel}</button>
          <button type="button" className="btn tram press fsx-go" onClick={onClose}>{showLabel}</button>
        </div>
      </div>
    </div></Portal>
  );
}

export const countFilters = (v: Record<string, string[]>) => Object.values(v).reduce((n, a) => n + a.length, 0);
