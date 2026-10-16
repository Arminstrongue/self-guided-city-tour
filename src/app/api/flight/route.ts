import { NextResponse } from "next/server";
import { flightApiEnabled, flightStatus, normaliseFlightNo, validFlightNo } from "@/lib/flight";

export const dynamic = "force-dynamic";

/** GET /api/flight?no=TP1234&date=2026-10-16&from=LIS */
export async function GET(req: Request) {
  if (!flightApiEnabled()) return NextResponse.json({ error: "disabled" }, { status: 501 });
  const q = new URL(req.url).searchParams;
  const no = normaliseFlightNo(q.get("no") ?? "");
  const date = q.get("date") ?? "";
  const from = (q.get("from") ?? "").toUpperCase();
  if (!validFlightNo(no) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const s = await flightStatus(no, date, /^[A-Z]{3}$/.test(from) ? from : undefined);
    if (!s) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(s);
  } catch (e) {
    console.error("flight", e);
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}
