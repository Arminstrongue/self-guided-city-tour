"use client";
import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";

type Planned = { city: string; key: string; n: number; h: string; names?: string[]; base?: string };

/**
 * "O seu roteiro": o que o viajante escolheu em "Começar em 3 passos" continua visível até ao pagamento,
 * para saber que está a comprar exatamente esse roteiro (e o roteiro abre já nessa versão).
 */
export function ChosenRoute({ t, locale, city }: { t: Dict; locale: Locale; city: string }) {
  const [p, setP] = useState<Planned | null>(null);
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem("sgct:planned") ?? "null"); if (v?.city === city) setP(v); } catch { /* ignorar */ } }, [city]);
  if (!p) return null;
  return (
    <div className="card cr" role="note">
      <div className="cr-h"><span className="cr-k">⏱ {t.crTitle}</span><a href={`/${locale}/start?city=${city}`} className="link-btn">{t.bpChange}</a></div>
      <b>{fmt(t.wPlannedSub, { n: p.n, h: p.h })}</b>
      {p.base && <span className="hint">{fmt(t.bpFrom, { p: p.base })}</span>}
      {p.names && <ol className="cr-stops">{p.names.map((n, i) => <li key={n + i}>{n}</li>)}</ol>}
      <span className="hint">{t.crNote}</span>
    </div>
  );
}
