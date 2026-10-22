/** Dados pequenos das cidades usados no browser (sem carregar todos os roteiros). */
export type Zone = "uk" | "schengen" | "tr" | "ae" | "qa" | "sa" | "eg" | "jo" | "om" | "sg"
  | "us" | "ca" | "mx" | "br" | "ar" | "ma" | "za" | "tz" | "tn" | "et" | "ke" | "ao" | "gh" | "rw" | "sn";
const CUR_ZONE: Record<string, Zone> = { GBP: "uk", TRY: "tr", AED: "ae", QAR: "qa", SAR: "sa", EGP: "eg", JOD: "jo", OMR: "om", SGD: "sg",
  USD: "us", CAD: "ca", MXN: "mx", BRL: "br", ARS: "ar", MAD: "ma", ZAR: "za", TZS: "tz", TND: "tn", ETB: "et", KES: "ke", AOA: "ao", GHS: "gh", RWF: "rw", XOF: "sn" };
/** País de cada zona de fronteira fora da Europa (nome mostrado com Intl.DisplayNames). */
export const ZONE_COUNTRY: Partial<Record<Zone, string>> = { us: "US", ca: "CA", mx: "MX", br: "BR", ar: "AR", ma: "MA", za: "ZA", tz: "TZ", tn: "TN", et: "ET", ke: "KE", ao: "AO", gh: "GH", rw: "RW", sn: "SN" };
/** Zona de fronteira: Reino Unido, Turquia e cada país do Médio Oriente têm regras de entrada próprias; o resto é espaço Schengen. */
export const zoneOf = (c: { cur: string }): Zone => CUR_ZONE[c.cur] ?? "schengen";

export const COUNTRY: Record<string, string> = {
  lis: "PT", opo: "PT", mad: "ES", bcn: "ES", par: "FR", rom: "IT", ams: "NL", ist: "TR",
  lon: "GB", edi: "GB", man: "GB", gla: "GB", liv: "GB", bir: "GB",
  fra: "DE", ber: "DE", muc: "DE", vie: "AT", prg: "CZ", sin: "SG",
  dxb: "AE", auh: "AE", doh: "QA", ruh: "SA", jed: "SA", cai: "EG", amm: "JO", mct: "OM",
  nyc: "US", was: "US", sfo: "US", chi: "US", bos: "US", mia: "US", lax: "US", las: "US", msy: "US", mco: "US",
  yyz: "CA", mex: "MX", rio: "BR", bue: "AR",
  rak: "MA", cas: "MA", cpt: "ZA", zan: "TZ", tun: "TN", add: "ET", nbo: "KE", lad: "AO", acc: "GH", kgl: "RW", dkr: "SN"
};
