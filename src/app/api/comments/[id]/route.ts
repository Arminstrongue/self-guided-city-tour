import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { deleteComment, reportComment } from "@/lib/place-comments";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
const isId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!isId(params.id)) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: await deleteComment(me, params.id) });
}

const Body = z.object({ reason: z.enum(["spam", "fake", "harassment", "inappropriate", "safety", "other"]).default("other") });
/** Denunciar um comentário. */
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!isId(params.id)) return NextResponse.json({ ok: false }, { status: 404 });
  if (!rateLimit(req, "comments-report", 30)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = Body.safeParse(await req.json().catch(() => ({})));
  return NextResponse.json({ ok: await reportComment(me, params.id, v.success ? v.data.reason : "other") });
}
