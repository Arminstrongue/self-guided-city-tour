/**
 * Avaliações verificadas de negócios: só quem teve uma reserva confirmada pelo negócio, e só depois do dia da visita.
 * No dia seguinte à visita o viajante recebe um email com um link assinado (vale 60 dias). Aparece só o primeiro nome.
 */
import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { db, schema } from "./db";
import { createPurposeToken, readPurposeToken } from "./access-token";
import { env } from "./env";
import { sendEmail, emailBrand } from "./email";
import { moderate } from "./moderation";
import { linkFallback } from "./signin-email";

const purpose = (id: string) => `mreview:${id}`;
export const reviewToken = (b: { id: string; email: string }) => createPurposeToken(b.email, purpose(b.id), 60 * 24 * 3600);
export const reviewUrl = (b: { id: string; email: string; locale: string }) =>
  `${env.appUrl}/${b.locale || "en"}/merchants/review?b=${b.id}&t=${encodeURIComponent(reviewToken(b))}`;
/** Dia da visita: o último dia da reserva (quartos e carros têm data de fim). */
export const visitDay = (b: { dateFrom: string; dateTo: string }) => b.dateTo || b.dateFrom;
const today = () => new Date().toISOString().slice(0, 10);

export async function reviewableBooking(bookingId: string, token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(bookingId)) return null;
  const d = await db();
  const [b] = await d.select().from(schema.bookingRequests).where(eq(schema.bookingRequests.id, bookingId)).limit(1);
  if (!b || readPurposeToken(token, purpose(b.id)) !== b.email) return null;
  const [m] = await d.select().from(schema.merchants).where(eq(schema.merchants.id, b.merchantId)).limit(1);
  if (!m) return null;
  const [existing] = await d.select().from(schema.merchantReviews).where(eq(schema.merchantReviews.bookingId, b.id)).limit(1);
  return { booking: b, merchant: m, review: existing ?? null, started: visitDay(b) <= today(), confirmed: b.status === "confirmed" };
}

export async function submitMerchantReview(bookingId: string, token: string, stars: number, comment: string | null) {
  const r = await reviewableBooking(bookingId, token);
  if (!r || !r.confirmed || !r.started) return { error: "not_allowed" as const };
  if (r.review) return { error: "done" as const };
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return { error: "invalid" as const };
  let text: string | null = comment?.trim().slice(0, 600) || null;
  if (text) { const mod = moderate(text); if (!mod.ok) return { error: "offensive" as const }; text = mod.text; }
  const d = await db();
  const ins = await d.insert(schema.merchantReviews).values({
    bookingId, merchantId: r.merchant.id, stars, comment: text, author: r.booking.name.split(/\s+/)[0]?.slice(0, 30) || null, locale: r.booking.locale
  }).onConflictDoNothing().returning({ id: schema.merchantReviews.id });
  if (!ins.length) return { error: "done" as const };
  await d.update(schema.merchants).set({ ratingSum: sql`${schema.merchants.ratingSum} + ${stars}`, ratingCount: sql`${schema.merchants.ratingCount} + 1` }).where(eq(schema.merchants.id, r.merchant.id));
  return { ok: true as const };
}

export async function reviewsOf(merchantId: string, limit = 20) {
  const d = await db();
  return d.select({ stars: schema.merchantReviews.stars, comment: schema.merchantReviews.comment, author: schema.merchantReviews.author, at: schema.merchantReviews.createdAt })
    .from(schema.merchantReviews).where(eq(schema.merchantReviews.merchantId, merchantId)).orderBy(desc(schema.merchantReviews.createdAt)).limit(limit);
}

/** Média com uma casa decimal (null sem avaliações). */
export const ratingOf = (sum: number, count: number) => (count > 0 ? Math.round((sum / count) * 10) / 10 : null);

