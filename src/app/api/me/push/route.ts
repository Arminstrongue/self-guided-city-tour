import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { removeSub, saveSettings, saveSub } from "@/lib/notify";

export const runtime = "nodejs";
const Sub = z.object({
  subscription: z.object({ endpoint: z.string().url().max(1000), keys: z.object({ p256dh: z.string().max(200), auth: z.string().max(100) }) }),
  lang: z.string().regex(/^[a-z]{2}$/).optional()
});

/** Ligar as notificações push neste dispositivo. */
export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const v = Sub.safeParse(await req.json().catch(() => null));
  if (!v.success || !/^https:\/\//.test(v.data.subscription.endpoint)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await saveSub(me, v.data.subscription);
  if (v.data.lang) await saveSettings(me, { lang: v.data.lang });
  return NextResponse.json({ ok: true });
}
/** Desligar neste dispositivo. */
export async function DELETE(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const v = z.object({ endpoint: z.string().max(1000) }).safeParse(await req.json().catch(() => null));
  if (v.success) await removeSub(v.data.endpoint);
  return NextResponse.json({ ok: true });
}
