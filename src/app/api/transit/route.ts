import { NextResponse } from "next/server";
import { takeGoogle } from "@/lib/gbudget";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Próximas ligações em transportes públicos entre dois pontos (Google Routes, modo TRANSIT):
 * linhas, hora de partida e chegada, duração e preço quando o operador o publica.
 */
export type TransitLine = { name: string; vehicle: string; color: string; from: string; to: string; headsign: string; dep: string; stops: number };
export type TransitOption = { dep: string; arr: string; min: number; fare: string; walkMin: number; lines: TransitLine[] };
const cache = new Map<string, { at: number; out: TransitOption[] }>();
const pt = (s: string | null) => { const [a, b] = (s ?? "").split(",").map(Number); return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180 ? { latitude: a, longitude: b } : null; };
const secs = (d?: string) => Math.round(Number((d ?? "0s").replace("s", "")) / 60);

type Step = { travelMode?: string; staticDuration?: string; transitDetails?: { stopDetails?: { departureStop?: { name?: string }; arrivalStop?: { name?: string }; departureTime?: string; arrivalTime?: string }; headsign?: string; stopCount?: number; transitLine?: { nameShort?: string; name?: string; color?: string; vehicle?: { type?: string } } } };
type Route = { duration?: string; legs?: { steps?: Step[] }[]; travelAdvisory?: { transitFare?: { currencyCode?: string; units?: string; nanos?: number } }; localizedValues?: { transitFare?: { text?: string } } };

export async function GET(req: Request) {
  if (!rateLimit(req, "transit", 20)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const u = new URL(req.url);
  const from = pt(u.searchParams.get("from")), to = pt(u.searchParams.get("to"));
  const lang = (u.searchParams.get("lang") ?? "en").slice(0, 5);
  if (!from || !to) return NextResponse.json({ options: [] }, { status: 400 });
  const key = `${from.latitude.toFixed(4)},${from.longitude.toFixed(4)}|${to.latitude.toFixed(4)},${to.longitude.toFixed(4)}|${lang}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 3 * 60_000) return NextResponse.json({ options: hit.out });
  if (!process.env.GOOGLE_PLACES_API_KEY || !takeGoogle("search")) return NextResponse.json({ options: [], off: true });
  let out: TransitOption[] = [];
  try {
    const r = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.legs.steps.travelMode,routes.legs.steps.staticDuration,routes.legs.steps.transitDetails,routes.travelAdvisory.transitFare,routes.localizedValues.transitFare"
      },
      body: JSON.stringify({ origin: { location: { latLng: from } }, destination: { location: { latLng: to } }, travelMode: "TRANSIT", computeAlternativeRoutes: true, languageCode: lang, departureTime: new Date(Date.now() + 60_000).toISOString() }),
      signal: AbortSignal.timeout(9000), cache: "no-store"
    });
    if (r.ok) {
      const j = (await r.json()) as { routes?: Route[] };
      out = (j.routes ?? []).map((rt) => {
        const steps = rt.legs?.flatMap((l) => l.steps ?? []) ?? [];
        const lines: TransitLine[] = steps.filter((s) => s.transitDetails).map((s) => {
          const d = s.transitDetails!;
          return { name: d.transitLine?.nameShort || d.transitLine?.name || "", vehicle: (d.transitLine?.vehicle?.type ?? "BUS").toLowerCase(), color: d.transitLine?.color ?? "", from: d.stopDetails?.departureStop?.name ?? "", to: d.stopDetails?.arrivalStop?.name ?? "", headsign: d.headsign ?? "", dep: d.stopDetails?.departureTime ?? "", stops: d.stopCount ?? 0 };
        });
        const tr = steps.filter((s) => s.transitDetails);
        return {
          dep: tr[0]?.transitDetails?.stopDetails?.departureTime ?? "", arr: tr[tr.length - 1]?.transitDetails?.stopDetails?.arrivalTime ?? "",
          min: secs(rt.duration), fare: rt.localizedValues?.transitFare?.text ?? "",
          walkMin: steps.filter((s) => s.travelMode === "WALK").reduce((a, s) => a + secs(s.staticDuration), 0), lines
        };
      }).filter((o) => o.lines.length).sort((a, b) => a.dep.localeCompare(b.dep)).slice(0, 4);
    } else console.warn("[transit]", r.status, (await r.text()).slice(0, 200));
  } catch { /* sem dados */ }
  cache.set(key, { at: Date.now(), out }); if (cache.size > 3000) cache.delete(cache.keys().next().value as string); // memória limitada
  return NextResponse.json({ options: out });
}
