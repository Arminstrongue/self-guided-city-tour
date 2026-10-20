import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { addComment, comments, deleteComment, getPost, like, removePost, reportPost, save } from "@/lib/posts";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Uma publicação com os comentários. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const [p, c] = await Promise.all([getPost(me, params.id), comments(me, params.id)]);
  if (!p || !c) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ...p, ...c });
}

const Body = z.object({
  action: z.enum(["like", "unlike", "comment", "uncomment", "delete", "report", "save", "unsave"]),
  text: z.string().trim().min(1).max(300).optional(),
  commentId: z.string().max(40).optional(),
  reason: z.enum(["spam", "fake", "harassment", "inappropriate", "safety", "other"]).optional(),
  note: z.string().max(500).optional()
});

/** Gostar, comentar, apagar e denunciar. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { action } = v.data;
  if (!rateLimit(req, action === "comment" ? "social-comment" : "social-like", action === "comment" ? 40 : 200)) return NextResponse.json({ error: "rate" }, { status: 429 });
  if (action === "like" || action === "unlike") {
    const r = await like(me, params.id, action === "like");
    return r ? NextResponse.json(r) : NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (action === "save" || action === "unsave") {
    const r = await save(me, params.id, action === "save");
    return r ? NextResponse.json(r) : NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (action === "comment") {
    if (!v.data.text) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const r = await addComment(me, params.id, v.data.text);
    return "error" in r ? NextResponse.json(r, { status: r.error === "not_found" ? 404 : 403 }) : NextResponse.json(r);
  }
  if (action === "uncomment" && v.data.commentId) await deleteComment(me, v.data.commentId);
  if (action === "delete") await removePost(params.id, me);
  if (action === "report") await reportPost(me, params.id, v.data.reason ?? "other", v.data.note ?? "");
  return NextResponse.json({ ok: true });
}
