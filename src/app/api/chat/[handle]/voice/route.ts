import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { canChat, send } from "@/lib/chat";
import { profileByHandle } from "@/lib/social";
import { MAX_VOICE_BYTES, deleteVoice, saveVoice } from "@/lib/voice";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Nota de voz: o corpo é o áudio gravado no telemóvel. */
export async function POST(req: Request, props: { params: Promise<{ handle: string }> }) {
  const params = await props.params;
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "chat-voice", 20)) return NextResponse.json({ error: "rate" }, { status: 429 });
  if (!/^audio\//.test(req.headers.get("content-type") ?? "")) return NextResponse.json({ error: "type" }, { status: 415 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_VOICE_BYTES) return NextResponse.json({ error: "too_big" }, { status: 413 });
  const p = await profileByHandle(params.handle);
  if (!p || !(await canChat(me, p.email)) || !req.body) return NextResponse.json({ error: "not_allowed" }, { status: 403 });
  const id = randomUUID();
  let file: string;
  try { file = await saveVoice(id, req.body); } catch { return NextResponse.json({ error: "upload" }, { status: 400 }); }
  const r = await send(me, params.handle, "", null, { audio: file, id, replyTo: new URL(req.url).searchParams.get("reply") });
  if ("error" in r) { await deleteVoice([file]); return NextResponse.json(r, { status: 400 }); }
  return NextResponse.json(r);
}
