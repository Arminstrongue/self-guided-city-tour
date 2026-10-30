/**
 * Moedas apresentadas ao viajante. O preço de venda é sempre em euros; a Stripe
 * ("Adaptive Pricing") cobra na moeda local do cliente. Aqui só mostramos o valor
 * aproximado na moeda de cada viajante, para ele perceber quanto vai pagar.
 */

/** Moedas com taxa diária do Banco Central Europeu (mais o euro), do Médio Oriente (indexadas ao dólar) e das cidades das Américas e de África. */
export const CURRENCIES = [
  "EUR", "GBP", "USD", "CHF", "CAD", "AUD", "NZD", "BRL", "MXN", "JPY", "CNY", "HKD", "SGD", "KRW", "INR",
  "IDR", "MYR", "PHP", "THB", "ILS", "TRY", "ZAR", "SEK", "NOK", "DKK", "ISK", "PLN", "CZK", "HUF", "RON",
  "AED", "QAR", "SAR", "OMR", "JOD", "EGP",
  // Moedas das cidades das Américas e de África sem taxa do BCE (taxa diária de open.er-api.com; franco CFA indexado ao euro).
  "ARS", "MAD", "TZS", "TND", "ETB", "KES", "AOA", "GHS", "RWF", "XOF", "CVE", "NAD"
] as const;
export type Currency = (typeof CURRENCIES)[number];
export const isCurrency = (v: unknown): v is Currency => typeof v === "string" && (CURRENCIES as readonly string[]).includes(v);

export const CURRENCY_COOKIE = "sgct_currency";

/** Euros por unidade são o inverso disto: 1 EUR = rates[X] X. */
export type Rates = Record<Currency, number>;

/** País (ISO 3166-1 alfa-2) → moeda. Países sem moeda suportada pagam e veem em euros ou dólares. */
const EURO = ["AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
  "AD", "MC", "SM", "VA", "ME", "XK", "BG"];
const BY_COUNTRY: Record<string, Currency> = {
  GB: "GBP", IM: "GBP", JE: "GBP", GG: "GBP", GI: "GBP",
  US: "USD", PR: "USD", EC: "USD", SV: "USD", PA: "USD",
  CH: "CHF", LI: "CHF", CA: "CAD", AU: "AUD", NZ: "NZD", BR: "BRL", MX: "MXN", JP: "JPY", CN: "CNY", HK: "HKD", MO: "HKD",
  SG: "SGD", KR: "KRW", IN: "INR", ID: "IDR", MY: "MYR", PH: "PHP", TH: "THB", IL: "ILS", TR: "TRY", ZA: "ZAR",
  SE: "SEK", NO: "NOK", DK: "DKK", FO: "DKK", GL: "DKK", IS: "ISK", PL: "PLN", CZ: "CZK", HU: "HUF", RO: "RON",
  // Mercados onde o dólar é a referência habitual de quem viaja.
  AO: "USD", MZ: "USD", CV: "EUR", AE: "AED", SA: "SAR", QA: "QAR", KW: "USD", BH: "USD", OM: "OMR", JO: "JOD", EG: "EGP", NG: "USD",
  KE: "USD", GH: "USD", AR: "USD", CL: "USD", CO: "USD", PE: "USD", UY: "USD", TW: "USD", VN: "USD", PK: "USD"
};
for (const c of EURO) BY_COUNTRY[c] = "EUR";

export function currencyForCountry(country: string | null | undefined): Currency | null {
  if (!country) return null;
  return BY_COUNTRY[country.trim().toUpperCase()] ?? null;
}

/** Região do primeiro idioma do navegador ("en-US" → "US"). */
export function countryFromAcceptLanguage(header: string | null | undefined): string | null {
  for (const part of (header ?? "").split(",")) {
    const m = part.trim().match(/^[a-z]{2,3}-([A-Za-z]{2})\b/);
    if (m) return m[1].toUpperCase();
  }
  return null;
}

/**
 * Escolhe a moeda do viajante: escolha guardada > país do IP (Cloudflare) > idioma do navegador > euro.
 */
export function pickCurrency(opts: { cookie?: string | null; ipCountry?: string | null; acceptLanguage?: string | null }): Currency {
  if (isCurrency(opts.cookie)) return opts.cookie;
  const ip = opts.ipCountry && opts.ipCountry !== "XX" && opts.ipCountry !== "T1" ? opts.ipCountry : null;
  return currencyForCountry(ip) ?? currencyForCountry(countryFromAcceptLanguage(opts.acceptLanguage)) ?? "EUR";
}

/** Converte entre moedas usando taxas relativas ao euro. */
export function convert(amount: number, from: string, to: string, rates: Partial<Record<string, number>>): number | null {
  if (from === to) return amount;
  const rf = from === "EUR" ? 1 : rates[from];
  const rt = to === "EUR" ? 1 : rates[to];
  if (!rf || !rt) return null;
  return (amount / rf) * rt;
}

/** Moedas sem casas decimais na prática do dia a dia. */
const NO_DECIMALS = new Set(["JPY", "KRW", "IDR", "HUF", "ISK", "ARS", "TZS", "KES", "AOA", "RWF", "XOF", "CVE"]);

export function formatMoney(amount: number, currency: string, intlLocale: string, opts?: { approx?: boolean }): string {
  const digits = NO_DECIMALS.has(currency) ? 0 : 2;
  const s = new Intl.NumberFormat(intlLocale, { style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(amount);
  return opts?.approx ? `≈ ${s}` : s;
}

/** Contexto enviado às páginas: moeda do viajante e taxas necessárias. */
export type FxContext = { cur: Currency; rates: Partial<Record<string, number>>; date: string };

/**
 * Formata um valor numa moeda de origem e, se o viajante usar outra, junta o aproximado na dele.
 * Ex.: "£2.90 · ≈ R$ 21,40".
 */
export function dualMoney(amount: number, from: string, fx: FxContext, intlLocale: string): { main: string; local: string | null } {
  const main = formatMoney(amount, from, intlLocale);
  if (fx.cur === from) return { main, local: null };
  const v = convert(amount, from, fx.cur, fx.rates);
  return { main, local: v === null ? null : formatMoney(v, fx.cur, intlLocale, { approx: true }) };
}
