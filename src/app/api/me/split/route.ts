import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { createGroup, listGroups } from "@/lib/split";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Person = z.union([z.object({ handle: z.string().min(3).max(24) }), z.object({ name: z.string().min(1).max(40) })]);
const New = z.object({ title: z.string().min(1).max(60), currency: z.string().length(3), people: z.array(Person).max(19).default([]) });

export async function GET() {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json({ groups: await listGroups(me) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!rateLimit(req, "split", 30)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const p = New.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = await createGroup(me, p.data);
  return NextResponse.json(r, { status: "error" in r ? 400 : 200 });
}
