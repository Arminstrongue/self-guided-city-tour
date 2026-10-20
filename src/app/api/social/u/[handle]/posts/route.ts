import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { userPosts } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { handle: string } }) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const r = await userPosts(me, params.handle, new URL(req.url).searchParams.get("before"));
  return r ? NextResponse.json(r) : NextResponse.json({ error: "hidden" }, { status: 403 });
}
