import { emailBrand } from "./email";
/** Emails dos pedidos de reserva: ao negócio (pt/en/es/fr) e a confirmação ao viajante (12 idiomas). */
import { isLocale } from "@/i18n/core";
import type { Locale } from "@/i18n/dictionaries";
import type { BookKind } from "./booking";
import { nights } from "./booking";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const f = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");

type Biz = {
  subject: string; intro: string; reply: string; kinds: Record<BookKind, string>;
  option: string; date: string; checkin: string; checkout: string; pickup: string; ret: string; time: string;
  people: string; rooms: string; bags: string; nights: string; name: string; email: string; phone: string; note: string; lang: string; foot: string;
};
const BIZ: Record<"pt" | "en" | "es" | "fr", Biz> = {
  pt: {
    subject: "Novo pedido de reserva ({k}) · {d}", intro: "Um viajante da VOYBU quer reservar em {b}.",
    reply: "Responda a este email (vai diretamente para o viajante) para confirmar, propor outra hora ou recusar.",
    kinds: { table: "mesa", room: "quarto", car: "carro", slot: "experiência", bag: "bagagem" },
    option: "Escolha", date: "Data", checkin: "Entrada", checkout: "Saída", pickup: "Levantamento", ret: "Devolução", time: "Hora",
    people: "Pessoas", rooms: "Quartos", bags: "Malas", nights: "{n} noites", name: "Nome", email: "Email", phone: "Telefone", note: "Mensagem", lang: "Idioma do viajante",
    foot: "A VOYBU não cobra nada por este pedido nem pelo pagamento — combine-o diretamente com o viajante."
  },
  en: {
    subject: "New booking request ({k}) · {d}", intro: "A VOYBU traveller would like to book at {b}.",
    reply: "Reply to this email (it goes straight to the traveller) to confirm, suggest another time or decline.",
    kinds: { table: "table", room: "room", car: "car", slot: "experience", bag: "luggage" },
    option: "Choice", date: "Date", checkin: "Check-in", checkout: "Check-out", pickup: "Pick-up", ret: "Return", time: "Time",
    people: "People", rooms: "Rooms", bags: "Bags", nights: "{n} nights", name: "Name", email: "Email", phone: "Phone", note: "Message", lang: "Traveller's language",
    foot: "VOYBU takes no fee on this request or its payment — arrange it directly with the traveller."
  },
  es: {
    subject: "Nueva solicitud de reserva ({k}) · {d}", intro: "Un viajero de VOYBU quiere reservar en {b}.",
    reply: "Responde a este email (llega directamente al viajero) para confirmar, proponer otra hora o rechazar.",
    kinds: { table: "mesa", room: "habitación", car: "coche", slot: "experiencia", bag: "equipaje" },
    option: "Elección", date: "Fecha", checkin: "Entrada", checkout: "Salida", pickup: "Recogida", ret: "Devolución", time: "Hora",
    people: "Personas", rooms: "Habitaciones", bags: "Maletas", nights: "{n} noches", name: "Nombre", email: "Email", phone: "Teléfono", note: "Mensaje", lang: "Idioma del viajero",
    foot: "VOYBU no cobra nada por esta solicitud ni por el pago: acuérdalo directamente con el viajero."
  },
  fr: {
    subject: "Nouvelle demande de réservation ({k}) · {d}", intro: "Un voyageur VOYBU souhaite réserver chez {b}.",
    reply: "Répondez à cet email (il va directement au voyageur) pour confirmer, proposer un autre horaire ou refuser.",
    kinds: { table: "table", room: "chambre", car: "voiture", slot: "expérience", bag: "bagages" },
    option: "Choix", date: "Date", checkin: "Arrivée", checkout: "Départ", pickup: "Prise en charge", ret: "Retour", time: "Heure",
    people: "Personnes", rooms: "Chambres", bags: "Bagages", nights: "{n} nuits", name: "Nom", email: "Email", phone: "Téléphone", note: "Message", lang: "Langue du voyageur",
    foot: "VOYBU ne prend aucune commission sur cette demande ni sur le paiement : réglez-le directement avec le voyageur."
  }
};

/** Confirmação ao viajante: [assunto, texto]. */
const TRAV: Record<Locale, [string, string]> = {
  pt: ["Pedido enviado a {b}", "{b} vai responder diretamente para este email para confirmar a sua reserva. Ainda não está confirmada nem foi cobrado nada."],
  en: ["Request sent to {b}", "{b} will reply directly to this email to confirm your booking. It isn't confirmed yet and nothing has been charged."],
  es: ["Solicitud enviada a {b}", "{b} responderá directamente a este email para confirmar tu reserva. Aún no está confirmada y no se ha cobrado nada."],
  fr: ["Demande envoyée à {b}", "{b} répondra directement à cet email pour confirmer votre réservation. Elle n'est pas encore confirmée et rien n'a été débité."],
  de: ["Anfrage an {b} gesendet", "{b} antwortet direkt auf diese E-Mail, um Ihre Buchung zu bestätigen. Sie ist noch nicht bestätigt, es wurde nichts berechnet."],
  it: ["Richiesta inviata a {b}", "{b} risponderà direttamente a questa email per confermare la prenotazione. Non è ancora confermata e non è stato addebitato nulla."],
  zh: ["已向{b}发送请求", "{b}会直接回复此邮件确认您的预订。目前尚未确认，也未产生任何费用。"],
  ar: ["تم إرسال الطلب إلى {b}", "سيرد {b} مباشرة على هذا البريد لتأكيد حجزك. الحجز غير مؤكد بعد ولم يُخصم أي مبلغ."],
  ja: ["{b}にリクエストを送信しました", "{b}からこのメール宛てに直接返信があり、予約が確定します。まだ確定しておらず、料金も発生していません。"],
  tr: ["İstek {b} işletmesine gönderildi", "{b} rezervasyonunuzu onaylamak için doğrudan bu e-postaya yanıt verecek. Henüz onaylanmadı ve hiçbir ücret alınmadı."],
  ru: ["Запрос отправлен: {b}", "{b} ответит прямо на этот адрес, чтобы подтвердить бронь. Пока она не подтверждена, деньги не списаны."],
  ko: ["{b}에 요청을 보냈어요", "{b}에서 이 이메일로 직접 답장해 예약을 확정해요. 아직 확정되지 않았고 결제된 금액도 없어요."]
};

