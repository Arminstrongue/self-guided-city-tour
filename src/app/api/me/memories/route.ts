import { NextResponse } from "next/server";
import { z } from "zod";
import { addMemory, currentTraveller } from "@/lib/wallet";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
const Mem = z.object({
  city: z.string().regex(/^[a-z]{2,8}$/), cityName: z.string().trim().min(1).max(80), title: z.string().trim().min(1).max(160), note: z.string().trim().max(500).default(""),
  photo: z.string().max(400_000).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/).nullable().default(null),
  lat: z.number().min(-90).max(90).nullable().default(null), lng: z.number().min(-180).max(180).nullable().default(null), at: z.number().int().positive().optional()
});

export async function POST(req: Request) {
  if (!rateLimit(req, "memories", 30)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const p = Mem.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  return NextResponse.json({ ok: true, id: await addMemory(email, p.data) });
}
