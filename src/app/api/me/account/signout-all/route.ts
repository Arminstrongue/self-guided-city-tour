import { NextResponse } from "next/server";
import { currentTraveller, forgetSessionCache } from "@/lib/wallet";
import { ACCESS_COOKIE, ACCESS_TTL_S, createAccessToken } from "@/lib/access-token";
import { saveSettings } from "@/lib/notify";
import { isProd } from "@/lib/env";

export const runtime = "nodejs";

/** Termina a sessão em todos os outros dispositivos; este continua com uma sessão nova. */
export async function POST() {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  await saveSettings(me, { sessionsAfter: new Date(Math.floor(Date.now() / 1000) * 1000) });
  forgetSessionCache(me);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, createAccessToken(me), { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: ACCESS_TTL_S, path: "/" });
  return res;
}
