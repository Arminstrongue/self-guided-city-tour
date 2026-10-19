import { NextResponse } from "next/server";
import { loadCity } from "@/lib/content";
import { cityCenter, placesFor } from "@/lib/explore";
import { eventsEnabled, eventsNear } from "@/lib/events";
import { isLocale } from "@/i18n/dictionaries";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Lugares (OpenStreetMap) e eventos (Ticketmaster) de uma cidade. Público e em cache. */
export async function GET(req: Request) {
  if (!rateLimit(req, "explore", 30)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const u = new URL(req.url);
  const city = await loadCity(u.searchParams.get("city") ?? "");
  if (!city) return NextResponse.json({ error: "city" }, { status: 404 });
  const l = u.searchParams.get("locale") ?? "en";
  const [places, events] = await Promise.all([placesFor(city, isLocale(l) ? l : "en"), eventsNear(city.id, cityCenter(city))]);
  return NextResponse.json({ places, events, eventsEnabled: eventsEnabled() }, { headers: { "Cache-Control": "public, max-age=600, s-maxage=3600" } });
}
