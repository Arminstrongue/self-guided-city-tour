import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { LOCALES } from "@/i18n/core";

export const runtime = "nodejs";

/** "Partilhar para a app" (Android/Chrome): abre o compositor com o texto ou link partilhado. */
export function GET(req: Request) {
  const u = new URL(req.url);
  const c = (req.headers.get("cookie") ?? "").match(/(?:^|;\s*)sgct_locale=([a-z]{2})/)?.[1] ?? "en";
  const locale = (LOCALES as readonly string[]).includes(c) ? c : "en";
  const text = [u.searchParams.get("title"), u.searchParams.get("text"), u.searchParams.get("url")].map((x) => (x ?? "").trim()).filter(Boolean)
    .filter((x, i, a) => a.indexOf(x) === i).join(" ").slice(0, 480);
  return NextResponse.redirect(`${env.appUrl}/${locale}/wallet#compose:${encodeURIComponent(text)}`, 303);
}
