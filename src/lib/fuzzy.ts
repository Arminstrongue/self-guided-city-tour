/**
 * Procura tolerante para nomes de lugares: cada palavra escrita só tem de ser o início de uma palavra do nome ou da morada,
 * em qualquer ordem, sem acentos, e aceita um erro de uma letra em palavras com 5+ letras ("piccadily" → "Piccadilly").
 */
export const fold = (x: string) => x.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/['’`]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const IGNORE = new Set(["station", "estacao", "estación", "gare", "bahnhof", "stazione", "railway", "train", "the", "de", "da", "do"]);

function lev1(a: string, b: string) { // distância de edição ≤ 1?
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, e = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++e > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return e + (a.length - i) + (b.length - j) <= 1;
}

/** Pontuação 0 (não serve) a 1+ (bom). Palavras do texto a procurar contra palavras do candidato. */
export function matchScore(query: string, candidate: string): number {
  const q = fold(query).split(" ").filter((w) => w && !IGNORE.has(w));
  if (!q.length) return 1;
  const words = fold(candidate).split(" ").filter(Boolean);
  let score = 0;
  for (const w of q) {
    let best = 0;
    for (const c of words) {
      if (c === w) { best = 1; break; }
      if (c.startsWith(w)) best = Math.max(best, 0.9);
      else if (w.length >= 5 && (lev1(w, c) || lev1(w, c.slice(0, w.length)))) best = Math.max(best, 0.7);
    }
    if (!best) return 0;
    score += best;
  }
  return score / q.length;
}

/** Filtra e ordena (melhor primeiro) uma lista pelo texto escrito. */
export function fuzzyFilter<T>(list: T[], query: string, text: (x: T) => string): T[] {
  if (!fold(query)) return list;
  return list.map((x, i) => ({ x, i, s: matchScore(query, text(x)) })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s || a.i - b.i).map((r) => r.x);
}
