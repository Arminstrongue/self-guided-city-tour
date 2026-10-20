import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { unreadCount } from "@/lib/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Número de conversas com mensagens por ler (para o selo na carteira). */
export async function GET() {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ n: 0 });
  return NextResponse.json({ n: await unreadCount(me) }, { headers: { "Cache-Control": "no-store" } });
}
