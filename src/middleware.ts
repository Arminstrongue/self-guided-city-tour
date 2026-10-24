import { NextResponse, type NextRequest } from "next/server";

// Manter igual a LOCALES em src/i18n/dictionaries.ts (o middleware não importa os dicionários para ficar leve).
const LOCALES = ["pt", "en", "es", "fr", "de", "it", "zh", "ar", "ja", "tr", "ru", "ko"];
const ROUTES = ["admin", "tour", "legal", "c", "success", "merchants", "agents", "guides", "g", "diary", "wallet", "plan", "u", "v", "i"]; // páginas, não códigos de cidade

/** Língua predefinida de cada país (código ISO do país → idioma da app). Países fora da lista: idioma do telemóvel, depois inglês. */
const COUNTRY_LANG: Record<string, string> = {};
const add = (lang: string, list: string) => list.split(" ").forEach((c) => (COUNTRY_LANG[c] = lang));
add("pt", "PT BR AO MZ CV GW ST TL");
add("es", "ES MX AR CO CL PE VE EC GT CU BO DO HN PY SV NI CR PA UY PR GQ AD");
add("fr", "FR BE LU MC SN CI ML BF NE TG BJ GN GA CG CD CM CF TD MG HT DJ KM RE GP MQ GF YT NC PF");
add("de", "DE AT LI CH");
add("it", "IT SM VA");
add("zh", "CN TW HK MO");
add("ar", "SA AE QA KW BH OM YE IQ SY JO LB PS EG LY TN DZ MA SD MR");
add("ja", "JP");
add("ko", "KR");
add("ru", "RU BY KZ KG");
add("tr", "TR");
add("en", "GB US IE AU NZ CA ZA NG GH KE UG TZ ZW ZM BW NA SG IN PH MT JM TT BS BB GM SL LR");

/** Idiomas do telemóvel/navegador (Accept-Language), por ordem de preferência. */
function browserLangs(req: NextRequest): string[] {
  return (req.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => { const [tag, ...params] = part.trim().split(";"); const q = params.find((x) => x.trim().startsWith("q=")); return { lang: tag.trim().toLowerCase().split("-")[0], q: q ? Number(q.trim().slice(2)) || 0 : 1 }; })
    .filter((x) => x.lang && x.q > 0)
    .sort((a, b) => b.q - a.q)
    .map((x) => x.lang);
}

/**
 * Idioma ao abrir:
 * 1) o que o viajante já escolheu no seletor (cookie);
 * 2) o idioma do país onde está (país do IP, enviado pela Cloudflare em CF-IPCountry);
 * 3) o idioma do telemóvel/navegador;
 * 4) inglês.
 */
export function pickLocale(req: NextRequest): string {
  const saved = req.cookies.get("sgct_locale")?.value;
  if (saved && LOCALES.includes(saved)) return saved;
  const country = (req.headers.get("cf-ipcountry") ?? "").toUpperCase();
  const byCountry = COUNTRY_LANG[country];
  if (byCountry) return byCountry;
  return browserLangs(req).find((l) => LOCALES.includes(l)) ?? "en";
}

/** Guarda a língua do país atual num cookie legível pelo browser, para o aviso "idioma do país / do dispositivo". */
function rememberCountryLang(req: NextRequest, res: NextResponse) {
  const cc = (req.headers.get("cf-ipcountry") ?? "").toUpperCase();
  if (!cc) return;
  const cl = COUNTRY_LANG[cc] ?? "-";
  if (req.cookies.get("sgct_cl")?.value !== cl) res.cookies.set("sgct_cl", cl, { path: "/", maxAge: 86400, sameSite: "lax" });
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
    rememberCountryLang(req, res);
    return res;
  }
  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = /^[a-z]{2,5}$/.test(first) && !ROUTES.includes(first) && pathname.split("/").length === 2 ? `/${locale}/c/${first}` : `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  const res = NextResponse.redirect(url);
  res.headers.set("Vary", "CF-IPCountry, Accept-Language, Cookie");
  res.headers.set("Cache-Control", "private, no-store");
  rememberCountryLang(req, res);
  return res;
}

export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
