import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { hasCityAccess } from "@/lib/city-access";

export const runtime = "nodejs";

/** Fotografia própria da VOYBU de uma paragem ou museu (ex.: /api/own-photo/lon/stops/1-westminster/parliament): só com passe da cidade. */
export async function GET(_req: Request, ctx: { params: Promise<{ city: string; path: string[] }> }) {
  const { city, path: parts } = await ctx.params;
  if (!/^[a-z]{2,12}$/.test(city) || !parts?.length || parts.length > 4 || !parts.every((p) => /^[a-z0-9-]{1,60}$/.test(p))) return new NextResponse(null, { status: 400 });
  if (!(await hasCityAccess(city))) return new NextResponse(null, { status: 402 });
  const buf = await readFile(path.join(process.cwd(), "private", "own", city, ...parts.slice(0, -1), `${parts[parts.length - 1]}.webp`)).catch(() => null);
  if (!buf) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": "image/webp", "Cache-Control": "private, max-age=86400" } });
}
