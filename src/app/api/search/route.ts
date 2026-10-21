import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { globalSearch } from "@/lib/search";
import { isLocale } from "@/i18n/core";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Pesquisa global: cidades, paragens, pessoas, #hashtags e guias. */
export async function GET(req: Request) {
  if (!rateLimit(req, "search", 90)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const u = new URL(req.url);
  const l = u.searchParams.get("l") ?? "en";
  const me = await currentTraveller().catch(() => null);
  return NextResponse.json(await globalSearch(me, (u.searchParams.get("q") ?? "").slice(0, 60), isLocale(l) ? l : "en"), { headers: { "Cache-Control": "no-store" } });
}
