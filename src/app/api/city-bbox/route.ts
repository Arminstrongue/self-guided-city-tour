import { NextResponse } from "next/server";
import { loadCity } from "@/lib/content";

export const runtime = "nodejs";

/** Área do roteiro de uma cidade (paragens + aeroporto), para descarregar o mapa e usar sem internet. */
export async function GET(req: Request) {
  const c = await loadCity(new URL(req.url).searchParams.get("city") ?? "");
  if (!c) return NextResponse.json({ error: "unknown_city" }, { status: 404 });
  const pts = c.stops.map((s) => [s.lat, s.lng]);
  const lat = pts.map((p) => p[0]), lng = pts.map((p) => p[1]);
  const pad = 0.006;
  return NextResponse.json({ s: Math.min(...lat) - pad, n: Math.max(...lat) + pad, w: Math.min(...lng) - pad, e: Math.max(...lng) + pad }, { headers: { "Cache-Control": "public, max-age=86400" } });
}
