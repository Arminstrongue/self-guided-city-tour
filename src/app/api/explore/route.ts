import { NextResponse } from "next/server";
import { hasCityAccess } from "@/lib/city-access";
import { loadCity } from "@/lib/content";
import { cityCenter, COMMERCIAL_CATS, placesFor } from "@/lib/explore";
import { eventsEnabled, eventsNear } from "@/lib/events";
import { googleExploreEnabled, googlePlacesFor } from "@/lib/gexplore";
import { isLocale } from "@/i18n/core";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Lugares (OpenStreetMap) e eventos (Ticketmaster) de uma cidade. Público e em cache. */
export async function GET(req: Request) {
  if (!rateLimit(req, "explore", 30)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const u = new URL(req.url);
  const city = await loadCity(u.searchParams.get("city") ?? "");
  if (!city) return NextResponse.json({ error: "city" }, { status: 404 });
  // Lugares e eventos só com passe da cidade.
  if (!(await hasCityAccess(city.id))) return NextResponse.json({ error: "locked" }, { status: 402, headers: { "Cache-Control": "private, no-store" } });
  const l = u.searchParams.get("locale") ?? "en";
  const lang = isLocale(l) ? l : "en";
  // Google Places quando há chave (fotos, avaliações, horário); OpenStreetMap como reserva.
  const google = googleExploreEnabled();
  const [gp, events] = await Promise.all([google ? googlePlacesFor(city, lang).catch(() => null) : Promise.resolve(null), eventsNear(city.id, cityCenter(city), 30)]);
  const places = ((gp ?? (await placesFor(city, lang))) ?? []).filter((p) => !COMMERCIAL_CATS.has(p.cat));
  return NextResponse.json({ places, events, eventsEnabled: eventsEnabled(), source: gp ? "google" : "osm" }, { headers: { "Cache-Control": gp ? "private, no-store" : "private, max-age=600" } });
}
