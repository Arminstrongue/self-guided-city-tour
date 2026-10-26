import { NextResponse } from "next/server";
import { submitMerchantReview } from "@/lib/merchant-reviews";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Avaliação verificada de um negócio (link assinado do email, só depois da visita confirmada). */
export async function POST(req: Request) {
  if (!rateLimit(req, "merchant-review", 10)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const r = await submitMerchantReview(String(b.bookingId ?? ""), String(b.token ?? ""), Number(b.stars), typeof b.comment === "string" ? b.comment : null);
  return NextResponse.json(r, { status: "error" in r ? 400 : 200 });
}
