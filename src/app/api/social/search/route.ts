import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { myProfile, search } from "@/lib/social";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export async function GET(req: Request) {
  if (!rateLimit(req, "people", 60)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const mine = await myProfile(me);
  const q = (new URL(req.url).searchParams.get("q") ?? "").slice(0, 40);
  return NextResponse.json({ people: await search(me, q, mine?.cities ?? []) }, { headers: { "Cache-Control": "no-store" } });
}