type T = { s: string; h: string; b: string; btn: string; why: string; foot: string };
const TX: Record<string, T> = {
  pt: { s: "Como foi em {m}?", h: "Como foi em {m}?", b: "A sua reserva foi confirmada pelo negócio. Diga-nos como correu: demora 20 segundos e ajuda outros viajantes.", btn: "Avaliar", why: "Só quem fez uma reserva confirmada pode avaliar, por isso as avaliações na VOYBU são verificadas. Aparece só o seu primeiro nome.", foot: "VOYBU · O seu próximo passo, em qualquer lugar." },
  en: { s: "How was {m}?", h: "How was {m}?", b: "Your booking was confirmed by the business. Tell us how it went: it takes 20 seconds and helps other travellers.", btn: "Rate it", why: "Only people with a confirmed booking can leave a rating, so reviews on VOYBU are verified. Only your first name is shown.", foot: "VOYBU · Your next step, anywhere." },
  es: { s: "¿Qué tal en {m}?", h: "¿Qué tal en {m}?", b: "El negocio confirmó tu reserva. Cuéntanos cómo fue: tardas 20 segundos y ayudas a otros viajeros.", btn: "Valorar", why: "Solo quien tuvo una reserva confirmada puede valorar, por eso las opiniones en VOYBU están verificadas. Solo se muestra tu nombre.", foot: "VOYBU · Tu próximo paso, en cualquier lugar." },
  fr: { s: "Comment c'était chez {m} ?", h: "Comment c'était chez {m} ?", b: "Votre réservation a été confirmée par l'établissement. Dites-nous comment ça s'est passé : 20 secondes qui aident d'autres voyageurs.", btn: "Donner un avis", why: "Seules les personnes ayant une réservation confirmée peuvent noter : les avis sur VOYBU sont donc vérifiés. Seul votre prénom est affiché.", foot: "VOYBU · Votre prochaine étape, partout." },
  de: { s: "Wie war es bei {m}?", h: "Wie war es bei {m}?", b: "Ihre Buchung wurde vom Betrieb bestätigt. Erzählen Sie uns, wie es war: Das dauert 20 Sekunden und hilft anderen Reisenden.", btn: "Bewerten", why: "Nur wer eine bestätigte Buchung hatte, kann bewerten – deshalb sind Bewertungen bei VOYBU verifiziert. Es wird nur Ihr Vorname angezeigt.", foot: "VOYBU · Ihr nächster Schritt, überall." },
  it: { s: "Com'è andata da {m}?", h: "Com'è andata da {m}?", b: "La tua prenotazione è stata confermata dall'attività. Raccontaci com'è andata: bastano 20 secondi e aiuti altri viaggiatori.", btn: "Valuta", why: "Solo chi ha avuto una prenotazione confermata può valutare, quindi le recensioni su VOYBU sono verificate. Viene mostrato solo il tuo nome.", foot: "VOYBU · Il tuo prossimo passo, ovunque." },
  zh: { s: "{m} 体验如何？", h: "{m} 体验如何？", b: "商家已确认您的预订。告诉我们感受如何：只需 20 秒，还能帮助其他旅行者。", btn: "去评价", why: "只有预订被确认的人才能评价，因此 VOYBU 上的评价都经过验证。只显示您的名字。", foot: "VOYBU · 您的下一步，随处可达。" },
  ar: { s: "كيف كانت تجربتك في {m}؟", h: "كيف كانت تجربتك في {m}؟", b: "أكّد النشاط التجاري حجزك. أخبرنا كيف كانت التجربة: 20 ثانية فقط وتساعد مسافرين آخرين.", btn: "قيّم", why: "لا يمكن التقييم إلا لمن لديه حجز مؤكد، لذلك التقييمات في VOYBU موثّقة. يظهر اسمك الأول فقط.", foot: "VOYBU · خطوتك التالية، في أي مكان." },
  ja: { s: "{m}はいかがでしたか？", h: "{m}はいかがでしたか？", b: "ご予約は店舗により確定されました。感想をお聞かせください。20秒で終わり、ほかの旅行者の役に立ちます。", btn: "評価する", why: "確定した予約がある方だけが評価できるため、VOYBUのレビューは確認済みです。表示されるのは名前だけです。", foot: "VOYBU · どこでも、次の一歩を。" },
  ko: { s: "{m}은(는) 어떠셨나요?", h: "{m}은(는) 어떠셨나요?", b: "업체가 예약을 확정했어요. 어땠는지 알려 주세요. 20초면 되고 다른 여행자에게 도움이 돼요.", btn: "평가하기", why: "예약이 확정된 사람만 평가할 수 있어 VOYBU의 리뷰는 인증된 리뷰예요. 이름만 표시돼요.", foot: "VOYBU · 어디서든 다음 한 걸음." },
  ru: { s: "Как вам {m}?", h: "Как вам {m}?", b: "Заведение подтвердило вашу бронь. Расскажите, как всё прошло: это займёт 20 секунд и поможет другим путешественникам.", btn: "Оценить", why: "Оценить могут только те, чья бронь была подтверждена, поэтому отзывы в VOYBU проверены. Показывается только ваше имя.", foot: "VOYBU · Ваш следующий шаг, где угодно." },
  tr: { s: "{m} nasıldı?", h: "{m} nasıldı?", b: "Rezervasyonunuz işletme tarafından onaylandı. Nasıl geçtiğini anlatın: 20 saniye sürer ve diğer gezginlere yardımcı olur.", btn: "Değerlendir", why: "Yalnızca onaylı rezervasyonu olanlar değerlendirebilir; bu yüzden VOYBU'daki yorumlar doğrulanmıştır. Yalnızca adınız görünür.", foot: "VOYBU · Bir sonraki adımınız, her yerde." }
};
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function reviewEmail(locale: string, merchant: string, link: string) {
  const t = TX[locale] ?? TX.en, f = linkFallback(locale);
  const m = (s: string) => s.replace("{m}", merchant);
  const html = `<!doctype html><html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}"><body style="margin:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;padding:32px 28px">
<tr><td style="padding-bottom:24px">${emailBrand()}</td></tr>
<tr><td style="font-size:24px;font-weight:700;line-height:1.25;padding-bottom:12px;color:#102A43">${esc(m(t.h))}</td></tr>
<tr><td style="font-size:16px;line-height:1.55;padding-bottom:20px">${esc(t.b)}</td></tr>
<tr><td align="center" style="font-size:30px;letter-spacing:6px;color:#f5a623;padding-bottom:16px">★★★★★</td></tr>
<tr><td align="center" style="padding-bottom:24px"><a href="${link}" style="display:inline-block;background:#102A43;color:#ffffff;text-decoration:none;font-weight:700;font-size:17px;padding:14px 40px;border-radius:999px">${esc(t.btn)}</a></td></tr>
<tr><td style="font-size:14px;line-height:1.5;color:#6e6e73;padding-bottom:20px">✓ ${esc(t.why)}</td></tr>
<tr><td style="font-size:12px;line-height:1.5;color:#86868b;border-top:1px solid #e5e5ea;padding-top:16px">${esc(f.copy)} <a href="${link}" style="color:#0071e3;font-weight:600">${esc(f.here)}</a></td></tr>
</table><p style="font-size:12px;color:#86868b;margin:16px 0 0">${esc(t.foot)}</p></td></tr></table></body></html>`;
  return { subject: m(t.s), html, text: `${m(t.h)}\n\n${t.b}\n\n${link}\n\n${t.why}\n\n${t.foot}` };
}

