/**
 * Dados de chegada que precisam de nova verificação (o viajante nunca se deve perder por informação antiga):
 * guias de estação e terminais com data de verificação ("checked", AAAA-MM) com mais de 9 meses.
 */
import { GUIDES_DATA } from "@/data/arrival-guides-data";
import { TERMINALS_DATA } from "@/data/terminals-data";

export const STALE_MONTHS = 9;

export function monthsSince(checked: string, now = new Date()): number {
  const m = /^(\d{4})-(\d{2})$/.exec(checked);
  if (!m) return Infinity;
  return (now.getUTCFullYear() - Number(m[1])) * 12 + (now.getUTCMonth() + 1 - Number(m[2]));
}

export function staleIds(data: Record<string, { checked: string }>, now = new Date()): string[] {
  return Object.entries(data).filter(([, v]) => monthsSince(v.checked, now) > STALE_MONTHS).map(([k]) => k).sort();
}

export function staleData(now = new Date()): string[] {
  const g = staleIds(GUIDES_DATA, now), t = staleIds(TERMINALS_DATA, now);
  const out: string[] = [];
  if (g.length) out.push(`⚠ Guias de estação por rever (mais de ${STALE_MONTHS} meses): ${g.length} — ${g.slice(0, 8).join(", ")}${g.length > 8 ? "…" : ""}`);
  if (t.length) out.push(`⚠ Terminais por rever (mais de ${STALE_MONTHS} meses): ${t.length} — ${t.slice(0, 8).join(", ")}${t.length > 8 ? "…" : ""}`);
  return out;
}
