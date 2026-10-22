import { cookies, headers } from "next/headers";
import { CURRENCIES, CURRENCY_COOKIE, pickCurrency, type FxContext, type Rates } from "./currency";

/**
 * Taxas de câmbio diárias do Banco Central Europeu (1 EUR = X), guardadas 6 horas em memória.
 * Sem ligação, usa valores de referência aproximados para a app nunca falhar.
 */
const ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const TTL_MS = 6 * 3600e3;

export const FALLBACK_RATES: Rates = {
  EUR: 1, GBP: 0.86, USD: 1.16, CHF: 0.94, CAD: 1.6, AUD: 1.77, NZD: 1.98, BRL: 6.3, MXN: 21.5, JPY: 172, CNY: 8.3,
  HKD: 9.05, SGD: 1.5, KRW: 1620, INR: 102, IDR: 19000, MYR: 4.9, PHP: 66, THB: 37.5, ILS: 3.9, TRY: 50.8, ZAR: 20.3,
  SEK: 10.9, NOK: 11.7, DKK: 7.46, ISK: 143, PLN: 4.25, CZK: 24.4, HUF: 390, RON: 5.08,
  AED: 4.26, QAR: 4.22, SAR: 4.35, OMR: 0.446, JOD: 0.822, EGP: 57.5,
  // Valores de referência (só usados se a fonte diária falhar; o peso argentino muda depressa).
  ARS: 1650, MAD: 10.7, TZS: 3000, TND: 3.45, ETB: 165, KES: 150, AOA: 1070, GHS: 12.5, RWF: 1680, XOF: 655.957
};
/** Moedas que o BCE não publica: vêm de open.er-api.com (diário, sem chave). O franco CFA é fixo face ao euro. */
const EXTRA = ["ARS", "MAD", "TZS", "TND", "ETB", "KES", "AOA", "GHS", "RWF"] as const;
const EXTRA_URL = "https://open.er-api.com/v6/latest/EUR";
async function extraRates(): Promise<Partial<Rates>> {
  try {
    const r = await fetch(EXTRA_URL, { signal: AbortSignal.timeout(3000), cache: "no-store" });
    if (!r.ok) return {};
    const j = (await r.json()) as { result?: string; rates?: Record<string, number> };
    if (j.result !== "success" || !j.rates) return {};
    return Object.fromEntries(EXTRA.filter((c) => j.rates![c] > 0).map((c) => [c, j.rates![c]]));
  } catch { return {}; }
}
/** Moedas do Golfo e da Jordânia indexadas ao dólar (unidades por 1 USD). O BCE não as publica: derivam-se do dólar. */
export const USD_PEGS = { AED: 3.6725, QAR: 3.64, SAR: 3.75, OMR: 0.3845, JOD: 0.709 } as const;
export function withPegs(r: Rates): Rates {
  const out = { ...r };
  for (const [k, v] of Object.entries(USD_PEGS)) out[k as keyof Rates] = Math.round(r.USD * v * 10000) / 10000;
  return out;
}
const FALLBACK_DATE = "2026-10-01";

let cache: { at: number; rates: Rates; date: string } | null = null;

export function parseEcbXml(xml: string): { rates: Partial<Rates>; date: string | null } {
  const rates: Partial<Rates> = { EUR: 1 };
  for (const m of xml.matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)) {
    const code = m[1] as keyof Rates;
    if ((CURRENCIES as readonly string[]).includes(code)) rates[code] = Number(m[2]);
  }
  return { rates, date: xml.match(/time=['"](\d{4}-\d{2}-\d{2})['"]/)?.[1] ?? null };
}

export async function getRates(): Promise<{ rates: Rates; date: string }> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache;
  try {
    const res = await fetch(ECB_URL, { signal: AbortSignal.timeout(3000), cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const { rates, date } = parseEcbXml(await res.text());
    if (Object.keys(rates).length < 10) throw new Error("poucas taxas");
    const extra = await extraRates();
    cache = { at: Date.now(), rates: withPegs({ ...FALLBACK_RATES, ...rates, ...extra, XOF: 655.957 }), date: date ?? new Date().toISOString().slice(0, 10) };
  } catch {
    // Tenta outra vez dentro de 10 minutos.
    cache = { at: Date.now() - TTL_MS + 10 * 60e3, rates: cache?.rates ?? FALLBACK_RATES, date: cache?.date ?? FALLBACK_DATE };
  }
  return cache;
}

/** Moeda do viajante para o pedido atual (cookie, país do IP via Cloudflare, idioma do navegador). */
export function requestCurrency() {
  const h = headers();
  return pickCurrency({
    cookie: cookies().get(CURRENCY_COOKIE)?.value,
    ipCountry: h.get("cf-ipcountry") ?? h.get("x-vercel-ip-country") ?? h.get("x-country-code"),
    acceptLanguage: h.get("accept-language")
  });
}

export async function fxContext(): Promise<FxContext> {
  const { rates, date } = await getRates();
  return { cur: requestCurrency(), rates, date };
}
