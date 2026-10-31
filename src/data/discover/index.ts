/** Ficheiros "Descobrir" por cidade (carregados só quando pedidos). Gerado por scripts/check-discover.ts. */
export const DISCOVER_LOADERS: Record<string, () => Promise<{ default: unknown }>> = {
  lon: () => import("./lon.json"),
  par: () => import("./par.json"),
};
