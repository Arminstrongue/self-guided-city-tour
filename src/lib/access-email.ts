/** Email de acesso ao roteiro, na língua do cliente (12 línguas), com botão e texto simples. */
import { INTL_LOCALE } from "@/i18n/core";
import type { Locale } from "@/i18n/dictionaries";

type T = { hi: string; hiName: string; ready: string; open: string; until: string; tip: string; help: string };
/** Passe que começa a contar na primeira abertura: "{h}" = duração, "{d}" = prazo para abrir. */
const START: Record<Locale, string> = {
 "pt": "O seu acesso de {h} começa quando abrir o roteiro pela primeira vez. Abra-o até {d}.",
 "en": "Your {h} start when you first open the route. Open it by {d}.",
 "es": "Tus {h} empiezan cuando abras la ruta por primera vez. Ábrela antes del {d}.",
 "fr": "Vos {h} commencent à la première ouverture du parcours. Ouvrez-le avant le {d}.",
 "de": "Ihre {h} beginnen, wenn Sie die Route zum ersten Mal öffnen. Öffnen Sie sie bis {d}.",
 "it": "Le tue {h} iniziano quando apri l'itinerario per la prima volta. Aprilo entro il {d}.",
 "zh": "您的 {h} 从首次打开路线时开始计算。请在 {d} 前打开。",
 "ar": "تبدأ مدة {h} عند فتح المسار لأول مرة. افتحه قبل {d}.",
 "ja": "{h}の有効期間はルートを初めて開いたときから始まります。{d}までに開いてください。",
 "tr": "{h} süreniz rotayı ilk açtığınızda başlar. En geç {d} tarihine kadar açın.",
 "ru": "Ваши {h} начинают отсчитываться при первом открытии маршрута. Откройте его до {d}.",
 "ko": "이용 기간 {h}은(는) 경로를 처음 열 때부터 시작돼요. {d}까지 열어 주세요."
};
const TX: Record<Locale, T> = {
  pt: { hi: "Olá,", hiName: "Olá {n},", ready: "O seu roteiro de {c} está pronto. Abra-o em qualquer dispositivo:", open: "Abrir o roteiro", until: "Acesso válido até {d}.", tip: "Guarde este email: o link volta a abrir o roteiro noutro telemóvel ou computador.", help: "Precisa de ajuda? Responda a este email." },
  en: { hi: "Hello,", hiName: "Hello {n},", ready: "Your {c} route is ready. Open it on any device:", open: "Open the route", until: "Access valid until {d}.", tip: "Keep this email: the link reopens the route on another phone or computer.", help: "Need help? Just reply to this email." },
  es: { hi: "Hola:", hiName: "Hola, {n}:", ready: "Tu ruta de {c} está lista. Ábrela en cualquier dispositivo:", open: "Abrir la ruta", until: "Acceso válido hasta el {d}.", tip: "Guarda este email: el enlace vuelve a abrir la ruta en otro móvil u ordenador.", help: "¿Necesitas ayuda? Responde a este email." },
  fr: { hi: "Bonjour,", hiName: "Bonjour {n},", ready: "Votre parcours de {c} est prêt. Ouvrez-le sur n'importe quel appareil :", open: "Ouvrir le parcours", until: "Accès valable jusqu'au {d}.", tip: "Gardez cet email : le lien rouvre le parcours sur un autre téléphone ou ordinateur.", help: "Besoin d'aide ? Répondez simplement à cet email." },
  de: { hi: "Hallo,", hiName: "Hallo {n},", ready: "Ihre Route für {c} ist bereit. Öffnen Sie sie auf jedem Gerät:", open: "Route öffnen", until: "Zugang gültig bis {d}.", tip: "Bewahren Sie diese E-Mail auf: Der Link öffnet die Route auch auf einem anderen Handy oder Computer.", help: "Brauchen Sie Hilfe? Antworten Sie einfach auf diese E-Mail." },
  it: { hi: "Ciao,", hiName: "Ciao {n},", ready: "Il tuo itinerario di {c} è pronto. Aprilo su qualsiasi dispositivo:", open: "Apri l'itinerario", until: "Accesso valido fino al {d}.", tip: "Conserva questa email: il link riapre l'itinerario su un altro telefono o computer.", help: "Serve aiuto? Rispondi a questa email." },
  zh: { hi: "您好，", hiName: "{n}，您好：", ready: "您的{c}路线已准备好，可在任何设备上打开：", open: "打开路线", until: "访问有效期至 {d}。", tip: "请保存此邮件：链接可在其他手机或电脑上再次打开路线。", help: "需要帮助？直接回复此邮件即可。" },
  ar: { hi: "مرحباً،", hiName: "مرحباً {n}،", ready: "مسارك في {c} جاهز. افتحه على أي جهاز:", open: "افتح المسار", until: "الوصول صالح حتى {d}.", tip: "احتفظ بهذا البريد: الرابط يعيد فتح المسار على هاتف أو حاسوب آخر.", help: "تحتاج مساعدة؟ ردّ على هذا البريد." },
  ja: { hi: "こんにちは。", hiName: "{n} 様", ready: "{c}のルートの準備ができました。どの端末でも開けます：", open: "ルートを開く", until: "アクセス有効期限：{d}", tip: "このメールは保存してください。リンクから別のスマホやパソコンでもルートを開けます。", help: "お困りの際はこのメールに返信してください。" },
  tr: { hi: "Merhaba,", hiName: "Merhaba {n},", ready: "{c} rotanız hazır. Herhangi bir cihazda açın:", open: "Rotayı aç", until: "Erişim {d} tarihine kadar geçerli.", tip: "Bu e-postayı saklayın: bağlantı rotayı başka bir telefonda veya bilgisayarda yeniden açar.", help: "Yardım mı lazım? Bu e-postayı yanıtlamanız yeterli." },
  ru: { hi: "Здравствуйте!", hiName: "Здравствуйте, {n}!", ready: "Ваш маршрут по городу {c} готов. Откройте его на любом устройстве:", open: "Открыть маршрут", until: "Доступ действует до {d}.", tip: "Сохраните это письмо: по ссылке маршрут откроется на другом телефоне или компьютере.", help: "Нужна помощь? Просто ответьте на это письмо." },
  ko: { hi: "안녕하세요,", hiName: "{n}님, 안녕하세요.", ready: "{c} 경로가 준비됐어요. 어떤 기기에서든 열 수 있어요:", open: "경로 열기", until: "이용 기간: {d}까지.", tip: "이 이메일을 보관하세요. 링크로 다른 휴대폰이나 컴퓨터에서도 경로를 다시 열 수 있어요.", help: "도움이 필요하신가요? 이 이메일에 답장해 주세요." }
};

