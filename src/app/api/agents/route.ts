import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { newAgentCode, sendAgentLink } from "@/lib/agents";
import { LOCALES } from "@/i18n/core";
import { isProd } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().email().max(200),
  phone: z.string().trim().max(30).optional(),
  country: z.string().trim().max(2).optional(),
  locale: z.enum(LOCALES)
});

/** Registo de comercial ou pedido de novo link de entrada (mesmo endpoint). */
export async function POST(req: Request) {
  if (!rateLimit(req, "agents", 10)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const b = p.data; const email = b.email.toLowerCase();
  const d = await db();
  const [exists] = await d.select().from(schema.agents).where(eq(schema.agents.email, email)).limit(1);
  if (!exists) {
    if (!b.name) return NextResponse.json({ error: "name_required" }, { status: 400 });
    await d.insert(schema.agents).values({ name: b.name, email, phone: b.phone || null, country: b.country?.toUpperCase() || null, code: newAgentCode() });
  }
  const link = await sendAgentLink(email, b.locale);
  // Sem serviço de email (só no computador de desenvolvimento) devolvemos o link para testar.
  return NextResponse.json({ ok: true, devLink: !isProd ? link : null });
}
