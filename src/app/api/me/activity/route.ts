import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { myActivity } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A sua atividade: gostos e comentários. */
export async function GET() {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json(await myActivity(me));
}
