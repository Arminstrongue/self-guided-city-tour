import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { MERCHANT_PLANS } from "@/lib/pricing";
import { newRefCode } from "@/lib/merchants";
import { agentByCode } from "@/lib/agents";
import { rateLimit } from "@/lib/rate-limit";
import { loadCity } from "@/lib/content";
import { LOCALES } from "@/i18n/dictionaries";

export const runtime = "nodejs";
const handle = z.string().max(120).optional().default("").transform((s) => s.trim().replace(/^@/, "") || null);

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.enum(["food", "cafe", "stay", "hotel", "guesthouse", "shop", "exp", "bag"]),
  city: z.string(),
  stopId: z.string(),
  offer: z.string().trim().min(3).max(140),
  email: z.string().email().max(200),
  instagram: handle, tiktok: handle, facebook: handle,
  plan: z.enum(["basic", "featured", "partner"]),
  locale: z.enum(LOCALES),
  agent: z.string().max(12).optional()
});

export async function POST(req: Request) {
  if (!rateLimit(req, "merchants", 10)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });
  const b = parsed.data;
  const city = await loadCity(b.city);
  if (!city || !city.stops.some((s) => s.id === b.stopId)) return NextResponse.json({ error: "unknown_stop" }, { status: 400 });

  const agent = await agentByCode(b.agent);
  const d = await db();
  const [m] = await d.insert(schema.merchants).values({
    name: b.name, category: b.category, city: city.id, stopId: b.stopId, offer: b.offer, email: b.email.toLowerCase(),
    instagram: b.instagram, tiktok: b.tiktok, facebook: b.facebook, plan: b.plan, status: "pending", refCode: newRefCode(), agentId: agent?.status === "active" ? agent.id : null
  }).returning();

  const done = `${env.appUrl}/${b.locale}/merchants/done?id=${m.id}`;
  if (b.plan === "basic") return NextResponse.json({ url: done }); // plano grátis: aprovado no painel de administração

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: b.email,
      locale: b.locale === "ar" ? "auto" : b.locale,
      line_items: [{ quantity: 1, price_data: {
        currency: "eur", unit_amount: MERCHANT_PLANS[b.plan].amount, recurring: { interval: "month" },
        product_data: { name: `Self Guided City Tour · ${b.plan === "partner" ? "QR Partner" : "Featured"}` }
      } }],
      metadata: { merchantId: m.id },
      subscription_data: { metadata: { merchantId: m.id } },
      success_url: `${done}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.appUrl}/${b.locale}/merchants`
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("merchant checkout", e);
    return NextResponse.json({ error: "stripe" }, { status: 502 });
  }
}
