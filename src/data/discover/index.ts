/** Ficheiros "Descobrir" por cidade (carregados só quando pedidos). Gerado por scripts/check-discover.ts. */
export const DISCOVER_LOADERS: Record<string, () => Promise<{ default: unknown }>> = {
  ams: () => import("./ams.json"),
  bcn: () => import("./bcn.json"),
  dxb: () => import("./dxb.json"),
  lis: () => import("./lis.json"),
  lon: () => import("./lon.json"),
  mad: () => import("./mad.json"),
  nyc: () => import("./nyc.json"),
  par: () => import("./par.json"),
  rom: () => import("./rom.json"),
  tyo: () => import("./tyo.json"),
};
