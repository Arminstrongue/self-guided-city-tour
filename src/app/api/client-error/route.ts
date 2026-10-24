import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Erros do navegador (mensagem curta, página e navegador) para os logs do servidor: `docker compose logs app | grep client-error`. */
export async function POST(req: Request) {
  if (!rateLimit(req, "client-error", 20)) return NextResponse.json({ ok: false }, { status: 429 });
  const j = (await req.json().catch(() => null)) as { m?: string; p?: string; d?: string } | null;
  const clip = (x: unknown, n: number) => String(x ?? "").replace(/[\r\n]+/g, " ").slice(0, n);
  // Só o tipo de navegador e sistema (sem a versão completa nem dados da página além do caminho), para não identificar ninguém.
  const ua = String(req.headers.get("user-agent") ?? "");
  const kind = `${/iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : "other"}/${/Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "other"}`;
  // Emails e tokens nunca vão para os logs.
  const msg = clip(j?.m, 300).replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]").replace(/token=[^&\s]+/g, "token=[…]");
  console.warn(`[client-error] ${clip(j?.p, 120).replace(/\?.*$/, "")} · ${msg} · ${clip(j?.d, 40)} · ${kind}`);
  return NextResponse.json({ ok: true });
}
