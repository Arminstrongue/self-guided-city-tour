import { NextResponse } from "next/server";
import { departures, railLiveEnabled } from "@/lib/rail-live";
import { rateLimit } from "@/lib/rate-limit";
import { KNOWN_CRS } from "@/data/crs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const CRS = /^[A-Z]{3}$/;

/** Painel em tempo real de uma estação (só dados públicos da National Rail; a chave nunca sai do servidor). */
export async function GET(req: Request) {
  if (!railLiveEnabled()) return NextResponse.json({ off: true }, { status: 503 });
  const u = new URL(req.url);
  const crs = (u.searchParams.get("crs") ?? "").toUpperCase(), to = (u.searchParams.get("to") ?? "").toUpperCase();
  // Só estações que a VOYBU usa (evita gastar a quota da chave com códigos ao calhas) e um limite por IP.
  if (!CRS.test(crs) || (to && !CRS.test(to)) || !KNOWN_CRS.has(crs) || (to && !KNOWN_CRS.has(to))) return NextResponse.json({ error: "crs" }, { status: 400 });
  if (!rateLimit(req, "rail-board", 60)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const { board } = await departures(crs, to || null);
  if (!board) return NextResponse.json({ error: "unavailable" }, { status: 502 });
  return NextResponse.json(board, { headers: { "Cache-Control": "public, max-age=20" } });
}
