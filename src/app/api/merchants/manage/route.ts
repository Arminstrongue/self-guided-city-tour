import { NextResponse } from "next/server";
import { z } from "zod";
import { MerchantPatch, applyPatch, currentMerchantEmail, setBookingStatus } from "@/lib/merchant-portal";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** O dono atualiza o próprio negócio (oferta, horário, contactos, reservas, fotos, pausa). */
export async function PATCH(req: Request) {
  const email = await currentMerchantEmail();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "merchant-manage", 40)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const p = MerchantPatch.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const err = await applyPatch(email, p.data);
  if (err) return NextResponse.json({ error: err }, { status: err === "not_found" ? 404 : 400 });
  return NextResponse.json({ ok: true });
}

const Status = z.object({ booking: z.guid(), status: z.enum(["confirmed", "declined"]) });
/** Marca um pedido de reserva como confirmado ou recusado. */
export async function POST(req: Request) {
  const email = await currentMerchantEmail();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const b = Status.safeParse(await req.json().catch(() => null));
  if (!b.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const ok = await setBookingStatus(email, b.data.booking, b.data.status);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "not_found" }, { status: 404 });
}
