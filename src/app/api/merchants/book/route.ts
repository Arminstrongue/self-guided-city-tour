import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { rateLimit, rateLimitKey } from "@/lib/rate-limit";
import { BookingBody, bookKind, checkBooking } from "@/lib/booking";
import { businessMail, travellerMail } from "@/lib/booking-emails";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

/** Pedido de reserva a um negócio parceiro: guarda, envia ao negócio (responder = falar com o viajante) e confirma ao viajante. */
export async function POST(req: Request) {
  if (!rateLimit(req, "merchant-book", 6)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const parsed = BookingBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const b = parsed.data;
  // Cada endereço recebe no máximo 3 pedidos por dia (evita usar o formulário para enviar emails a terceiros).
  if (!rateLimitKey(`merchant-book:${b.email.toLowerCase()}`, 3, 24 * 3600_000)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const d = await db();
  const [m] = await d.select().from(schema.merchants).where(eq(schema.merchants.id, b.merchantId)).limit(1);
  const kind = m ? bookKind(m.category) : null;
  if (!m || !kind || m.status !== "active" || m.paused || m.bookMode !== "request") return NextResponse.json({ error: "unavailable" }, { status: 404 });
  const bad = checkBooking(kind, b);
  if (bad) return NextResponse.json({ error: bad }, { status: 400 });
  const option = m.bookOptions.some((o) => o.name === b.option) ? b.option : "";

  const row = {
    merchantId: m.id, kind, option, dateFrom: b.dateFrom, dateTo: kind === "room" || kind === "car" ? b.dateTo : "",
    time: kind === "room" ? "" : b.time, people: b.people, units: kind === "room" || kind === "bag" ? b.units : 1,
    name: b.name, email: b.email.toLowerCase(), phone: b.phone.replace(/[^\d+ ]/g, "").slice(0, 20), note: b.note, locale: b.locale
  };
  await d.insert(schema.bookingRequests).values(row);
  const data = { ...row, business: m.name };
  const toBiz = businessMail(data, m.locale);
  const sent = await sendEmail(m.email, toBiz.subject, toBiz.html, undefined, row.email);
  const toTrav = travellerMail(data);
  await sendEmail(row.email, toTrav.subject, toTrav.html, undefined, m.email);
  return NextResponse.json({ ok: true, sent });
}
