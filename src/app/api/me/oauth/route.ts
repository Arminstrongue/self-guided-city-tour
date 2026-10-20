import { NextResponse } from "next/server";
import { sessionEmail } from "@/lib/auth";
import { ACCESS_COOKIE, ACCESS_TTL_S, createAccessToken } from "@/lib/access-token";
import { env, isProd } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const NA = ["next-auth.session-token", "__Secure-next-auth.session-token"];

/**
 * Depois de "Continuar com Google/Apple": passa a sessão para o cookie da carteira (o mesmo do link por email),
 * para que "terminar sessão em todos os dispositivos" e "sair" funcionem igual para todos.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const next = u.searchParams.get("next") ?? "/en/wallet";
  const safe = /^\/[a-z]{2}\/[a-z0-9/_?=&#:-]*$/i.test(next) ? next : "/en/wallet";
  const email = await sessionEmail().catch(() => null);
  const res = NextResponse.redirect(`${env.appUrl}${safe}`, 303);
  if (email) res.cookies.set(ACCESS_COOKIE, createAccessToken(email), { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: ACCESS_TTL_S, path: "/" });
  for (const n of NA) res.cookies.set(n, "", { maxAge: 0, path: "/", secure: n.startsWith("__Secure") });
  return res;
}
