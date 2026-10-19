import { z } from "zod";
import { LOCALES } from "@/i18n/dictionaries";
import { CITIES } from "@/data/cities";
import { GUIDE_LANGS } from "./guides";
import { GUIDE_MAX_HOURLY, GUIDE_MIN_HOURLY } from "./pricing";

const photo = z.string().max(110_000).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/).optional().nullable();

export const GuideProfile = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional().default(""),
  city: z.string().refine((c) => CITIES.some((x) => x.id === c)),
  languages: z.array(z.enum(GUIDE_LANGS)).min(1).max(8),
  bio: z.string().trim().min(40).max(1200),
  hourly: z.coerce.number().refine((v) => v * 100 >= GUIDE_MIN_HOURLY && v * 100 <= GUIDE_MAX_HOURLY),
  maxPeople: z.coerce.number().int().min(1).max(20),
  meetingPoint: z.string().trim().max(200).optional().default(""),
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
  .superRefine((v, ctx) => { for (const k of missingLegal(v)) ctx.addIssue({ code: "custom", path: [k], message: "required" }); });

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
