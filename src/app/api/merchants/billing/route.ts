import { NextResponse } from "next/server";
import { z } from "zod";
import { currentMerchantEmail, ownMerchant } from "@/lib/merchant-portal";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { LOCALES } from "@/i18n/core";

export const runtime = "nodejs";
const Body = z.object({ id: z.guid(), locale: z.enum(LOCALES) });

/** Abre o portal de faturação da Stripe (mudar cartão, ver faturas, cancelar) para planos pagos. */
export async function POST(req: Request) {
  const email = await currentMerchantEmail();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const b = Body.safeParse(await req.json().catch(() => null));
  if (!b.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const m = await ownMerchant(email, b.data.id);
  if (!m?.stripeCustomerId) return NextResponse.json({ error: "no_billing" }, { status: 404 });
  try {
    const s = await stripe().billingPortal.sessions.create({ customer: m.stripeCustomerId, return_url: `${env.appUrl}/${b.data.locale}/merchants/manage` });
    return NextResponse.json({ url: s.url });
  } catch (e) {
    console.error("merchant billing", e);
    return NextResponse.json({ error: "stripe" }, { status: 502 });
  }
}
