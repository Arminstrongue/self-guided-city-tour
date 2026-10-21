import { NextResponse } from "next/server";
import { GUIDE_COOKIE } from "@/lib/guides";
import { readPurposeToken } from "@/lib/access-token";
import { env, isProd } from "@/lib/env";
import { isLocale } from "@/i18n/core";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const l = url.searchParams.get("locale") ?? "pt";
  const locale = isLocale(l) ? l : "pt";
  if (!readPurposeToken(token, "guide")) return NextResponse.redirect(`${env.appUrl}/${locale}/guides/join?expired=1`);
  const res = NextResponse.redirect(`${env.appUrl}/${locale}/guides/portal`);
  res.cookies.set(GUIDE_COOKIE, token as string, { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: 30 * 24 * 3600, path: "/" });
  return res;
}
