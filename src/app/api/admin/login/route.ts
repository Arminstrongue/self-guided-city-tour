import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminEmail } from "@/lib/auth";
import { createPurposeToken } from "@/lib/access-token";
import { sendEmail } from "@/lib/email";
import { env, isProd } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
const Body = z.object({ email: z.string().email().max(200), locale: z.string().max(5).optional() });

/** Envia um link de entrada (válido 20 min) só se o email estiver em ADMIN_EMAILS. A resposta é sempre igual. */
export async function POST(req: Request) {
  if (!rateLimit(req, "admin-login", 5)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const email = p.data.email.toLowerCase();
  let link: string | null = null;
  if (isAdminEmail(email)) {
    link = `${env.appUrl}/api/admin/link?token=${encodeURIComponent(createPurposeToken(email, "admin-link", 20 * 60))}&locale=${p.data.locale ?? "pt"}`;
    const btn = `<a href="${link}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;font-weight:600;padding:12px 26px;border-radius:999px">Entrar na administração</a>`;
    await sendEmail(email, "Self Guided City Tour — entrada na administração",
      `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:16px;color:#1d1d1f"><p>Pediu para entrar na administração.</p><p>${btn}</p><p style="color:#6e6e73;font-size:13px">O link vale 20 minutos. Se não foi você, ignore este email.</p></div>`,
      `Entrar na administração (válido 20 min): ${link}`).catch(() => null);
  }
  return NextResponse.json({ ok: true, devLink: !isProd ? link : null });
}
