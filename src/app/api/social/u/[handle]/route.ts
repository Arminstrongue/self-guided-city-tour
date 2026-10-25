import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { viewProfile } from "@/lib/social";

export const runtime = "nodejs";
export async function GET(_req: Request, props: { params: Promise<{ handle: string }> }) {
  const params = await props.params;
  const v = await viewProfile(await currentTraveller(), params.handle);
  if (!v) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(v, { headers: { "Cache-Control": "no-store" } });
}
