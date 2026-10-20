import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { contacts, inbox } from "@/lib/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Caixa de entrada e (com ?contacts=1) as pessoas com quem pode conversar. */
export async function GET(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  const withContacts = new URL(req.url).searchParams.get("contacts") === "1";
  const [box, people] = await Promise.all([inbox(me), withContacts ? contacts(me) : Promise.resolve(undefined)]);
  return NextResponse.json({ ...box, contacts: people });
}
