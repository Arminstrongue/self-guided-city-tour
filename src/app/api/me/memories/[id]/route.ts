import { NextResponse } from "next/server";
import { currentTraveller, removeMemory } from "@/lib/wallet";

export const runtime = "nodejs";

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await removeMemory(email, params.id);
  return NextResponse.json({ ok: true });
}
