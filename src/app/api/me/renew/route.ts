import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, ACCESS_TTL_S, createAccessToken, readAccessTokenFull } from "@/lib/access-token";
import { validAccessEmail } from "@/lib/session-revoke";
import { isProd } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Sessão que se renova sozinha: quem usa a app no mesmo aparelho não tem de voltar a entrar.
 * Se a sessão é válida e tem mais de 1 dia, recebe outra de 31 dias (sair de todo o lado continua a funcionar).
 */
export async function POST() {
  const raw = (await cookies()).get(ACCESS_COOKIE)?.value;
  const full = raw ? readAccessTokenFull(raw) : null;
  const email = raw && full ? await validAccessEmail(raw) : null;
  if (!email || !full) return NextResponse.json({ ok: false });
  const res = NextResponse.json({ ok: true });
  if (Date.now() / 1000 - full.iat > 24 * 3600) {
    res.cookies.set(ACCESS_COOKIE, createAccessToken(email), { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: ACCESS_TTL_S, path: "/" });
  }
  return res;
}
