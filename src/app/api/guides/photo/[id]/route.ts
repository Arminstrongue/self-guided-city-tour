import { imageBytes } from "@/lib/strip-meta";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { currentGuide } from "@/lib/guides";

export const runtime = "nodejs";

/** Foto do guia (guardada como data URL pequena), servida com cache. */
export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return new Response(null, { status: 404 });
  const d = await db();
  const [g] = await d.select({ photo: schema.guides.photo, status: schema.guides.status }).from(schema.guides).where(eq(schema.guides.id, params.id)).limit(1);
  const m = g?.photo?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!m) return new Response(null, { status: 404 });
  // Só guias aprovados têm a foto pública; o próprio guia vê sempre a sua (portal, pendente de aprovação).
  if (g.status !== "active" && (await currentGuide().catch(() => null))?.id !== params.id) return new Response(null, { status: 404 });
  return new Response(imageBytes(m[1], m[2]), { headers: { "Content-Type": m[1], "Cache-Control": g.status === "active" ? "public, max-age=3600, stale-while-revalidate=86400" : "private, no-store" } });
}
