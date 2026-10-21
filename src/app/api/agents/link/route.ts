import { NextResponse } from "next/server";
import { AGENT_COOKIE } from "@/lib/agents";
import { readPurposeToken } from "@/lib/access-token";
import { env, isProd } from "@/lib/env";
import { isLocale } from "@/i18n/core";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const l = url.searchParams.get("locale") ?? "en";
  const locale = isLocale(l) ? l : "en";
  if (!readPurposeToken(token, "agent")) return NextResponse.redirect(`${env.appUrl}/${locale}/agents?expired=1`);
  const res = NextResponse.redirect(`${env.appUrl}/${locale}/agents/portal`);
  res.cookies.set(AGENT_COOKIE, token as string, { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: 30 * 24 * 3600, path: "/" });
  return res;
}
