/**
 * Eventos nos próximos dias (concertos, jogos, teatro, família) via Ticketmaster Discovery API.
 * Só ativo com TICKETMASTER_API_KEY (gratuita em developer.ticketmaster.com). Cache de 3 h por cidade.
 */
import type { Hobby } from "./explore";

export type CityEvent = {
  id: string; name: string; url: string; start: string; localDate: string; localTime: string | null;
  kind: "music" | "sport" | "arts" | "family" | "film" | "other"; venue: string | null; lat: number | null; lng: number | null;
  image: string | null; priceMin: number | null; currency: string | null;
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
  priceRanges?: { min?: number; currency?: string }[];
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
    const key = `${e.name.toLowerCase()}|${d.localDate}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const v = e._embedded?.venues?.[0];
    const imgs = (e.images ?? []).filter((i) => i.ratio === "16_9" && i.width >= 500).sort((a, b) => a.width - b.width);
    const c = e.classifications?.[0];
    const lat = Number(v?.location?.latitude), lng = Number(v?.location?.longitude);
    out.push({
      id: e.id, name: e.name, url: e.url, start: d.dateTime ?? `${d.localDate}T${d.localTime ?? "00:00:00"}`, localDate: d.localDate, localTime: d.localTime?.slice(0, 5) ?? null,
      kind: kindOf(c?.segment?.name, c?.genre?.name), venue: v?.name ?? null, lat: Number.isFinite(lat) ? lat : null, lng: Number.isFinite(lng) ? lng : null,
      image: imgs[0]?.url ?? e.images?.[0]?.url ?? null, priceMin: e.priceRanges?.[0]?.min ?? null, currency: e.priceRanges?.[0]?.currency ?? null
    });
  }
  return out;
}

const cache = new Map<string, { at: number; events: CityEvent[] }>();

export async function eventsNear(cityId: string, center: { lat: number; lng: number }, days = 14): Promise<CityEvent[] | null> {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) return null;
  const hit = cache.get(cityId);
  if (hit && Date.now() - hit.at < 3 * 3600_000) return hit.events;
  const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
  const q = new URLSearchParams({
    apikey: key, latlong: `${center.lat.toFixed(4)},${center.lng.toFixed(4)}`, radius: "30", unit: "km",
    startDateTime: iso(new Date()), endDateTime: iso(new Date(Date.now() + days * 86400_000)), size: "80", sort: "date,asc", locale: "*"
  });
  try {
    const r = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${q}`, { signal: AbortSignal.timeout(12_000) });
    if (!r.ok) return hit?.events ?? null;
    const events = parseTicketmaster(await r.json());
    cache.set(cityId, { at: Date.now(), events });
    return events;
  } catch { return hit?.events ?? null; }
}
