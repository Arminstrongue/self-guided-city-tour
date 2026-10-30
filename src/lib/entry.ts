/**
 * "Posso sair do aeroporto?" — regras gerais de entrada para estadias curtas (escala).
 * Revisto em outubro de 2026. Fontes oficiais:
 *  - Schengen: https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en
 *  - ETIAS: https://travel-europe.europa.eu/etias_en
 *  - Reino Unido: https://www.gov.uk/check-uk-visa e https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta
 *  - Turquia: https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa e https://www.evisa.gov.tr
 *  - Emirados: https://u.ae (ICP/GDRFA) · Catar: https://visitqatar.com · Arábia Saudita: https://visa.visitsaudi.com
 *  - Egito: https://visa2egypt.gov.eg · Jordânia: https://www.jordanpass.jo · Omã: https://evisa.rop.gov.om
 *  - Singapura: https://www.ica.gov.sg/enter-transit-depart/entering-singapore (e SG Arrival Card obrigatório)
 *  - Irlanda: https://www.irishimmigration.ie/at-the-border/transit-including-transfer-visa-advice/ e
 *    https://www.irishimmigration.ie/coming-to-visit-ireland/short-stay-visa-waiver-programme/ (S.I. 242/2026 em irishstatutebook.ie)
 *  - Hong Kong: https://www.immd.gov.hk/eng/services/visas/visit-transit/visit-visa-entry-permit.html
 *  - Tailândia (regras de 15/09/2026): https://image.mfa.go.th/mfa/0/TkZZJfspCP/Visa_Exemption_Scheme/PR-eng.pdf e https://tdac.immigration.go.th
 *  - Indonésia: https://www.imigrasi.go.id/faq/visa?lang=en-US e https://evisa.imigrasi.go.id · Bali: https://lovebali.baliprov.go.id
 *  - Cabo Verde: https://www.gov.cv/en/paises-com-visto-obrigatorio-para-cabo-verde e https://www.ease.gov.cv/assets/lista_de_paises.pdf
 *    (Despacho n.º 244/GMAI/2026, BO II Série n.º 14 de 23/01/2026, em vigor desde 01/01/2026; Decreto-Lei 13/2025) e https://www.ease.gov.cv
 *  - Namíbia: https://eservices.mhaiss.gov.na/visaonarrival e https://eservices.mhaiss.gov.na/form/FactSheetVisaRequirementstoNamibia.pdf (versão 4, 28/05/2025)
 *  - Japão: https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html (74 países e regiões, 01/09/2025) · Visit Japan Web: https://vjw-lp.digital.go.jp
 *    JESTA: Lei n.º 32 de Reiwa 8 (promulgada a 05/06/2026), entra em vigor por decreto até 31/03/2029 — ainda não se aplica (https://www.moj.go.jp/isa/policies/bill/05_00001.html)
 * As regras mudam: a app mostra sempre a ligação oficial para confirmar.
 * Médio Oriente (revisto em outubro de 2026): só marcamos as nacionalidades com regra confirmada; as outras ficam "unknown".
 */
import { EXIT_AIRPORT_MIN, fitRoute, type RouteOption } from "./route-cost";
import { AIRPORT_BUFFER_MIN } from "./pricing";
import type { City } from "@/data/cities";
import { zoneOf, type Zone } from "@/data/city-meta";

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

/** Turquia: isentos de visto para turismo (até 90 dias; China desde 2 jan 2026). Chipre precisa de visto. */
const TR_FREE = [...EU.filter((c) => c !== "CY"), ...EEA_CH, "GB", "US", "CA", "AU", "NZ", "BR", "JP", "KR", "CN", "SA", "AE", "QA", "KW", "BH", "OM",
  "AR", "CL", "RU", "UA", "GE", "AZ", "SG", "MY", "IL"];
/** Turquia: e-Visa online (algumas só com visto/residência Schengen, EUA, Reino Unido ou Irlanda). */
const TR_EVISA = ["IN", "PK", "BD", "EG", "ZA", "MX", "CV"];
/** Turquia: visto consular. */
const TR_VISA = ["AO", "MZ", "NG", "CY"];

const GCC = ["AE", "SA", "QA", "KW", "BH", "OM"];
/** Emirados: entrada sem visto (30 ou 90 dias) para estas nacionalidades. */
const AE_FREE = [...EU, ...EEA_CH, "GB", "US", "CA", "AU", "NZ", "JP", "KR", "SG", "MY", "BN", "HK", "MO", "CN", "IL", "AL", "AR", "AM", "AZ", "BS",
  "BB", "BY", "BA", "BR", "CL", "CO", "CR", "EC", "SV", "FJ", "GE", "HN", "KI", "XK", "MK", "MV", "MD", "ME", "NR", "PY", "PE", "GY", "RU", "VC",
  "SM", "RS", "SC", "SB", "UY", "AD", "KZ", "MU", "MC", "MN", "UA", "UZ", "VA"];
/** Emirados: visto à chegada só com residência/visto válido dos EUA, UE ou Reino Unido (e alguns outros países). */
const AE_VOA_PERMIT = ["IN", "ID", "VN", "TH", "PH", "KE", "ZA"];
/** Catar: isenção de visto (30 ou 90 dias). */
const QA_FREE = ["AG", "AR", "AM", "AT", "BS", "BE", "BR", "BG", "HR", "CY", "CZ", "DK", "DO", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IT", "LV",
  "LI", "LT", "LU", "MY", "MT", "NL", "NO", "PL", "PT", "RO", "RU", "RS", "SC", "SK", "SI", "ZA", "KR", "ES", "SE", "CH", "TR", "UA", "US",
  "AD", "AU", "AZ", "BO", "BA", "BN", "CA", "CL", "CN", "CO", "CR", "CU", "EC", "GE", "GY", "HK", "ID", "IE", "JP", "KZ", "MV", "MX", "MD",
  "MC", "NZ", "MK", "PA", "PY", "PE", "RW", "SM", "SG", "SR", "GB", "UY", "UZ", "VA", "VE"];
