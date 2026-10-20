import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { tagPosts } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Publicações com uma #hashtag. */
export async function GET(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const u = new URL(req.url);
  return NextResponse.json(await tagPosts(me, u.searchParams.get("t") ?? "", u.searchParams.get("before")));
}
