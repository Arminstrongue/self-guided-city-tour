import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { userPosts } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { handle: string } }) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const q = new URL(req.url).searchParams;
  const r = await userPosts(me, params.handle, q.get("before"), q.get("archive") === "1");
  return r ? NextResponse.json(r) : NextResponse.json({ error: "hidden" }, { status: 403 });
}
