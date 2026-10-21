import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { myProfile } from "@/lib/social";
import { MAX_MUSIC_BYTES, saveOwnMusic } from "@/lib/music";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Som próprio: corpo = ficheiro de áudio; ?start=segundos. Devolve o identificador para usar na publicação. */
export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!(await myProfile(me))) return NextResponse.json({ error: "no_profile" }, { status: 409 });
  if (!rateLimit(req, "music-up", 12)) return NextResponse.json({ error: "rate" }, { status: 429 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX_MUSIC_BYTES) return NextResponse.json({ error: "too_big" }, { status: 413 });
  if (!/^(audio|video)\//.test(req.headers.get("content-type") ?? "") || !req.body) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const start = Number(new URL(req.url).searchParams.get("start") ?? 0);
  try { return NextResponse.json({ id: await saveOwnMusic(me, req.body, start) }); }
  catch (e) { const m = (e as Error).message; return NextResponse.json({ error: m === "too_big" ? "too_big" : "convert" }, { status: m === "too_big" ? 413 : 400 }); }
}
