import { NextResponse } from "next/server";
import { z } from "zod";
import { imageDataUrl } from "@/lib/strip-meta";
import { currentTraveller } from "@/lib/wallet";
import { createPost, STORY_BGS } from "@/lib/posts";
import { HOBBIES } from "@/lib/explore";
import { rateLimit } from "@/lib/rate-limit";
import { checkAchievements } from "@/lib/achievements";

export const runtime = "nodejs";
const Body = z.object({
  kind: z.enum(["post", "story"]),
  text: z.string().max(500).default(""),
  photo: imageDataUrl(480_000).nullable().default(null),
  extra: z.array(imageDataUrl(480_000)).max(5).default([]),
  city: z.string().regex(/^[a-z]{2,12}$/).nullable().default(null),
  tag: z.enum(HOBBIES as unknown as [string, ...string[]]).nullable().default(null),
  bg: z.enum(STORY_BGS).nullable().default(null),
  close: z.boolean().optional(), // história só para amigos próximos
  music: z.union([z.object({ lib: z.string().regex(/^[a-z-]{2,40}$/) }), z.object({ own: z.string().uuid(), title: z.string().max(60).default("") })]).nullable().default(null)
}).refine((v) => v.kind === "post" || v.text.length <= 200, { message: "story text" });

/** Nova publicação ou história (24 h). */
export async function POST(req: Request) {
  const me = await currentTraveller();
  if (!me) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "social-post", 20)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = Body.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const r = await createPost(me, v.data);
  if ("error" in r) return NextResponse.json(r, { status: r.error === "no_profile" ? 409 : 400 });
  void checkAchievements(me).catch(() => {});
  return NextResponse.json(r);
}