/** Confirmação em suporte duradouro (Diretiva 2011/83/UE, art. 8.º, n.º 7): pediu acesso imediato e perdeu a livre resolução de 14 dias. */
const WD: Partial<Record<Locale, string>> = {
  pt: "Na compra pediu acesso imediato ao roteiro e aceitou perder o direito de livre resolução de 14 dias. Se um problema técnico do nosso lado o impedir de usar o roteiro, responda a este email e devolvemos o valor.",
  en: "When you bought, you asked for immediate access to the route and accepted losing the 14-day right of withdrawal. If a technical problem on our side stops you from using the route, reply to this email and we'll refund you.",
  es: "Al comprar pediste acceso inmediato a la ruta y aceptaste perder el derecho de desistimiento de 14 días. Si un problema técnico nuestro te impide usar la ruta, responde a este email y te devolvemos el importe.",
  fr: "Lors de l'achat, vous avez demandé un accès immédiat à l'itinéraire et accepté de perdre le droit de rétractation de 14 jours. Si un problème technique de notre côté vous empêche de l'utiliser, répondez à cet e-mail et nous vous rembourserons.",
  de: "Beim Kauf haben Sie den sofortigen Zugang zur Route verlangt und auf das 14-tägige Widerrufsrecht verzichtet. Wenn ein technisches Problem auf unserer Seite die Nutzung verhindert, antworten Sie auf diese E-Mail und wir erstatten den Betrag.",
  it: "All'acquisto hai chiesto l'accesso immediato all'itinerario e accettato di perdere il diritto di recesso di 14 giorni. Se un problema tecnico da parte nostra ti impedisce di usarlo, rispondi a questa email e ti rimborsiamo.",
  zh: "购买时，您要求立即访问路线，并同意放弃14天无理由撤销权。如因我方技术问题导致无法使用路线，请回复此邮件，我们将为您退款。",
  ar: "عند الشراء طلبت الوصول الفوري إلى المسار ووافقت على التنازل عن حق الانسحاب خلال 14 يومًا. إذا منعتك مشكلة تقنية من جهتنا من استخدام المسار، فرد على هذه الرسالة وسنعيد لك المبلغ.",
  ja: "ご購入時、ルートへの即時アクセスを希望し、14日間の撤回権を放棄することに同意されました。当社側の技術的な問題でルートを利用できない場合は、このメールに返信してください。返金いたします。",
  ko: "구매 시 루트에 즉시 접근을 요청하고 14일 청약철회권을 포기하는 데 동의하셨습니다. 저희 측 기술 문제로 루트를 이용할 수 없다면 이 이메일에 회신해 주세요. 환불해 드립니다.",
  ru: "При покупке вы запросили немедленный доступ к маршруту и согласились отказаться от права на отказ от договора в течение 14 дней. Если из-за технической проблемы на нашей стороне маршрут не работает, ответьте на это письмо, и мы вернём деньги.",
  tr: "Satın alırken rotaya hemen erişim istediniz ve 14 günlük cayma hakkından vazgeçmeyi kabul ettiniz. Bizden kaynaklı teknik bir sorun rotayı kullanmanızı engellerse bu e-postayı yanıtlayın, ücreti iade edelim.",
};

