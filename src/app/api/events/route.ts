import { NextResponse } from "next/server";
import { isEvent, track } from "@/lib/metrics";
import { rateLimit } from "@/lib/rate-limit";

/** Regista um evento anónimo do funil (sem cookies nem dados pessoais). */
export async function POST(req: Request) {
  if (!rateLimit(req, "events", 120)) return new NextResponse(null, { status: 204 });
  let b: Record<string, unknown> = {};
  try { b = JSON.parse(await req.text()); } catch { /* sendBeacon pode chegar vazio */ }
  if (!isEvent(b.name)) return NextResponse.json({ error: "event" }, { status: 400 });
  try { await track({ name: b.name, city: b.city, stop: b.stop, locale: b.locale, ref: b.ref, platform: b.platform }); } catch (e) { console.error("events", e); }
  return new NextResponse(null, { status: 204 });
}
