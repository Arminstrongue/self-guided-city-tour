import { NextResponse } from "next/server";
import { takeGoogle } from "@/lib/gbudget";
import { rateLimit } from "@/lib/rate-limit";
import { mergeWalks, type GuideStep } from "@/lib/route-steps";

export const dynamic = "force-dynamic";

/**
 * Percurso passo a passo (Google Routes): a pé e em transportes públicos, com a instrução de cada passo,
 * distância, tempo, linha, sentido, paragem de entrada e de saída. Serve o modo "Ajude-me a orientar-me".
 */
type RStep = {
  travelMode?: string; distanceMeters?: number; staticDuration?: string; navigationInstruction?: { instructions?: string };
  transitDetails?: { stopDetails?: { departureStop?: { name?: string }; arrivalStop?: { name?: string }; departureTime?: string }; headsign?: string; stopCount?: number; transitLine?: { nameShort?: string; name?: string; color?: string; vehicle?: { type?: string; name?: { text?: string } } } };
};
const cache = new Map<string, { at: number; out: unknown }>();
const pt = (s: string | null) => { const [a, b] = (s ?? "").split(",").map(Number); return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a) <= 90 && Math.abs(b) <= 180 ? { latitude: a, longitude: b } : null; };
const mins = (d?: string) => Math.max(1, Math.round(Number((d ?? "0s").replace("s", "")) / 60));

export async function GET(req: Request) {
  if (!rateLimit(req, "route-steps", 30)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const u = new URL(req.url);
  const from = pt(u.searchParams.get("from")), to = pt(u.searchParams.get("to"));
  const lang = (u.searchParams.get("lang") ?? "en").slice(0, 5);
  const walkOnly = u.searchParams.get("mode") === "walk";
  if (!from || !to) return NextResponse.json({ steps: [] }, { status: 400 });
  const key = `${from.latitude.toFixed(4)},${from.longitude.toFixed(4)}|${to.latitude.toFixed(4)},${to.longitude.toFixed(4)}|${lang}|${walkOnly}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 5 * 60_000) return NextResponse.json(hit.out);
  if (!process.env.GOOGLE_PLACES_API_KEY || !takeGoogle("search")) return NextResponse.json({ steps: [], off: true });
  let out: { steps: GuideStep[]; min: number; fare: string } = { steps: [], min: 0, fare: "" };
  try {
    const r = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.legs.steps.travelMode,routes.legs.steps.distanceMeters,routes.legs.steps.staticDuration,routes.legs.steps.navigationInstruction,routes.legs.steps.transitDetails,routes.localizedValues.transitFare"
      },
      body: JSON.stringify({ origin: { location: { latLng: from } }, destination: { location: { latLng: to } }, travelMode: walkOnly ? "WALK" : "TRANSIT", languageCode: lang,
        ...(walkOnly ? {} : { transitPreferences: { routingPreference: "FEWER_TRANSFERS" }, departureTime: new Date(Date.now() + 60_000).toISOString() }) }),
      signal: AbortSignal.timeout(9000), cache: "no-store"
    });
    if (r.ok) {
      const j = (await r.json()) as { routes?: { duration?: string; legs?: { steps?: RStep[] }[]; localizedValues?: { transitFare?: { text?: string } } }[] };
      const rt = j.routes?.[0];
      const raw = rt?.legs?.flatMap((l) => l.steps ?? []) ?? [];
      const steps: GuideStep[] = raw.map((s) => s.transitDetails ? {
        k: "transit" as const, vehicle: (s.transitDetails.transitLine?.vehicle?.type ?? "BUS").toLowerCase(),
        line: s.transitDetails.transitLine?.nameShort || s.transitDetails.transitLine?.name || s.transitDetails.transitLine?.vehicle?.name?.text || "",
        color: s.transitDetails.transitLine?.color ?? "", headsign: s.transitDetails.headsign ?? "",
        from: s.transitDetails.stopDetails?.departureStop?.name ?? "", to: s.transitDetails.stopDetails?.arrivalStop?.name ?? "",
        stops: s.transitDetails.stopCount ?? 0, min: mins(s.staticDuration), dep: s.transitDetails.stopDetails?.departureTime ?? ""
      } : { k: "walk" as const, text: s.navigationInstruction?.instructions ?? "", m: s.distanceMeters ?? 0, min: mins(s.staticDuration) });
      out = { steps: mergeWalks(steps).filter((s) => s.k === "transit" || s.m > 15), min: mins(rt?.duration), fare: rt?.localizedValues?.transitFare?.text ?? "" };
    } else console.warn("[route-steps]", r.status, (await r.text()).slice(0, 200));
  } catch { /* sem dados */ }
  cache.set(key, { at: Date.now(), out }); if (cache.size > 3000) cache.delete(cache.keys().next().value as string); // memória limitada
  return NextResponse.json(out);
}
