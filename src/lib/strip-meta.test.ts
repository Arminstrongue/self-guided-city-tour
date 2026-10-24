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
