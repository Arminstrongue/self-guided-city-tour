import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { reportUpdate } from "@/lib/updates";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "updates-report", 10)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = z.object({ reason: z.enum(["false", "offensive", "spam", "danger", "privacy", "other"]), note: z.string().max(300).default("") }).safeParse(await req.json().catch(() => null));
  if (!/^[0-9a-f-]{36}$/.test(id) || !v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = await reportUpdate(id, me, v.data.reason, v.data.note);
  if ("error" in r) return NextResponse.json(r, { status: 404 });
  return NextResponse.json(r);
}
