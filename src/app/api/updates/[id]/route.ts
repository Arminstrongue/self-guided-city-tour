import { NextResponse } from "next/server";
import { currentTraveller } from "@/lib/wallet";
import { removeUpdate } from "@/lib/updates";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/** Apagar: o autor, ou a equipa (administração). */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const me = await currentTraveller();
  const admin = await isAdmin().catch(() => false);
  if (!me && !admin) return NextResponse.json({ error: "auth" }, { status: 401 });
  await removeUpdate(id, me ?? "", admin);
  return NextResponse.json({ ok: true });
}