/** Arábia Saudita: eVisa de turismo (ou à chegada) para estas nacionalidades. */
const SA_EVISA = ["BS", "BB", "CA", "GD", "PA", "KN", "US", "AL", "AD", "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "GE", "DE", "GR",
  "NL", "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "MC", "ME", "NO", "PL", "PT", "RO", "RU", "SM", "SK", "SI", "ES", "SE", "CH", "UA",
  "GB", "AZ", "BN", "CN", "HK", "MO", "JP", "KZ", "KG", "MY", "MV", "SG", "KR", "TJ", "TH", "TR", "UZ", "MU", "SC", "ZA", "AU", "NZ"];
/** Egito: visto à chegada (25 USD em dinheiro) ou eVisa. */
const EG_VOA = ["AL", "AD", "AG", "AR", "AU", "AT", "BS", "BE", "BT", "BO", "BR", "BN", "BG", "KH", "CA", "CL", "CO", "CR", "HR", "CU", "CY", "CZ",
  "DK", "DM", "DO", "EC", "EE", "FJ", "FI", "FR", "GE", "DE", "GR", "GD", "GY", "HT", "HU", "IS", "IE", "IT", "JM", "JP", "KZ", "KI", "LA",
  "LV", "LI", "LT", "LU", "MY", "MV", "MT", "MH", "MX", "FM", "MC", "ME", "NR", "NP", "NL", "NZ", "NI", "MK", "NO", "PW", "PA", "PG", "PY",
  "PE", "PL", "PT", "RO", "RU", "KN", "LC", "WS", "SM", "ST", "RS", "SC", "SG", "SK", "SI", "SB", "KR", "SS", "ES", "VC", "SR", "SE", "CH",
  "TW", "TL", "TO", "TT", "TV", "UA", "GB", "US", "UY", "VU", "VA", "VE"];
/** Jordânia: sem visto (GCC, Turquia, Líbano, Egito, Tunísia); visto à chegada (40 JOD) para quase todos; aprovação prévia para estes. */
const JO_FREE = [...GCC, "TR", "LB", "EG", "TN"];
const JO_RESTRICTED = ["AF", "BD", "KH", "IR", "IQ", "LA", "MN", "MM", "NP", "PK", "PG", "PH", "LK", "YE", "AO", "BJ", "BW", "BF", "BI", "CM", "CF",
  "TD", "KM", "CG", "CD", "CI", "DJ", "GQ", "ER", "ET", "GA", "GM", "GH", "GN", "GW", "LR", "MG", "ML", "MR", "MZ", "NA", "NE", "NG", "SN", "SL",
  "SO", "SD", "TZ", "TG", "UG", "ZM", "BZ", "CU"];
const JO_VOA = [...EU, ...EEA_CH, "GB", "US", "CA", "AU", "NZ", "JP", "KR", "SG", "MY", "CN", "HK", "BR", "AR", "MX", "CL", "CO", "ZA", "RU", "UA",
  "IN", "ID", "TH", "VN", "KZ", "UZ", "GE", "AZ", "AM", "AL", "RS", "BA", "ME", "MK", "MD", "IS", "AD", "MC", "SM", "VA", "IL", "MA", "DZ"];
/** Omã: entrada sem visto até 14 dias. */
const OM_FREE = [...EU, ...EEA_CH, "AL", "DZ", "AD", "AR", "AM", "AU", "AZ", "BY", "BT", "BO", "BA", "BR", "BN", "CA", "CL", "CN", "HK", "MO", "CO", "CR",
  "CU", "EC", "EG", "GF", "GE", "GT", "HN", "IN", "ID", "IR", "JP", "JO", "KZ", "KG", "LA", "LB", "MK", "MY", "MV", "MR", "MX", "MD", "MC", "MA",
  "NZ", "NI", "PA", "PY", "PE", "RU", "SV", "SM", "RS", "SC", "SG", "ZA", "KR", "SR", "TW", "TJ", "TH", "TN", "TR", "TM", "GB", "UA", "UY", "US",
  "UZ", "VA", "VE", "VN"];

/** Singapura: entrada sem visto (30 ou 90 dias) — principais nacionalidades com regra confirmada. */
const SG_FREE = [...EU, ...EEA_CH, "GB", "US", "CA", "AU", "NZ", "JP", "KR", "MY", "BN", "TH", "ID", "PH", "VN", "KH", "LA", "HK", "MO", "TW", "CN",
  "BR", "AR", "CL", "MX", "ZA", "AE", "IL", "TR"];
/** Singapura: precisam de visto (pedido antes de viajar). */
const SG_VISA = ["IN", "PK", "BD", "NG", "EG", "AF", "IR", "IQ", "SY", "YE", "SO", "SD", "SS", "LY", "DZ", "JO", "LB", "TN", "MA", "ML", "KP"];

/* ---------- Irlanda, Hong Kong, Tailândia e Indonésia (revisto em outubro de 2026; fontes oficiais no topo do ficheiro) ---------- */
/** Irlanda (fora de Schengen; Área Comum de Viagem com o Reino Unido): sem visto (anexo 1 do S.I. 473/2014, alterado pelo S.I. 242/2026). */
const IE_FREE = ["AD", "AG", "AR", "AU", "BS", "BB", "BZ", "BR", "BN", "CA", "CL", "CR", "SV", "FJ", "GD", "HK", "IL", "JP", "KI", "MY", "MV", "MX",
  "MC", "NZ", "PA", "PY", "VC", "WS", "SM", "SC", "SG", "SB", "KR", "TW", "TO", "TV", "UA", "AE", "US", "UY", "VA"];
