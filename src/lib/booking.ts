/**
 * Reservas nos negócios parceiros: o tipo de reserva depende da categoria (mesa, quarto, carro, experiência,
 * bagagem). O viajante envia um pedido; o negócio recebe-o por email e confirma diretamente com o viajante.
 */
import { z } from "zod";

export const MERCHANT_CATS = ["food", "cafe", "stay", "hotel", "guesthouse", "car", "shop", "exp", "bag"] as const;
export type MerchantCat = (typeof MERCHANT_CATS)[number];
export type BookKind = "table" | "room" | "car" | "slot" | "bag";
export const BOOK_KINDS: BookKind[] = ["table", "room", "car", "slot", "bag"];

export const MAX_PHOTOS = 4;
export const MAX_PHOTO_CHARS = 480_000; // data URL JPEG (~350 KB)
export const MAX_OPTIONS = 6;

/** Que tipo de reserva faz sentido para cada categoria (lojas não têm reserva). */
export function bookKind(category: string): BookKind | null {
  switch (category) {
    case "food": case "cafe": return "table";
    case "stay": case "hotel": case "guesthouse": return "room";
    case "car": return "car";
    case "exp": return "slot";
    case "bag": return "bag";
    default: return null;
  }
}

export const isPhotoDataUrl = (s: string) => s.length <= MAX_PHOTO_CHARS && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s);

/** Link de reserva: só https (evita javascript: e afins). */
export function cleanUrl(s: string | null | undefined): string | null {
  const v = (s ?? "").trim();
  if (!v) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!u.hostname.includes(".")) return null;
    u.protocol = "https:";
    return u.toString();
  } catch { return null; }
}

/** Telefone / WhatsApp em formato internacional (só dígitos, com +). */
export function cleanPhone(s: string | null | undefined): string | null {
  const d = (s ?? "").replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  const digits = d.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return null;
  return d.startsWith("+") ? d : `+${digits}`;
}

export const BookOption = z.object({ name: z.string().trim().min(1).max(60), price: z.string().trim().max(40).default("") });

/** Campos novos do registo do negócio. */
export const MerchantExtras = z.object({
  photos: z.array(z.string()).min(1).max(MAX_PHOTOS).refine((a) => a.every(isPhotoDataUrl), "photo"),
  bookMode: z.enum(["none", "request"]).default("none"),
  bookOptions: z.array(BookOption).max(MAX_OPTIONS).default([]),
  bookingUrl: z.string().max(300).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  address: z.string().trim().min(5).max(200),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export const BookingBody = z.object({
  merchantId: z.guid(),
  option: z.string().trim().max(60).optional().default(""),
  dateFrom: z.string().regex(DATE),
  dateTo: z.string().regex(DATE).optional().or(z.literal("")).default(""),
  time: z.string().regex(TIME).optional().or(z.literal("")).default(""),
  people: z.coerce.number().int().min(1).max(50).default(1),
  units: z.coerce.number().int().min(1).max(20).default(1),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().default(""),
  note: z.string().trim().max(500).optional().default(""),
  locale: z.string().max(5).default("en")
});
export type BookingInput = z.infer<typeof BookingBody>;

/** Regras por tipo: datas no futuro (até 1 ano), saída depois da entrada, hora quando precisa. Devolve o erro ou null. */
export function checkBooking(kind: BookKind, b: BookingInput, today = new Date().toISOString().slice(0, 10)): string | null {
  const max = new Date(Date.parse(`${today}T00:00:00Z`) + 366 * 864e5).toISOString().slice(0, 10);
  if (b.dateFrom < yesterday(today) || b.dateFrom > max) return "date";
  if (kind === "room" || kind === "car") {
    if (!b.dateTo || b.dateTo > max) return "dateTo";
    if (kind === "room" ? b.dateTo <= b.dateFrom : b.dateTo < b.dateFrom) return "dateTo";
  }
  if ((kind === "table" || kind === "slot" || kind === "car" || kind === "bag") && !b.time) return "time";
  return null;
}
// Um dia de folga para fusos horários (o viajante pode estar "ainda ontem" em UTC).
const yesterday = (d: string) => new Date(Date.parse(`${d}T00:00:00Z`) - 864e5).toISOString().slice(0, 10);

export const nights = (from: string, to: string) => Math.max(0, Math.round((Date.parse(to) - Date.parse(from)) / 864e5));
