import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { createUpdate, listUpdates, UPDATE_KINDS } from "@/lib/updates";
import { imageDataUrl } from "@/lib/strip-meta";
import { rateLimit } from "@/lib/rate-limit";
import { loadCity } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/updates?city=lon[&stop=] — atualizações dos viajantes ainda válidas. Públicas (sem sessão também se veem). */
export async function GET(req: Request) {
  if (!rateLimit(req, "updates-get", 60)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const u = new URL(req.url);
  const city = u.searchParams.get("city") ?? "";
  const stop = u.searchParams.get("stop") ?? undefined;
  if (!/^[a-z]{2,12}$/.test(city) || (stop && !/^[a-z0-9-]{1,40}$/.test(stop))) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const me = await currentTraveller();
  return NextResponse.json({ list: await listUpdates(city, me, { stop }) }, { headers: { "Cache-Control": "private, no-store" } });
}

const Body = z.object({
  city: z.string().regex(/^[a-z]{2,12}$/), kind: z.enum(UPDATE_KINDS), text: z.string().max(500).default(""),
  stop: z.string().regex(/^[a-z0-9-]{1,40}$/).nullable().default(null), place: z.string().max(120).default(""),
  lat: z.number().min(-90).max(90).nullable().default(null), lng: z.number().min(-180).max(180).nullable().default(null),
  photo: imageDataUrl(600_000).nullable().default(null), postId: z.guid().nullable().default(null)
});

export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "updates-post", 10)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const city = await loadCity(v.data.city);
  if (!city || (v.data.stop && !city.stops.some((s) => s.id === v.data.stop))) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if ((v.data.lat === null) !== (v.data.lng === null)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = await createUpdate(me, v.data);
  if ("error" in r) return NextResponse.json(r, { status: r.error === "rate" ? 429 : 400 });
  return NextResponse.json(r);
}