/** Irlanda: precisam de visto irlandês (um visto Schengen não serve; um visto do Reino Unido só serve nos programas BIVS/SSVWP). */
const IE_VISA = ["AF", "AL", "DZ", "AO", "AM", "AZ", "BH", "BD", "BY", "BJ", "BO", "BA", "BW", "BF", "KH", "CM", "CV", "CN", "CO", "CU", "CD", "DM",
  "DO", "EC", "EG", "ER", "SZ", "ET", "GE", "GH", "GN", "GW", "GT", "GY", "HN", "IN", "ID", "IR", "IQ", "CI", "JM", "JO", "KZ", "KE", "XK", "KW", "LA",
  "LB", "LS", "LY", "MW", "ML", "MD", "MN", "ME", "MA", "MZ", "MM", "NA", "NR", "NP", "NI", "NE", "NG", "MK", "OM", "PK", "PE", "PH", "QA", "RU", "RW",
  "KN", "LC", "ST", "SA", "SN", "RS", "SO", "ZA", "LK", "SD", "SY", "TZ", "TH", "TT", "TN", "TR", "UG", "UZ", "VU", "VE", "VN", "YE", "ZM", "ZW"];
/** Irlanda: visto de trânsito mesmo sem passar a fronteira (lista do ISD, atualizada a 24/07/2026). */
const IE_ATV = ["AF", "AL", "BO", "BW", "CU", "CD", "DM", "ER", "SZ", "ET", "GE", "GH", "HN", "IR", "IQ", "LB", "LS", "MD", "NR", "NI", "NG", "KN", "LC",
  "SO", "ZA", "LK", "TT", "VU", "ZW"];
/** Hong Kong: sem visto 180 dias (GB), 90, 30 ou 14 dias. As outras nacionalidades estrangeiras não listadas têm 7 dias sem visto. */
const HK_FREE = ["GB",
  "AD", "AG", "AR", "AU", "AT", "BS", "BB", "BE", "BZ", "BW", "BR", "BN", "BG", "CA", "CL", "CO", "HR", "CY", "CZ", "DK", "DM", "EC", "EG", "EE", "FJ",
  "FI", "FR", "DE", "GR", "GD", "GY", "HU", "IS", "IE", "IL", "IT", "JM", "JP", "KE", "KI", "KR", "LV", "LI", "LT", "LU", "MW", "MY", "MV", "MT", "MU",
  "MX", "MC", "NA", "NR", "NL", "NZ", "NO", "PG", "PL", "PT", "RO", "SM", "SA", "SC", "SG", "SK", "SI", "ES", "KN", "LC", "VC", "SE", "CH", "TZ", "TO",
  "TT", "TR", "TV", "UY", "US", "VU", "VE", "ZM", "ZW",
  "AM", "BH", "BY", "BO", "CV", "CR", "DO", "SV", "GE", "GT", "HN", "ID", "JO", "KW", "MA", "NI", "OM", "PA", "PY", "PE", "QA", "WS", "SB", "ZA", "TH",
  "TN", "UG", "AE",
  "AL", "DZ", "BJ", "BT", "BA", "BF", "TD", "KM", "DJ", "GQ", "GA", "GN", "HT", "KZ", "LS", "MG", "ML", "MH", "MR", "FM", "MN", "ME", "MZ", "NE", "MK",
  "PW", "PH", "RU", "ST", "SR", "UA", "VA"];
/** Hong Kong: precisam de visto. */
const HK_VISA = ["AF", "AO", "AZ", "BD", "BI", "KH", "CM", "CF", "CD", "CG", "CI", "CU", "ER", "SZ", "ET", "GM", "GH", "GW", "IR", "IQ", "KP", "KG", "LA",
  "LB", "LR", "LY", "MD", "MM", "NP", "NG", "PK", "PS", "RW", "SN", "SL", "SO", "SS", "LK", "SD", "SY", "TJ", "TG", "TM", "UZ", "VN", "YE"];
/** Hong Kong: precisam de visto mesmo em trânsito sem sair da zona internacional (notas *, ^ e ※ do ImmD). */
const HK_ATV = ["AF", "CF", "CD", "CI", "ER", "SZ", "GM", "GW", "IR", "IQ", "KP", "LR", "LY", "NG", "SL", "SO", "SS", "SD", "SY", "YE",
  "AO", "BD", "BI", "CM", "CG", "ET", "GH", "RW", "LK", "TG", "PK"];
/** Tailândia (desde 15/09/2026): isenção de 30 dias (60 países), 15 dias (SC, MU) e acordos bilaterais. Os outros pedem e-Visa antes de viajar. */
const TH_FREE = ["AU", "AT", "BH", "BE", "BG", "BT", "BN", "CA", "HR", "CY", "CZ", "DK", "EE", "FJ", "FI", "FR", "GE", "DE", "GR", "HU", "IS", "ID", "IN",
  "IE", "IL", "IT", "JP", "JO", "KW", "KG", "LV", "LI", "LT", "LU", "MT", "MY", "MV", "NL", "NZ", "NO", "OM", "PH", "PL", "PT", "QA", "RO", "SA", "SG",
  "SK", "SI", "ZA", "ES", "SE", "CH", "TW", "TR", "UA", "AE", "GB", "US",
  "SC", "MU",
  "AR", "PE", "BR", "KR", "CL", "CN", "HK", "KZ", "LA", "MO", "MN", "RU", "TL", "VN", "KH", "MM"];
/** Tailândia: visto à chegada (2000 THB). */
const TH_VOA = ["AZ", "BY", "RS"];
/** Indonésia: isenção de visto para cidadãos da ASEAN. */
const ID_FREE = ["BN", "KH", "LA", "MY", "MM", "PH", "SG", "TH", "VN"];
/** Indonésia: e-VoA (online) ou visto à chegada, 500 000 IDR, 30 dias prorrogáveis uma vez (97 países; os da ASEAN já estão em ID_FREE). */
const ID_VOA = ["ZA", "AL", "US", "AD", "SA", "AR", "AM", "AU", "AT", "BH", "NL", "BY", "BE", "BR", "BA", "BG", "CZ", "CL", "DK", "EC", "EE", "FI", "GT",
  "HK", "HU", "IN", "GB", "IE", "IT", "IS", "JP", "DE", "CA", "KZ", "KE", "CO", "KR", "HR", "KW", "LV", "LI", "LT", "LU", "MO", "MV", "MT", "MA", "MX",
  "EG", "MC", "MN", "MZ", "NO", "OM", "PS", "PG", "FR", "PE", "PL", "PT", "QA", "RO", "RU", "RW", "SM", "NZ", "RS", "SC", "CY", "SK", "SI", "ES", "SR",
  "SE", "CH", "TW", "TZ", "TL", "CN", "TN", "TR", "AE", "UZ", "UA", "VA", "VE", "JO", "GR"];

