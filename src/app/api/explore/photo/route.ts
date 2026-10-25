import { NextResponse } from "next/server";
import { photoUrl } from "@/lib/gexplore";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
const cache = new Map<string, { at: number; url: string }>();

/** /api/explore/photo?n=places/…/photos/… → redireciona para a foto do Google (a chave fica no servidor). */
export async function GET(req: Request) {
  // Cada pedido novo gasta quota paga do Google: limite por IP (a cache serve o resto).
  const n = new URL(req.url).searchParams.get("n") ?? "";
  if (!/^places\/[\w-]{1,300}\/photos\/[\w-]{1,900}$/.test(n)) return new NextResponse(null, { status: 404 });
  const hit = cache.get(n);
  let url = hit && Date.now() - hit.at < 24 * 3600_000 ? hit.url : null;
  if (!url && !rateLimit(req, "explore-photo", 60)) return new NextResponse(null, { status: 429 });
  if (!url) { url = await photoUrl(n).catch(() => null); if (url) { cache.set(n, { at: Date.now(), url }); if (cache.size > 5000) cache.delete(cache.keys().next().value as string); } }
  if (!url) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "private, max-age=300" } });
}
