import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { fulfilTourSession } from "@/lib/orders";
import { ACCESS_COOKIE, ACCESS_TTL_S, createAccessToken } from "@/lib/access-token";
import { env, isProd } from "@/lib/env";
import { isLocale } from "@/i18n/core";

export const runtime = "nodejs";

/** Regresso do Stripe Checkout: confirma o pagamento, regista o acesso e guarda o cookie. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("session_id") ?? "";
  const l = url.searchParams.get("locale") ?? "en";
  const locale = isLocale(l) ? l : "en";
  if (!id.startsWith("cs_")) return NextResponse.redirect(`${env.appUrl}/${locale}`);

  let session: Awaited<ReturnType<ReturnType<typeof stripe>["checkout"]["sessions"]["retrieve"]>> | null = null;
  try { session = await stripe().checkout.sessions.retrieve(id); } catch { session = null; }
  const dest = new URL(`${env.appUrl}/${locale}/success`);
  if (!session) { dest.searchParams.set("pending", "1"); return NextResponse.redirect(dest); }
  // Um erro aqui (base de dados) não pode dar uma página de erro a quem acabou de pagar: fica "a processar" e o webhook trata.
  const access = await fulfilTourSession(session).catch((e) => { console.error("claim", e); return null; });
  if (!access) { dest.searchParams.set("pending", "1"); return NextResponse.redirect(dest); }
  if (access.city) dest.searchParams.set("city", access.city);
  // O id da sessão Stripe fica no histórico do navegador: só abre sessão logo a seguir ao pagamento (2 h).
  // Depois disso, entra-se pelo link enviado por email.
  // Conta a partir do pagamento confirmado (registo do acesso), não de quando o Stripe abriu a página de pagamento.
  const fresh = Date.now() - new Date(access.createdAt).getTime() < 2 * 3600_000;
  const res = NextResponse.redirect(dest);
  if (!fresh) return res;
  res.cookies.set(ACCESS_COOKIE, createAccessToken(access.email), { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: ACCESS_TTL_S, path: "/" });
  return res;
}