/* ---------- Cabo Verde, Namíbia e Japão (revisto em outubro de 2026; fontes oficiais no topo do ficheiro) ---------- */
/** Cabo Verde: sem visto desde 01/01/2019 (UE, Reino Unido, Suíça, Liechtenstein, Noruega, Mónaco, São Marinho e Andorra, segundo a Delegação da UE)
 *  e CEDEAO (protocolo de livre circulação). Burkina Faso, Mali e Níger saíram da CEDEAO em 2025: ficam "unknown". Todos pagam a TSA no EASE. */
const CV_FREE = [...EU, "GB", "CH", "LI", "NO", "MC", "SM", "AD", ...["BJ", "CI", "GM", "GH", "GN", "GW", "LR", "NG", "SN", "SL", "TG"]];
/** Cabo Verde: visto obrigatório antes de viajar, também para trânsito/escala no aeroporto (anexo do Despacho 244/GMAI/2026, 91 países;
 *  sem visto online nem à chegada). Porto Rico e Toquelau constam da lista mas não emitem passaporte próprio: ficam de fora. */
const CV_VISA = ["AF", "DZ", "AM", "AZ", "BH", "BD", "BY", "BO", "BW", "BN", "BI", "BT", "KH", "KZ", "TD", "CL", "CO", "KM", "CG", "KP", "CR", "DJ", "DM",
  "EG", "SV", "EC", "ER", "SZ", "ET", "PH", "GA", "GT", "GY", "HT", "HN", "YE", "ID", "IR", "IQ", "JM", "JO", "KI", "LA", "LS", "LB", "LY", "MG", "MW", "MR",
  "MX", "MN", "MM", "NA", "NR", "NP", "NI", "OM", "PS", "PW", "PA", "PG", "PK", "PY", "PE", "KG", "CF", "CD", "DO", "WS", "SY", "SO", "LK", "SD", "SS", "SR",
  "TJ", "TZ", "TO", "TT", "TN", "TM", "TV", "UG", "UZ", "VU", "VE", "VN", "ZM", "ZW"];
/** Namíbia (regras de 01/04/2025): sem visto para férias (fact sheet do Ministério, versão 4). Singapura aparece também na lista de visto à chegada: fica "unknown". */
const NA_FREE = ["AO", "BW", "BR", "CU", "SZ", "HK", "ID", "JM", "KE", "LS", "MO", "MW", "MY", "MU", "MZ", "RU", "SC", "ZA", "TZ", "ZM", "ZW"];
/** Namíbia: visto à chegada ou e-visa (lista do portal eservices.mhaiss.gov.na, com os 36 países juntados em setembro de 2025; territórios sem passaporte próprio ficam de fora). */
const NA_VOA = ["BJ", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CI", "DJ", "GQ", "ER", "GA", "GM", "GH", "GN", "GW", "LR", "MG", "MR", "NE", "RW", "ST", "SL",
  "TG", "TN", "UG",
  "AR", "BG", "KH", "CL", "HR", "CZ", "EC", "EE", "GR", "HU", "IL", "LV", "LT", "MX", "NI", "PY", "PE", "PL", "RO", "SK", "KR", "VA", "VE", "VN", "TH", "TR",
  "AE", "UY", "AM", "AU", "AT", "AZ", "BY", "BE", "CA", "DK", "FI", "FR", "DE", "IS", "IE", "IT", "JP", "KZ", "KG", "LI", "LU", "MD", "NL", "NZ", "NO", "PT",
  "ES", "SE", "CH", "TJ", "TM", "UA", "GB", "US", "UZ", "AD", "AG", "BS", "BB", "MC", "MN", "ME", "PS", "PA", "SI", "BO", "BN", "CY", "GE", "GD", "HT", "KI",
  "MV", "VC", "KN", "LC", "SR", "MK", "TO", "TT", "VU", "DO"];
/** Namíbia: fontes oficiais em conflito ou ilegíveis (Malta e Samoa anunciadas em set. 2025 mas fora da lista do portal; Índia, Nigéria, Egito e RD Congo na fact sheet). */
const NA_UNKNOWN = ["SG", "MT", "WS", "IN", "NG", "EG", "CD"];
/** Japão: isenção de visto para estadias curtas (MOFA, 74 países e regiões). Indonésia e Catar só com passaporte eletrónico registado numa missão japonesa: ficam "unknown". */
const JP_FREE = ["BN", "MY", "KR", "SG", "TH", "HK", "MO", "TW", "CA", "US", "AR", "BS", "CL", "CR", "DO", "SV", "GT", "HN", "SR", "BB", "BR", "PA", "PY", "PE",
  "MX", "UY", "AU", "NZ", "IL", "TR", "AE", "LS", "MU", "TN",
  "AD", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "GR", "HU", "IS", "IT", "LV", "LT", "LU", "MT", "MC", "NL", "MK", "NO", "PL", "PT", "RO", "SM",
  "SK", "SI", "ES", "SE", "AT", "DE", "IE", "LI", "CH", "GB", "ME", "RS"];
/** Japão: casos à parte (registo prévio do passaporte eletrónico, ou "aconselhados a pedir visto" como a Colômbia). Todos os outros precisam de visto. */
const JP_UNKNOWN = ["ID", "QA", "CO"];

/* ---------- Américas e África (revisto em outubro de 2026; só nacionalidades com regra confirmada) ---------- */
const AFRICA = ["DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "EG", "GQ", "ER", "SZ", "ET", "GA", "GM", "GH",
  "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW", "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD",
  "TZ", "TG", "TN", "UG", "ZM", "ZW"];
