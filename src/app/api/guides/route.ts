import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendGuideLink } from "@/lib/guides";
import { GUIDE_TERMS_VERSION, GuideSignup } from "@/lib/guide-input";
import { LOCALES } from "@/i18n/core";
import { isProd } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
const Relink = z.object({ email: z.string().email().max(200), locale: z.enum(LOCALES) });

/** Registo de guia (fica "pendente" até aprovação) ou pedido de novo link para o portal. */
export async function POST(req: Request) {
  if (!rateLimit(req, "guides", 8)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const d = await db();
  if (body && !body.name) {
    const r = Relink.safeParse(body);
    if (!r.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
    const [g] = await d.select().from(schema.guides).where(eq(schema.guides.email, r.data.email.toLowerCase())).limit(1);
    const link = g ? await sendGuideLink(g.email, r.data.locale) : null;
    return NextResponse.json({ ok: true, devLink: !isProd ? link : null }); // não revela se o email existe
  }
  const p = GuideSignup.safeParse(body);
  if (!p.success) return NextResponse.json({ error: "invalid", fields: Object.keys(p.error.flatten().fieldErrors) }, { status: 400 });
  const b = p.data; const email = b.email.toLowerCase();
  const [exists] = await d.select().from(schema.guides).where(eq(schema.guides.email, email)).limit(1);
  if (!exists) {
    await d.insert(schema.guides).values({
      email, name: b.name, phone: b.phone || null, city: b.city, languages: b.languages, bio: b.bio, photo: b.photo ?? null,
      hourlyCents: Math.round(b.hourly * 100), maxPeople: b.maxPeople, meetingPoint: b.meetingPoint || null, licenseNo: b.licenseNo || null,
      activityRegNo: b.activityRegNo, insurer: b.insurer, policyNo: b.policyNo, taxId: b.taxId, taxCountry: b.taxCountry, address: b.address, birthDate: b.birthDate,
      independentAt: new Date(), termsVersion: GUIDE_TERMS_VERSION
    });
  }
  const link = await sendGuideLink(email, b.locale);
  return NextResponse.json({ ok: true, devLink: !isProd ? link : null });
}
