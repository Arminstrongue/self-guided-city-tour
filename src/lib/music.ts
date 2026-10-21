/**
 * Som próprio nas publicações e histórias: o autor carrega um ficheiro de áudio, escolhe o início
 * e o servidor guarda 30 s em AAC (.m4a). Só o autor pode usar o ficheiro que carregou.
 */
import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { env } from "./env";

export const MAX_MUSIC_BYTES = 20 * 1024 * 1024;
export const CLIP_SECS = 30;
const dir = () => path.resolve(env.mediaDir, "m");
const owner = (email: string) => createHash("sha256").update(email).digest("hex").slice(0, 24);
export const musicPath = (token: string) => path.join(dir(), `${path.basename(token)}.m4a`);
const okToken = (t: string) => /^[0-9a-f-]{36}$/.test(t);

/** Recebe o áudio, corta 30 s a partir de `start` e devolve o identificador do ficheiro. */
export async function saveOwnMusic(me: string, body: ReadableStream<Uint8Array>, start: number) {
  await mkdir(dir(), { recursive: true });
  const id = randomUUID();
  const raw = path.join(dir(), `${id}.raw`), out = musicPath(id);
  let n = 0;
  const limit = new TransformStream<Uint8Array, Uint8Array>({ transform(c, ctrl) { n += c.byteLength; if (n > MAX_MUSIC_BYTES) ctrl.error(new Error("too_big")); else ctrl.enqueue(c); } });
  try {
    await pipeline(Readable.fromWeb(body.pipeThrough(limit) as never), createWriteStream(raw));
    if (n < 1000) throw new Error("empty");
    const ss = Math.max(0, Math.min(3600, Number.isFinite(start) ? start : 0));
    const code = await new Promise<number>((res) => {
      const p = spawn("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-ss", String(ss), "-i", raw, "-t", String(CLIP_SECS), "-vn",
        "-af", `afade=t=in:d=0.3,afade=t=out:st=${CLIP_SECS - 1.5}:d=1.5,loudnorm=I=-15:TP=-1.5`, "-c:a", "aac", "-b:a", "128k", "-ac", "2", "-movflags", "+faststart", out], { stdio: "ignore" });
      const t = setTimeout(() => p.kill("SIGKILL"), 90_000);
      p.on("error", () => { clearTimeout(t); res(-1); });
      p.on("close", (c) => { clearTimeout(t); res(c ?? -1); });
    });
    const st = await stat(out).catch(() => null);
    if (code !== 0 || !st || st.size < 2000) throw new Error("convert");
    await writeFile(path.join(dir(), `${id}.json`), JSON.stringify({ owner: owner(me), at: Date.now() }));
    return id;
  } catch (e) { await rm(out, { force: true }); throw e; } finally { await rm(raw, { force: true }); }
}

/** O ficheiro existe e foi carregado por este viajante. */
export async function ownsMusic(me: string, token: string) {
  if (!okToken(token)) return false;
  try { return JSON.parse(await readFile(path.join(dir(), `${token}.json`), "utf8")).owner === owner(me); } catch { return false; }
}

export async function deleteOwnMusic(tokens: (string | null | undefined)[]) {
  await Promise.all(tokens.filter((t): t is string => Boolean(t && okToken(t))).flatMap((t) => [rm(musicPath(t), { force: true }), rm(path.join(dir(), `${t}.json`), { force: true })]));
}
