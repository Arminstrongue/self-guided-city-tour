import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { stripe } from "@/lib/stripe";
import { fulfilTourSession, linkAccessToAccount } from "@/lib/orders";
import { env } from "@/lib/env";
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
  // Segurança: pagar NUNCA inicia sessão numa conta. Quem paga pode escrever qualquer email no Stripe;
  // se abrisse sessão com esse email, bastava comprar um passe com o email de outra pessoa para lhe entrar na conta.
  // - Já com sessão: o passe fica ligado a essa conta (segue a conta, mesmo pago com outro email).
  // - Sem sessão: entra-se com o link/código enviado para o email do pagamento (prova que o email é seu).
  const me = await currentTraveller().catch(() => null);
  if (me && me !== access.email && !access.accountEmail) await linkAccessToAccount(access.id, me).catch(() => {});
  if (!me) dest.searchParams.set("paid", "1");
  return NextResponse.redirect(dest);
}
