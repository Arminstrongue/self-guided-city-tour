import { NextResponse } from "next/server";
import { MERCHANT_COOKIE, MERCHANT_TTL_S, readLinkToken, sessionToken } from "@/lib/merchant-portal";
import { env, isProd } from "@/lib/env";
import { isLocale } from "@/i18n/core";

export const runtime = "nodejs";

/** Link do email (30 min) → sessão da Área do comerciante (30 dias, cookie só do servidor). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const l = url.searchParams.get("locale") ?? "en";
  const locale = isLocale(l) ? l : "en";
  const email = readLinkToken(url.searchParams.get("token"));
  if (!email) return NextResponse.redirect(`${env.appUrl}/${locale}/merchants/manage?expired=1`);
  const res = NextResponse.redirect(`${env.appUrl}/${locale}/merchants/manage`);
  res.cookies.set(MERCHANT_COOKIE, sessionToken(email), { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: MERCHANT_TTL_S, path: "/" });
  return res;
}
