import { NextResponse } from "next/server";
import { GUIDE_COOKIE } from "@/lib/guides";
import { createPurposeToken, readPurposeToken } from "@/lib/access-token";
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
  // A sessão é um token novo: o link do email (que fica guardado na caixa de correio) não passa a ser a sessão.
  res.cookies.set(GUIDE_COOKIE, createPurposeToken(readPurposeToken(token, "guide") as string, "guide", 30 * 24 * 3600), { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: 30 * 24 * 3600, path: "/" });
  return res;
}
