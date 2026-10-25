import { test } from "node:test";
import assert from "node:assert/strict";
import { stripJpegMeta } from "./strip-meta";

test("fotos: tira EXIF/GPS e mantém a imagem", () => {
  const seg = (m: number, body: number[]) => [0xff, m, ((body.length + 2) >> 8) & 255, (body.length + 2) & 255, ...body];
  const jfif = seg(0xe0, [0x4a, 0x46, 0x49, 0x46, 0]);
  const exif = seg(0xe1, [0x45, 0x78, 0x69, 0x66, 0, 0, 1, 2, 3]);
  const scan = [0xff, 0xda, 0, 2, 9, 9, 9, 0xff, 0xd9];
  const out = stripJpegMeta(Buffer.from([0xff, 0xd8, ...jfif, ...exif, ...scan]));
  assert.deepEqual([...out], [0xff, 0xd8, ...jfif, ...scan]);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
  assert.equal(stripJpegMeta(png), png);
});

import { stripPngMeta, stripWebpMeta, cleanImageDataUrl, stripJpegMetaStrict } from "./strip-meta";
test("PNG: tira eXIf/tEXt e mantém IHDR/IDAT/IEND", () => {
  const chunk = (t: string, d: number[]) => { const b = Buffer.alloc(12 + d.length); b.writeUInt32BE(d.length, 0); b.write(t, 4, "latin1"); Buffer.from(d).copy(b, 8); return b; };
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = chunk("IHDR", [1, 2, 3]), exif = chunk("eXIf", [9, 9]), txt = chunk("tEXt", [7]), idat = chunk("IDAT", [5]), iend = chunk("IEND", []);
  const out = stripPngMeta(Buffer.concat([sig, ihdr, exif, txt, idat, iend]));
  assert.deepEqual(out, Buffer.concat([sig, ihdr, idat, iend]));
  assert.equal(stripPngMeta(Buffer.concat([sig, ihdr])), null); // sem IEND: recusado
});
test("WebP: tira EXIF/XMP e apaga as marcas no VP8X", () => {
  const ch = (id: string, d: number[]) => { const b = Buffer.alloc(8 + d.length + (d.length & 1)); b.write(id, 0, "latin1"); b.writeUInt32LE(d.length, 4); Buffer.from(d).copy(b, 8); return b; };
  const body = Buffer.concat([ch("VP8X", [0x0c, 0, 0, 0, 0, 0, 0, 0, 0, 0]), ch("VP8 ", [1, 2, 3]), ch("EXIF", [4, 5]), ch("XMP ", [6])]);
  const head = Buffer.alloc(12); head.write("RIFF", 0, "latin1"); head.writeUInt32LE(body.length + 4, 4); head.write("WEBP", 8, "latin1");
  const out = stripWebpMeta(Buffer.concat([head, body]))!;
  assert.ok(!out.includes(Buffer.from("EXIF")) && !out.includes(Buffer.from("XMP ")));
  assert.equal(out[20] & 0x0c, 0);
  assert.equal(out.readUInt32LE(4), out.length - 8);
});
test("JPEG malformado é recusado; data URL inválida também", () => {
  assert.equal(stripJpegMetaStrict(Buffer.from([0xff, 0xd8, 0x00, 0x00, 0x00])), null);
  assert.equal(cleanImageDataUrl("data:image/png;base64,AAAA"), null);
});