/** Corre no worker: pede avaliação no dia a seguir à visita, uma única vez por reserva confirmada (até 60 dias depois do pedido). */
export async function mailReviewInvites(log: (m: string) => void = console.log) {
  const d = await db();
  const rows = await d.select({ b: schema.bookingRequests, name: schema.merchants.name }).from(schema.bookingRequests)
    .innerJoin(schema.merchants, eq(schema.merchants.id, schema.bookingRequests.merchantId))
    .where(and(eq(schema.bookingRequests.status, "confirmed"), isNull(schema.bookingRequests.reviewMailedAt), gte(schema.bookingRequests.createdAt, new Date(Date.now() - 60 * 86400_000))))
    .limit(200);
  let sent = 0;
  for (const { b, name } of rows.filter((r) => visitDay(r.b) < today()).slice(0, 50)) {
    if (!b.email) continue;
    const e = reviewEmail(b.locale, name, reviewUrl(b));
    // Marca primeiro: um erro de envio não faz repetir o email em cada volta.
    await d.update(schema.bookingRequests).set({ reviewMailedAt: new Date() }).where(eq(schema.bookingRequests.id, b.id));
    if (await sendEmail(b.email, e.subject, e.html, e.text).catch(() => false)) sent++;
  }
  if (sent) log(`avaliações: ${sent} pedido(s) enviado(s)`);
  return sent;
}
