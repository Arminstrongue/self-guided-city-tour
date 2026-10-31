import { NextResponse } from "next/server";
import { departures, railLiveEnabled } from "@/lib/rail-live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Para confirmar a ligação depois de pôr a chave no servidor: configurada? responde? (sem mostrar a chave). */
export async function GET() {
  if (!railLiveEnabled()) return NextResponse.json({ configured: false });
  const { board, http } = await departures("MAN");
  return NextResponse.json({ configured: true, ok: Boolean(board), http, services: board?.services.length ?? 0, messages: board?.messages.length ?? 0 }, { headers: { "Cache-Control": "no-store" } });
}
