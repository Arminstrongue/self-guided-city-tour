import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { fulfilTourSession } from "@/lib/orders";
import { ACCESS_COOKIE, ACCESS_TTL_S, createAccessToken } from "@/lib/access-token";
import { env, isProd } from "@/lib/env";
import { isLocale } from "@/i18n/core";

export const runtime = "nodejs";

/** Regresso do Stripe Checkout: confirma o pagamento, regista o acesso e guarda o cookie. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("session_id") ?? "";
  const l = url.searchParams.get("locale") ?? "en";
  const locale = isLocale(l) ? l : "en";
  if (!id.startsWith("cs_")) return NextResponse.redirect(`${env.appUrl}/${locale}`);

  const session = await stripe().checkout.sessions.retrieve(id);
  const access = await fulfilTourSession(session);
  const dest = new URL(`${env.appUrl}/${locale}/success`);
  if (!access) { dest.searchParams.set("pending", "1"); return NextResponse.redirect(dest); }
  if (access.city) dest.searchParams.set("city", access.city);
  dest.searchParams.set("email", access.email);
  const res = NextResponse.redirect(dest);
  res.cookies.set(ACCESS_COOKIE, createAccessToken(access.email), { httpOnly: true, sameSite: "lax", secure: isProd, maxAge: ACCESS_TTL_S, path: "/" });
  return res;
}
