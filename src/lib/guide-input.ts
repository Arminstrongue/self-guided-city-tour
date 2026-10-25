import { z } from "zod";
import { imageDataUrl } from "./strip-meta";
import { LOCALES } from "@/i18n/core";
import { CITIES, COUNTRY } from "@/data/cities";
import { GUIDE_LANGS } from "./guides";
import { GUIDE_MAX_HOURLY, GUIDE_MIN_HOURLY } from "./pricing";

/** Países onde os guias podem receber pagamentos pela Stripe Connect (Turquia, Catar, Arábia Saudita, Egito, Jordânia e Omã ainda não). */
export const GUIDE_PAYOUT_COUNTRIES = ["PT", "ES", "FR", "IT", "NL", "GB", "AE", "DE", "AT", "CZ", "SG", "US", "CA", "MX", "BR"];
export const guideCityOk = (id: string) => GUIDE_PAYOUT_COUNTRIES.includes(COUNTRY[id] ?? "");

const photo = imageDataUrl(110_000).optional().nullable();

export const GuideProfile = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional().default(""),
  city: z.string().refine((c) => CITIES.some((x) => x.id === c)),
  languages: z.array(z.enum(GUIDE_LANGS)).min(1).max(8),
  bio: z.string().trim().min(40).max(1200).transform((b) => dedupeText(b)),
  hourly: z.coerce.number().refine((v) => v * 100 >= GUIDE_MIN_HOURLY && v * 100 <= GUIDE_MAX_HOURLY),
  maxPeople: z.coerce.number().int().min(1).max(20),
  // Ponto de encontro preciso (não basta "Aeroporto" ou "Centro"): o viajante tem de o encontrar sem perguntar.
  meetingPoint: z.string().trim().min(15).max(200).refine((m) => !vagueMeeting(m), "vague"),
  licenseNo: z.string().trim().max(60).optional().default(""),
  photo,
  // Dados profissionais (não públicos). Opcionais na edição para guias antigos; obrigatórios no registo.
  activityRegNo: z.string().trim().max(60).optional().default(""),
  insurer: z.string().trim().max(80).optional().default(""),
  policyNo: z.string().trim().max(60).optional().default(""),
  taxId: z.string().trim().max(30).optional().default(""),
  taxCountry: z.string().trim().toUpperCase().regex(/^([A-Z]{2})?$/).optional().default(""),
  address: z.string().trim().max(240).optional().default(""),
  birthDate: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/).optional().default(""),
  independent: z.boolean().optional()
});

/** Versão dos termos para guias aceite no registo (guardada com a data da declaração). */
export const GUIDE_TERMS_VERSION = "2026-10-19";

/** Campos profissionais obrigatórios: registo da atividade, seguro, NIF, país fiscal, morada, data de nascimento e declaração. */
export const LEGAL_FIELDS = ["activityRegNo", "insurer", "policyNo", "taxId", "taxCountry", "address", "birthDate"] as const;
export function missingLegal(v: Partial<Record<(typeof LEGAL_FIELDS)[number], string | null>>): string[] {
  return LEGAL_FIELDS.filter((k) => !String(v[k] ?? "").trim());
}

export const GuideSignup = GuideProfile.extend({ email: z.string().email().max(200), locale: z.enum(LOCALES), terms: z.literal(true), independent: z.literal(true) })
  .superRefine((v, ctx) => {
    for (const k of missingLegal(v)) ctx.addIssue({ code: "custom", path: [k], message: "required" });
    if (!guideCityOk(v.city)) ctx.addIssue({ code: "custom", path: ["city"], message: "payouts_unavailable" });
  });

export const BookBody = z.object({
  guideId: z.string().uuid(),
  startAt: z.string().datetime({ offset: true }),
  hours: z.coerce.number().int().min(1).max(8),
  people: z.coerce.number().int().min(1).max(20),
  email: z.string().email().max(200),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional().default(""),
  note: z.string().trim().max(500).optional().default(""),
  locale: z.enum(LOCALES),
  terms: z.literal(true)
});

/**
 * Controlo editorial simples: remove frases e parágrafos repetidos (texto colado várias vezes).
 * Compara sem acentos, maiúsculas nem espaços; mantém a primeira ocorrência e a ordem.
 */
export function dedupeText(text: string): string {
  // Compara sem acentos, maiúsculas, pontuação nem espaços: "Sou guia." e "sou guia!" são a mesma frase.
  const norm = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const seen = new Set<string>();
  return text.replace(/\r/g, "").split(/\n{2,}/).map((para) => para.split("\n").map((line) => {
    const parts = line.match(/[^.!?。！？]+[.!?。！？]*\s*/g) ?? [line];
    return parts.filter((p) => {
      const k = norm(p);
      if (k.length < 12) return true;
      // Repetida, ou quase igual (uma contida na outra, ex.: colada sem o ponto final).
      if (seen.has(k) || (k.length >= 30 && [...seen].some((x) => x.length >= 30 && (x.includes(k) || k.includes(x))))) return false;
      seen.add(k); return true;
    }).join("").trim();
  }).filter(Boolean).join("\n")).filter(Boolean).join("\n\n");
}

/** "Aeroporto", "Centro", "Hotel"… sem mais nada não chega para um ponto de encontro. */
export function vagueMeeting(m: string): boolean {
  const k = m.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  return k.length < 15 || /^(o |the |el |le |l |il |der |die |das )?(aeroporto|airport|aeropuerto|aeroport|flughafen|centro|center|centre|city centre|downtown|hotel|seu hotel|your hotel|a combinar|to be agreed|tbc|estacao|station)( da cidade| do hotel)?$/.test(k);
}
