import { currentTraveller } from "@/lib/wallet";
import { photoOf } from "@/lib/posts";
import { isRemotePhoto, remotePhoto } from "@/lib/remote-photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Foto de uma publicação ou história — só para quem a pode ver. */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const me = await currentTraveller();
  if (!me) return new Response("auth", { status: 401 });
  const i = Math.max(0, Math.min(5, Number(new URL(req.url).searchParams.get("i") ?? 0) || 0));
  const data = await photoOf(me, params.id, i);
  if (isRemotePhoto(data)) { // fotos da conta oficial (Wikimedia/Google), guardadas no servidor
    const r = await remotePhoto(data as string);
    if (!r) return new Response("not found", { status: 404 });
    return new Response(r.body, { headers: { "Content-Type": r.type, "Cache-Control": "private, max-age=604800, immutable", "X-Content-Type-Options": "nosniff" } });
  }
  const m = data?.match(/^data:(image\/(?:jpeg|webp|png));base64,(.+)$/);
  if (!m) return new Response("not found", { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), {
    headers: { "Content-Type": m[1], "Cache-Control": "private, max-age=86400", "X-Content-Type-Options": "nosniff" }
  });
}
