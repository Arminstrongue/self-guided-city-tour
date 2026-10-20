import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { currentTraveller } from "@/lib/wallet";
import { db, schema } from "@/lib/db";
import { ACCESS_COOKIE } from "@/lib/access-token";
import { pushEnabled, saveSettings, settingsOf } from "@/lib/notify";
import { deleteAccount } from "@/lib/account";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Definições da conta: email, privacidade, quem pode enviar mensagens, notificações, bloqueados. */
export async function GET() {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const d = await db();
  const [st, prof, blocked] = await Promise.all([
    settingsOf(me),
    d.select({ isPrivate: schema.travellerProfiles.isPrivate, handle: schema.travellerProfiles.handle }).from(schema.travellerProfiles).where(eq(schema.travellerProfiles.email, me)).limit(1),
    d.select({ handle: schema.travellerProfiles.handle, name: schema.travellerProfiles.name, photo: schema.travellerProfiles.photo, bio: schema.travellerProfiles.bio, isPrivate: schema.travellerProfiles.isPrivate })
      .from(schema.blocks).innerJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.blocks.blocked)).where(eq(schema.blocks.blocker, me))
  ]);
  return NextResponse.json({
    email: me, hasProfile: prof.length > 0, isPrivate: prof[0]?.isPrivate ?? true,
    dmPolicy: st.dmPolicy, notif: st.notif, lang: st.lang, blocked,
    push: { enabled: pushEnabled(), key: env.vapidPublic }
  });
}

const Body = z.object({
  dmPolicy: z.enum(["circle", "following", "none"]).optional(),
  notif: z.record(z.enum(["like", "comment", "follow", "message", "story_reply", "video"]), z.boolean()).optional(),
  lang: z.string().regex(/^[a-z]{2}$/).optional(),
  isPrivate: z.boolean().optional()
});
export async function PUT(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { isPrivate, ...rest } = v.data;
  if (Object.keys(rest).length) await saveSettings(me, rest);
  if (isPrivate !== undefined) {
    const d = await db();
    await d.update(schema.travellerProfiles).set({ isPrivate, updatedAt: new Date() }).where(eq(schema.travellerProfiles.email, me));
    // Ao passar a público, os pedidos pendentes ficam aceites.
    if (!isPrivate) await d.update(schema.follows).set({ status: "accepted" }).where(eq(schema.follows.followee, me));
  }
  return NextResponse.json({ ok: true });
}

/** Apagar a conta (pede a confirmação escrita "DELETE"). */
export async function DELETE(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "account-delete", 3)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = z.object({ confirm: z.literal("DELETE") }).safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "confirm" }, { status: 400 });
  await deleteAccount(me);
  const res = NextResponse.json({ ok: true, next: `${env.appUrl}/` });
  res.cookies.set(ACCESS_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
