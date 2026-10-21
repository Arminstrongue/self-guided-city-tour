import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { myScore, PTS, LEVEL_AT, BADGES } from "@/lib/points";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Os meus pontos, nível, medalhas e prémios (e os novos prémios atingidos agora). */
export async function GET() {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json({ ...(await myScore(me)), rules: PTS, levels: LEVEL_AT, allBadges: BADGES });
}
