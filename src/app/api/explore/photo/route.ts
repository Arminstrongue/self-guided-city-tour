import { NextResponse } from "next/server";
import { photoUrl } from "@/lib/gexplore";

export const runtime = "nodejs";
const cache = new Map<string, { at: number; url: string }>();

/** /api/explore/photo?n=places/…/photos/… → redireciona para a foto do Google (a chave fica no servidor). */
export async function GET(req: Request) {
  const n = new URL(req.url).searchParams.get("n") ?? "";
  const hit = cache.get(n);
  let url = hit && Date.now() - hit.at < 24 * 3600_000 ? hit.url : null;
  if (!url) { url = await photoUrl(n).catch(() => null); if (url) { cache.set(n, { at: Date.now(), url }); if (cache.size > 5000) cache.delete(cache.keys().next().value as string); } }
  if (!url) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "public, max-age=86400" } });
}
