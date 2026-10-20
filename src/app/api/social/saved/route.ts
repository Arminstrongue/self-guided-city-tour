import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { savedPosts } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** As minhas publicações guardadas. */
export async function GET(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json(await savedPosts(me, new URL(req.url).searchParams.get("before")));
}
