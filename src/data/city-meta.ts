/** Dados pequenos das cidades usados no browser (sem carregar todos os roteiros). */
export type Zone = "uk" | "schengen" | "tr" | "ae" | "qa" | "sa" | "eg" | "jo" | "om" | "sg";
const CUR_ZONE: Record<string, Zone> = { GBP: "uk", TRY: "tr", AED: "ae", QAR: "qa", SAR: "sa", EGP: "eg", JOD: "jo", OMR: "om", SGD: "sg" };
/** Zona de fronteira: Reino Unido, Turquia e cada país do Médio Oriente têm regras de entrada próprias; o resto é espaço Schengen. */
export const zoneOf = (c: { cur: string }): Zone => CUR_ZONE[c.cur] ?? "schengen";

export const COUNTRY: Record<string, string> = {
  lis: "PT", opo: "PT", mad: "ES", bcn: "ES", par: "FR", rom: "IT", ams: "NL", ist: "TR",
  lon: "GB", edi: "GB", man: "GB", gla: "GB", liv: "GB", bir: "GB",
  fra: "DE", ber: "DE", muc: "DE", vie: "AT", prg: "CZ", sin: "SG",
  dxb: "AE", auh: "AE", doh: "QA", ruh: "SA", jed: "SA", cai: "EG", amm: "JO", mct: "OM"
};
