import { NextResponse } from "next/server";
import { REF_COOKIE } from "@/lib/invites";
import { env, isProd } from "@/lib/env";
import { LOCALES } from "@/i18n/core";

export const runtime = "nodejs";

/** Link de convite: guarda quem convidou (30 dias) e abre a página de boas-vindas. */
export async function GET(req: Request, props: { params: Promise<{ handle: string }> }) {
  const params = await props.params;
  const u = new URL(req.url);
  const l = (LOCALES as readonly string[]).includes(u.searchParams.get("l") ?? "") ? u.searchParams.get("l")! : "en";
  const h = params.handle.toLowerCase();
  if (!/^[a-z0-9._]{3,24}$/.test(h)) return NextResponse.redirect(`${env.appUrl}/${l}/wallet`, 303);
  const res = NextResponse.redirect(`${env.appUrl}/${l}/i/${h}`, 303);
  res.cookies.set(REF_COOKIE, h, { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: 30 * 86400, path: "/" });
  return res;
}
