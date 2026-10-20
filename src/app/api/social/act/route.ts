import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { answerRequest, block, follow, report, unblock, unfollow } from "@/lib/social";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
const Body = z.object({
  handle: z.string().trim().toLowerCase().max(24),
  action: z.enum(["follow", "unfollow", "accept", "decline", "remove", "block", "unblock", "report"]),
  reason: z.enum(["spam", "fake", "harassment", "inappropriate", "safety", "other"]).optional(),
  note: z.string().max(500).optional()
});

/** Seguir, deixar de seguir, responder a pedidos, bloquear e denunciar. */
export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "social-act", 60)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { handle, action } = v.data;
  if (action === "follow") {
    const r = await follow(me, handle);
    if (r === "no_profile") return NextResponse.json({ error: "no_profile" }, { status: 409 });
    if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ relation: r === "accepted" ? "following" : "requested" });
  }
  if (action === "unfollow") await unfollow(me, handle);
  if (action === "accept" || action === "decline" || action === "remove") await answerRequest(me, handle, action === "accept");
  if (action === "block") await block(me, handle);
  if (action === "unblock") await unblock(me, handle);
  if (action === "report") await report(me, handle, v.data.reason ?? "other", v.data.note ?? "");
  return NextResponse.json({ ok: true });
}
