import { NextResponse } from "next/server";
import { loadCity } from "@/lib/content";
import { cityCenter } from "@/lib/explore";
import { eventsEnabled, eventsNear } from "@/lib/events";
import { rateLimit } from "@/lib/rate-limit";
import { isEvent, track } from "@/lib/metrics";

export const runtime = "nodejs";

/** Agenda de eventos de uma cidade (Ticketmaster), para ver dentro da app. */
export async function GET(req: Request) {
  if (!rateLimit(req, "events", 30)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const city = await loadCity(new URL(req.url).searchParams.get("city") ?? "");
  if (!city) return NextResponse.json({ error: "city" }, { status: 404 });
  const events = await eventsNear(city.id, cityCenter(city), 30);
  return NextResponse.json({ events: events ?? [], enabled: eventsEnabled() }, { headers: { "Cache-Control": "public, max-age=600, s-maxage=1800" } });
}

/** Regista um evento anónimo do funil (sem cookies nem dados pessoais). Partilha o endereço com a agenda (GET). */
export async function POST(req: Request) {
  if (!rateLimit(req, "events-post", 120)) return new NextResponse(null, { status: 204 });
  let b: Record<string, unknown> = {};
  try { b = JSON.parse(await req.text()); } catch { /* sendBeacon pode chegar vazio */ }
  if (!isEvent(b.name)) return NextResponse.json({ error: "event" }, { status: 400 });
  try { await track({ name: b.name, city: b.city, stop: b.stop, locale: b.locale, ref: b.ref, platform: b.platform }); } catch (e) { console.error("events", e); }
  return new NextResponse(null, { status: 204 });
}