/** O que foi comprado (serviço de informação) e o que não está incluído. */
const WHAT: Partial<Record<Locale, string>> = {
  pt: "Comprou o acesso digital à informação do roteiro (paragens, mapa, áudio-guia, tempos e custos estimados). Bilhetes de transporte, entradas e reservas não estão incluídos e pagam-se à parte.",
  en: "You bought digital access to the route information (stops, map, audio guide, estimated times and costs). Transport tickets, entry fees and bookings are not included and are paid separately.",
  es: "Has comprado el acceso digital a la información de la ruta (paradas, mapa, audioguía, tiempos y costes estimados). Los billetes de transporte, entradas y reservas no están incluidos y se pagan aparte.",
  fr: "Vous avez acheté l'accès numérique aux informations de l'itinéraire (étapes, carte, audioguide, temps et coûts estimés). Les billets de transport, entrées et réservations ne sont pas inclus et se paient à part.",
  de: "Sie haben digitalen Zugang zu den Routeninformationen gekauft (Stopps, Karte, Audioguide, geschätzte Zeiten und Kosten). Fahrkarten, Eintritte und Buchungen sind nicht enthalten und werden separat bezahlt.",
  it: "Hai acquistato l'accesso digitale alle informazioni dell'itinerario (tappe, mappa, audioguida, tempi e costi stimati). Biglietti dei trasporti, ingressi e prenotazioni non sono inclusi e si pagano a parte.",
  zh: "您购买的是路线信息的数字访问权限（站点、地图、语音导览、预估时间和费用）。交通票、门票和预订不包括在内，需另行支付。",
  ar: "اشتريت وصولًا رقميًا إلى معلومات المسار (المحطات والخريطة والدليل الصوتي والأوقات والتكاليف التقديرية). تذاكر المواصلات والدخول والحجوزات غير مشمولة وتُدفع بشكل منفصل.",
  ja: "ご購入いただいたのはルート情報へのデジタルアクセスです（スポット、地図、音声ガイド、目安の時間と費用）。交通チケット、入場料、予約は含まれず、別途お支払いください。",
  ko: "구매하신 것은 루트 정보에 대한 디지털 이용권입니다(정류장, 지도, 오디오 가이드, 예상 시간과 비용). 교통 승차권, 입장료, 예약은 포함되지 않으며 별도로 지불합니다.",
  ru: "Вы купили цифровой доступ к информации о маршруте (остановки, карта, аудиогид, ориентировочное время и стоимость). Билеты на транспорт, входные билеты и бронирования не включены и оплачиваются отдельно.",
  tr: "Rota bilgilerine dijital erişim satın aldınız (duraklar, harita, sesli rehber, tahmini süreler ve maliyetler). Ulaşım biletleri, giriş ücretleri ve rezervasyonlar dahil değildir ve ayrıca ödenir.",
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const f = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");

export function accessEmail(o: { locale: Locale; name?: string | null; place: string; link: string; expiresAt: Date; tz?: string; startsOnOpen?: { hours: number } }) {
  const t = TX[o.locale] ?? TX.en;
  const first = (o.name ?? "").trim().split(/\s+/)[0] ?? "";
  let when: string;
  try {
    when = new Intl.DateTimeFormat(INTL_LOCALE[o.locale], { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: o.tz ?? "UTC", timeZoneName: "short" }).format(o.expiresAt);
  } catch { when = o.expiresAt.toISOString().slice(0, 16).replace("T", " ") + " UTC"; }
  const dur = (h: number) => {
    const days = h >= 24 * 7;
    try { return new Intl.NumberFormat(INTL_LOCALE[o.locale], { style: "unit", unit: days ? "day" : "hour", unitDisplay: "long" }).format(days ? Math.round(h / 24) : h); } catch { return days ? `${Math.round(h / 24)} d` : `${h} h`; }
  };
  const validity = o.startsOnOpen ? f(START[o.locale] ?? START.en, { h: dur(o.startsOnOpen.hours), d: when }) : f(t.until, { d: when });
  const wdTxt = WD[o.locale] ?? WD.en!;
  const whatTxt = WHAT[o.locale] ?? WHAT.en!;
  const hello = first ? f(t.hiName, { n: esc(first) }) : t.hi;
  const dir = o.locale === "ar" ? "rtl" : "ltr";
  const html = `<!doctype html><html lang="${o.locale}" dir="${dir}"><body style="margin:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:20px;padding:32px">
<tr><td style="font-size:15px;font-weight:600;color:#0071e3;padding-bottom:20px">📍 VOYBU</td></tr>
<tr><td style="font-size:17px;line-height:1.5;padding-bottom:8px">${hello}</td></tr>
<tr><td style="font-size:17px;line-height:1.5;padding-bottom:24px">${f(t.ready, { c: `<b>${esc(o.place)}</b>` })}</td></tr>
<tr><td align="center" style="padding-bottom:24px"><a href="${o.link}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;font-weight:600;font-size:17px;padding:14px 32px;border-radius:999px">${t.open}</a></td></tr>
<tr><td style="font-size:15px;line-height:1.5;color:#6e6e73;padding-bottom:8px">${esc(validity)}</td></tr>
<tr><td style="font-size:15px;line-height:1.5;color:#6e6e73;padding-bottom:20px">${t.tip}</td></tr>
<tr><td style="font-size:13px;line-height:1.5;color:#86868b;padding-bottom:8px">${esc(whatTxt)}</td></tr>
<tr><td style="font-size:13px;line-height:1.5;color:#86868b;padding-bottom:16px">${esc(wdTxt)}</td></tr>
<tr><td style="font-size:12px;line-height:1.5;color:#86868b;word-break:break-all;border-top:1px solid #e5e5ea;padding-top:16px"><a href="${o.link}" style="color:#86868b">${o.link}</a><br><br>${t.help}</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${hello.replace(/<[^>]+>/g, "")}\n\n${f(t.ready, { c: o.place })}\n${o.link}\n\n${validity}\n${t.tip}\n\n${whatTxt}\n${wdTxt}\n\n${t.help}`;
  return { subject: `VOYBU — ${o.place}`, html, text };
}
