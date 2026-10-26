import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { removeSub, saveSettings, saveSub } from "@/lib/notify";

export const runtime = "nodejs";
const Sub = z.object({
  subscription: z.object({ endpoint: z.string().url().max(1000), keys: z.object({ p256dh: z.string().max(200), auth: z.string().max(100) }) }),
  lang: z.string().regex(/^[a-z]{2}$/).optional()
});

/** Só serviços de push dos navegadores (o servidor envia pedidos para este endereço: nada de endereços arbitrários). */
const PUSH_HOSTS = /^(fcm\.googleapis\.com|android\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9-]+\.push\.apple\.com|[a-z0-9-]+\.notify\.windows\.com)$/i;
const pushOk = (u: string) => { try { const x = new URL(u); return x.protocol === "https:" && PUSH_HOSTS.test(x.hostname); } catch { return false; } };

/** Ligar as notificações push neste dispositivo. */
export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const v = Sub.safeParse(await req.json().catch(() => null));
  if (!v.success || !pushOk(v.data.subscription.endpoint)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await saveSub(me, v.data.subscription);
  if (v.data.lang) await saveSettings(me, { lang: v.data.lang });
  return NextResponse.json({ ok: true });
}
/** Desligar neste dispositivo. */
export async function DELETE(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const v = z.object({ endpoint: z.string().max(1000) }).safeParse(await req.json().catch(() => null));
  if (v.success) await removeSub(v.data.endpoint, me);
  return NextResponse.json({ ok: true });
}
