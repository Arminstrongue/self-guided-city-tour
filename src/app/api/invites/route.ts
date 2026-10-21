import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { myProfile } from "@/lib/social";
import { inviteLink, inviteStats, recordInvite, sendEmailInvites, validPhone } from "@/lib/invites";
import { LOCALES } from "@/i18n/core";
import { rateLimit } from "@/lib/rate-limit";
import { referralStats } from "@/lib/referrals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** O meu link de convite e quantos amigos já entraram. */
export async function GET(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const p = await myProfile(me);
  if (!p) return NextResponse.json({ error: "no_profile" }, { status: 409 });
  const l = new URL(req.url).searchParams.get("l") ?? "en";
  const locale = (LOCALES as readonly string[]).includes(l) ? l : "en";
  return NextResponse.json({ handle: p.handle, link: inviteLink(p.handle, locale, "link"), ...(await inviteStats(me)), rewards: await referralStats(me) });
}

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("email"), emails: z.array(z.string().max(200)).min(1).max(10), note: z.string().trim().max(200).default(""), locale: z.enum(LOCALES) }),
  z.object({ action: z.literal("record"), channel: z.enum(["sms", "whatsapp", "link"]), phone: z.string().max(30).optional() })
]);

/** Enviar convites por email, ou registar um convite enviado do telemóvel (SMS/WhatsApp) ou por link. */
export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "invites", 20)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (v.data.action === "email") {
    const r = await sendEmailInvites(me, v.data.emails, v.data.locale, v.data.note);
    return NextResponse.json(r, { status: "error" in r ? (r.error === "limit" ? 429 : 409) : 200 });
  }
  if (!(await myProfile(me))) return NextResponse.json({ error: "no_profile" }, { status: 409 });
  if (v.data.phone && !validPhone(v.data.phone)) return NextResponse.json({ error: "phone" }, { status: 400 });
  await recordInvite(me, v.data.channel, v.data.phone);
  return NextResponse.json({ ok: true });
}
