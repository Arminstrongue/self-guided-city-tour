import { imageBytes } from "@/lib/strip-meta";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { currentTraveller } from "@/lib/wallet";
import { messageMedia } from "@/lib/chat";
import { voicePath } from "@/lib/voice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Foto (?k=photo) ou nota de voz (?k=audio, com pedidos parciais) de uma mensagem — só para quem está na conversa. */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const me = await currentTraveller();
  if (!me) return new Response("auth", { status: 401 });
  const m = await messageMedia(me, params.id);
  if (!m) return new Response("not found", { status: 404 });
  const base = { "Cache-Control": "private, max-age=86400", "X-Content-Type-Options": "nosniff" };
  if (new URL(req.url).searchParams.get("k") === "audio") {
    if (!m.audio) return new Response("not found", { status: 404 });
    const file = voicePath(m.audio);
    const st = await stat(file).catch(() => null);
    if (!st) return new Response("not found", { status: 404 });
    const h = { ...base, "Content-Type": "audio/mp4", "Accept-Ranges": "bytes" };
    const range = req.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = Math.min(st.size - 1, range[2] ? Number(range[2]) : st.size - 1);
      if (start >= st.size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${st.size}` } });
      return new Response(Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream, { status: 206, headers: { ...h, "Content-Range": `bytes ${start}-${end}/${st.size}`, "Content-Length": String(end - start + 1) } });
    }
    return new Response(Readable.toWeb(createReadStream(file)) as ReadableStream, { headers: { ...h, "Content-Length": String(st.size) } });
  }
  const d = m.photo?.match(/^data:(image\/(?:jpeg|webp|png));base64,(.+)$/);
  if (!d) return new Response("not found", { status: 404 });
  return new Response(imageBytes(d[1], d[2]), { headers: { ...base, "Content-Type": d[1] } });
}
