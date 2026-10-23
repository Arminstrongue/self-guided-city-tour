/** Passos de orientação (a pé / transportes) e utilitários partilhados entre a API e a interface. */
export type GuideStep =
  | { k: "walk"; text: string; m: number; min: number }
  | { k: "transit"; vehicle: string; line: string; color: string; headsign: string; from: string; to: string; stops: number; min: number; dep: string };
/** Junta passos a pé seguidos (o Google parte-os em muitos pedaços curtos). */
export function mergeWalks(steps: GuideStep[]): GuideStep[] {
  const out: GuideStep[] = [];
  for (const s of steps) {
    const last = out[out.length - 1];
    if (s.k === "walk" && last?.k === "walk" && (last.m < 120 || s.m < 120)) { last.m += s.m; last.min += s.min; if (!last.text) last.text = s.text; continue; }
    out.push({ ...s });
  }
  return out;
}

