import { NextResponse } from "next/server";
import { loadCity } from "@/lib/content";
import { bestEats, placesEnabled } from "@/lib/places";
import { rateLimit } from "@/lib/rate-limit";
import { isLocale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

/** GET /api/eat?city=lis&stop=rossio&locale=pt — melhores avaliados e mais baratos perto da paragem. */
export async function GET(req: Request) {
  if (!placesEnabled()) return NextResponse.json({ error: "disabled" }, { status: 501 });
  if (!rateLimit(req, "eat", 40)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const q = new URL(req.url).searchParams;
  const city = await loadCity(q.get("city") ?? "");
  const stop = city?.stops.find((s) => s.id === q.get("stop"));
  if (!city || !stop) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const l = q.get("locale") ?? "en";
  try {
    return NextResponse.json({ places: await bestEats(stop.lat, stop.lng, isLocale(l) ? l : "en") }, { headers: { "Cache-Control": "private, max-age=1800" } });
  } catch (e) {
    console.error("eat", e);
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}
