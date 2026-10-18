import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const l = new URL(req.url).searchParams.get("locale") ?? "pt";
  const res = NextResponse.redirect(`${env.appUrl}/${/^[a-z]{2}$/.test(l) ? l : "pt"}/admin`, 303);
  res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