const ECOWAS = ["BJ", "BF", "CV", "CI", "GM", "GH", "GN", "GW", "LR", "ML", "NE", "NG", "SN", "SL", "TG"];
const MICRO = ["AD", "MC", "SM", "VA"];
/** EUA: Visa Waiver Program (ESTA). */
const US_VWP = ["AD", "AU", "AT", "BE", "BN", "CL", "HR", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IL", "IT", "JP", "LV", "LI", "LT", "LU",
  "MT", "MC", "NL", "NZ", "NO", "PL", "PT", "QA", "SM", "SG", "SK", "SI", "KR", "ES", "SE", "CH", "TW", "GB"];
const US_VISA = ["BR", "MX", "AR", "CO", "PE", "EC", "CN", "IN", "RU", "TR", "ZA", "NG", "GH", "KE", "AO", "MA", "EG", "PH", "VN", "ID", "TH", "PK", "BD",
  "UA", "RO", "BG", "CY", "MZ", "ET", "TN", "SN", "RW", "TZ", "AE", "SA", "JO", "UY", "PY", "BO", "VE", "CU"];
/** EUA, Proclamação 10998 (desde 1 jan 2026): sem novos vistos (total) ou sem vistos de turismo B-1/B-2 (parcial). Fonte: travel.state.gov. */
const US_BAN_FULL = ["AF", "MM", "BF", "TD", "CG", "GQ", "ER", "HT", "IR", "LA", "LY", "ML", "NE", "SL", "SO", "SS", "SD", "SY", "YE"];
const US_BAN_B = ["AO", "AG", "BJ", "BI", "CI", "CU", "DM", "GA", "GM", "MW", "MR", "NG", "SN", "TZ", "TG", "TO", "VE", "ZM", "ZW"];
/** Canadá: eTA para quem não precisa de visto. */
const CA_ETA = [...EU, ...EEA_CH, ...MICRO, "GB", "AU", "NZ", "JP", "KR", "SG", "IL", "CL", "TW", "HK", "BN", "AE", "BS", "BB", "PG", "SB", "WS"];
const CA_VISA = ["MX", "BR", "AR", "CN", "IN", "NG", "PK", "PH", "VN", "ID", "TH", "ZA", "EG", "MA", "KE", "GH", "AO", "RU", "TR", "CO", "PE", "EC",
  "UA", "BD", "ET", "TN", "SN", "RW", "TZ", "MZ", "SA", "JO", "CU", "VE"];
/** México: sem visto (e sem visto também para quem tem visto válido dos EUA, Canadá, Reino Unido, Schengen ou Japão). */
const MX_FREE = [...EU, ...EEA_CH, ...MICRO, "GB", "US", "CA", "JP", "KR", "AU", "NZ", "SG", "IL", "AR", "CL", "CO", "CR", "UY", "PA", "PY", "HK", "MY"];
const MX_VISA = ["BR", "EC", "PE", "VE", "CN", "IN", "NG", "GH", "AO", "MA", "EG", "PK", "PH", "VN", "ID", "KE", "ET", "CU"];
/** Brasil: e-visa obrigatório para EUA, Canadá e Austrália desde abril de 2025. */
const BR_FREE = [...EU, ...EEA_CH, ...MICRO, "GB", "AR", "CL", "UY", "PY", "BO", "CO", "PE", "EC", "JP", "KR", "NZ", "ZA", "IL", "RU", "TR", "MA", "SG",
  "MY", "HK", "CR", "PA", "GT", "HN", "SV", "NI", "TT", "BB", "BS"];
const BR_EVISA = ["US", "CA", "AU"];
const BR_VISA = ["CN", "IN", "NG", "GH", "AO", "EG", "PK", "PH", "KE", "ET", "MZ"];
/** Argentina: sem visto. */
const AR_FREE = [...EU, ...EEA_CH, ...MICRO, "GB", "US", "CA", "AU", "NZ", "JP", "KR", "BR", "CL", "UY", "PY", "BO", "PE", "EC", "CO", "VE", "MX", "CR",
  "PA", "GT", "HN", "SV", "NI", "IL", "SG", "MY", "HK", "RU", "TR", "ZA", "TT", "JM"];
const AR_VISA = ["CN", "IN", "NG", "GH", "AO", "KE", "EG", "MA", "PK", "VN"];
/** Marrocos: sem visto. */
const MA_FREE = [...EU, ...EEA_CH, ...MICRO, "GB", "US", "CA", "AU", "NZ", "JP", "KR", "BR", "AR", "CL", "MX", "PE", "CN", "RU", "TR", "TN", "DZ", "SN",
  "ML", "NE", "CI", "GN", "CG", "GA", ...GCC, "SG", "MY", "ID", "PH", "HK"];
const MA_VISA = ["IN", "NG", "GH", "KE", "AO", "EG", "PK", "BD", "CM", "ZA", "ET", "CD"];
/** África do Sul: sem visto. */
const ZA_FREE = ["AD", "AR", "AT", "AU", "BE", "BW", "BR", "CA", "CL", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IL", "IT", "JM",
  "JP", "KR", "LS", "LI", "LU", "MW", "MY", "MT", "MU", "MX", "MC", "MZ", "NA", "NL", "NZ", "NO", "PY", "PE", "PL", "PT", "RU", "SC", "SG", "SK", "ES",
  "SZ", "SE", "CH", "TZ", "TH", "TT", "TR", "GB", "US", "UY", "VE", "ZM", "ZW", "AO", "KE", "GH", "HK", "SM", "VA", "SI", "LV", "LT", "HR", "BG", "RO"];
const ZA_VISA = ["IN", "CN", "NG", "PK", "EG", "BD", "MA", "PH", "VN", "CM", "CD", "ET"];
/** Tanzânia (Zanzibar): sem visto. Os outros pedem eVisa (também há visto à chegada). */
const TZ_FREE = ["KE", "UG", "RW", "BI", "ZA", "ZW", "ZM", "MZ", "MW", "BW", "NA", "LS", "SZ", "MU", "SC", "SG", "MY"];
const TZ_EVISA = [...EU, ...EEA_CH, ...MICRO, "GB", "US", "CA", "AU", "NZ", "JP", "KR", "BR", "AR", "MX", "CL", "CN", "IN", "RU", "TR", "IL", ...GCC, "AO",
  "GH", "SN", "MA", "TN", "EG", "ET", "PH", "VN", "ID", "TH"];
