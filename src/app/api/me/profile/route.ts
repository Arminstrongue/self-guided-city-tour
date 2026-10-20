import { NextResponse } from "next/server";
import { z } from "zod";
import { currentTraveller } from "@/lib/wallet";
import { ACCENTS, THEMES, counts, deleteProfile, handleTaken, lists, myProfile, saveProfile, savePrefsOnly, validHandle } from "@/lib/social";
import { CITIES } from "@/data/cities";
import { HOBBIES } from "@/lib/explore";
import { rateLimit } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { REF_COOKIE, acceptInvite } from "@/lib/invites";

export const runtime = "nodejs";
const photo = z.string().max(140_000).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/).nullable();
const Full = z.object({
  handle: z.string().trim().toLowerCase(), name: z.string().trim().min(1).max(60), bio: z.string().trim().max(160).default(""),
  photo, isPrivate: z.boolean(), adult: z.literal(true)
});
const Prefs = z.object({
  theme: z.enum(THEMES).optional(), accent: z.enum(ACCENTS).optional(),
  cities: z.array(z.string().refine((c) => CITIES.some((x) => x.id === c))).max(40).optional(),
  lessOf: z.array(z.enum(HOBBIES)).max(18).optional()
});

export async function GET() {
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const p = await myProfile(email);
  if (!p) return NextResponse.json({ profile: null }, { headers: { "Cache-Control": "no-store" } });
  const [c, l] = await Promise.all([counts(email), lists(email)]);
  const { email: _e, ...profile } = p;
  return NextResponse.json({ profile, count: c, ...l }, { headers: { "Cache-Control": "no-store" } });
}

/** Criar ou editar o perfil (o @nome tem de ser único). */
export async function PUT(req: Request) {
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (!rateLimit(req, "profile", 20)) return NextResponse.json({ error: "rate" }, { status: 429 });
  const v = Full.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid", fields: v.error.issues.map((i) => i.path[0]) }, { status: 400 });
  if (!validHandle(v.data.handle)) return NextResponse.json({ error: "handle" }, { status: 400 });
  if (await handleTaken(v.data.handle, email)) return NextResponse.json({ error: "taken" }, { status: 409 });
  const { adult: _a, ...data } = v.data;
  const isNew = !(await myProfile(email));
  await saveProfile(email, data);
  const res = NextResponse.json({ ok: true });
  // Entrou por um convite: segue quem o convidou e avisa-o.
  const ref = cookies().get(REF_COOKIE)?.value;
  if (isNew && ref) { await acceptInvite(email, ref).catch(() => null); res.cookies.set(REF_COOKIE, "", { maxAge: 0, path: "/" }); }
  return res;
}

/** Tema, cor, cidades seguidas e "ver menos" (o algoritmo). */
export async function PATCH(req: Request) {
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  const v = Prefs.safeParse(await req.json().catch(() => null));
  if (!v.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (await myProfile(email)) await savePrefsOnly(email, v.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const email = await currentTraveller();
  if (!email) return NextResponse.json({ error: "auth" }, { status: 401 });
  await deleteProfile(email);
  return NextResponse.json({ ok: true });
}
