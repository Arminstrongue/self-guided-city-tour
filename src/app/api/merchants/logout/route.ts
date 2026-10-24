import { NextResponse } from "next/server";
import { MERCHANT_COOKIE } from "@/lib/merchant-portal";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MERCHANT_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
