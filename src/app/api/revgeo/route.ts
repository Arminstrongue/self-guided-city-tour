import { nominatimFetch } from "@/lib/nominatim";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

const cache = new Map<string, string>();
/** Nome do sítio onde o viajante parou (OpenStreetMap), para a pergunta «Guardar no percurso?». */
export async function GET(req: Request) {
  if (!rateLimit(req, "revgeo", 30)) return NextResponse.json({ name: "" }, { status: 429 });
  const u = new URL(req.url);
  const lat = Number(u.searchParams.get("lat")), lng = Number(u.searchParams.get("lng"));
  const lang = (u.searchParams.get("lang") ?? "en").slice(0, 5);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return NextResponse.json({ name: "" }, { status: 400 });
  // Para o OpenStreetMap vai a posição arredondada (~10 m), não a exata; nada fica guardado em disco.
  const key = `${lat.toFixed(4)},${lng.toFixed(4)},${lang}`;
  if (cache.has(key)) return NextResponse.json({ name: cache.get(key) });
  try {
    const r = await nominatimFetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&accept-language=${lang}&lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}`, { headers: { "User-Agent": env.ua }, signal: AbortSignal.timeout(8000), cache: "no-store" });
    const j = r.ok ? await r.json() as { name?: string; address?: Record<string, string> } : null;
    const a = j?.address ?? {};
    const name = (j?.name || a.amenity || a.tourism || a.leisure || a.shop || a.building || [a.road, a.suburb].filter(Boolean).join(", ") || "").slice(0, 80);
    cache.set(key, name); if (cache.size > 3000) cache.delete(cache.keys().next().value as string); // memória limitada
    return NextResponse.json({ name });
  } catch { return NextResponse.json({ name: "" }); }
}
