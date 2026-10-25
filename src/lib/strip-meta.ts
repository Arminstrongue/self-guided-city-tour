/**
 * Tira os metadados das fotografias (EXIF/XMP com localização GPS, aparelho, data; IPTC; texto) sem as reprocessar.
 * JPEG, PNG e WebP. Serve de barreira no servidor: o navegador já reduz as fotos, mas um cliente direto à API podia não o fazer.
 * Estrutura inesperada → `null` (a foto é recusada em vez de passar com metadados).
 */
import { z } from "zod";

/** JPEG sem APP1 (EXIF/XMP) nem APP13 (IPTC). Não-JPEG volta igual; JPEG malformado → null. */
export function stripJpegMetaStrict(buf: Buffer): Buffer | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  const parts: Buffer[] = [buf.subarray(0, 2)];
  let i = 2;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    if (marker === 0xff) { i += 1; continue; } // enchimento
    if (marker === 0xda) { parts.push(buf.subarray(i)); return Buffer.concat(parts); } // início da imagem: o resto fica igual
    const len = buf.readUInt16BE(i + 2);
    if (len < 2 || i + 2 + len > buf.length) return null;
    const drop = marker === 0xe1 || marker === 0xed || marker === 0xfe; // APP1 (EXIF/XMP), APP13 (IPTC), comentário
    if (!drop) parts.push(buf.subarray(i, i + 2 + len));
    i += 2 + len;
  }
  return null;
}
/** Compatibilidade: em caso de dúvida devolve o original (usado só para respostas de fotos antigas). */
export function stripJpegMeta(buf: Buffer): Buffer {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return buf;
  return stripJpegMetaStrict(buf) ?? buf;
}

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_DROP = new Set(["eXIf", "tEXt", "iTXt", "zTXt", "tIME"]);
/** PNG sem blocos de texto/EXIF/data. Malformado → null. */
export function stripPngMeta(buf: Buffer): Buffer | null {
  if (buf.length < 8 || !buf.subarray(0, 8).equals(PNG_SIG)) return null;
  const parts: Buffer[] = [PNG_SIG];
  let i = 8;
  while (i + 12 <= buf.length) {
    const len = buf.readUInt32BE(i), type = buf.toString("latin1", i + 4, i + 8), end = i + 12 + len;
    if (end > buf.length) return null;
    if (!PNG_DROP.has(type)) parts.push(buf.subarray(i, end));
    i = end;
    if (type === "IEND") return Buffer.concat(parts);
  }
  return null;
}

/** WebP sem blocos EXIF/XMP (e com as marcas correspondentes do VP8X apagadas). Malformado → null. */
export function stripWebpMeta(buf: Buffer): Buffer | null {
  if (buf.length < 12 || buf.toString("latin1", 0, 4) !== "RIFF" || buf.toString("latin1", 8, 12) !== "WEBP") return null;
  const parts: Buffer[] = [];
  let i = 12;
  while (i + 8 <= buf.length) {
    const id = buf.toString("latin1", i, i + 4), size = buf.readUInt32LE(i + 4), end = i + 8 + size + (size & 1);
    if (i + 8 + size > buf.length) return null;
    const chunk = Buffer.from(buf.subarray(i, Math.min(end, buf.length)));
    if (id === "VP8X" && size >= 1) chunk[8] &= ~0x0c; // sem EXIF (0x08) nem XMP (0x04)
    if (id !== "EXIF" && id !== "XMP ") parts.push(chunk);
    i = end;
  }
  const body = Buffer.concat(parts);
  const head = Buffer.alloc(12);
  head.write("RIFF", 0, "latin1"); head.writeUInt32LE(body.length + 4, 4); head.write("WEBP", 8, "latin1");
  return Buffer.concat([head, body]);
}

/** Bytes limpos conforme o tipo; null se o conteúdo não for mesmo desse tipo. */
export function stripImage(mime: string, raw: Buffer): Buffer | null {
  if (mime === "image/jpeg") return stripJpegMetaStrict(raw);
  if (mime === "image/png") return stripPngMeta(raw);
  if (mime === "image/webp") return stripWebpMeta(raw);
  return null;
}

/** Data URL de imagem limpa de metadados (ou null se for inválida). */
export function cleanImageDataUrl(url: string): string | null {
  const m = url.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return null;
  const out = stripImage(m[1], Buffer.from(m[2], "base64"));
  return out ? `data:${m[1]};base64,${out.toString("base64")}` : null;
}

/** Campo zod para fotos em data URL: valida o formato e grava sem metadados (GPS incluído). */
export const imageDataUrl = (max: number) => z.string().max(max).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
  .transform((v, ctx) => { const c = cleanImageDataUrl(v); if (!c) { ctx.addIssue({ code: z.ZodIssueCode.custom, message: "image" }); return z.NEVER; } return c; });

/** Para respostas: devolve os bytes de uma imagem em data URL, sem metadados. */
export function imageBytes(mime: string, b64: string): Buffer {
  const raw = Buffer.from(b64, "base64");
  return stripImage(mime, raw) ?? (mime === "image/jpeg" ? stripJpegMeta(raw) : raw);
}
