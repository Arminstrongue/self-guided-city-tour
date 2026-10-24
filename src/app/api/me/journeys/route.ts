import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { JourneyBody, deleteJourney, listJourneys, saveJourney } from "@/lib/journeys";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const list = await listJourneys(me);
  return NextResponse.json({ list: list.map((j) => ({ id: j.id, day: j.day, city: j.city, cityName: j.cityName, km: j.km, steps: j.steps, places: j.places, path: j.path })) }, { headers: { "Cache-Control": "no-store" } });
}
/** Confirmar um percurso detetado (dia, cidade, km, passos, lugares e trajeto simplificado). */
export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "journeys", 30)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const b = JourneyBody.safeParse(await req.json().catch(() => null));
  if (!b.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  return NextResponse.json({ ok: true, id: await saveJourney(me, b.data) });
}
export async function DELETE(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (/^[0-9a-f-]{36}$/i.test(id)) await deleteJourney(me, id);
  return NextResponse.json({ ok: true });
}
