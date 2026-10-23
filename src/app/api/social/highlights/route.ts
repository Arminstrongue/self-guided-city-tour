import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { createHighlight, deleteHighlight, highlightItems, highlightsOf, storyArchive, updateHighlight } from "@/lib/posts";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** ?handle=x → destaques do perfil · ?id=… → histórias de um destaque · ?archive=1 → o meu arquivo de histórias. */
export async function GET(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const q = new URL(req.url).searchParams;
  if (q.get("archive") === "1") return NextResponse.json(await storyArchive(me));
  const id = q.get("id");
  if (id) { const r = await highlightItems(me, id); return r ? NextResponse.json(r) : NextResponse.json({ error: "not_found" }, { status: 404 }); }
  const r = await highlightsOf(me, q.get("handle") ?? "");
  return r ? NextResponse.json(r) : NextResponse.json({ error: "hidden" }, { status: 403 });
}

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), title: z.string().max(60), ids: z.array(z.string().max(40)).max(100) }),
  z.object({ action: z.literal("update"), id: z.string().uuid(), title: z.string().max(60).optional(), ids: z.array(z.string().max(40)).max(100).optional(), cover: z.string().uuid().optional() }),
  z.object({ action: z.literal("remove"), id: z.string().uuid(), story: z.string().uuid() }),
  z.object({ action: z.literal("delete"), id: z.string().uuid() })
]);

export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "highlights", 60)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const b = v.data;
  if (b.action === "delete") { await deleteHighlight(me, b.id); return NextResponse.json({ ok: true }); }
  const r = b.action === "create" ? await createHighlight(me, b.title, b.ids)
    : b.action === "remove" ? await updateHighlight(me, b.id, { remove: b.story })
      : await updateHighlight(me, b.id, { title: b.title, ids: b.ids, cover: b.cover });
  return "error" in r ? NextResponse.json(r, { status: r.error === "not_found" ? 404 : 400 }) : NextResponse.json(r);
}
