import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { leaderboard } from "@/lib/points";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Ranking: ?scope=friends|global&period=all|month */
export async function GET(req: Request) {
  if (!rateLimit(req, "leaderboard", 60)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const u = new URL(req.url);
  const scope = u.searchParams.get("scope") === "global" ? "global" : "friends";
  const period = u.searchParams.get("period") === "month" ? "month" : "all";
  return NextResponse.json(await leaderboard(me, scope, period), { headers: { "Cache-Control": "no-store" } });
}
