"use client";
/** Terminal de partida: escolhe-se no plano (ou "Não sei"); mostra que voos o servem, transportes, ligações e quando chegar. */
import { useEffect, useState } from "react";
import { Plane, ArrowLeftRight, TrainFront, Clock } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import type { GTxt } from "@/data/arrival-guides";
import type { terminalsOf as TerminalsOf } from "@/data/terminals";
import { ARRIVAL_LANGS } from "@/lib/arrival-text";

function useTermTx(locale: string) {
  const [pack, setPack] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    if (!(ARRIVAL_LANGS as readonly string[]).includes(locale)) return;
    let live = true;
    void import(`@/data/terminals-i18n/${locale}.json`).then((p) => { if (live) setPack((p.default ?? p) as Record<string, string>); }).catch(() => null);
    return () => { live = false; };
  }, [locale]);
  return (key: string, x: GTxt) => (locale === "pt" ? x.pt : pack?.[key] ?? x.en);
}

/** Dados dos terminais (≈90 KB, todos os aeroportos): carregados só quando o seletor aparece. */
function useTerminals(iata?: string | null) {
  const [a, setA] = useState<ReturnType<typeof TerminalsOf> | null>(null);
  useEffect(() => {
    if (!iata) { setA(null); return; }
    let live = true;
    void import("@/data/terminals").then((m) => { if (live) setA(m.terminalsOf(iata) ?? null); }).catch(() => null);
    return () => { live = false; };
  }, [iata]);
  return a;
}

export function TerminalPick({ t, locale, iata, value, onChange }: { t: Dict; locale: Locale; iata?: string | null; value?: string; onChange: (code: string | undefined) => void }) {
  const a = useTerminals(iata);
  const tx = useTermTx(locale);
  if (!a || !a.terminals.length || !iata) return null;
  const one = a.terminals.length === 1;
  const sel = one ? a.terminals[0] : a.terminals.find((x) => x.code === value);
  return (
    <div className="tm">
      <span className="bp-h">{t.tmTitle}</span>
      {one ? <p className="bp-ok">✓ {t.tmOne}: {a.terminals[0].name}</p> : (
        <div className="tm-chips" role="radiogroup" aria-label={t.tmTitle}>
          {a.terminals.map((x) => (
            <button key={x.code} type="button" role="radio" aria-checked={value === x.code} className={value === x.code ? "on" : ""} onClick={() => onChange(x.code)}>{x.name}</button>
          ))}
          <button type="button" role="radio" aria-checked={!value} className={!value ? "on" : ""} onClick={() => onChange(undefined)}>{t.tmUnsure}</button>
        </div>
      )}
      <p className="hint">{t.tmCheck}</p>
      <ul className="tm-info">
        {sel?.serves && <li><Plane size={16} aria-hidden="true" /><span>{tx(`${iata}.${sel.code}.serves`, sel.serves)}</span></li>}
        {sel?.transit && <li><TrainFront size={16} aria-hidden="true" /><span>{tx(`${iata}.${sel.code}.transit`, sel.transit)}</span></li>}
        {!sel && !one && a.terminals.some((x) => x.serves) && a.terminals.filter((x) => x.serves).map((x) => (
          <li key={x.code}><Plane size={16} aria-hidden="true" /><span><b>{x.name}:</b> {tx(`${iata}.${x.code}.serves`, x.serves!)}</span></li>
        ))}
        {a.between && !one && <li><ArrowLeftRight size={16} aria-hidden="true" /><span>{tx(`${iata}.between`, a.between)}</span></li>}
        {a.arrive && <li><Clock size={16} aria-hidden="true" /><span>{tx(`${iata}.arrive`, a.arrive)}</span></li>}
      </ul>
      {a.sources[0] && <p className="sg-note">{t.stgSource}: <a href={a.sources[0]} target="_blank" rel="noopener noreferrer">{new URL(a.sources[0]).hostname.replace(/^www\./, "")}</a></p>}
    </div>
  );
}
