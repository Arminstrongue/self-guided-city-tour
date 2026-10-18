import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { currentGuide } from "@/lib/guides";
import { GuideProfile } from "@/lib/guide-input";

export const runtime = "nodejs";

/** O guia atualiza o perfil (a cidade só muda com nova aprovação). */
export async function PATCH(req: Request) {
  const g = await currentGuide();
  if (!g) return NextResponse.json({ error: "auth" }, { status: 401 });
  const p = GuideProfile.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid", fields: Object.keys(p.error.flatten().fieldErrors) }, { status: 400 });
  const b = p.data;
  const d = await db();
  await d.update(schema.guides).set({
    name: b.name, phone: b.phone || null, languages: b.languages, bio: b.bio, hourlyCents: Math.round(b.hourly * 100), maxPeople: b.maxPeople,
    meetingPoint: b.meetingPoint || null, licenseNo: b.licenseNo || null, ...(b.photo !== undefined ? { photo: b.photo } : {}),
    ...(b.city !== g.city ? { city: b.city, status: g.status === "active" ? "pending" as const : g.status } : {})
  }).where(eq(schema.guides.id, g.id));
  return NextResponse.json({ ok: true });
}
