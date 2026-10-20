import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { currentTraveller } from "@/lib/wallet";
import { videoOf } from "@/lib/posts";
import { posterPath, videoPath } from "@/lib/video";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Vídeo (com pedidos parciais "Range", para o telemóvel ir buscando aos bocados) ou a capa (?poster=1). */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const me = await currentTraveller();
  if (!me) return new Response("auth", { status: 401 });
  const id = await videoOf(me, params.id);
  if (!id) return new Response("not found", { status: 404 });
  const poster = new URL(req.url).searchParams.get("poster");
  const file = poster ? posterPath(id) : videoPath(id);
  const st = await stat(file).catch(() => null);
  if (!st) return new Response("not found", { status: 404 });
  const base = { "Cache-Control": "private, max-age=86400", "X-Content-Type-Options": "nosniff", "Content-Type": poster ? "image/jpeg" : "video/mp4", "Accept-Ranges": "bytes" };
  const range = req.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
  if (range && !poster) {
    let start = range[1] ? Number(range[1]) : NaN, end = range[2] ? Number(range[2]) : NaN;
    if (Number.isNaN(start)) { start = Math.max(0, st.size - end); end = st.size - 1; }
    if (Number.isNaN(end) || end >= st.size) end = Math.min(st.size - 1, start + 2 * 1024 * 1024 - 1); // pedaços de 2 MB
    if (start >= st.size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${st.size}` } });
    const body = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream;
    return new Response(body, { status: 206, headers: { ...base, "Content-Range": `bytes ${start}-${end}/${st.size}`, "Content-Length": String(end - start + 1) } });
  }
  const body = Readable.toWeb(createReadStream(file)) as ReadableStream;
  return new Response(body, { headers: { ...base, "Content-Length": String(st.size) } });
}
