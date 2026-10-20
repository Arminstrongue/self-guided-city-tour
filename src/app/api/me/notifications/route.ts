import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { listNotifs, markNotifsRead, unreadNotifs } from "@/lib/notify";
import { unreadCount } from "@/lib/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** ?count=1 → só os números (notificações e conversas por ler); sem isso, a lista. */
export async function GET(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ n: 0, chats: 0 });
  if (new URL(req.url).searchParams.get("count")) {
    const [n, chats] = await Promise.all([unreadNotifs(me), unreadCount(me)]);
    return NextResponse.json({ n, chats }, { headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ items: await listNotifs(me) }, { headers: { "Cache-Control": "no-store" } });
}
/** Marcar todas como lidas. */
export async function POST() {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  await markNotifsRead(me);
  return NextResponse.json({ ok: true });
}
