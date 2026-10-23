import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { addComment, comments, deleteComment, editPost, getPost, hidePost, like, managePost, muteAuthorOf, removePost, reportPost, save, storyViewers, viewStory } from "@/lib/posts";
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
  action: z.enum(["like", "unlike", "comment", "uncomment", "delete", "report", "save", "unsave", "view", "viewers",
    "archive", "unarchive", "pin", "unpin", "hidelikes", "showlikes", "commentsoff", "commentson", "edit", "hide", "unhide", "mute", "unmute"]),
  text: z.string().trim().max(2200).optional(),
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
  if (!rateLimit(req, action === "comment" ? "social-comment" : action === "view" || action === "viewers" ? "story-view" : "social-like", action === "comment" ? 40 : action === "view" || action === "viewers" ? 900 : 200)) return NextResponse.json({ error: "rate" }, { status: 429 });
  if (action === "archive" || action === "unarchive" || action === "pin" || action === "unpin" || action === "hidelikes" || action === "showlikes" || action === "commentsoff" || action === "commentson") {
    const r = await managePost(me, params.id, action);
    return "error" in r ? NextResponse.json(r, { status: r.error === "too_many" ? 409 : 404 }) : NextResponse.json(r);
  }
  if (action === "edit") {
    const r = await editPost(me, params.id, v.data.text ?? "");
    return "error" in r ? NextResponse.json(r, { status: r.error === "not_found" ? 404 : 400 }) : NextResponse.json(r);
  }
  if (action === "hide" || action === "unhide") { await hidePost(me, params.id, action === "hide"); return NextResponse.json({ ok: true }); }
  if (action === "mute" || action === "unmute") { const r = await muteAuthorOf(me, params.id, action === "mute"); return NextResponse.json(r, { status: "error" in r ? 404 : 200 }); }
  if (action === "view") return NextResponse.json({ ok: await viewStory(me, params.id) });
  if (action === "viewers") { const list = await storyViewers(me, params.id); return list ? NextResponse.json({ viewers: list }) : NextResponse.json({ error: "not_found" }, { status: 404 }); }
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
