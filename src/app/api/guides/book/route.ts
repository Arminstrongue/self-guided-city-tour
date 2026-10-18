import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { createBooking, isSlotFree } from "@/lib/guides";
import { BookBody } from "@/lib/guide-input";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** O turista pede uma data ao guia: cria a reserva e devolve o checkout (cartão só autorizado). */
export async function POST(req: Request) {
  if (!rateLimit(req, "guide-book", 10)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const p = BookBody.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid", fields: Object.keys(p.error.flatten().fieldErrors) }, { status: 400 });
  const b = p.data;
  const start = new Date(b.startAt);
  if (start.getTime() < Date.now() + 3 * 3600_000) return NextResponse.json({ error: "too_soon" }, { status: 400 });
  if (start.getTime() > Date.now() + 120 * 86400_000) return NextResponse.json({ error: "too_far" }, { status: 400 });
  const d = await db();
  const [g] = await d.select().from(schema.guides).where(eq(schema.guides.id, b.guideId)).limit(1);
  if (!g || g.status !== "active" || !g.payoutsReady) return NextResponse.json({ error: "unavailable" }, { status: 409 });
  if (b.people > g.maxPeople) return NextResponse.json({ error: "people" }, { status: 400 });
  if (!(await isSlotFree(g.id, start, b.hours))) return NextResponse.json({ error: "busy" }, { status: 409 });
  try {
    const r = await createBooking(g, { ...b, startAt: start });
    return NextResponse.json({ url: r.url });
  } catch (e) {
    console.error("guide book", e);
    return NextResponse.json({ error: "stripe" }, { status: 502 });
  }
}
