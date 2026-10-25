import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { REF_COOKIE } from "@/lib/invites";
import { inviterOf, creditBalance } from "@/lib/referrals";
import { currentTraveller } from "@/lib/wallet";
import { REFERRAL_FRIEND_PCT } from "@/lib/pricing";
import { db, schema } from "@/lib/db";
import { and, eq, gt } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Para o formulário de compra: há desconto de amigo convidado? Quanto crédito de convites tenho? (estimativa; o servidor recalcula no pagamento) */
export async function GET() {
  const me = await currentTraveller().catch(() => null);
  const inv = await inviterOf(me, (await cookies()).get(REF_COOKIE)?.value ?? null);
  let first = true;
  if (me) {
    const d = await db();
    first = !(await d.select({ id: schema.accesses.id }).from(schema.accesses).where(and(eq(schema.accesses.email, me), gt(schema.accesses.amountCents, 0))).limit(1)).length;
  }
  return NextResponse.json({ inviter: inv && first ? inv.handle : null, friendPct: inv && first ? REFERRAL_FRIEND_PCT : 0, credit: me ? await creditBalance(me) : 0, email: me });
}
