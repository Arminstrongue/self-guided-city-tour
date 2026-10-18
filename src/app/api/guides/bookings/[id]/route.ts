import { NextResponse } from "next/server";
import { currentGuide, respond } from "@/lib/guides";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const g = await currentGuide();
  if (!g) return NextResponse.json({ error: "auth" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const r = await respond(g, params.id, b.accept === true);
  return NextResponse.json(r, { status: "error" in r ? 409 : 200 });
}
