import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { currentTraveller } from "@/lib/wallet";
import { musicOf } from "@/lib/posts";
import { musicPath } from "@/lib/music";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Som próprio de uma publicação ou história (com pedidos parciais), só para quem a pode ver. */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const me = await currentTraveller();
  if (!me) return new Response("auth", { status: 401 });
  const own = await musicOf(me, params.id);
  if (!own) return new Response("not found", { status: 404 });
  const file = musicPath(own);
  const st = await stat(file).catch(() => null);
  if (!st) return new Response("not found", { status: 404 });
  const h = { "Content-Type": "audio/mp4", "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=86400", "X-Content-Type-Options": "nosniff" };
  const range = req.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = Math.min(st.size - 1, range[2] ? Number(range[2]) : st.size - 1);
    if (start >= st.size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${st.size}` } });
    return new Response(Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream, { status: 206, headers: { ...h, "Content-Range": `bytes ${start}-${end}/${st.size}`, "Content-Length": String(end - start + 1) } });
  }
  return new Response(Readable.toWeb(createReadStream(file)) as ReadableStream, { headers: { ...h, "Content-Length": String(st.size) } });
}
