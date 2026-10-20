/**
 * Notas de voz nas conversas: o telemóvel grava (webm/opus no Android, mp4 no iPhone) e o servidor converte
 * para AAC .m4a, que toca em todos. Máximo 2 minutos e 5 MB.
 */
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { env } from "./env";

export const MAX_VOICE_BYTES = 5 * 1024 * 1024;
const dir = () => path.resolve(env.mediaDir, "a");
export const voicePath = (file: string) => path.join(dir(), path.basename(file));

/** Grava, converte e devolve o nome do ficheiro final ("<id>.m4a"). */
export async function saveVoice(id: string, body: ReadableStream<Uint8Array>) {
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("id");
  await mkdir(dir(), { recursive: true });
  const raw = path.join(dir(), `${id}.raw`), out = path.join(dir(), `${id}.m4a`);
  let n = 0;
  const limit = new TransformStream<Uint8Array, Uint8Array>({ transform(c, ctrl) { n += c.byteLength; if (n > MAX_VOICE_BYTES) ctrl.error(new Error("too_big")); else ctrl.enqueue(c); } });
  try {
    await pipeline(Readable.fromWeb(body.pipeThrough(limit) as never), createWriteStream(raw));
    if (n < 500) throw new Error("empty");
    const code = await new Promise<number>((res) => {
      const p = spawn("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-t", "120", "-vn", "-c:a", "aac", "-b:a", "64k", "-ac", "1", "-movflags", "+faststart", out], { stdio: "ignore" });
      const t = setTimeout(() => p.kill("SIGKILL"), 60_000);
      p.on("error", () => { clearTimeout(t); res(-1); });
      p.on("close", (c) => { clearTimeout(t); res(c ?? -1); });
    });
    if (code !== 0 || !(await stat(out).catch(() => null))) throw new Error("convert");
    return `${id}.m4a`;
  } catch (e) { await rm(out, { force: true }); throw e; } finally { await rm(raw, { force: true }); }
}

export async function deleteVoice(files: string[]) {
  await Promise.all(files.map((f) => rm(voicePath(f), { force: true })));
}
