"use client";
import { MAX_PHOTO_CHARS } from "./booking";

/** Foto do negócio reduzida no telemóvel: lado maior ≤ 1280 px, JPEG ≤ ~350 KB. */
export async function shrink(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const k = Math.min(1, 1280 / Math.max(img.width, img.height));
  const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  let q = 0.82, data = c.toDataURL("image/jpeg", q);
  while (data.length > MAX_PHOTO_CHARS - 10_000 && q > 0.3) { q -= 0.08; data = c.toDataURL("image/jpeg", q); }
  return data;
}
