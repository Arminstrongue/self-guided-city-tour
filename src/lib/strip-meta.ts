/**
 * Tira os metadados de uma fotografia JPEG (EXIF/XMP com localização GPS, aparelho, data; IPTC) sem a reprocessar.
 * Serve de segunda barreira: o navegador já reduz as fotos antes do envio, mas um cliente direto à API podia não o fazer.
 */
export function stripJpegMeta(buf: Buffer): Buffer {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return buf; // não é JPEG
  const parts: Buffer[] = [buf.subarray(0, 2)];
  let i = 2;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff) return buf; // estrutura inesperada: devolve como está
    const marker = buf[i + 1];
    if (marker === 0xda) { parts.push(buf.subarray(i)); return Buffer.concat(parts); } // início da imagem: o resto fica igual
    const len = buf.readUInt16BE(i + 2);
    if (len < 2 || i + 2 + len > buf.length) return buf;
    const drop = marker === 0xe1 || marker === 0xed; // APP1 (EXIF/XMP) e APP13 (IPTC)
    if (!drop) parts.push(buf.subarray(i, i + 2 + len));
    i += 2 + len;
  }
  return buf;
}

/** Para respostas: devolve os bytes de uma imagem em data URL, sem metadados se for JPEG. */
export function imageBytes(mime: string, b64: string): Buffer {
  const raw = Buffer.from(b64, "base64");
  return mime === "image/jpeg" ? stripJpegMeta(raw) : raw;
}
