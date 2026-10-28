import { NextResponse } from "next/server";
import { isLocale } from "@/i18n/core";
import { rateLimit } from "@/lib/rate-limit";
import { placeInfo } from "@/lib/place-info";

export const runtime = "nodejs";

/** GET /api/place-info?name=&lat=&lng=&locale=[&wiki=en:Title] — resumo da Wikipédia sobre um lugar (para a ficha do lugar). */
export async function GET(req: Request) {
  if (!rateLimit(req, "place-info", 40)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const q = new URL(req.url).searchParams;
  const name = (q.get("name") ?? "").trim().slice(0, 120);
  const lat = Number(q.get("lat")), lng = Number(q.get("lng"));
  const l = q.get("locale") ?? "en";
  const wiki = q.get("wiki") ?? undefined;
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const info = await placeInfo({ name, lat, lng, lang: isLocale(l) ? l : "en", wiki: wiki && /^[a-z]{2,3}:.{1,200}$/.test(wiki) ? wiki : undefined });
  return NextResponse.json({ info }, { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } });
}
