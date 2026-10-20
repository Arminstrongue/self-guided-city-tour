import { currentTraveller } from "@/lib/wallet";
import { photoOf } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Foto de uma publicação ou história — só para quem a pode ver. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const me = await currentTraveller();
  if (!me) return new Response("auth", { status: 401 });
  const data = await photoOf(me, params.id);
  const m = data?.match(/^data:(image\/(?:jpeg|webp|png));base64,(.+)$/);
  if (!m) return new Response("not found", { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), {
    headers: { "Content-Type": m[1], "Cache-Control": "private, max-age=86400", "X-Content-Type-Options": "nosniff" }
  });
}
