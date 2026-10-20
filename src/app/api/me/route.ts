import { NextResponse } from "next/server";
import { currentTraveller, walletFor } from "@/lib/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A carteira do viajante com sessão (passes, reservas, memórias, interesses). */
export async function GET() {
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json(await walletFor(email), { headers: { "Cache-Control": "no-store" } });
}
