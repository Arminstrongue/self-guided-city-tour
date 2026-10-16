import { NextResponse } from "next/server";
import { AGENT_COOKIE } from "@/lib/agents";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AGENT_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
