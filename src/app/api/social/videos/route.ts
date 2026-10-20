import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { createVideoPost, feedVideos, removePost } from "@/lib/posts";
import { enqueue, MAX_UPLOAD_BYTES, resumePending, saveUpload } from "@/lib/video";
import { HOBBIES } from "@/lib/explore";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Feed de vídeos: ?scope=foryou|following, ?handle= (vídeos de um perfil), ?before= (página seguinte). */
export async function GET(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  void resumePending();
  const u = new URL(req.url);
  const scope = u.searchParams.get("scope") === "following" ? "following" : "foryou";
  const handle = u.searchParams.get("handle");
  return NextResponse.json(await feedVideos(me, scope, u.searchParams.get("before"), handle && /^[a-z0-9._]{3,24}$/.test(handle) ? handle : undefined));
}

const Meta = z.object({
  text: z.string().max(500).default(""),
  city: z.string().regex(/^[a-z]{2,12}$/).nullable().default(null),
  tag: z.enum(HOBBIES as unknown as [string, ...string[]]).nullable().default(null)
});

/** Enviar um vídeo: o corpo é o ficheiro; legenda, cidade e tema vão no endereço. */
export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "video-upload", 6)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const type = req.headers.get("content-type") ?? "";
  if (!/^video\//.test(type)) return NextResponse.json({ error: "type" }, { status: 415 });
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "too_big" }, { status: 413 });
  const u = new URL(req.url);
  const m = Meta.safeParse({ text: u.searchParams.get("text") ?? "", city: u.searchParams.get("city") || null, tag: u.searchParams.get("tag") || null });
  if (!m.success || !req.body) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = await createVideoPost(me, m.data);
  if ("error" in r) return NextResponse.json(r, { status: r.error === "no_profile" ? 409 : 429 });
  try {
    await saveUpload(r.id, req.body);
  } catch (e) {
    await removePost(r.id, me);
    return NextResponse.json({ error: String((e as Error).message) === "too_big" ? "too_big" : "upload" }, { status: 400 });
  }
  enqueue(r.id);
  return NextResponse.json({ id: r.id, status: "processing" });
}
