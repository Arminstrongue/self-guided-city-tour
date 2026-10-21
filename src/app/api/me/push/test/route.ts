import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { sendPush, settingsOf } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Envia uma notificação de teste para os dispositivos do viajante. */
export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "push-test", 5)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const { lang } = await settingsOf(me);
  const pt = lang === "pt";
  const n = await sendPush(me, { title: "HelloTravell", body: pt ? "As notificações estão ligadas ✓" : "Notifications are on ✓", url: `/${lang}/wallet`, tag: "test" });
  return NextResponse.json({ sent: n });
}
