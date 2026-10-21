import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminEmail } from "@/lib/auth";
import { createPurposeToken, readPurposeToken } from "@/lib/access-token";
import { env, isProd } from "@/lib/env";
import { isLocale } from "@/i18n/core";

export const runtime = "nodejs";
const TTL = 7 * 24 * 3600;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const l = url.searchParams.get("locale") ?? "pt";
  const locale = isLocale(l) ? l : "pt";
  const email = readPurposeToken(url.searchParams.get("token"), "admin-link");
  if (!isAdminEmail(email)) return NextResponse.redirect(`${env.appUrl}/${locale}/admin?expired=1`);
  const res = NextResponse.redirect(`${env.appUrl}/${locale}/admin`);
  res.cookies.set(ADMIN_COOKIE, createPurposeToken(email as string, "admin", TTL), { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: TTL, path: "/" });
  return res;
}
