import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAdmin, sessionEmail } from "@/lib/auth";
import { resetCity, saveCity } from "@/lib/content";

export const runtime = "nodejs";

/** Guarda (cria ou substitui) o conteúdo de uma cidade. Só administradores. */
export async function PUT(req: Request, props: { params: Promise<{ city: string }> }) {
  const params = await props.params;
  if (!(await isAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null) as { city?: { id?: string }; active?: boolean } | null;
  if (!body?.city || body.city.id !== params.city) return NextResponse.json({ error: "id_mismatch" }, { status: 400 });
  try {
    const city = await saveCity(body.city, body.active !== false, (await sessionEmail()) ?? "admin");
    return NextResponse.json({ ok: true, id: city.id });
  } catch (e) {
    if (e instanceof ZodError) return NextResponse.json({ error: "invalid", issues: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, { status: 400 });
    console.error("content save", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

/** Remove as alterações e volta ao conteúdo de origem. */
export async function DELETE(_req: Request, props: { params: Promise<{ city: string }> }) {
  const params = await props.params;
  if (!(await isAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await resetCity(params.city);
  return NextResponse.json({ ok: true });
}
