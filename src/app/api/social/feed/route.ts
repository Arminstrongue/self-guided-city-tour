import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { feedCity, feedFollowing } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Feed: "following" (quem sigo) ou "city" (uma cidade). Paginado por data. */
export async function GET(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const u = new URL(req.url);
  const city = u.searchParams.get("city");
  const before = u.searchParams.get("before");
  if (city && !/^[a-z]{2,12}$/.test(city)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  return NextResponse.json(city ? await feedCity(me, city, before) : await feedFollowing(me, before));
}
