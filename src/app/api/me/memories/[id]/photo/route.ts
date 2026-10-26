import { NextResponse } from "next/server";
import { currentTraveller, memoryPhoto } from "@/lib/wallet";

export const runtime = "nodejs";

/** Foto de uma memória do viajante com sessão (privada: cache só no navegador dele). */
export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse(null, { status: 400 });
  const email = await currentTraveller();
  if (!email) return new NextResponse(null, { status: 401 });
  const data = await memoryPhoto(email, id);
  const m = data && /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(data);
  if (!m) return new NextResponse(null, { status: 404 });
  return new NextResponse(Buffer.from(m[2], "base64"), { headers: { "Content-Type": m[1], "Cache-Control": "private, max-age=86400" } });
}
