import { NextResponse } from "next/server";
import { ACCESS_COOKIE, ACCESS_TTL_S, createAccessToken, readAccessToken } from "@/lib/access-token";
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
  const email = readAccessToken(token);
  if (!email) return NextResponse.redirect(`${env.appUrl}/${locale}`);
  const to = url.searchParams.get("to") === "wallet" ? "/wallet" : city ? `/tour/${city.id}` : "";
  const res = NextResponse.redirect(`${env.appUrl}/${locale}${to}`);
  // A sessão é um token novo: o link (que fica no email e em registos) não passa a ser a sessão.
  res.cookies.set(ACCESS_COOKIE, createAccessToken(email), { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: ACCESS_TTL_S, path: "/" });
  return res;
}
