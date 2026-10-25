import { NextResponse } from "next/server";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { currentTraveller } from "@/lib/wallet";
import { cleanWords, closeFriendsOf, setCloseFriend } from "@/lib/posts";
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
  const [st, prof, blocked, muted, hidden] = await Promise.all([
    settingsOf(me),
    d.select({ isPrivate: schema.travellerProfiles.isPrivate, handle: schema.travellerProfiles.handle }).from(schema.travellerProfiles).where(eq(schema.travellerProfiles.email, me)).limit(1),
    d.select({ handle: schema.travellerProfiles.handle, name: schema.travellerProfiles.name, photo: schema.travellerProfiles.photo, bio: schema.travellerProfiles.bio, isPrivate: schema.travellerProfiles.isPrivate })
      .from(schema.blocks).innerJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.blocks.blocked)).where(eq(schema.blocks.blocker, me)),
    d.select({ handle: schema.travellerProfiles.handle, name: schema.travellerProfiles.name, photo: schema.travellerProfiles.photo, bio: schema.travellerProfiles.bio, isPrivate: schema.travellerProfiles.isPrivate })
      .from(schema.userMutes).innerJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.userMutes.muted)).where(eq(schema.userMutes.email, me)),
    d.select({ id: schema.posts.id, text: schema.posts.text, handle: schema.travellerProfiles.handle, at: schema.postHides.createdAt })
      .from(schema.postHides).innerJoin(schema.posts, eq(schema.posts.id, schema.postHides.postId))
      .innerJoin(schema.travellerProfiles, eq(schema.travellerProfiles.email, schema.posts.author))
      .where(eq(schema.postHides.email, me)).orderBy(desc(schema.postHides.createdAt)).limit(100)
  ]);
  return NextResponse.json({
    email: me, hasProfile: prof.length > 0, isPrivate: prof[0]?.isPrivate ?? true,
    dmPolicy: st.dmPolicy, notif: st.notif, lang: st.lang, blocked, muted,
    hiddenWords: (await d.select({ w: schema.accountSettings.hiddenWords }).from(schema.accountSettings).where(eq(schema.accountSettings.email, me)).limit(1))[0]?.w ?? [],
    closeFriends: await closeFriendsOf(me),
    hidden: hidden.map((h) => ({ id: h.id, handle: h.handle, text: h.text.slice(0, 120) })),
    push: { enabled: pushEnabled(), key: env.vapidPublic }
  });
}

const Body = z.object({
  dmPolicy: z.enum(["circle", "following", "none"]).optional(),
  notif: z.partialRecord(z.enum(["like", "comment", "follow", "message", "story_reply", "video"]), z.boolean()).optional(), // zod 4: record com enum exige todas as chaves; aqui só as alteradas
  lang: z.string().regex(/^[a-z]{2}$/).optional(),
  isPrivate: z.boolean().optional(),
  unmute: z.string().max(40).optional(),   // handle
  unhide: z.guid().optional(),    // publicação
  hiddenWords: z.array(z.string().max(60)).max(200).optional(),
  close: z.object({ handle: z.string().max(40), on: z.boolean() }).optional()
});
export async function PUT(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { isPrivate, unmute, unhide, hiddenWords, close, ...rest } = v.data;
  if (hiddenWords) {
    const d = await db();
    const w = cleanWords(hiddenWords);
    await d.insert(schema.accountSettings).values({ email: me, hiddenWords: w }).onConflictDoUpdate({ target: schema.accountSettings.email, set: { hiddenWords: w, updatedAt: new Date() } });
  }
  if (close && !(await setCloseFriend(me, close.handle, close.on))) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (unmute || unhide) {
    const d = await db();
    if (unhide) await d.delete(schema.postHides).where(and(eq(schema.postHides.email, me), eq(schema.postHides.postId, unhide)));
    if (unmute) {
      const [u] = await d.select({ e: schema.travellerProfiles.email }).from(schema.travellerProfiles).where(eq(schema.travellerProfiles.handle, unmute.toLowerCase())).limit(1);
      if (u) await d.delete(schema.userMutes).where(and(eq(schema.userMutes.email, me), eq(schema.userMutes.muted, u.e)));
    }
  }
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
