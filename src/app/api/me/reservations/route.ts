import { NextResponse } from "next/server";
import { z } from "zod";
import { imageDataUrl } from "@/lib/strip-meta";
import { currentTraveller } from "@/lib/wallet";
import { deleteReservation, listReservations, RES_KINDS, saveReservation } from "@/lib/reservations";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json({ list: await listReservations(me) });
}

const Body = z.object({
  id: z.guid().optional(),
  kind: z.enum(RES_KINDS), title: z.string().trim().min(1).max(120), city: z.string().max(12).default(""),
  localAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/), tz: z.string().min(1).max(60),
  place: z.string().max(200).default(""), lat: z.number().min(-90).max(90).nullable().default(null), lng: z.number().min(-180).max(180).nullable().default(null),
  ref: z.string().max(80).default(""), notes: z.string().max(600).default(""),
  photo: z.literal("").or(imageDataUrl(600_000)).default(""), photos: z.array(imageDataUrl(600_000)).max(6).default([]), paid: z.boolean().default(false),
  // Viagem com troços (comboio/autocarro): até 6 troços, horas "HH:MM".
  journey: z.object({ legs: z.array(z.object({
    from: z.string().trim().min(1).max(80), to: z.string().trim().min(1).max(80),
    dep: z.string().regex(/^\d{2}:\d{2}$/), arr: z.string().regex(/^\d{2}:\d{2}$/),
    op: z.string().trim().max(60).optional(), pf: z.string().regex(/^[A-Za-z0-9]{1,5}$/).optional()
  })).min(1).max(6) }).nullable().default(null)
});

export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "reservations", 40)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try { Intl.DateTimeFormat("en", { timeZone: v.data.tz }); } catch { return NextResponse.json({ error: "tz" }, { status: 400 }); }
  const { id, ...rest } = v.data;
  const r = await saveReservation(me, rest, id);
  if ("error" in r) return NextResponse.json(r, { status: 400 });
  return NextResponse.json({ reservation: r });
}

export async function DELETE(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await deleteReservation(me, id);
  return NextResponse.json({ ok: true });
}
