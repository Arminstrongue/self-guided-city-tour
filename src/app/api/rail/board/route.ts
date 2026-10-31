import { NextResponse } from "next/server";
import { departures, railLiveEnabled } from "@/lib/rail-live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const CRS = /^[A-Z]{3}$/;

/** Painel em tempo real de uma estação (só dados públicos da National Rail; a chave nunca sai do servidor). */
export async function GET(req: Request) {
  if (!railLiveEnabled()) return NextResponse.json({ off: true }, { status: 503 });
  const u = new URL(req.url);
  const crs = (u.searchParams.get("crs") ?? "").toUpperCase(), to = (u.searchParams.get("to") ?? "").toUpperCase();
  if (!CRS.test(crs) || (to && !CRS.test(to))) return NextResponse.json({ error: "crs" }, { status: 400 });
  const { board } = await departures(crs, to || null);
  if (!board) return NextResponse.json({ error: "unavailable" }, { status: 502 });
  return NextResponse.json(board, { headers: { "Cache-Control": "public, max-age=20" } });
}
