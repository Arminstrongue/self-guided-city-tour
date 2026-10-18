import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, readAccessToken } from "@/lib/access-token";
import { sessionEmail } from "@/lib/auth";
import { findActiveAccess } from "@/lib/orders";
import { ratingFor, saveRating, validRating } from "@/lib/metrics";
import { rateLimit } from "@/lib/rate-limit";

async function accessFor(city: string) {
  const emails = [readAccessToken(cookies().get(ACCESS_COOKIE)?.value), await sessionEmail()].filter((e): e is string => Boolean(e));
  return /^[a-z]{2,8}$/.test(city) ? findActiveAccess(emails, city) : null;
}

/** Avaliação já feita para esta cidade (para não voltar a perguntar). */
export async function GET(req: Request) {
  const city = new URL(req.url).searchParams.get("city") ?? "";
  const a = await accessFor(city);
  if (!a) return NextResponse.json({ rating: null });
  const r = await ratingFor(a.id, city);
  return NextResponse.json({ rating: r ? { stars: r.stars, nps: r.nps } : null });
}

/** Só quem comprou o roteiro pode avaliar (uma avaliação por compra e cidade; pode ser corrigida). */
export async function POST(req: Request) {
  if (!rateLimit(req, "ratings", 10)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const city = String(b.city ?? "");
  const a = await accessFor(city);
  if (!a) return NextResponse.json({ error: "access" }, { status: 403 });
  const r = validRating(b);
  if (!r) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await saveRating(a.id, city, r);
  return NextResponse.json({ ok: true });
}
