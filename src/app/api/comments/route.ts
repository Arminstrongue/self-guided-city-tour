import { hasCityAccess } from "@/lib/city-access";
import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { addComment, commentCounts, listComments } from "@/lib/place-comments";
import { rateLimit } from "@/lib/rate-limit";
import { checkAchievements } from "@/lib/achievements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const place = /^[a-z0-9-]{0,40}$/;

/** Comentários de uma cidade (?city=lis) ou de um lugar (?city=lis&stop=rossio); ?counts=1 devolve os contadores por lugar. */
export async function GET(req: Request) {
  if (!rateLimit(req, "comments-read", 240)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const u = new URL(req.url);
  const city = u.searchParams.get("city") ?? "", stop = u.searchParams.get("stop") ?? "";
  if (!/^[a-z]{2,12}$/.test(city) || !place.test(stop)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  // Comentários de um lugar do roteiro fazem parte do roteiro pago: sem passe da cidade, nada (Manchester é grátis).
  if (stop && !(await hasCityAccess(city).catch(() => false))) return NextResponse.json({ error: "locked", items: [], total: 0, next: null, signed: false }, { status: 402 });
  if (u.searchParams.get("counts")) return NextResponse.json({ counts: await commentCounts(city) });
  const me = await currentTraveller().catch(() => null);
  return NextResponse.json({ ...(await listComments(me, city, stop, u.searchParams.get("before"))), signed: Boolean(me) }, { headers: { "Cache-Control": "no-store" } });
}

const Body = z.object({ city: z.string().regex(/^[a-z]{2,12}$/), stop: z.string().regex(place).default(""), text: z.string().max(1000) });
export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "comments-write", 30)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = await addComment(me, v.data.city, v.data.stop, v.data.text);
  if (!("error" in r)) void checkAchievements(me).catch(() => {});
  return "error" in r ? NextResponse.json(r, { status: r.error === "no_profile" ? 409 : r.error === "limit" ? 429 : 400 }) : NextResponse.json({ comment: r });
}
