/** Emails do marketplace de guias: ao turista na sua língua (9), ao guia em português e inglês. */
import { INTL_LOCALE, isLocale } from "@/i18n/core";
import type { Locale } from "@/i18n/dictionaries";

type T = { req: [string, string]; ok: [string, string]; no: [string, string]; meet: string; contact: string; rate: string; other: string; when: string; charged: string };
const TX: Record<Locale, T> = {
  pt: { req: ["Pedido enviado a {g}", "{g} tem até {d} para confirmar. O cartão só é cobrado se o guia aceitar."], ok: ["{g} confirmou o seu passeio", "Está marcado. O pagamento de {a} foi cobrado."], no: ["{g} não está disponível", "Nada foi cobrado. Escolha outro guia bem avaliado:"], meet: "Ponto de encontro", contact: "Contacto do guia", rate: "Depois do passeio, avalie {g}", other: "Ver outros guias", when: "Data", charged: "Total" },
  en: { req: ["Request sent to {g}", "{g} has until {d} to confirm. Your card is only charged if the guide accepts."], ok: ["{g} confirmed your tour", "You're booked. The payment of {a} has been charged."], no: ["{g} isn't available", "Nothing was charged. Choose another top-rated guide:"], meet: "Meeting point", contact: "Guide contact", rate: "After the tour, rate {g}", other: "See other guides", when: "Date", charged: "Total" },
  es: { req: ["Solicitud enviada a {g}", "{g} tiene hasta el {d} para confirmar. Solo se cobra si el guía acepta."], ok: ["{g} ha confirmado tu tour", "Reserva hecha. Se ha cobrado el pago de {a}."], no: ["{g} no está disponible", "No se ha cobrado nada. Elige otro guía bien valorado:"], meet: "Punto de encuentro", contact: "Contacto del guía", rate: "Después del tour, valora a {g}", other: "Ver otros guías", when: "Fecha", charged: "Total" },
  fr: { req: ["Demande envoyée à {g}", "{g} a jusqu'au {d} pour confirmer. Votre carte n'est débitée que si le guide accepte."], ok: ["{g} a confirmé votre visite", "C'est réservé. Le paiement de {a} a été débité."], no: ["{g} n'est pas disponible", "Rien n'a été débité. Choisissez un autre guide bien noté :"], meet: "Point de rendez-vous", contact: "Contact du guide", rate: "Après la visite, notez {g}", other: "Voir d'autres guides", when: "Date", charged: "Total" },
  de: { req: ["Anfrage an {g} gesendet", "{g} hat bis {d} Zeit zu bestätigen. Ihre Karte wird nur belastet, wenn der Guide annimmt."], ok: ["{g} hat Ihre Tour bestätigt", "Gebucht. Die Zahlung von {a} wurde belastet."], no: ["{g} ist nicht verfügbar", "Es wurde nichts belastet. Wählen Sie einen anderen gut bewerteten Guide:"], meet: "Treffpunkt", contact: "Kontakt des Guides", rate: "Bewerten Sie {g} nach der Tour", other: "Andere Guides ansehen", when: "Datum", charged: "Gesamt" },
  it: { req: ["Richiesta inviata a {g}", "{g} ha tempo fino al {d} per confermare. La carta viene addebitata solo se la guida accetta."], ok: ["{g} ha confermato il tuo tour", "Prenotato. Il pagamento di {a} è stato addebitato."], no: ["{g} non è disponibile", "Non è stato addebitato nulla. Scegli un'altra guida ben valutata:"], meet: "Punto d'incontro", contact: "Contatto della guida", rate: "Dopo il tour, valuta {g}", other: "Vedi altre guide", when: "Data", charged: "Totale" },
  zh: { req: ["已向{g}发送请求", "{g}需在 {d} 前确认。只有导游接受后才会扣款。"], ok: ["{g}已确认您的行程", "预订成功，已扣款 {a}。"], no: ["{g}无法接单", "未产生任何费用。请选择其他高评分导游："], meet: "集合地点", contact: "导游联系方式", rate: "行程结束后，请为{g}评分", other: "查看其他导游", when: "日期", charged: "总计" },
  ar: { req: ["تم إرسال الطلب إلى {g}", "أمام {g} حتى {d} للتأكيد. لن تُخصم البطاقة إلا إذا قبل المرشد."], ok: ["أكّد {g} جولتك", "تم الحجز وخُصم مبلغ {a}."], no: ["{g} غير متاح", "لم يُخصم أي مبلغ. اختر مرشداً آخر بتقييم عالٍ:"], meet: "نقطة اللقاء", contact: "التواصل مع المرشد", rate: "بعد الجولة، قيّم {g}", other: "عرض مرشدين آخرين", when: "التاريخ", charged: "المجموع" },
  ja: { req: ["{g}にリクエストを送信しました", "{g}は {d} までに確認します。ガイドが承諾した場合のみ請求されます。"], ok: ["{g}がツアーを確定しました", "予約完了です。{a} が請求されました。"], no: ["{g}は対応できません", "請求は発生していません。ほかの高評価ガイドを選んでください："], meet: "集合場所", contact: "ガイドの連絡先", rate: "ツアー後に{g}を評価してください", other: "ほかのガイドを見る", when: "日時", charged: "合計" },
  tr: { req: ["İstek {g} kişisine gönderildi", "{g} onaylamak için {d} tarihine kadar süreye sahip. Kartınızdan yalnızca rehber kabul ederse ücret alınır."], ok: ["{g} turunuzu onayladı", "Rezervasyonunuz tamam. {a} tutarındaki ödeme alındı."], no: ["{g} müsait değil", "Hiçbir ücret alınmadı. Yüksek puanlı başka bir rehber seçin:"], meet: "Buluşma noktası", contact: "Rehber iletişimi", rate: "Turdan sonra {g} için puan verin", other: "Diğer rehberleri gör", when: "Tarih", charged: "Toplam" },
  ru: { req: ["Запрос отправлен: {g}", "У {g} есть время до {d}, чтобы подтвердить. Деньги спишутся, только если гид согласится."], ok: ["{g} подтвердил(а) экскурсию", "Бронь готова. Списано {a}."], no: ["{g} недоступен(-на)", "Ничего не списано. Выберите другого гида с высоким рейтингом:"], meet: "Место встречи", contact: "Контакт гида", rate: "После экскурсии оцените {g}", other: "Другие гиды", when: "Дата", charged: "Итого" },
  ko: { req: ["{g}님에게 요청을 보냈어요", "{g}님은 {d}까지 확정해요. 가이드가 수락할 때만 카드에 청구돼요."], ok: ["{g}님이 투어를 확정했어요", "예약 완료. {a}이(가) 결제됐어요."], no: ["{g}님은 이용할 수 없어요", "청구된 금액이 없어요. 평점 높은 다른 가이드를 고르세요:"], meet: "만남 장소", contact: "가이드 연락처", rate: "투어 후 {g}님을 평가해 주세요", other: "다른 가이드 보기", when: "날짜", charged: "합계" }
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const f = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
const loc = (l: string | null | undefined): Locale => (l && isLocale(l) ? l : "en");

export function fmtWhen(d: Date, locale: string | null | undefined, tz?: string) {
  try { return new Intl.DateTimeFormat(INTL_LOCALE[loc(locale)], { weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: tz ?? "UTC", timeZoneName: "short" }).format(d); }
  catch { return d.toISOString().slice(0, 16).replace("T", " ") + " UTC"; }
}
export function fmtEur(cents: number, locale?: string | null) {
  return new Intl.NumberFormat(INTL_LOCALE[loc(locale)], { style: "currency", currency: "EUR" }).format(cents / 100);
}

function shell(locale: Locale, title: string, rows: string) {
  return `<!doctype html><html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}"><body style="margin:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:20px;padding:32px">
<tr><td style="font-size:15px;font-weight:600;color:#0071e3;padding-bottom:16px">📍 VOYBU</td></tr>
<tr><td style="font-size:22px;font-weight:700;padding-bottom:12px">${title}</td></tr>${rows}
</table></td></tr></table></body></html>`;
}
const p = (s: string, muted = false) => `<tr><td style="font-size:16px;line-height:1.5;padding-bottom:12px;${muted ? "color:#6e6e73" : ""}">${s}</td></tr>`;
const btn = (href: string, label: string) => `<tr><td style="padding:8px 0 16px"><a href="${href}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;font-weight:600;font-size:16px;padding:12px 26px;border-radius:999px">${esc(label)}</a></td></tr>`;

export type MailBooking = { guide: string; when: Date; tz?: string; amountCents: number; hours: number; people: number; locale?: string | null };

export function tourist(kind: "req" | "ok" | "no", b: MailBooking, extra: { respondBy?: Date; meet?: string | null; contact?: string; rateUrl?: string; othersUrl?: string } = {}) {
  const l = loc(b.locale), t = TX[l], g = esc(b.guide);
  const [title, body] = t[kind];
  let rows = p(f(esc(body), { g, d: esc(fmtWhen(extra.respondBy ?? b.when, l, b.tz)), a: esc(fmtEur(b.amountCents, l)) }));
  rows += p(`<b>${t.when}:</b> ${esc(fmtWhen(b.when, l, b.tz))} · ${b.hours} h · ${b.people} 👤<br><b>${t.charged}:</b> ${esc(fmtEur(b.amountCents, l))}`, true);
  if (kind === "ok") {
    if (extra.meet) rows += p(`<b>${t.meet}:</b> ${esc(extra.meet)}`);
    if (extra.contact) rows += p(`<b>${t.contact}:</b> ${esc(extra.contact)}`);
    if (extra.rateUrl) rows += btn(extra.rateUrl, f(t.rate, { g: b.guide }));
  }
  if (kind === "no" && extra.othersUrl) rows += btn(extra.othersUrl, t.other);
  const subject = f(title, { g: b.guide });
  return { subject: `VOYBU — ${subject}`, html: shell(l, f(esc(title), { g }), rows) };
}

/** Ao guia (PT + EN): novo pedido, com prazo e link para o portal. */
export function guideNewRequest(b: MailBooking & { tourist: string; note?: string | null }, respondBy: Date, portalUrl: string) {
  const when = fmtWhen(b.when, "pt", b.tz);
  const rows = p(`<b>${esc(b.tourist)}</b> · ${esc(when)} · ${b.hours} h · ${b.people} 👤`) +
    (b.note ? p(`“${esc(b.note)}”`, true) : "") +
    p(`Recebe / You receive: <b>${esc(fmtEur(Math.round(b.amountCents * 0.8), "pt"))}</b>`) +
    p(`Responda até / Reply by: <b>${esc(fmtWhen(respondBy, "pt", b.tz))}</b>. Sem resposta, o pedido expira. / Without a reply the request expires.`, true) +
    btn(portalUrl, "Aceitar ou recusar / Accept or decline");
  return { subject: `Novo pedido de passeio / New tour request — ${when}`, html: shell("pt", "Novo pedido / New request", rows) };
}

export function guideLinkMail(link: string) {
  return { subject: "VOYBU — portal do guia / guide portal", html: shell("pt", "Portal do guia / Guide portal", p("Entre no seu portal / Open your portal:") + btn(link, "Abrir o portal / Open portal") + p(esc(link), true)) };
}