/** Tunísia: sem visto. */
const TN_FREE = [...EU, ...EEA_CH, ...MICRO, "GB", "US", "CA", "JP", "KR", "BR", "AR", "CL", "MX", "CN", "RU", "TR", "MA", "DZ", "LY", "SN", "CI", "ML",
  "NE", "MR", "GN", "ZA", ...GCC, "JO", "MY", "SG", "HK"];
const TN_VISA = ["IN", "PK", "NG", "GH", "KE", "BD", "EG", "AO", "ET"];
/** Quénia: isentos da eTA (todos os africanos exceto Somália e Líbia, mais estes); os outros pedem a eTA. */
const KE_FREE = [...AFRICA.filter((c) => c !== "SO" && c !== "LY"), "BS", "BB", "BZ", "BN", "CY", "DM", "FJ", "GD", "GY", "JM", "KI", "MY", "MV", "NR", "PG",
  "WS", "SM", "SG", "SB", "KN", "LC", "VC", "TO", "TT", "TV", "VU"];
/** Angola: isenção de visto de turismo (Decreto 189/23), estadias até 90 dias. */
const AO_FREE = ["DZ", "BW", "CV", "SZ", "GQ", "MU", "LS", "MG", "MW", "MA", "RW", "SC", "TZ", "ZW", "ZA", "NA", "MZ",
  "SA", "CN", "AE", "IN", "ID", "IL", "JP", "KR", "QA", "SG", "TL",
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "LV", "LT", "LU", "MT", "MC", "NL", "NO", "PL", "PT",
  "RO", "RU", "SK", "SI", "ES", "SE", "CH", "TR", "GB", "VA",
  "AR", "BR", "CA", "CL", "MX", "PA", "US", "UY",
  "AU", "FJ", "MH", "FM", "NR", "NZ", "PW", "PG", "WS", "SB", "TO", "TV", "VU",
  "AG", "BS", "BB", "BZ", "DM", "DO", "GD", "GY", "HT", "JM", "KI", "KN", "LC", "VC", "SR", "TT"];
/** Gana: sem visto (CEDEAO e acordos bilaterais). Para a maioria dos outros é preciso visto antes de viajar. */
/** Gana: sem visto para todos os passaportes africanos desde 1 jan 2025. */
const GH_FREE = [...AFRICA, "SG", "MY", "TT"];
const GH_VISA = [...EU, ...EEA_CH, "GB", "US", "CA", "AU", "NZ", "JP", "KR", "BR", "AR", "MX", "CN", "IN", "RU", "TR", "IL", ...GCC, "PK"];
/** Ruanda: visto gratuito à chegada para africanos, Commonwealth e Francofonia; todos os outros têm visto à chegada pago. */
const RW_FREE = [...AFRICA, "GB", "CA", "AU", "NZ", "IN", "PK", "BD", "LK", "MY", "SG", "JM", "TT", "BB", "BS", "CY", "MT", "FR", "BE", "CH", "LU", "MC", "RO",
  "VN", "KH", "LA", "AM", "AL", "MD"];
/** Senegal: sem visto. */
const SN_FREE = [...EU, ...EEA_CH, ...MICRO, "GB", "US", "CA", "JP", "KR", "BR", "AR", "CL", "MX", "IL", "MA", "TN", "DZ", ...ECOWAS, "CM", "GA", "CG", "TD",
  "CF", "MR", "ZA", "MU", "SC", "SG", "MY"];

/** Regra genérica: sem visto / autorização eletrónica antes de embarcar / eVisa / visto à chegada / visto. */
type ZoneRule = {
  local: string; free: string[]; auth?: string[] | "all"; evisa?: string[] | "all"; voa?: string[] | "all"; visa?: string[];
  url: string; site?: string; fee?: string; authFee?: string; hint?: EntryHint;
  /** Saem com passaporte OU cartão de cidadão (veredicto "free"), ex.: UE/EEE/Suíça e Reino Unido na Irlanda. */
  idOk?: string[];
  /** Precisam de visto de trânsito aeroportuário mesmo sem sair. */
  atv?: string[];
  /** Veredicto para as nacionalidades que não estão em nenhuma lista (ex.: Hong Kong dá 7 dias sem visto a todos os outros; Namíbia pede e-visa aos outros). */
  rest?: "free-pass" | "visa" | "evisa-me";
  /** Nacionalidades fora de `rest` (ficam "unknown"). */
  restExcept?: string[];
  /** A dica só aparece nestas cidades (id) ou com estes veredictos. */
  hintCities?: string[]; hintOn?: EntryVerdict[];
};
export type EntryHint = "usban" | "ae-permit" | "sa-visa" | "sa-stopover" | "jo-pass" | "sg-arrival" | "us" | "ca" | "mx" | "zan" | "ke" | "et" | "ao" | "br"
  | "ie-uk" | "hk-par" | "th-tdac" | "bali" | "cv-ease" | "na-voa" | "jp-vjw";
