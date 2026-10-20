import { NextResponse } from "next/server";
import { createPlan, currentTraveller, listPlans } from "@/lib/wallet";
import { NewPlan } from "@/lib/plan-input";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const plans = await listPlans(email);
  return NextResponse.json({ plans: plans.map((p) => ({ id: p.id, title: p.title, city: p.city, cityName: p.cityName, startDate: p.startDate, days: p.days, count: p.items.length })) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!rateLimit(req, "plans", 20)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const p = NewPlan.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  return NextResponse.json({ ok: true, id: await createPlan(email, p.data) });
}
