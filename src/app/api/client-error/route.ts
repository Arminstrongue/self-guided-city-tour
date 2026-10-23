import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Erros do navegador (mensagem curta, página e navegador) para os logs do servidor: `docker compose logs app | grep client-error`. */
export async function POST(req: Request) {
  if (!rateLimit(req, "client-error", 20)) return NextResponse.json({ ok: false }, { status: 429 });
  const j = (await req.json().catch(() => null)) as { m?: string; p?: string; d?: string } | null;
  const clip = (x: unknown, n: number) => String(x ?? "").replace(/[\r\n]+/g, " ").slice(0, n);
  console.warn(`[client-error] ${clip(j?.p, 120)} · ${clip(j?.m, 300)} · ${clip(j?.d, 40)} · ${clip(req.headers.get("user-agent"), 160)}`);
  return NextResponse.json({ ok: true });
}
