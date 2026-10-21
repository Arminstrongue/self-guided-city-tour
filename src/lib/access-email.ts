/** Email de acesso ao roteiro, na língua do cliente (12 línguas), com botão e texto simples. */
import { INTL_LOCALE } from "@/i18n/core";
import type { Locale } from "@/i18n/dictionaries";

type T = { hi: string; hiName: string; ready: string; open: string; until: string; tip: string; help: string };
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

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const f = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");

export function accessEmail(o: { locale: Locale; name?: string | null; place: string; link: string; expiresAt: Date; tz?: string }) {
  const t = TX[o.locale] ?? TX.en;
  const first = (o.name ?? "").trim().split(/\s+/)[0] ?? "";
  let when: string;
  try {
    when = new Intl.DateTimeFormat(INTL_LOCALE[o.locale], { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: o.tz ?? "UTC", timeZoneName: "short" }).format(o.expiresAt);
  } catch { when = o.expiresAt.toISOString().slice(0, 16).replace("T", " ") + " UTC"; }
  const hello = first ? f(t.hiName, { n: esc(first) }) : t.hi;
  const dir = o.locale === "ar" ? "rtl" : "ltr";
  const html = `<!doctype html><html lang="${o.locale}" dir="${dir}"><body style="margin:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:20px;padding:32px">
<tr><td style="font-size:15px;font-weight:600;color:#0071e3;padding-bottom:20px">📍 HelloTravell</td></tr>
<tr><td style="font-size:17px;line-height:1.5;padding-bottom:8px">${hello}</td></tr>
<tr><td style="font-size:17px;line-height:1.5;padding-bottom:24px">${f(t.ready, { c: `<b>${esc(o.place)}</b>` })}</td></tr>
<tr><td align="center" style="padding-bottom:24px"><a href="${o.link}" style="display:inline-block;background:#0071e3;color:#fff;text-decoration:none;font-weight:600;font-size:17px;padding:14px 32px;border-radius:999px">${t.open}</a></td></tr>
<tr><td style="font-size:15px;line-height:1.5;color:#6e6e73;padding-bottom:8px">${f(t.until, { d: esc(when) })}</td></tr>
<tr><td style="font-size:15px;line-height:1.5;color:#6e6e73;padding-bottom:20px">${t.tip}</td></tr>
<tr><td style="font-size:12px;line-height:1.5;color:#86868b;word-break:break-all;border-top:1px solid #e5e5ea;padding-top:16px"><a href="${o.link}" style="color:#86868b">${o.link}</a><br><br>${t.help}</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${hello.replace(/<[^>]+>/g, "")}\n\n${f(t.ready, { c: o.place })}\n${o.link}\n\n${f(t.until, { d: when })}\n${t.tip}\n\n${t.help}`;
  return { subject: `HelloTravell — ${o.place}`, html, text };
}
