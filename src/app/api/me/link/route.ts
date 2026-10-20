import { NextResponse } from "next/server";
import { z } from "zod";
import { sendWalletLink } from "@/lib/wallet";
import { LOCALES } from "@/i18n/dictionaries";
import { isProd } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
const Body = z.object({ email: z.string().email().max(200), locale: z.enum(LOCALES) });

/** Envia o link de entrada na carteira (a resposta é igual exista ou não conta: a conta cria-se ao entrar). */
export async function POST(req: Request) {
  if (!rateLimit(req, "me-link", 5)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const link = await sendWalletLink(p.data.email.toLowerCase(), p.data.locale);
  return NextResponse.json({ ok: true, devLink: isProd ? null : link });
}
