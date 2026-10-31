/**
 * Painéis de partidas em tempo real (National Rail, via Rail Data Marketplace — produto "Live Departure Board", grátis).
 * A chave fica só no servidor (RDM_LDB_KEY no .env). O endereço vem da página "Specification" do produto (RDM_LDB_URL).
 * Respostas guardadas 30 s em memória para não repetir pedidos.
 */
export type LiveCall = { n: string; crs: string; st: string; et: string };
export type LiveService = { std: string; etd: string; platform: string | null; operator: string; cancelled: boolean; reason: string | null; to: string; calls: LiveCall[] };
export type LiveBoard = { at: string; station: string; messages: string[]; services: LiveService[] };

const DEFAULT_URL = "https://api1.raildata.org.uk/1010-live-departure-board-dep1_2/LDBWS/api/20220120/GetDepBoardWithDetails";
export const railLiveEnabled = () => Boolean(process.env.RDM_LDB_KEY);
const cache = new Map<string, { at: number; v: LiveBoard | null; http: number }>();

const strip = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
type Raw = Record<string, unknown>;
const arr = (x: unknown): Raw[] => (Array.isArray(x) ? (x as Raw[]) : x && typeof x === "object" ? [x as Raw] : []);
const str = (x: unknown) => (typeof x === "string" ? x : "");

function parse(j: Raw): LiveBoard {
  const messages = arr(j.nrccMessages).map((m) => strip(str(m.Value) || str(m.value) || str(m.message) || (typeof m === "string" ? m : ""))).filter(Boolean);
  const services = arr(j.trainServices).map((s): LiveService => {
    const calls = arr(s.subsequentCallingPoints).flatMap((g) => arr(g.callingPoint)).map((c) => ({ n: str(c.locationName), crs: str(c.crs), st: str(c.st), et: str(c.et) || str(c.at) }));
    return {
      std: str(s.std), etd: str(s.etd), platform: str(s.platform) || null, operator: str(s.operator), cancelled: Boolean(s.isCancelled),
      reason: str(s.cancelReason) || str(s.delayReason) || null, to: arr(s.destination).map((d) => str(d.locationName)).join(" / "), calls
    };
  });
  return { at: str(j.generatedAt), station: str(j.locationName), messages, services };
}

/** Partidas de uma estação (CRS), opcionalmente só as que vão para "to" (CRS). */
export async function departures(crs: string, to?: string | null): Promise<{ board: LiveBoard | null; http: number }> {
  const key = process.env.RDM_LDB_KEY;
  if (!key) return { board: null, http: 0 };
  const id = `${crs}>${to ?? ""}`;
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < 30_000) return { board: hit.v, http: hit.http };
  const base = (process.env.RDM_LDB_URL || DEFAULT_URL).replace(/\/+$/, "").replace(/\/[A-Z]{3}$/, "");
  const q = new URLSearchParams({ numRows: "15", timeWindow: "120" });
  if (to) { q.set("filterCrs", to); q.set("filterType", "to"); }
  let v: LiveBoard | null = null, http = 0;
  try {
    const r = await fetch(`${base}/${crs}?${q}`, { headers: { "x-apikey": key, Accept: "application/json" }, signal: AbortSignal.timeout(8000), cache: "no-store" });
    http = r.status;
    if (r.ok) v = parse((await r.json()) as Raw);
  } catch { http = -1; }
  cache.set(id, { at: Date.now(), v, http });
  if (cache.size > 500) cache.delete(cache.keys().next().value!);
  return { board: v, http };
}
