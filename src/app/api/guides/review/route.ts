import { NextResponse } from "next/server";
import { submitReview } from "@/lib/guides";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!rateLimit(req, "guide-review", 10)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const r = await submitReview(String(b.bookingId ?? ""), String(b.token ?? ""), Number(b.stars), typeof b.comment === "string" ? b.comment : null);
  return NextResponse.json(r, { status: "error" in r ? 400 : 200 });
}
