/**
 * Modo Escala (VOYBU Layover): a partir do tempo total de escala, calcula o tempo real na cidade
 * (sair do aeroporto, ir ao centro, passear, voltar e chegar com margem) e escolhe o roteiro que cabe.
 * Determinístico: os mesmos números que o planeador usa (tempo do aeroporto ao centro, regresso, margem do avião).
 */
import { BUFFER_MIN } from "./trip";

/** Do toque no chão até sair do aeroporto (desembarque, controlo de passaportes): estimativa média. */
export const EXIT_MIN = 45;
export const BUCKETS = [3, 6, 9, 12] as const;

export type LyOption = { key: string; n: number; tour: number; ret: number };
export type LyVerdict = "stay" | "short" | "explore" | "long";
export type LyPlan = { verdict: LyVerdict; option: LyOption | null; exit: number; to: number; tour: number; back: number; buffer: number; free: number };

/** Escolhe o maior roteiro que cabe; sem nenhum, aconselha ficar no aeroporto. */
export function layoverPlan(hours: number, airMin: number, options: LyOption[]): LyPlan {
  const total = Math.round(hours * 60);
  const buffer = BUFFER_MIN.plane;
  const fixed = EXIT_MIN + airMin + buffer;
  let best: LyOption | null = null;
  for (const o of options) if (fixed + o.tour + o.ret <= total && (!best || o.tour > best.tour)) best = o;
  if (!best) return { verdict: "stay", option: null, exit: EXIT_MIN, to: airMin, tour: 0, back: 0, buffer, free: Math.max(0, total - fixed - airMin) };
  const free = total - fixed - best.ret;
  const coreIdx = options.findIndex((o) => o.key === "core");
  const idx = options.indexOf(best);
  const verdict: LyVerdict = best.key === "ext" || (hours >= 12 && idx >= coreIdx) ? "long" : idx >= coreIdx ? "explore" : "short";
  return { verdict, option: best, exit: EXIT_MIN, to: airMin, tour: best.tour, back: best.ret, buffer, free };
}
