import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller, sendWalletLink } from "@/lib/wallet";
import { checkSignInCode } from "@/lib/access-token";
import { linkPassesToAccount } from "@/lib/orders";
import { LOCALES } from "@/i18n/core";
import { isProd } from "@/lib/env";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
const Send = z.object({ email: z.string().email().max(200), locale: z.enum(LOCALES) });
const Verify = z.object({ challenge: z.string().min(20).max(1000), code: z.string().min(6).max(12) });

/**
 * "Pagou com outro email?": com sessão iniciada, prova-se o outro email com o código de 6 dígitos
 * e os passes comprados com ele passam a pertencer a esta conta. Sem o código, nada muda.
 */
export async function POST(req: Request) {
  const me = await currentTraveller().catch(() => null);
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "pass-link", 10)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const v = Verify.safeParse(body);
  if (v.success) {
    if (!rateLimitKey(`pass-link-code:${me}`, 8, 10 * 60_000)) return NextResponse.json({ error: "rate" }, { status: 429 });
    const email = checkSignInCode(v.data.challenge, v.data.code);
    if (!email) return NextResponse.json({ error: "code" }, { status: 400 });
    const n = await linkPassesToAccount(email, me);
    return NextResponse.json({ ok: true, linked: n });
  }
  const s = Send.safeParse(body);
  if (!s.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const email = s.data.email.toLowerCase();
  if (email === me) return NextResponse.json({ error: "same" }, { status: 400 });
  if (!rateLimitKey(`me-link:${email}`, 3, 10 * 60_000)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const r = await sendWalletLink(email, s.data.locale);
  if (isProd && !r.sent) return NextResponse.json({ error: "email" }, { status: 502 });
  return NextResponse.json({ ok: true, challenge: r.challenge, devCode: isProd ? null : r.code });
}
