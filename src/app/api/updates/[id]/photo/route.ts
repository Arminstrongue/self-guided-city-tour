import { NextResponse } from "next/server";
import { updatePhoto } from "@/lib/updates";
import { hasCityAccess } from "@/lib/city-access";
import { imageBytes } from "@/lib/strip-meta";

export const runtime = "nodejs";

/** Foto de uma atualização (sem metadados), com cache — a lista não carrega as fotos todas de uma vez. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse(null, { status: 400 });
  const u = await updatePhoto(id);
  // Como a lista: só com passe da cidade.
  if (u && !(await hasCityAccess(u.city))) return new NextResponse(null, { status: 402 });
  const m = u?.photo.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!m) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(imageBytes(m[1], m[2])), { headers: { "Content-Type": m[1], "Cache-Control": "private, max-age=3600" } });
}
