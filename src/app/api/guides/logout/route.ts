import { NextResponse } from "next/server";
import { GUIDE_COOKIE } from "@/lib/guides";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const l = new URL(req.url).searchParams.get("locale") ?? "pt";
  const res = NextResponse.redirect(`${env.appUrl}/${l}/guides/join`, 303);
  res.cookies.delete(GUIDE_COOKIE);
  return res;
}
