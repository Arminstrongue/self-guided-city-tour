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
import { cookies } from "next/headers";
import { REF_COOKIE } from "@/lib/invites";
import { holdCredit, quote, releaseHold } from "@/lib/referrals";
import { currentTraveller } from "@/lib/wallet";
import { parseTrip } from "@/lib/trip";
import { company } from "@/legal/content";

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
  consent: z.literal(true), // pedido de acesso imediato (perda do direito de livre resolução)
  terms: z.literal(true), // aceitou os Termos e a Política de privacidade
  trip: z.unknown().optional() // plano de viagem (início, fim, modalidade); validado com parseTrip
});

export async function POST(req: Request) {
  if (!rateLimit(req, "checkout", 20)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });
  const b = parsed.data;
  const trip = parseTrip(b.trip);
  // Passe de 48 h: precisa da hora de partida, exceto quando o viajante fica na cidade.
  if (b.plan === "city" && !b.flightAt && trip?.mode !== "stay") return NextResponse.json({ error: "flight_required" }, { status: 400 });
  // Metadados da Stripe: no máximo 500 caracteres por valor (nomes encurtados).
  const short = trip ? { ...trip, next: undefined, start: trip.start.kind === "airport" ? trip.start : { ...trip.start, label: trip.start.label.slice(0, 60) }, end: trip.end.kind === "airport" ? trip.end : { ...trip.end, label: trip.end.label.slice(0, 60) } } : null;
  const tripMeta = short ? JSON.stringify(short).slice(0, 500) : "";
  const city = await loadCity(b.city);
  if (!city) return NextResponse.json({ error: "unknown_city" }, { status: 400 });
  if (b.flightAt && new Date(b.flightAt).getTime() < Date.now()) return NextResponse.json({ error: "flight_in_past" }, { status: 400 });

  const plan = TOUR_PLANS[b.plan];
  // Convites: desconto de amigo na primeira compra e crédito de quem convidou.
  const q = await quote({ amount: plan.amount, buyerEmail: b.email, refHandle: cookies().get(REF_COOKIE)?.value ?? null, signedEmail: await currentTraveller().catch(() => null) });
  // Reserva o crédito agora; se outro pagamento aberto já o usou, este segue sem crédito (preço recalculado).
  const creditHold = q.creditUsed > 0 ? await holdCredit(b.email, q.creditUsed) : null;
  if (q.creditUsed > 0 && !creditHold) { q.amount += q.creditUsed; q.creditUsed = 0; }
  const ref = await merchantByRef(b.ref);
  const label = b.plan === "all" ? "All-Cities Pass — 30 days" : b.plan === "trip" ? `${cityName(city, b.locale)} — 3 days` : `${cityName(city, b.locale)} — 48 h`;
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: b.email,
      locale: b.locale === "ar" ? "auto" : b.locale,
      line_items: [{ quantity: 1, price_data: { currency: "eur", unit_amount: q.amount, product_data: { name: `VOYBU · ${label}` } } }],
      metadata: { consentImmediate: new Date().toISOString(), termsAccepted: new Date().toISOString(), termsVersion: company().updated, plan: b.plan, city: city.id, email: b.email, name: b.name, flightAt: b.flightAt ?? "", flightNo: b.flightNo, locale: b.locale, shownCurrency: requestCurrency(), refMerchantId: ref?.status === "active" ? ref.id : "", refInviter: q.inviter?.email ?? "", friendOff: String(q.friendOff), creditUsed: String(q.creditUsed), creditHold: creditHold ?? "", trip: tripMeta },
      success_url: `${env.appUrl}/api/access/claim?session_id={CHECKOUT_SESSION_ID}&locale=${b.locale}`,
      cancel_url: `${env.appUrl}/${b.locale}/c/${city.id}${b.ref ? `?ref=${encodeURIComponent(b.ref)}` : ""}`
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("checkout", e);
    await releaseHold(creditHold);
    return NextResponse.json({ error: "stripe" }, { status: 502 });
  }
}
