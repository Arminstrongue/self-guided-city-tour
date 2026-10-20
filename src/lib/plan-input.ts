import { z } from "zod";

export const PlanItemZ = z.object({
  id: z.string().min(1).max(40), day: z.number().int().min(1).max(30), time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  title: z.string().trim().min(1).max(160), kind: z.enum(["moment", "place", "stop", "custom"]),
  lat: z.number().min(-90).max(90).optional(), lng: z.number().min(-180).max(180).optional(), note: z.string().trim().max(500).optional(), icon: z.string().max(8).optional()
});
export const NewPlan = z.object({
  title: z.string().trim().min(1).max(120), city: z.string().regex(/^[a-z]{2,8}$/).nullable(), cityName: z.string().trim().min(1).max(80),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null), days: z.number().int().min(1).max(30).default(1), items: z.array(PlanItemZ).max(300).optional()
});
export const EditPlan = z.object({
  title: z.string().trim().min(1).max(120).optional(), startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  days: z.number().int().min(1).max(30).optional(), items: z.array(PlanItemZ).max(300).optional()
});
