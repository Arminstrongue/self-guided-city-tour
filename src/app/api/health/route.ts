import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Verificação de saúde para o balanceador e a monitorização (Uptime Kuma, etc.). */
export async function GET() {
  try {
    const d = await db();
    await d.execute(sql`select 1`);
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
