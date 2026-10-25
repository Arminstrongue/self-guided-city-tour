"use client";
/** Trocar de cidade escrevendo o nome (em vez de uma lista comprida): título com ▾ → folha com pesquisa. */
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import Portal from "./Portal";

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export type CityOpt = { id: string; name: string; sub?: string };

export function CitySwitch({ current, cities, onPick, label, placeholder, className = "cs-title", none }: {
  current: string; cities: CityOpt[]; onPick: (id: string) => void; label: string; placeholder: string; className?: string; none: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inp = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(""); setTimeout(() => inp.current?.focus(), 60); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [open]);
  const list = useMemo(() => {
    const k = fold(q.trim());
    if (!k) return cities;
    return cities.filter((c) => fold(`${c.name} ${c.sub ?? ""} ${c.id}`).includes(k))
      .sort((a, b) => Number(!fold(a.name).startsWith(k)) - Number(!fold(b.name).startsWith(k)));
  }, [q, cities]);
  const cur = cities.find((c) => c.id === current);
  return (
    <>
      <button type="button" className={`${className} press`} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`${label}: ${cur?.name ?? current}`}>
        <span>{cur?.name ?? current}</span><ChevronDown size={18} aria-hidden="true" />
      </button>
      {open && (
        <Portal><div className="sheet-bg" onClick={() => setOpen(false)}>
          <div className="sheet cs-sheet" role="dialog" aria-label={label} onClick={(e) => e.stopPropagation()}>
            <div className="cs-head"><b>{label}</b><button type="button" className="pk-x press" onClick={() => setOpen(false)} aria-label="✕"><X size={18} aria-hidden="true" /></button></div>
            <label className="pk-q"><Search size={16} aria-hidden="true" />
              <input ref={inp} value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} autoComplete="off" spellCheck={false}
                onKeyDown={(e) => { if (e.key === "Enter" && list[0]) { setOpen(false); onPick(list[0].id); } }} />
            </label>
            <ul className="cs-list" role="listbox">
              {list.map((c) => (
                <li key={c.id}><button type="button" role="option" aria-selected={c.id === current} className={`cs-row press${c.id === current ? " on" : ""}`} onClick={() => { setOpen(false); if (c.id !== current) onPick(c.id); }}>
                  <b>{c.name}</b>{c.sub && <small>{c.sub}</small>}
                </button></li>
              ))}
              {!list.length && <li className="hint" style={{ padding: 14 }}>{none}</li>}
            </ul>
          </div>
        </div></Portal>
      )}
    </>
  );
}
