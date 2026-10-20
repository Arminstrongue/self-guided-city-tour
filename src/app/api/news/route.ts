import { NextResponse } from "next/server";
import { safetyNews } from "@/lib/news";

export const runtime = "nodejs";
export async function GET(req: Request) {
  const u = new URL(req.url);
  const city = (u.searchParams.get("city") ?? "").slice(0, 8) || null;
  const locale = (u.searchParams.get("locale") ?? "en").slice(0, 5);
  const r = await safetyNews(city, locale).catch(() => ({ items: [], city }));
  return NextResponse.json(r, { headers: { "Cache-Control": "public, max-age=300, s-maxage=900" } });
}
