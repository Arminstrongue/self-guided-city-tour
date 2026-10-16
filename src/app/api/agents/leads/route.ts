import { NextResponse } from "next/server";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { currentAgent, LEAD_KINDS } from "@/lib/agents";

export const runtime = "nodejs";

const LeadBody = z.object({
  name: z.string().trim().min(2).max(120),
  kind: z.enum(LEAD_KINDS),
  city: z.string().trim().max(40).optional(),
  contact: z.string().trim().max(80).optional(),
  email: z.string().email().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional(),
  notes: z.string().trim().max(1000).optional()
});

export async function POST(req: Request) {
  const agent = await currentAgent();
  if (!agent) return NextResponse.json({ error: "auth" }, { status: 401 });
  const p = LeadBody.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const d = await db();
  const [lead] = await d.insert(schema.leads).values({ ...p.data, email: p.data.email?.toLowerCase() || null, agentId: agent.id }).returning();
  return NextResponse.json(lead);
}
