import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { clearThread, MAX_TEXT, send, thread, unsend } from "@/lib/chat";
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
  z.object({ action: z.literal("send"), text: z.string().max(MAX_TEXT) }),
  z.object({ action: z.literal("unsend"), id: z.string().max(40) }),
  z.object({ action: z.literal("clear") })
]);

export async function POST(req: Request, { params }: { params: { handle: string } }) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "chat", 60)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (v.data.action === "send") {
    const r = await send(me, params.handle, v.data.text);
    return "error" in r ? NextResponse.json(r, { status: r.error === "not_allowed" ? 403 : 400 }) : NextResponse.json(r);
  }
  if (v.data.action === "unsend") await unsend(me, v.data.id);
  if (v.data.action === "clear") await clearThread(me, params.handle);
  return NextResponse.json({ ok: true });
}
