/** Descobrir: mais lugares, ruas e bairros e passeios a pé por cidade (dados em src/data/discover/<cidade>.json). */
import { DISCOVER_LOADERS } from "@/data/discover";

export type DPlace = { id: string; n: string; a: string; lat: number; lng: number; k: string; top?: boolean; free?: boolean; url?: string; en: string; pt: string; ja?: string };
export type DStreet = { id: string; n: string; a: string; lat: number; lng: number; en: string; pt: string };
export type DWalk = { id: string; en_n: string; pt_n: string; km: number; min: number; en: string; pt: string; pts: { n: string; lat: number; lng: number }[] };
export type Discover = { places: DPlace[]; streets: DStreet[]; walks: DWalk[] };

const cache = new Map<string, Discover | null>();
const ID = /^[a-z]{2,4}$/;

export async function discoverFor(city: string): Promise<Discover | null> {
  if (!ID.test(city)) return null;
  if (cache.has(city)) return cache.get(city)!;
  let v: Discover | null = null;
  // Os ficheiros entram no build (import), para funcionarem no servidor em modo "standalone".
  const load = DISCOVER_LOADERS[city];
  try { v = load ? ((await load()).default as unknown as Discover) : null; } catch { v = null; }
  cache.set(city, v);
  return v;
}
