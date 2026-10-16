/**
 * "Posso sair do aeroporto?" — regras gerais de entrada para estadias curtas (escala).
 * Revisto em outubro de 2026. Fontes oficiais:
 *  - Schengen: https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en
 *  - ETIAS: https://travel-europe.europa.eu/etias_en
 *  - Reino Unido: https://www.gov.uk/check-uk-visa e https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta
 * As regras mudam: a app mostra sempre a ligação oficial para confirmar.
 */
import { EXIT_AIRPORT_MIN, fitRoute, type RouteOption } from "./route-cost";
import { AIRPORT_BUFFER_MIN } from "./pricing";
import { zoneOf, type City } from "@/data/cities";

/** ETIAS (autorização de 20 € para quem não precisa de visto Schengen): prevista para o 4.º trimestre de 2026. */
export const ETIAS_LIVE = process.env.NEXT_PUBLIC_ETIAS_LIVE === "1";
/** ETA do Reino Unido: obrigatória desde 25/02/2026, 20 £, válida 2 anos. */
export const UK_ETA_FEE = 20;

const EU = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"];
const EEA_CH = ["IS", "LI", "NO", "CH"];
/** Isentos de visto Schengen (anexo II do Regulamento 2018/1806), principais nacionalidades. */
const SCHENGEN_EXEMPT = ["AD", "AE", "AG", "AL", "AR", "AU", "BA", "BB", "BN", "BR", "BS", "CA", "CL", "CO", "CR", "DM", "GB", "GD", "GE", "GT",
  "HK", "HN", "IL", "JP", "KI", "KN", "KR", "LC", "MC", "MD", "ME", "MH", "MK", "MO", "MU", "MX", "MY", "NI", "NR", "NZ", "PA", "PE", "PW",
  "PY", "RS", "SB", "SC", "SG", "SM", "SV", "TL", "TO", "TT", "TV", "TW", "UA", "US", "UY", "VA", "VC", "VE", "WS", "XK"];
/** Precisam de visto Schengen (lista não exaustiva das nacionalidades mais comuns). */
const SCHENGEN_VISA = ["AF", "AM", "AO", "AZ", "BD", "BF", "BJ", "BO", "BY", "CD", "CG", "CI", "CM", "CN", "CU", "CV", "DO", "DZ", "EC", "EG",
  "ER", "ET", "GH", "GN", "GW", "ID", "IN", "IQ", "IR", "JM", "JO", "KE", "KH", "KZ", "LA", "LB", "LK", "MA", "ML", "MM", "MN", "MZ", "NA", "NE",
  "NG", "NP", "PH", "PK", "RU", "SD", "SN", "SO", "ST", "SY", "TH", "TN", "TR", "TZ", "UG", "UZ", "VN", "ZA", "ZM", "ZW"];
/** Precisam de visto de trânsito aeroportuário Schengen mesmo sem sair (anexo IV do Código de Vistos). */
const SCHENGEN_ATV = ["AF", "BD", "CD", "ER", "ET", "GH", "IR", "IQ", "NG", "PK", "SO", "LK"];
/** Reino Unido: nacionalidades que entram com ETA (sem visto). */
const UK_ETA = [...EU, ...EEA_CH, "AD", "AE", "AG", "AR", "AU", "BB", "BH", "BN", "BR", "BS", "CA", "CL", "CR", "FM", "GD", "GT", "HK", "IL",
  "JP", "KI", "KN", "KR", "KW", "LC", "MC", "MH", "MO", "MU", "MX", "MY", "NR", "NZ", "OM", "PA", "PW", "PY", "QA", "SA", "SB", "SC", "SG",
  "SM", "TO", "TV", "TW", "US", "UY", "VA", "WS"].filter((c) => c !== "IE");
/** Reino Unido: precisam de visto (de visitante ou "Visitor in Transit"). */
const UK_VISA = ["AF", "AM", "AO", "AZ", "BD", "BW", "BY", "CD", "CI", "CM", "CN", "CO", "CU", "CV", "DM", "DO", "DZ", "EC", "EG", "ET", "GE",
  "GH", "GW", "HN", "ID", "IN", "IQ", "IR", "JM", "JO", "KE", "KH", "KZ", "LA", "LB", "LK", "MA", "MM", "MN", "MZ", "NA", "NG", "NP", "PH", "PK",
  "RU", "SD", "SN", "ST", "SY", "TH", "TN", "TR", "TT", "UA", "UZ", "VE", "VN", "ZA", "ZW"];

