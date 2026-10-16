import { NextResponse, type NextRequest } from "next/server";

// Manter igual a LOCALES em src/i18n/dictionaries.ts (o middleware não importa os dicionários para ficar leve).
const LOCALES = ["pt", "en", "es", "fr", "de", "it", "zh", "ar", "ja"];
const ROUTES = ["admin", "tour", "legal", "c", "success", "merchants", "agents"]; // páginas, não códigos de cidade

function pickLocale(req: NextRequest): string {
  const saved = req.cookies.get("sgct_locale")?.value;
  if (saved && LOCALES.includes(saved)) return saved;
  const header = req.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (LOCALES.includes(code)) return code;
  }
  return "en";
}

/**
 * - "/" e caminhos sem idioma → "/{idioma}/…"
 * - QR curto "/lis?ref=ABC" → "/{idioma}/c/lis?ref=ABC"
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if (LOCALES.includes(first)) {
    const res = NextResponse.next();
    if (req.cookies.get("sgct_locale")?.value !== first) res.cookies.set("sgct_locale", first, { path: "/", maxAge: 31536000, sameSite: "lax" });
    return res;
  }
  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = /^[a-z]{2,5}$/.test(first) && !ROUTES.includes(first) && pathname.split("/").length === 2 ? `/${locale}/c/${first}` : `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
