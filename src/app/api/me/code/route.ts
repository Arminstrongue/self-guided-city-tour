import { NextResponse } from "next/server";
import { z } from "zod";
import { ACCESS_COOKIE, ACCESS_TTL_S, challengeEmail, checkSignInCode, createAccessToken } from "@/lib/access-token";
import { isProd } from "@/lib/env";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
const Body = z.object({ challenge: z.string().min(20).max(1000), code: z.string().min(6).max(12) });

/** Entrar com o código de 6 dígitos do email, no mesmo navegador onde se pediu. */
export async function POST(req: Request) {
  if (!rateLimit(req, "me-code", 10)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const who = challengeEmail(p.data.challenge);
  // No máximo 8 tentativas por email a cada 10 minutos (o código tem 1 milhão de combinações).
  if (!who || !rateLimitKey(`me-code:${who}`, 8, 10 * 60_000)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const email = checkSignInCode(p.data.challenge, p.data.code);
  if (!email) return NextResponse.json({ error: "code" }, { status: 400 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, createAccessToken(email), { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: ACCESS_TTL_S, path: "/" });
  return res;
}
