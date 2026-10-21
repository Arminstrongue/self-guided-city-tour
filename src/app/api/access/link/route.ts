import { NextResponse } from "next/server";
import { ACCESS_COOKIE, ACCESS_TTL_S, readAccessToken } from "@/lib/access-token";
import { env, isProd } from "@/lib/env";
import { isLocale } from "@/i18n/core";
import { loadCity } from "@/lib/content";

export const runtime = "nodejs";

/** Link enviado por email: abre o roteiro noutro dispositivo. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const l = url.searchParams.get("locale") ?? "en";
  const locale = isLocale(l) ? l : "en";
  const city = await loadCity(url.searchParams.get("city") ?? "");
  if (!readAccessToken(token)) return NextResponse.redirect(`${env.appUrl}/${locale}`);
  const to = url.searchParams.get("to") === "wallet" ? "/wallet" : city ? `/tour/${city.id}` : "";
  const res = NextResponse.redirect(`${env.appUrl}/${locale}${to}`);
  res.cookies.set(ACCESS_COOKIE, token as string, { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: ACCESS_TTL_S, path: "/" });
  return res;
}
