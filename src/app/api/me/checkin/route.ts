import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { checkIn, myCheckins, undoCheckIn } from "@/lib/points";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const city = new URL(req.url).searchParams.get("city") ?? "";
  return NextResponse.json({ checkins: /^[a-z]{2,12}$/.test(city) ? await myCheckins(me, city) : [] });
}

const Body = z.object({
  city: z.string().regex(/^[a-z]{2,12}$/), stop: z.string().regex(/^[a-z0-9-]{0,40}$/).default(""),
  lat: z.number().min(-90).max(90).optional(), lng: z.number().min(-180).max(180).optional(), undo: z.boolean().optional()
});
/** Marcar (ou desmarcar) uma paragem/cidade como visitada. Com a posição GPS, conta como confirmada e vale o dobro. */
export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "checkin", 120)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { city, stop, lat, lng, undo } = v.data;
  if (undo) { await undoCheckIn(me, city, stop); return NextResponse.json({ ok: true }); }
  const r = await checkIn(me, city, stop, lat !== undefined && lng !== undefined ? { lat, lng } : null);
  return "error" in r ? NextResponse.json(r, { status: 400 }) : NextResponse.json(r);
}