const ZONES: Partial<Record<Zone, ZoneRule>> = {
  us: { local: "US", free: ["CA"], auth: US_VWP, visa: US_VISA, url: "https://esta.cbp.dhs.gov", site: "esta.cbp.dhs.gov", authFee: "40 USD", hint: "us" },
  ca: { local: "CA", free: ["US"], auth: CA_ETA, visa: CA_VISA, url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html", site: "canada.ca/eta", authFee: "7 CAD", hint: "ca" },
  mx: { local: "MX", free: MX_FREE, visa: MX_VISA, url: "https://www.gob.mx/sre", hint: "mx" },
  br: { local: "BR", free: BR_FREE, auth: BR_EVISA, visa: BR_VISA, url: "https://brazil.vfsevisa.com", site: "brazil.vfsevisa.com", authFee: "80,90 USD", hint: "br" },
  ar: { local: "AR", free: AR_FREE, visa: AR_VISA, url: "https://www.argentina.gob.ar/interior/migraciones" },
  ma: { local: "MA", free: MA_FREE, visa: MA_VISA, url: "https://www.acces-maroc.ma" },
  za: { local: "ZA", free: ZA_FREE, visa: ZA_VISA, url: "https://www.dha.gov.za/index.php/immigration-services/exempt-countries" },
  tz: { local: "TZ", free: TZ_FREE, evisa: TZ_EVISA, url: "https://visa.immigration.go.tz", site: "visa.immigration.go.tz", hint: "zan", hintCities: ["zan"] },
  tn: { local: "TN", free: TN_FREE, visa: TN_VISA, url: "https://www.diplomatie.gov.tn" },
  et: { local: "ET", free: ["KE", "DJ"], evisa: "all", url: "https://www.evisa.gov.et", site: "evisa.gov.et", hint: "et" },
  ke: { local: "KE", free: KE_FREE, auth: "all", url: "https://www.etakenya.go.ke", site: "etakenya.go.ke", authFee: "30 USD", hint: "ke" },
  ao: { local: "AO", free: AO_FREE, url: "https://www.smevisa.gov.ao", hint: "ao" },
  gh: { local: "GH", free: GH_FREE, visa: GH_VISA, url: "https://www.gis.gov.gh" },
  rw: { local: "RW", free: RW_FREE, voa: "all", url: "https://irembo.gov.rw", fee: "50 USD" },
  sn: { local: "SN", free: SN_FREE, url: "https://www.dakaraeroport.com" },
  ie: { local: "IE", free: IE_FREE, idOk: [...EU, ...EEA_CH, "GB"], visa: IE_VISA, atv: IE_ATV,
    url: "https://www.irishimmigration.ie/coming-to-visit-ireland/visit-ireland-travel-path/", hint: "ie-uk", hintOn: ["visa"] },
  hk: { local: "HK", free: HK_FREE, auth: ["IN"], visa: HK_VISA, atv: HK_ATV, rest: "free-pass", restExcept: ["CN", "TW", "MO", "XK"],
    url: "https://www.immd.gov.hk/eng/services/visas/visit-transit/visit-visa-entry-permit.html", site: "immd.gov.hk", authFee: "0 HKD", hint: "hk-par", hintOn: ["auth"] },
  th: { local: "TH", free: TH_FREE, voa: TH_VOA, rest: "visa", url: "https://image.mfa.go.th/mfa/0/TkZZJfspCP/Visa_Exemption_Scheme/PR-eng.pdf", site: "tdac.immigration.go.th", fee: "2000 THB", hint: "th-tdac" },
  id: { local: "ID", free: ID_FREE, voa: ID_VOA, url: "https://www.imigrasi.go.id/faq/visa?lang=en-US", site: "evisa.imigrasi.go.id", fee: "500 000 IDR", hint: "bali", hintCities: ["dps"] },
  cv: { local: "CV", free: CV_FREE, visa: CV_VISA, atv: CV_VISA, url: "https://www.gov.cv/en/paises-com-visto-obrigatorio-para-cabo-verde", site: "ease.gov.cv", hint: "cv-ease" },
  na: { local: "NA", free: NA_FREE, voa: NA_VOA, rest: "evisa-me", restExcept: NA_UNKNOWN,
    url: "https://eservices.mhaiss.gov.na/visaonarrival", site: "eservices.mhaiss.gov.na", fee: "1200–1600 NAD", hint: "na-voa", hintOn: ["voa", "evisa-me"] },
  jp: { local: "JP", free: JP_FREE, rest: "visa", restExcept: JP_UNKNOWN, url: "https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html", site: "vjw-lp.digital.go.jp", hint: "jp-vjw" }
};

type MeRule = { free: string[]; voa?: string[]; evisa?: string[]; restricted?: string[]; permitVoa?: string[]; url: string; fee?: string; site?: string };
const ME: Record<"ae" | "qa" | "sa" | "eg" | "jo" | "om", MeRule> = {
  ae: { free: [...GCC, ...AE_FREE], permitVoa: AE_VOA_PERMIT, url: "https://u.ae/en/information-and-services/visa-and-emirates-id", fee: "100 AED" },
  qa: { free: [...GCC, ...QA_FREE], url: "https://visitqatar.com/intl-en/practical-info/visas" },
  sa: { free: GCC, evisa: SA_EVISA, url: "https://visa.visitsaudi.com", site: "visa.visitsaudi.com" },
  eg: { free: ["EG"], voa: EG_VOA, url: "https://visa2egypt.gov.eg", fee: "25 USD" },
  jo: { free: JO_FREE, voa: JO_VOA, restricted: JO_RESTRICTED, url: "https://www.jordanpass.jo/Contents/FAQs.aspx", fee: "40 JOD" },
  om: { free: [...GCC, ...OM_FREE], url: "https://evisa.rop.gov.om" }
};

export type EntryVerdict =
  | "free"          // pode sair só com o passaporte ou cartão de cidadão
  | "free-ees"      // pode sair; registo biométrico EES na fronteira (mais demorado)
  | "etias"         // pode sair com ETIAS aprovada
  | "eta"           // pode sair com ETA do Reino Unido aprovada
  | "evisa"         // pode sair com e-Visa da Turquia
  | "free-pass"     // pode sair só com o passaporte (sem visto ou visto grátis à chegada; não serve o cartão de cidadão)
  | "voa"           // visto à chegada pago no aeroporto (fee)
  | "evisa-me"      // eVisa pedido online antes de viajar (site)
  | "auth"          // autorização eletrónica aprovada antes de embarcar (ESTA, eTA, e-visa do Brasil, eTA do Quénia)
  | "visa"          // precisa de visto
  | "unknown";      // sem regra para esta nacionalidade: confirmar na fonte oficial

export type EntryCheck = {
  verdict: EntryVerdict;
  zone: Zone;
  transitVisa: boolean;       // precisa de visto de trânsito aeroportuário mesmo sem sair
  exitMin: number;            // tempo estimado para sair do aeroporto
  officialUrl: string;
  fee?: string;               // valor do visto à chegada
  site?: string;              // site do eVisa
  hint?: EntryHint;
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
  if (zone in ME) {
    const r = ME[zone as keyof typeof ME];
    const local = (zone === "ae" && n === "AE") || (zone === "qa" && n === "QA") || (zone === "sa" && n === "SA") || (zone === "jo" && n === "JO") || (zone === "om" && n === "OM");
    let verdict: EntryVerdict;
    if (local || hasPermit) verdict = "free";
    else if (r.free.includes(n)) verdict = "free-pass";
    else if (r.restricted?.includes(n)) verdict = "visa";
    else if (r.voa?.includes(n)) verdict = "voa";
    else if (r.evisa?.includes(n)) verdict = "evisa-me";
    else if (r.permitVoa?.includes(n)) verdict = "visa";
    else verdict = "unknown";
    const hint: EntryCheck["hint"] = zone === "ae" && r.permitVoa?.includes(n) && !hasPermit ? "ae-permit"
      : zone === "sa" && verdict === "unknown" ? "sa-visa" : zone === "sa" && verdict === "evisa-me" ? "sa-stopover"
      : zone === "jo" && verdict === "voa" ? "jo-pass" : undefined;
    return { verdict, zone, transitVisa: false, officialUrl: r.url, exitMin: local ? EXIT_AIRPORT_MIN.free : EXIT_AIRPORT_MIN.check, ...(r.fee ? { fee: r.fee } : {}), ...(r.site ? { site: r.site } : {}), ...(hint ? { hint } : {}) };
  }
  if (zone === "sg") {
    const verdict: EntryVerdict = n === "SG" || hasPermit ? "free" : SG_FREE.includes(n) ? "free-pass" : SG_VISA.includes(n) ? "visa" : "unknown";
    return { verdict, zone, transitVisa: false, officialUrl: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore", exitMin: n === "SG" ? EXIT_AIRPORT_MIN.free : EXIT_AIRPORT_MIN.check, ...(n !== "SG" ? { hint: "sg-arrival" as const } : {}) };
  }
  const zr = ZONES[zone];
  if (zr) {
    const local = n === zr.local;
    const inList = (l: string[] | "all" | undefined) => l === "all" ? true : Boolean(l?.includes(n));
    let verdict: EntryVerdict;
    if (local || hasPermit || zr.idOk?.includes(n)) verdict = "free";
    else if (zr.free.includes(n)) verdict = "free-pass";
    else if (zr.visa?.includes(n)) verdict = "visa";
    else if (inList(zr.auth)) verdict = "auth";
    else if (inList(zr.evisa)) verdict = "evisa-me";
    else if (inList(zr.voa)) verdict = "voa";
    else if (zr.rest && !zr.restExcept?.includes(n)) verdict = zr.rest;
    else verdict = "unknown";
    // EUA: nacionalidades com emissão de vistos suspensa — só entra quem já tem visto válido (aviso próprio).
    const usBan = zone === "us" && !local && !hasPermit && (US_BAN_FULL.includes(n) || US_BAN_B.includes(n));
    if (usBan) verdict = "visa";
    const fee = verdict === "auth" ? zr.authFee : verdict === "voa" ? zr.fee : undefined;
    const hintOk = zr.hint && !local && (!zr.hintCities || zr.hintCities.includes(city.id)) && (!zr.hintOn || zr.hintOn.includes(verdict));
    const transitVisa = !local && !hasPermit && Boolean(zr.atv?.includes(n));
    return { verdict, zone, transitVisa, officialUrl: zr.url, exitMin: local ? EXIT_AIRPORT_MIN.free : EXIT_AIRPORT_MIN.check,
      ...(fee ? { fee } : {}), ...(zr.site ? { site: zr.site } : {}), ...(usBan ? { hint: "usban" as const } : hintOk ? { hint: zr.hint } : {}) };
  }
  if (zone === "tr") {
    const verdict: EntryVerdict = hasPermit || TR_FREE.includes(n) || n === "TR" ? "free" : TR_EVISA.includes(n) ? "evisa" : TR_VISA.includes(n) ? "visa" : "unknown";
    return { verdict, zone, transitVisa: false, officialUrl: "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa", exitMin: n === "TR" ? EXIT_AIRPORT_MIN.free : EXIT_AIRPORT_MIN.check };
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
export const NATIONALITIES = [...new Set([...EU, ...EEA_CH, ...SCHENGEN_EXEMPT, ...SCHENGEN_VISA, ...UK_ETA, ...UK_VISA, ...TR_FREE, ...TR_EVISA, ...TR_VISA, ...SG_FREE, ...SG_VISA, "IE", "TR", "SG",
  ...Object.values(ME).flatMap((r) => [...r.free, ...(r.voa ?? []), ...(r.evisa ?? []), ...(r.restricted ?? []), ...(r.permitVoa ?? [])]),
  ...Object.values(ZONES).flatMap((r) => [r.local, ...r.free, ...(Array.isArray(r.auth) ? r.auth : []), ...(Array.isArray(r.evisa) ? r.evisa : []), ...(Array.isArray(r.voa) ? r.voa : []), ...(r.visa ?? [])])])]
  .filter((c) => c !== "GF").sort();

/** Só para testes. */
export const _lists = { ZONES, EU, EEA_CH, SCHENGEN_EXEMPT, SCHENGEN_VISA, UK_ETA, UK_VISA, TR_FREE, TR_EVISA, TR_VISA, ME, SG_FREE, SG_VISA,
  IE_FREE, IE_VISA, IE_ATV, HK_FREE, HK_VISA, HK_ATV, TH_FREE, TH_VOA, ID_FREE, ID_VOA, CV_FREE, CV_VISA, NA_FREE, NA_VOA, NA_UNKNOWN, JP_FREE, JP_UNKNOWN };

/** Mês em que as regras de entrada e trânsito foram verificadas (AAAA-MM). */
export const ENTRY_CHECKED = "2026-10";
