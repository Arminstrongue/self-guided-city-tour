import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Só diz se há sessão (sem dados pessoais), para o ecrã de boas-vindas. */
export async function GET() {
  const email = await currentTraveller();
  return NextResponse.json({ signed: Boolean(email) }, { headers: { "Cache-Control": "no-store" } });
}
