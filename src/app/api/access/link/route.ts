import { NextResponse } from "next/server";
import { ACCESS_COOKIE, ACCESS_TTL_S, readAccessToken } from "@/lib/access-token";
import { env, isProd } from "@/lib/env";
import { isLocale } from "@/i18n/dictionaries";
import { getCity } from "@/data/cities";

export const runtime = "nodejs";

/** Link enviado por email: abre o roteiro noutro dispositivo. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const l = url.searchParams.get("locale") ?? "en";
  const locale = isLocale(l) ? l : "en";
  const city = getCity(url.searchParams.get("city") ?? "");
  if (!readAccessToken(token)) return NextResponse.redirect(`${env.appUrl}/${locale}`);
  const res = NextResponse.redirect(`${env.appUrl}/${locale}${city ? `/tour/${city.id}` : ""}`);
  res.cookies.set(ACCESS_COOKIE, token as string, { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: ACCESS_TTL_S, path: "/" });
  return res;
}
