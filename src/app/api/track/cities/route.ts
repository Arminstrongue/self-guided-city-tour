import { NextResponse } from "next/server";
import { loadCities } from "@/lib/content";
import { cityCenterOf } from "@/lib/city-center";
import { stopName } from "@/data/stop-names";
import { cityName } from "@/data/cities";
import { isLocale } from "@/i18n/core";

/** Dados mínimos para detetar cidade e paragens no telemóvel (centro e paragens de cada cidade). */
export async function GET(req: Request) {
  const l0 = new URL(req.url).searchParams.get("lang") ?? "en";
  const l = isLocale(l0) ? l0 : "en";
  const out = (await loadCities()).map((c) => {
    const ctr = cityCenterOf(c);
    return { id: c.id, n: cityName(c, l), lat: +ctr.lat.toFixed(4), lng: +ctr.lng.toFixed(4), s: c.stops.map((s) => [s.id, stopName(s, l), +s.lat.toFixed(5), +s.lng.toFixed(5)]) };
  });
  return NextResponse.json(out, { headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } });
}
