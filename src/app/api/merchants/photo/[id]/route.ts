import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

/** Foto de um negócio parceiro: /api/merchants/photo/<id>?i=0 (0 a 3). */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return new Response(null, { status: 404 });
  const i = Math.max(0, Math.min(3, Number(new URL(req.url).searchParams.get("i")) || 0));
  const d = await db();
  const [p] = await d.select({ data: schema.merchantPhotos.data }).from(schema.merchantPhotos)
    .where(and(eq(schema.merchantPhotos.merchantId, params.id), eq(schema.merchantPhotos.idx, i))).limit(1);
  const m = p?.data.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!m) return new Response(null, { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), { headers: { "Content-Type": m[1], "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } });
}
