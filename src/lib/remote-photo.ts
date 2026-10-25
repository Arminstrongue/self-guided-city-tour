/**
 * Fotos externas da conta oficial (Wikimedia, Google): descarregadas uma vez pelo servidor e guardadas no volume `media`.
 * Assim aparecem sempre (sem depender de ligações temporárias nem de limites dos sites de origem) e ficam em cache no Cloudflare.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "./env";

// Só Wikimedia: fotos da Google não podem ser guardadas (termos da Google).
const ALLOWED = /^https:\/\/upload\.wikimedia\.org\//;
const MAX = 6 * 1024 * 1024;
export const isRemotePhoto = (u: string | null | undefined): boolean => Boolean(u && ALLOWED.test(u));

export async function remotePhoto(url: string): Promise<{ body: Buffer; type: string } | null> {
  if (!ALLOWED.test(url)) return null;
  const key = createHash("sha1").update(url).digest("hex");
  const dir = path.resolve(env.mediaDir, "r");
  const file = path.join(dir, `${key}.bin`);
  try {
    const raw = await readFile(file);
    const nl = raw.indexOf(10);
    return { type: raw.subarray(0, nl).toString(), body: raw.subarray(nl + 1) };
  } catch { /* ainda não está guardada */ }
  try {
    const r = await fetch(url, { headers: { "User-Agent": env.ua }, signal: AbortSignal.timeout(12_000) });
    const type = r.headers.get("content-type") ?? "";
    if (!r.ok || !/^image\/(jpeg|png|webp|gif)/.test(type)) return null;
    const body = Buffer.from(await r.arrayBuffer());
    if (body.length > MAX) return null;
    await mkdir(dir, { recursive: true });
    await writeFile(file, Buffer.concat([Buffer.from(`${type}\n`), body])).catch(() => null);
    return { body, type };
  } catch { return null; }
}
