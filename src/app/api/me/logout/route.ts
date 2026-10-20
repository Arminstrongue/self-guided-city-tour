import { NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/access-token";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const l = new URL(req.url).searchParams.get("locale") ?? "en";
  const res = NextResponse.redirect(`${env.appUrl}/${/^[a-z]{2}$/.test(l) ? l : "en"}/wallet`, 303);
  res.cookies.set(ACCESS_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
