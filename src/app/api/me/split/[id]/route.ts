import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { addExpense, addMember, getGroup, leaveGroup, removeItem, settle } from "@/lib/split";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Id = z.string().uuid();
const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("expense"), title: z.string().max(60).default(""), amount: z.number().positive().max(10_000_000), currency: z.string().length(3), payer: Id, among: z.array(Id).max(20).default([]), shares: z.record(Id, z.number().min(0)).optional() }),
  z.object({ action: z.literal("settle"), from: Id, to: Id, amount: z.number().int().positive() }),
  z.object({ action: z.literal("member"), handle: z.string().min(3).max(24).optional(), name: z.string().min(1).max(40).optional() }),
  z.object({ action: z.literal("remove"), item: Id })
]);

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!Id.safeParse(params.id).success) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const g = await getGroup(me, params.id);
  return g ? NextResponse.json(g, { headers: { "Cache-Control": "no-store" } }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!rateLimit(req, "split-item", 120)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const b = Body.safeParse(await req.json().catch(() => null));
  if (!b.success || !Id.safeParse(params.id).success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const v = b.data;
  const r = v.action === "expense" ? await addExpense(me, params.id, { ...v, title: v.title })
    : v.action === "settle" ? await settle(me, params.id, v)
    : v.action === "member" ? await addMember(me, params.id, v.handle ? { handle: v.handle } : { name: v.name ?? "" })
    : await removeItem(me, params.id, v.item);
  if ("error" in r) return NextResponse.json(r, { status: r.error === "forbidden" ? 403 : 400 });
  return NextResponse.json({ ok: true, group: await getGroup(me, params.id) });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!Id.safeParse(params.id).success) return NextResponse.json({ ok: true });
  return NextResponse.json(await leaveGroup(me, params.id));
}
