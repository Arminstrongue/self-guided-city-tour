/** Mosaicos do mapa: OpenStreetMap por defeito; outro fornecedor (ex.: MapTiler, Stadia) com MAP_TILES no .env do servidor. */
type Cfg = { t: string; a: string; p: boolean };
const cfg = (): Cfg | undefined => (typeof window !== "undefined" ? (window as unknown as { __SGCT_MAP?: Cfg }).__SGCT_MAP : undefined);
export const OSM = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const tilesUrl = () => cfg()?.t || process.env.NEXT_PUBLIC_MAP_TILES || OSM;
export const tilesAttr = () => cfg()?.a || process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || "© OpenStreetMap";
/** Só fornecedores que o permitem (nunca o OpenStreetMap público) podem ser descarregados para usar sem internet. */
export const canPrefetchTiles = () => Boolean(cfg()?.p) && tilesUrl() !== OSM && !/openstreetmap\.org/.test(tilesUrl());

/** Mosaicos (x, y, z) que cobrem uma área, do zoom mínimo ao máximo, até um limite. */
export function tilesFor(b: { s: number; w: number; n: number; e: number }, zMin: number, zMax: number, max = 900) {
  const out: string[] = [];
  const tpl = tilesUrl();
  const sub = ["a", "b", "c"];
  for (let z = zMin; z <= zMax; z++) {
    const n = 2 ** z;
    const x = (lng: number) => Math.floor(((lng + 180) / 360) * n);
    const y = (lat: number) => { const r = (lat * Math.PI) / 180; return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n); };
    for (let tx = x(b.w); tx <= x(b.e); tx++) for (let ty = y(b.n); ty <= y(b.s); ty++) {
      if (out.length >= max) return out;
      out.push(tpl.replace("{z}", String(z)).replace("{x}", String(tx)).replace("{y}", String(ty)).replace("{s}", sub[(tx + ty) % 3]).replace("{r}", ""));
    }
  }
  return out;
}
