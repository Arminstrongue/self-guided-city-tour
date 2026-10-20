import { NextResponse } from "next/server";
import { getRates } from "@/lib/fx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Taxas do dia (1 EUR = X) para o conversor; a app guarda a última cópia para funcionar sem rede. */
export async function GET() {
  const { rates, date } = await getRates();
  return NextResponse.json({ rates, date }, { headers: { "Cache-Control": "public, max-age=3600" } });
}
