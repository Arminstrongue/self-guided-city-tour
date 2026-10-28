import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { voteUpdate } from "@/lib/updates";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** "Ainda está" (1) / "já não está" (-1). */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "updates-vote", 30)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = z.object({ v: z.union([z.literal(1), z.literal(-1)]) }).safeParse(await req.json().catch(() => null));
  if (!/^[0-9a-f-]{36}$/.test(id) || !v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = await voteUpdate(id, me, v.data.v);
  if ("error" in r) return NextResponse.json(r, { status: r.error === "own" ? 409 : 404 });
  return NextResponse.json(r);
}
