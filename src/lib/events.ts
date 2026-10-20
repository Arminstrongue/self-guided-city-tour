/**
 * Eventos nos próximos dias (concertos, jogos, teatro, família) via Ticketmaster Discovery API.
 * Só ativo com TICKETMASTER_API_KEY (gratuita em developer.ticketmaster.com). Cache de 3 h por cidade.
 */
import type { Hobby } from "./explore";

export type CityEvent = {
  id: string; name: string; url: string; start: string; localDate: string; localTime: string | null;
  kind: "music" | "sport" | "arts" | "family" | "film" | "other"; venue: string | null; lat: number | null; lng: number | null;
  image: string | null; priceMin: number | null; currency: string | null;
  free?: boolean;   // entrada gratuita
  until?: string;   // última data, quando o mesmo evento se repete em vários dias
  runs?: number;    // número de dias com sessões
};
export const EVENT_HOBBY: Record<CityEvent["kind"], Hobby[]> = {
  music: ["music", "night"], sport: ["sport"], arts: ["art", "history"], family: ["family"], film: ["art"], other: []
};
export const eventsEnabled = () => Boolean(process.env.TICKETMASTER_API_KEY);

type TmEvent = {
  id: string; name: string; url: string;
  dates?: { start?: { dateTime?: string; localDate?: string; localTime?: string } };
  classifications?: { segment?: { name?: string }; genre?: { name?: string } }[];
  images?: { url: string; width: number; ratio?: string }[];
  priceRanges?: { min?: number; max?: number; currency?: string }[];
  info?: string; pleaseNote?: string;
  _embedded?: { venues?: { name?: string; location?: { latitude?: string; longitude?: string } }[] };
};

function kindOf(seg: string | undefined, genre: string | undefined): CityEvent["kind"] {
  if (seg === "Music") return "music";
  if (seg === "Sports") return "sport";
  if (seg === "Arts & Theatre") return /family|children/i.test(genre ?? "") ? "family" : "arts";
  if (seg === "Film") return "film";
  if (/family/i.test(seg ?? "") || /family|children/i.test(genre ?? "")) return "family";
  return "other";
}

/** Converte a resposta da Ticketmaster: um evento por nome e dia, com a imagem 16:9 mais pequena que sirva. */
export function parseTicketmaster(json: { _embedded?: { events?: TmEvent[] } }): CityEvent[] {
  const seen = new Set<string>();
  const out: CityEvent[] = [];
  for (const e of json._embedded?.events ?? []) {
    const d = e.dates?.start;
    if (!d?.localDate) continue;
    if (/gift ?card|voucher|parking|upgrade|add[- ]?on|fast ?track only|hospitality package/i.test(e.name)) continue; // não são eventos
    const key = `${e.name.toLowerCase()}|${d.localDate}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const v = e._embedded?.venues?.[0];
    const imgs = (e.images ?? []).filter((i) => i.ratio === "16_9" && i.width >= 500).sort((a, b) => a.width - b.width);
    const c = e.classifications?.[0];
    const lat = Number(v?.location?.latitude), lng = Number(v?.location?.longitude);
    const low = (e.priceRanges ?? []).filter((p) => typeof p.min === "number" && p.currency).sort((a, b) => a.min! - b.min!)[0];
    const free = (low?.min === 0 && (low.max ?? 0) === 0) || /\bfree (entry|admission|event)\b|\bentrada (gratuita|livre)\b/i.test(`${e.name} ${e.info ?? ""} ${e.pleaseNote ?? ""}`);
    out.push({
      id: e.id, name: e.name, url: e.url, start: d.dateTime ?? `${d.localDate}T${d.localTime ?? "00:00:00"}`, localDate: d.localDate, localTime: d.localTime?.slice(0, 5) ?? null,
      kind: kindOf(c?.segment?.name, c?.genre?.name), venue: v?.name ?? null, lat: Number.isFinite(lat) ? lat : null, lng: Number.isFinite(lng) ? lng : null,
      image: imgs[0]?.url ?? e.images?.[0]?.url ?? null, priceMin: low?.min ?? null, currency: low?.currency ?? null,
      ...(free ? { free: true } : {})
    });
  }
  return out;
}

/**
 * Junta as sessões do mesmo evento (atrações diárias, peças com várias datas) numa só entrada,
 * na primeira data, com a última data e o número de dias. Assim a lista mostra a variedade real da cidade.
 */
export function collapseRuns(list: CityEvent[], max = 150): CityEvent[] {
  const by = new Map<string, CityEvent>();
  for (const e of [...list].sort((a, b) => a.start.localeCompare(b.start))) {
    const k = `${e.name.toLowerCase().replace(/\s+/g, " ").trim()}|${(e.venue ?? "").toLowerCase()}`;
    const first = by.get(k);
    if (!first) { by.set(k, { ...e }); continue; }
    if (e.localDate !== first.localDate && e.localDate !== first.until) {
      first.runs = (first.runs ?? 1) + 1;
      first.until = e.localDate > (first.until ?? first.localDate) ? e.localDate : first.until;
    }
    if (e.priceMin !== null && (first.priceMin === null || e.priceMin < first.priceMin)) { first.priceMin = e.priceMin; first.currency = e.currency; }
    if (e.free) first.free = true;
  }
  return [...by.values()].sort((a, b) => a.start.localeCompare(b.start)).slice(0, max);
}

const cache = new Map<string, { at: number; events: CityEvent[] }>();

export async function eventsNear(cityId: string, center: { lat: number; lng: number }, days = 14): Promise<CityEvent[] | null> {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) return null;
  const ck = `${cityId}:${days}`;
  const hit = cache.get(ck);
  if (hit && Date.now() - hit.at < 3 * 3600_000) return hit.events;
  const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
  const q = new URLSearchParams({
    apikey: key, latlong: `${center.lat.toFixed(4)},${center.lng.toFixed(4)}`, radius: "30", unit: "km",
    startDateTime: iso(new Date()), endDateTime: iso(new Date(Date.now() + days * 86400_000)), size: "200", sort: "date,asc", locale: "*"
  });
  try {
    // Até 3 páginas de 200 (limite da API: 1000 resultados); as atrações diárias ocupam muitas posições.
    const all: CityEvent[] = [];
    for (let page = 0; page < 3; page++) {
      q.set("page", String(page));
      const r = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${q}`, { signal: AbortSignal.timeout(12_000) });
      if (!r.ok) { if (page === 0) return hit?.events ?? null; break; }
      const j = await r.json() as { _embedded?: { events?: TmEvent[] }; page?: { totalPages?: number } };
      all.push(...parseTicketmaster(j));
      if ((j.page?.totalPages ?? 1) <= page + 1) break;
      await new Promise((res) => setTimeout(res, 250)); // a API aceita 5 pedidos por segundo
    }
    const events = collapseRuns(all);
    cache.set(ck, { at: Date.now(), events });
    return events;
  } catch { return hit?.events ?? null; }
}
