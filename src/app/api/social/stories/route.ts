import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { stories } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Histórias ativas (24 h): as minhas e as de quem sigo, ou só as de um @nome. */
export async function GET(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const h = new URL(req.url).searchParams.get("handle");
  return NextResponse.json(await stories(me, h ?? undefined));
}
