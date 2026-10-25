import { NextResponse } from "next/server";
import { z } from "zod";
import { imageDataUrl } from "@/lib/strip-meta";
import { currentTraveller } from "@/lib/wallet";
import { clearThread, MAX_TEXT, react, send, sharePost, thread, typing, unsend } from "@/lib/chat";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Mensagens de uma conversa (?after= para só as novas, ?before= para as antigas). */
export async function GET(req: Request, { params }: { params: { handle: string } }) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const u = new URL(req.url);
  const r = await thread(me, params.handle, { after: u.searchParams.get("after"), before: u.searchParams.get("before") });
  return r ? NextResponse.json(r, { headers: { "Cache-Control": "no-store" } }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}

const Body = z.union([
  z.object({ action: z.literal("send"), text: z.string().max(MAX_TEXT), replyTo: z.string().max(40).optional(),
    photo: imageDataUrl(480_000).optional() }),
  z.object({ action: z.literal("share"), post: z.string().max(40), text: z.string().max(MAX_TEXT).optional() }),
  z.object({ action: z.literal("location"), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
  z.object({ action: z.literal("react"), id: z.string().max(40), emoji: z.string().max(16).nullable() }),
  z.object({ action: z.literal("unsend"), id: z.string().max(40) }),
  z.object({ action: z.literal("clear") }),
  z.object({ action: z.literal("typing") })
]);

export async function POST(req: Request, { params }: { params: { handle: string } }) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (v.data.action === "typing") { if (rateLimit(req, "chat-typing", 40)) await typing(me, params.handle); return NextResponse.json({ ok: true }); }
  if (!rateLimit(req, "chat", 60)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const out = (r: Awaited<ReturnType<typeof send>>) => ("error" in r ? NextResponse.json(r, { status: r.error === "not_allowed" ? 403 : 400 }) : NextResponse.json(r));
  if (v.data.action === "send") return out(await send(me, params.handle, v.data.text, null, { photo: v.data.photo ?? null, replyTo: v.data.replyTo ?? null }));
  if (v.data.action === "share") return out(await sharePost(me, params.handle, v.data.post, v.data.text ?? ""));
  if (v.data.action === "location") return out(await send(me, params.handle, "", `loc:${v.data.lat.toFixed(5)},${v.data.lng.toFixed(5)}`));
  if (v.data.action === "react") return NextResponse.json({ reactions: await react(me, v.data.id, v.data.emoji) });
  if (v.data.action === "unsend") await unsend(me, v.data.id);
  if (v.data.action === "clear") await clearThread(me, params.handle);
  return NextResponse.json({ ok: true });
}
