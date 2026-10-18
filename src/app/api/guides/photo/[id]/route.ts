import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

/** Foto do guia (guardada como data URL pequena), servida com cache. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return new Response(null, { status: 404 });
  const d = await db();
  const [g] = await d.select({ photo: schema.guides.photo, status: schema.guides.status }).from(schema.guides).where(eq(schema.guides.id, params.id)).limit(1);
  const m = g?.photo?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!m) return new Response(null, { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), { headers: { "Content-Type": m[1], "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
