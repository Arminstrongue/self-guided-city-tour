import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { replyToStory } from "@/lib/chat";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
const Body = z.object({ story: z.string().max(40), text: z.string().trim().min(1).max(1000) });

/** Responder a uma história: a resposta chega como mensagem privada. */
export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "chat", 60)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = await replyToStory(me, v.data.story, v.data.text);
  return "error" in r ? NextResponse.json(r, { status: 403 }) : NextResponse.json(r);
}
