import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { currentAgent, LEAD_STATUSES } from "@/lib/agents";

export const runtime = "nodejs";
const Patch = z.object({ status: z.enum(LEAD_STATUSES).optional(), notes: z.string().trim().max(1000).optional() });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const agent = await currentAgent();
  if (!agent) return NextResponse.json({ error: "auth" }, { status: 401 });
  const p = Patch.safeParse(await req.json().catch(() => null));
  if (!p.success || !/^[0-9a-f-]{36}$/.test(params.id)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const d = await db();
  const [lead] = await d.update(schema.leads).set({ ...p.data, updatedAt: new Date() })
    .where(and(eq(schema.leads.id, params.id), eq(schema.leads.agentId, agent.id))).returning();
  if (!lead) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(lead);
}
