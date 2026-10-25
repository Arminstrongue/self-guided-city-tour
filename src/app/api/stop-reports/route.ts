import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { env } from "@/lib/env";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { addStopReport, REPORT_KINDS, stopWarnings } from "@/lib/stop-reports";
import { rateLimit } from "@/lib/rate-limit";
import { loadCity } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Avisos de uma cidade (paragens com vários relatos em aberto). */
export async function GET(req: Request) {
  const city = new URL(req.url).searchParams.get("city") ?? "";
  if (!/^[a-z]{2,12}$/.test(city)) return NextResponse.json({ warnings: {} });
  return NextResponse.json({ warnings: await stopWarnings(city).catch(() => ({})) }, { headers: { "Cache-Control": "public, max-age=300" } });
}

const Body = z.object({ city: z.string().regex(/^[a-z]{2,12}$/), stop: z.string().regex(/^[a-z0-9-]{1,40}$/), kind: z.enum(REPORT_KINDS), note: z.string().trim().max(500).default("") });

/** "Reportar um problema": com ou sem sessão (sem sessão conta uma impressão anónima do IP, nunca o IP). */
export async function POST(req: Request) {
  if (!rateLimit(req, "stop-report", 8)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const city = await loadCity(v.data.city);
  if (!city?.stops.some((s) => s.id === v.data.stop)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const me = await currentTraveller();
  const ip = (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const who = me ?? `anon:${createHmac("sha256", env.secret).update(ip).digest("hex").slice(0, 16)}`;
  await addStopReport(v.data.city, v.data.stop, v.data.kind, v.data.note, who);
  return NextResponse.json({ ok: true });
}