export type EntryVerdict =
  | "free"          // pode sair só com o passaporte ou cartão de cidadão
  | "free-ees"      // pode sair; registo biométrico EES na fronteira (mais demorado)
  | "etias"         // pode sair com ETIAS aprovada
  | "eta"           // pode sair com ETA do Reino Unido aprovada
  | "visa"          // precisa de visto
  | "unknown";      // sem regra para esta nacionalidade: confirmar na fonte oficial

export type EntryCheck = {
  verdict: EntryVerdict;
  zone: "uk" | "schengen";
  transitVisa: boolean;       // precisa de visto de trânsito aeroportuário mesmo sem sair
  exitMin: number;            // tempo estimado para sair do aeroporto
  officialUrl: string;
};

export function checkEntry(city: City, nationality: string, hasPermit = false): EntryCheck {
  const n = nationality.toUpperCase();
  const zone = zoneOf(city);
  const isEU = EU.includes(n) || EEA_CH.includes(n);
  if (zone === "schengen") {
    const officialUrl = "https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en";
    let verdict: EntryVerdict;
    if (isEU) verdict = "free";
    else if (hasPermit) verdict = "free-ees";
    else if (SCHENGEN_EXEMPT.includes(n)) verdict = ETIAS_LIVE ? "etias" : "free-ees";
    else if (SCHENGEN_VISA.includes(n)) verdict = "visa";
    else verdict = "unknown";
    return { verdict, zone, transitVisa: !hasPermit && SCHENGEN_ATV.includes(n), officialUrl, exitMin: isEU ? EXIT_AIRPORT_MIN.free : EXIT_AIRPORT_MIN.check };
  }
  const officialUrl = "https://www.gov.uk/check-uk-visa";
  let verdict: EntryVerdict;
  if (n === "GB" || n === "IE" || hasPermit) verdict = "free";
  else if (UK_ETA.includes(n)) verdict = "eta";
  else if (UK_VISA.includes(n)) verdict = "visa";
  else verdict = "unknown";
  return { verdict, zone, transitVisa: false, officialUrl, exitMin: n === "GB" || n === "IE" ? EXIT_AIRPORT_MIN.free : EXIT_AIRPORT_MIN.check };
}

export type LayoverCheck = {
  entry: EntryCheck;
  layoverMin: number;
  cityMin: number;            // tempo útil fora do aeroporto (de aeroporto a aeroporto)
  route: RouteOption | null;  // roteiro mais completo que cabe
  worthIt: boolean;
};

/**
 * Tempo útil = escala − sair do aeroporto − margem antes do voo (2h30).
 * O roteiro escolhido inclui as viagens de ida e volta ao aeroporto.
 */
export function checkLayover(city: City, nationality: string, arrival: Date, departure: Date, hasPermit = false): LayoverCheck {
  const entry = checkEntry(city, nationality, hasPermit);
  const layoverMin = Math.round((departure.getTime() - arrival.getTime()) / 60000);
  const cityMin = layoverMin - entry.exitMin - AIRPORT_BUFFER_MIN;
  const route = cityMin > 0 ? fitRoute(city, cityMin) : null;
  const allowed = entry.verdict !== "visa";
  return { entry, layoverMin, cityMin, route, worthIt: allowed && route !== null };
}

/** Nacionalidades para o seletor (código ISO). Os nomes vêm de Intl.DisplayNames no navegador. */
export const NATIONALITIES = [...new Set([...EU, ...EEA_CH, ...SCHENGEN_EXEMPT, ...SCHENGEN_VISA, ...UK_ETA, ...UK_VISA, "IE"])].sort();

/** Só para testes. */
export const _lists = { EU, EEA_CH, SCHENGEN_EXEMPT, SCHENGEN_VISA, UK_ETA, UK_VISA };
