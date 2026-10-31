/** Partes de "booking" sem validação (zod): podem ir para o navegador sem levar a biblioteca de validação. */
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


export const nights = (from: string, to: string) => Math.max(0, Math.round((Date.parse(to) - Date.parse(from)) / 864e5));

/** Meios de pagamento que um negócio pode indicar. */
export const PAYMENTS = ["card", "contactless", "mobile", "cash"] as const;
export type Payment = (typeof PAYMENTS)[number];
/** Promoção ainda válida (o dia "until" conta inteiro). */
export function promoActive(p: { text: string; until: string } | null | undefined, today = new Date().toISOString().slice(0, 10)) {
  return p && p.text && p.until >= today ? p : null;
}
