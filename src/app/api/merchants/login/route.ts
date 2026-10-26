import { NextResponse } from "next/server";
import { z } from "zod";
import { LOCALES } from "@/i18n/core";
import { isProd } from "@/lib/env";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";
import { sendMerchantLink } from "@/lib/merchant-portal";

export const runtime = "nodejs";
const Body = z.object({ email: z.string().trim().email().max(200), locale: z.enum(LOCALES) });

/** Pede o link de acesso à Área do comerciante. Resposta igual exista ou não o negócio. */
export async function POST(req: Request) {
  if (!rateLimit(req, "merchant-login", 6)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const b = Body.safeParse(await req.json().catch(() => null));
  if (!b.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  // No máximo 3 links por email por hora (evita encher a caixa de um negócio a partir de vários IP).
  if (!rateLimitKey(`merchant-mail:${b.data.email.toLowerCase()}`, 3, 3600_000)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const r = await sendMerchantLink(b.data.email, b.data.locale);
  // Sem serviço de email (só no computador de desenvolvimento) devolvemos o link para testar.
  return NextResponse.json({ ok: true, devLink: !isProd ? r.link : null });
}