export type BookingMailData = {
  business: string; kind: BookKind; option: string; dateFrom: string; dateTo: string; time: string;
  people: number; units: number; name: string; email: string; phone: string; note: string; locale: string;
};

function shell(locale: string, title: string, rows: string) {
  return `<!doctype html><html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}"><body style="margin:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:20px;padding:32px">
<tr><td style="font-size:15px;font-weight:600;color:#102A43;padding-bottom:16px">${emailBrand()}</td></tr>
<tr><td style="font-size:22px;font-weight:700;padding-bottom:12px">${title}</td></tr>${rows}
</table></td></tr></table></body></html>`;
}
const p = (s: string, style = "") => `<tr><td style="font-size:15px;line-height:1.5;padding:6px 0;${style}">${s}</td></tr>`;

/** Linhas "rótulo: valor" com os detalhes do pedido, na língua do negócio. */
export function bookingLines(d: BookingMailData, bizLocale: string): [string, string][] {
  const t = BIZ[(["pt", "es", "fr"] as const).find((l) => l === bizLocale) ?? "en"];
  const out: [string, string][] = [];
  if (d.option) out.push([t.option, d.option]);
  if (d.kind === "room") {
    out.push([t.checkin, d.dateFrom], [t.checkout, `${d.dateTo} (${f(t.nights, { n: String(nights(d.dateFrom, d.dateTo)) })})`], [t.people, String(d.people)], [t.rooms, String(d.units)]);
  } else if (d.kind === "car") {
    out.push([t.pickup, `${d.dateFrom} ${d.time}`.trim()], [t.ret, d.dateTo]);
  } else {
    out.push([t.date, d.dateFrom]);
    if (d.time) out.push([t.time, d.time]);
    out.push(d.kind === "bag" ? [t.bags, String(d.units)] : [t.people, String(d.people)]);
  }
  out.push([t.name, d.name], [t.email, d.email]);
  if (d.phone) out.push([t.phone, d.phone]);
  if (d.note) out.push([t.note, d.note]);
  out.push([t.lang, d.locale]);
  return out;
}

export function businessMail(d: BookingMailData, bizLocale: string) {
  const l = (["pt", "es", "fr"] as const).find((x) => x === bizLocale) ?? "en";
  const t = BIZ[l];
  const subject = f(t.subject, { k: t.kinds[d.kind], d: d.dateFrom });
  const rows = bookingLines(d, l).map(([k, v]) => `<tr><td style="font-size:15px;padding:4px 0"><span style="color:#6e6e73">${esc(k)}:</span> <b>${esc(v)}</b></td></tr>`).join("");
  const html = shell(l, esc(subject), p(esc(f(t.intro, { b: d.business }))) + rows + p(esc(t.reply), "padding-top:16px;font-weight:600") + p(esc(t.foot), "color:#6e6e73;font-size:13px"));
  return { subject, html };
}

export function travellerMail(d: BookingMailData) {
  const l: Locale = isLocale(d.locale) ? d.locale : "en";
  const [s, body] = TRAV[l];
  const subject = f(s, { b: d.business });
  const rows = bookingLines(d, l === "pt" || l === "es" || l === "fr" ? l : "en").filter(([k]) => k !== BIZ.en.lang && k !== BIZ.pt.lang && k !== BIZ.es.lang && k !== BIZ.fr.lang)
    .map(([k, v]) => `<tr><td style="font-size:15px;padding:4px 0"><span style="color:#6e6e73">${esc(k)}:</span> <b>${esc(v)}</b></td></tr>`).join("");
  return { subject, html: shell(l, esc(subject), p(esc(f(body, { b: d.business }))) + rows) };
}

/** Aviso ao negócio quando o anúncio grátis é aprovado (pt/en/es/fr). */
const LIVE: Record<"pt" | "en" | "es" | "fr", [string, string]> = {
  pt: ["O seu anúncio já está visível na VOYBU", "{b} já aparece no roteiro, junto à paragem mais próxima. Os pedidos de reserva dos viajantes chegam a este email."],
  en: ["Your listing is now live on VOYBU", "{b} now shows on the route, at the nearest stop. Booking requests from travellers will arrive at this email."],
  es: ["Tu anuncio ya está visible en VOYBU", "{b} ya aparece en la ruta, junto a la parada más cercana. Las solicitudes de reserva llegarán a este email."],
  fr: ["Votre annonce est en ligne sur VOYBU", "{b} apparaît désormais sur l'itinéraire, à l'arrêt le plus proche. Les demandes de réservation arriveront sur cet email."]
};
export function listingLiveMail(business: string, locale: string) {
  const l = (["pt", "es", "fr"] as const).find((x) => x === locale) ?? "en";
  const [s, b] = LIVE[l];
  return { subject: s, html: shell(l, esc(s), p(esc(f(b, { b: business })))) };
}
