import { NextResponse, type NextRequest } from "next/server";

// Manter igual a LOCALES em src/i18n/dictionaries.ts (o middleware não importa os dicionários para ficar leve).
const LOCALES = ["pt", "en", "es", "fr", "de", "it", "zh", "ar", "ja", "tr", "ru", "ko"];
const ROUTES = ["admin", "tour", "legal", "c", "success", "merchants", "agents", "guides", "g", "diary", "wallet", "plan", "u", "v", "i"]; // páginas, não códigos de cidade

/**
 * Idioma: 1) o que o viajante já escolheu (cookie do seletor); 2) na primeira visita, a língua do telemóvel/navegador
 * (Accept-Language, por ordem de preferência); 3) inglês.
 */
function pickLocale(req: NextRequest): string {
  const saved = req.cookies.get("sgct_locale")?.value;
  if (saved && LOCALES.includes(saved)) return saved;
  const prefs = (req.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => { const [tag, ...params] = part.trim().split(";"); const q = params.find((x) => x.trim().startsWith("q=")); return { lang: tag.trim().toLowerCase().split("-")[0], q: q ? Number(q.trim().slice(2)) || 0 : 1 }; })
    .filter((x) => x.lang && x.q > 0)
    .sort((a, b) => b.q - a.q);
  return prefs.find((x) => LOCALES.includes(x.lang))?.lang ?? "en";
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
  const res = NextResponse.redirect(url);
  res.headers.set("Vary", "Accept-Language, Cookie");
  return res;
}

export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
