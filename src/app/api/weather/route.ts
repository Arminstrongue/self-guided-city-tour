import { NextResponse } from "next/server";
import { loadCity } from "@/lib/content";
import { weatherFor } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("city") ?? "";
  const city = await loadCity(id);
  if (!city) return NextResponse.json({ error: "unknown_city" }, { status: 400 });
  const s = city.stops[0];
  const w = await weatherFor(s.lat, s.lng, city.tz ?? "Europe/Lisbon");
  if (!w) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  return NextResponse.json(w, { headers: { "Cache-Control": "public, max-age=900" } });
}
