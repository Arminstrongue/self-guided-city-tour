/**
 * Vídeos da carteira (estilo TikTok): guardar o envio, converter com ffmpeg para MP4 H.264 (máx. 720p, 60 s)
 * com "faststart" (começa a tocar antes de descarregar tudo) e uma imagem de capa. Um vídeo de cada vez por processo.
 */
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { env } from "./env";
import { publish } from "./live";
import { notify } from "./notify";

export const MAX_UPLOAD_BYTES = 80 * 1024 * 1024;   // 80 MB (a Cloudflare aceita até 100 MB)
export const MAX_SECONDS = 60;
const dir = () => path.resolve(env.mediaDir, "v");
export const videoPath = (id: string) => path.join(dir(), `${id}.mp4`);
export const posterPath = (id: string) => path.join(dir(), `${id}.jpg`);
const rawPath = (id: string) => path.join(dir(), `${id}.raw`);
const okId = (id: string) => /^[0-9a-f-]{36}$/.test(id);

/** Grava o corpo do pedido num ficheiro temporário, com limite de tamanho. */
export async function saveUpload(id: string, body: ReadableStream<Uint8Array>) {
  if (!okId(id)) throw new Error("id");
  await mkdir(dir(), { recursive: true });
  let n = 0;
  const limit = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, ctrl) { n += chunk.byteLength; if (n > MAX_UPLOAD_BYTES) ctrl.error(new Error("too_big")); else ctrl.enqueue(chunk); }
  });
  try {
    await pipeline(Readable.fromWeb(body.pipeThrough(limit) as never), createWriteStream(rawPath(id)));
  } catch (e) { await rm(rawPath(id), { force: true }); throw e; }
  if (n < 1000) { await rm(rawPath(id), { force: true }); throw new Error("empty"); }
  return n;
}

function run(cmd: string, args: string[], timeoutMs: number) {
  return new Promise<{ code: number; out: string; err: string }>((resolve) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => { out += d; if (out.length > 1e5) out = out.slice(-1e5); });
    p.stderr.on("data", (d) => { err += d; if (err.length > 2e4) err = err.slice(-2e4); });
    const t = setTimeout(() => p.kill("SIGKILL"), timeoutMs);
    p.on("error", (e) => { clearTimeout(t); resolve({ code: -1, out, err: String(e) }); });
    p.on("close", (code) => { clearTimeout(t); resolve({ code: code ?? -1, out, err }); });
  });
}

async function probe(file: string) {
  const r = await run("ffprobe", ["-v", "error", "-print_format", "json", "-show_entries", "format=duration:stream=codec_type", file], 30_000);
  if (r.code !== 0) return null;
  try {
    const j = JSON.parse(r.out) as { format?: { duration?: string }; streams?: { codec_type: string }[] };
    return { duration: Number(j.format?.duration ?? 0), video: Boolean(j.streams?.some((s) => s.codec_type === "video")), audio: Boolean(j.streams?.some((s) => s.codec_type === "audio")) };
  } catch { return null; }
}

/** Converte: lado menor até 720 px, H.264 + AAC, até 60 s, capa JPEG. */
async function transcode(id: string) {
  const raw = rawPath(id), tmp = path.join(dir(), `${id}.tmp.mp4`);
  const info = await probe(raw);
  if (!info?.video) throw new Error("not_video");
  const scale = "scale='if(gt(iw,ih),-2,min(720,iw))':'if(gt(iw,ih),min(720,ih),-2)'";
  const args = ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-t", String(MAX_SECONDS), "-vf", `${scale},fps=30`,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "26", "-profile:v", "main", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    ...(info.audio ? ["-c:a", "aac", "-b:a", "96k", "-ac", "2"] : ["-an"]), tmp];
  const r = await run("ffmpeg", args, 5 * 60_000);
  if (r.code !== 0) throw new Error(`ffmpeg: ${r.err.slice(-300)}`);
  await rename(tmp, videoPath(id));
  const at = Math.min(1, Math.max(0, (info.duration || 1) / 3));
  await run("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-ss", String(at), "-i", videoPath(id), "-frames:v", "1", "-vf", "scale='min(540,iw)':-2", "-q:v", "4", posterPath(id)], 60_000);
  return Math.round(Math.min(info.duration || 0, MAX_SECONDS));
}

/* ---------- Fila: um vídeo de cada vez por processo ---------- */
declare global { var __sgctVideoQ: Promise<void> | undefined } // eslint-disable-line no-var
export function enqueue(id: string) {
  const prev = globalThis.__sgctVideoQ ?? Promise.resolve();
  globalThis.__sgctVideoQ = prev.then(() => processVideo(id)).catch(() => undefined);
}
async function processVideo(id: string) {
  const d = await db();
  const [post] = await d.select().from(schema.posts).where(eq(schema.posts.id, id)).limit(1);
  if (!post) { await rm(rawPath(id), { force: true }); return; }
  try {
    const duration = await transcode(id);
    await d.update(schema.posts).set({ videoStatus: "ready", duration }).where(eq(schema.posts.id, id));
    await publish(post.author, { t: "video", id, status: "ready" });
    await notify(post.author, post.author, "video_ready", { postId: id }).catch(() => null);
  } catch (e) {
    console.error("[vídeo] falhou", id, String(e).slice(0, 300));
    await d.update(schema.posts).set({ videoStatus: "failed" }).where(eq(schema.posts.id, id));
    await publish(post.author, { t: "video", id, status: "failed" });
    await rm(videoPath(id), { force: true });
  } finally {
    await rm(rawPath(id), { force: true });
    await rm(path.join(dir(), `${id}.tmp.mp4`), { force: true });
  }
}

/** Ao arrancar: retoma vídeos que ficaram a meio (ex.: a app reiniciou durante a conversão). */
declare global { var __sgctVideoResume: boolean | undefined } // eslint-disable-line no-var
export async function resumePending() {
  if (globalThis.__sgctVideoResume) return;
  globalThis.__sgctVideoResume = true;
  const d = await db();
  const rows = await d.select({ id: schema.posts.id }).from(schema.posts).where(eq(schema.posts.videoStatus, "processing")).limit(20);
  for (const r of rows) {
    const has = await stat(rawPath(r.id)).then(() => true).catch(() => false);
    if (has) enqueue(r.id);
    else await d.update(schema.posts).set({ videoStatus: "failed" }).where(eq(schema.posts.id, r.id));
  }
}

export async function deleteVideoFiles(ids: string[]) {
  await Promise.all(ids.filter(okId).flatMap((id) => [videoPath(id), posterPath(id), rawPath(id)].map((f) => rm(f, { force: true }))));
}
