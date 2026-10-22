/**
 * Estado de verificação da informação prática de cada cidade (emergência, dicas, segurança, transportes).
 * COMPILED: mês em que foi compilada a partir de fontes oficiais e públicas.
 * ON_SITE: cidades cuja informação já foi confirmada no local (data). Só se acrescenta depois de uma verificação real.
 */
export const COMPILED = "2026-10";
export const ON_SITE: Record<string, string> = {};
export const verifiedOnSite = (id: string): string | null => ON_SITE[id] ?? null;
