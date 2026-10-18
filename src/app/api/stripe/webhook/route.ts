import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { fulfilTourSession } from "@/lib/orders";
import { activateFromSession, syncSubscription } from "@/lib/merchants";
import { commissionForInvoice, markLeadWon } from "@/lib/agents";
import { onGuideCheckout } from "@/lib/guides";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig ?? "", env.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object;
        if (s.metadata?.kind === "guide") { await onGuideCheckout(s); break; }
        if (s.mode === "payment") await fulfilTourSession(s);
        if (s.mode === "subscription") { const m = await activateFromSession(s); if (m) await markLeadWon(m); }
        break;
      }
      case "invoice.paid":
        await commissionForInvoice(event.data.object);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object);
        break;
    }
  } catch (e) {
    console.error("webhook", event.type, e);
    return NextResponse.json({ error: "handler" }, { status: 500 }); // o Stripe volta a tentar
  }
  return NextResponse.json({ received: true });
}
