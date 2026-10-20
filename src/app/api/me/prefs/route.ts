import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller, setPrefs } from "@/lib/wallet";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { HOBBIES } from "@/lib/explore";

export const runtime = "nodejs";
const Body = z.object({
  hobbies: z.array(z.enum(HOBBIES)).max(10).optional(),
  saved: z.array(z.object({ city: z.string().max(8), title: z.string().max(160), lat: z.number(), lng: z.number(), at: z.number() })).max(300).optional()
});

export async function PUT(req: Request) {
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await setPrefs(email, p.data);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const d = await db();
  const [p] = await d.select().from(schema.travellerPrefs).where(eq(schema.travellerPrefs.email, email)).limit(1);
  return NextResponse.json({ hobbies: p?.hobbies ?? [], saved: p?.saved ?? [] }, { headers: { "Cache-Control": "no-store" } });
}
