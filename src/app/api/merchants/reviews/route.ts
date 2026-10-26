import { NextResponse } from "next/server";
import { reviewsOf } from "@/lib/merchant-reviews";

export const runtime = "nodejs";

/** Avaliações públicas de um negócio (primeiro nome, estrelas, comentário e data). */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ list: [] });
  const list = await reviewsOf(id, 10);
  return NextResponse.json({ list: list.map((r) => ({ ...r, at: r.at.toISOString() })) }, { headers: { "Cache-Control": "public, max-age=120" } });
}
