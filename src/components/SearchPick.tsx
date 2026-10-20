"use client";
/**
 * Escolha com pesquisa (substitui listas compridas): escreve-se e a lista filtra na hora,
 * sem acentos nem maiúsculas a atrapalhar. Teclado: ↑ ↓ Enter Esc.
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";

export type PickOption = { value: string; label: string; icon?: string; sub?: string };
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function SearchPick({ options, value, onChange, placeholder, label, id, free = false, noneLabel, max = 60 }: {
  options: PickOption[]; value: string | null; onChange: (v: string | null, label?: string) => void; placeholder?: string; label?: string; id?: string;
  /** Aceita texto livre (ex.: uma cidade que não está na lista). */ free?: boolean;
  /** Mostra uma primeira opção "nenhuma". */ noneLabel?: string; max?: number;
}) {
  const auto = useId();
  const inputId = id ?? `sp-${auto}`;
  const sel = options.find((o) => o.value === value) ?? null;
  const [q, setQ] = useState(sel?.label ?? (free ? value ?? "" : ""));
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) setQ(sel?.label ?? (free ? value ?? "" : "")); }, [value, open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const out = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", out); return () => document.removeEventListener("mousedown", out);
  }, []);
  const list = useMemo(() => {
    const k = fold(q.trim());
    const typed = k && (!sel || fold(sel.label) !== k);
    const all = typed ? options.filter((o) => fold(o.label).includes(k) || (o.sub && fold(o.sub).includes(k))) : options;
    // Primeiro os que começam pelo texto escrito.
    return (typed ? [...all].sort((a, b) => Number(!fold(a.label).startsWith(k)) - Number(!fold(b.label).startsWith(k))) : all).slice(0, max);
  }, [q, options, sel, max]);
  const items: (PickOption | null)[] = noneLabel ? [null, ...list] : list;
  function choose(o: PickOption | null) {
    onChange(o?.value ?? null, o?.label);
    setQ(o?.label ?? ""); setOpen(false);
  }
  return (
    <div className="field sp" ref={box}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className="sp-in">
        <span aria-hidden="true" className="sp-ic">{sel?.icon ?? "🔎"}</span>
        <input id={inputId} role="combobox" aria-expanded={open} aria-controls={`${inputId}-l`} aria-autocomplete="list" autoComplete="off"
          value={q} placeholder={placeholder}
          onFocus={(e) => { setOpen(true); setHi(0); e.currentTarget.select(); }}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(0); if (free) onChange(e.target.value || null, e.target.value); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi((h) => Math.min(items.length - 1, h + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
            if (e.key === "Enter" && open && items[hi] !== undefined) { e.preventDefault(); choose(items[hi]); }
            if (e.key === "Escape") setOpen(false);
          }} />
        {(sel || (free && q)) && <button type="button" className="sp-x" aria-label="✕" onClick={() => { choose(null); setQ(""); }}>✕</button>}
      </div>
      {open && items.length > 0 && (
        <ul className="sp-list" id={`${inputId}-l`} role="listbox">
          {items.map((o, i) => (
            <li key={o?.value ?? "none"} role="option" aria-selected={i === hi} className={i === hi ? "hi" : ""}
              onMouseDown={(e) => { e.preventDefault(); choose(o); }} onMouseEnter={() => setHi(i)}>
              {o ? <><span aria-hidden="true">{o.icon ?? ""}</span><b>{o.label}</b>{o.sub && <small>{o.sub}</small>}</> : <span className="hint">{noneLabel}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
