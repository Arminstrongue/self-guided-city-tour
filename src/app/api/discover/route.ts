import { NextResponse } from "next/server";
import { hasCityAccess } from "@/lib/city-access";
import { discoverFor } from "@/lib/discover";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lugares, ruas e passeios extra de uma cidade: conteúdo pago, só com acesso à cidade. */
export async function GET(req: Request) {
  const city = new URL(req.url).searchParams.get("city") ?? "";
  const d = await discoverFor(city);
  if (!d) return NextResponse.json({ none: true }, { status: 404 });
  if (!(await hasCityAccess(city).catch(() => false))) return NextResponse.json({ error: "locked" }, { status: 402 });
  return NextResponse.json(d, { headers: { "Cache-Control": "private, max-age=600" } });
}
