import { NextResponse } from "next/server";
import { requestCurrency } from "@/lib/fx";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { TOUR_PLANS } from "@/lib/pricing";
import { cityName } from "@/data/cities";
import { loadCity } from "@/lib/content";
import { LOCALES } from "@/i18n/core";
import { merchantByRef } from "@/lib/merchants";
import { normaliseFlightNo, validFlightNo } from "@/lib/flight";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Body = z.object({
  city: z.string().min(2).max(8),
  plan: z.enum(["city", "trip", "all"]),
  email: z.string().email().max(200),
  name: z.string().max(80).optional().default(""),
  flightAt: z.string().datetime({ offset: true }).optional(), // opcional em férias
  flightNo: z.string().max(12).optional().transform((v) => (v ? normaliseFlightNo(v) : "")).refine((v) => !v || validFlightNo(v)),
  locale: z.enum(LOCALES),
  ref: z.string().max(16).optional(),
  consent: z.literal(true) // pedido de acesso imediato (perda do direito de livre resolução)
});

export async function POST(req: Request) {
  if (!rateLimit(req, "checkout", 20)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });
  const b = parsed.data;
  if (b.plan === "city" && !b.flightAt) return NextResponse.json({ error: "flight_required" }, { status: 400 });
  const city = await loadCity(b.city);
  if (!city) return NextResponse.json({ error: "unknown_city" }, { status: 400 });
  if (b.flightAt && new Date(b.flightAt).getTime() < Date.now()) return NextResponse.json({ error: "flight_in_past" }, { status: 400 });

  const plan = TOUR_PLANS[b.plan];
  const ref = await merchantByRef(b.ref);
  const label = b.plan === "all" ? "All-Cities Pass — 30 days" : b.plan === "trip" ? `${cityName(city, b.locale)} — 3 days` : `${cityName(city, b.locale)} — 48 h`;
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: b.email,
      locale: b.locale === "ar" ? "auto" : b.locale,
      line_items: [{ quantity: 1, price_data: { currency: "eur", unit_amount: plan.amount, product_data: { name: `Self Guided City Tour · ${label}` } } }],
      metadata: { consentImmediate: new Date().toISOString(), plan: b.plan, city: city.id, email: b.email, name: b.name, flightAt: b.flightAt ?? "", flightNo: b.flightNo, locale: b.locale, shownCurrency: requestCurrency(), refMerchantId: ref?.status === "active" ? ref.id : "" },
      success_url: `${env.appUrl}/api/access/claim?session_id={CHECKOUT_SESSION_ID}&locale=${b.locale}`,
      cancel_url: `${env.appUrl}/${b.locale}/c/${city.id}${b.ref ? `?ref=${encodeURIComponent(b.ref)}` : ""}`
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("checkout", e);
    return NextResponse.json({ error: "stripe" }, { status: 502 });
  }
}
