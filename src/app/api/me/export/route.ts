import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { exportData } from "@/lib/account";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Descarregar os meus dados (JSON). */
export async function GET(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "export", 5)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const data = await exportData(me);
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="self-guided-city-tour-data-${new Date().toISOString().slice(0, 10)}.json"`, "Cache-Control": "no-store" }
  });
}
