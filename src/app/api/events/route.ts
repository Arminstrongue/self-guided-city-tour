import { NextResponse } from "next/server";
import { loadCity } from "@/lib/content";
import { cityCenter } from "@/lib/explore";
import { eventsEnabled, eventsNear } from "@/lib/events";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Agenda de eventos de uma cidade (Ticketmaster), para ver dentro da app. */
export async function GET(req: Request) {
  if (!rateLimit(req, "events", 30)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const city = await loadCity(new URL(req.url).searchParams.get("city") ?? "");
  if (!city) return NextResponse.json({ error: "city" }, { status: 404 });
  const events = await eventsNear(city.id, cityCenter(city), 30);
  return NextResponse.json({ events: events ?? [], enabled: eventsEnabled() }, { headers: { "Cache-Control": "public, max-age=600, s-maxage=1800" } });
}
