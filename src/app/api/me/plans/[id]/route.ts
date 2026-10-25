import { NextResponse } from "next/server";
import { currentTraveller, deletePlan, getPlan, updatePlan } from "@/lib/wallet";
import { EditPlan } from "@/lib/plan-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ok = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const p = ok(params.id) ? await getPlan(email, params.id) : null;
  return p ? NextResponse.json(p, { headers: { "Cache-Control": "no-store" } }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const b = EditPlan.safeParse(await req.json().catch(() => null));
  if (!ok(params.id) || !b.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await updatePlan(email, params.id, b.data);
  return NextResponse.json({ ok: true });
}
export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (ok(params.id)) await deletePlan(email, params.id);
  return NextResponse.json({ ok: true });
}
