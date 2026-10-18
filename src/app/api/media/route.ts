import { NextResponse } from "next/server";
import { loadCity } from "@/lib/content";
import { rateLimit } from "@/lib/rate-limit";
import { isLocale } from "@/i18n/dictionaries";
import { cityName } from "@/data/cities";
import { stopName } from "@/data/stop-names";
import { cityCover, searchNames, stopMedia, wikiPhotos, type Photo } from "@/lib/media";

export const dynamic = "force-dynamic";

/**
 * GET /api/media?city=lis&stop=rossio&locale=pt — fotos, nota e avaliações de uma paragem.
 * GET /api/media?city=lis[&cover=1] — capa da cidade e uma foto por paragem (para cartões e galerias).
 */
export async function GET(req: Request) {
  if (!rateLimit(req, "media", 120)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const q = new URL(req.url).searchParams;
  const city = await loadCity(q.get("city") ?? "");
  if (!city) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const l = q.get("locale") ?? "en";
  const lang = isLocale(l) ? l : "en";
  const cityEn = cityName(city, "en");
  const sid = q.get("stop");
  try {
    if (sid) {
      const s = city.stops.find((x) => x.id === sid);
      if (!s) return NextResponse.json({ error: "invalid" }, { status: 400 });
      const m = await stopMedia({ names: searchNames(stopName(s, "en")), city: cityEn, lat: s.lat, lng: s.lng, lang });
      return NextResponse.json(m, { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
    }
    // ?cover=1 (página inicial): só a fotografia do monumento emblemático da cidade.
    const coverPhotos = await cityCover(city.id, cityEn);
    if (q.get("cover")) return NextResponse.json({ cover: coverPhotos, stops: {} }, { headers: { "Cache-Control": coverPhotos.length ? "public, max-age=3600, stale-while-revalidate=86400" : "no-store" } });
    // Uma foto por paragem; a capa junta o monumento emblemático e as paragens mais famosas.
    const ordered = [...city.stops].sort((a, b) => Number(Boolean(b.top)) - Number(Boolean(a.top)));
    const res = await Promise.all(ordered.map(async (s) => {
      const w = await wikiPhotos(searchNames(stopName(s, "en")), cityEn).catch(() => ({ photos: [] as Photo[] }));
      return [s.id, w.photos[0] ?? null] as const;
    }));
    const stops = Object.fromEntries(res);
    const cover = [...coverPhotos.slice(0, 2), ...res.map(([, p]) => p).filter((p): p is Photo => Boolean(p))].slice(0, 6);
    return NextResponse.json({ cover, stops }, { headers: { "Cache-Control": cover.length ? "public, max-age=3600, stale-while-revalidate=86400" : "no-store" } });
  } catch (e) {
    console.error("media", e);
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}
