/**
 * Estado do voo em direto (AeroDataBox via RapidAPI). Só ativo com AERODATABOX_API_KEY.
 * Plano gratuito ~ 300 pedidos/mês; guardamos cada resposta 10 minutos para poupar pedidos.
 */
export type FlightStatus = {
  number: string; status: string; from: string | null; to: string | null;
  scheduled: string | null; estimated: string | null;   // ISO UTC da partida
  terminal: string | null; gate: string | null; delayMin: number | null;
};

export const flightApiEnabled = () => Boolean(process.env.AERODATABOX_API_KEY);
export const normaliseFlightNo = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, "");
export const validFlightNo = (v: string) => /^([A-Z]{2}|[A-Z]\d|\d[A-Z])\d{1,4}[A-Z]?$/.test(v);

const cache = new Map<string, { at: number; v: FlightStatus | null }>();

type Movement = {
  airport?: { iata?: string };
  scheduledTime?: { utc?: string }; revisedTime?: { utc?: string }; predictedTime?: { utc?: string };
  scheduledTimeUtc?: string; actualTimeUtc?: string;
  terminal?: string; gate?: string;
};
type ApiFlight = { number?: string; status?: string; departure?: Movement; arrival?: Movement };

const iso = (s?: string) => (s ? new Date(s.replace(" ", "T").replace(/Z?$/, "Z")).toISOString() : null);

/** Escolhe o troço que parte do aeroporto indicado (voos com escalas têm vários). */
export function parseFlights(list: ApiFlight[], number: string, fromIata?: string): FlightStatus | null {
  if (!Array.isArray(list) || !list.length) return null;
  const f = list.find((x) => fromIata && x.departure?.airport?.iata === fromIata) ?? list[0];
  const d = f.departure ?? {};
  const scheduled = iso(d.scheduledTime?.utc ?? d.scheduledTimeUtc);
  const estimated = iso(d.revisedTime?.utc ?? d.predictedTime?.utc ?? d.actualTimeUtc) ?? scheduled;
  const delayMin = scheduled && estimated ? Math.round((Date.parse(estimated) - Date.parse(scheduled)) / 60000) : null;
  return {
    number: f.number?.replace(/\s/g, "") ?? number, status: f.status ?? "Unknown",
    from: d.airport?.iata ?? null, to: f.arrival?.airport?.iata ?? null,
    scheduled, estimated, terminal: d.terminal ?? null, gate: d.gate ?? null, delayMin
  };
}

export async function flightStatus(number: string, dateLocal: string, fromIata?: string): Promise<FlightStatus | null> {
  const key = `${number}|${dateLocal}|${fromIata ?? ""}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 10 * 60e3) return hit.v;
  const res = await fetch(`https://aerodatabox.p.rapidapi.com/flights/number/${encodeURIComponent(number)}/${dateLocal}?withAircraftImage=false&withLocation=false`, {
    headers: { "x-rapidapi-key": process.env.AERODATABOX_API_KEY ?? "", "x-rapidapi-host": "aerodatabox.p.rapidapi.com" },
    signal: AbortSignal.timeout(6000), cache: "no-store"
  });
  if (res.status === 204 || res.status === 404) { cache.set(key, { at: Date.now(), v: null }); return null; }
  if (!res.ok) throw new Error(`aerodatabox ${res.status}`);
  const v = parseFlights(await res.json(), number, fromIata);
  cache.set(key, { at: Date.now(), v });
  return v;
}
