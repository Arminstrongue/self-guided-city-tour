/** Leitura central das variáveis de ambiente (só no servidor). */
// O domínio vem só de APP_URL: mudar de domínio = mudar o .env (APP_URL, DOMAIN) e reiniciar.
const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "").replace(/^http:\/\/(?!localhost|127\.0\.0\.1)/, "https://");
const host = new URL(appUrl).host;
const contact = process.env.COMPANY_EMAIL ?? `hello@${host.replace(/:\d+$/, "")}`;
export const BRAND = process.env.BRAND_NAME ?? "VOYBU";
export const env = {
  appUrl, host, contact,
  /** User-Agent educado para Wikipedia/Wikimedia/Overpass (pedem contacto). */
  ua: `${BRAND.replace(/\s+/g, "")}/1.0 (${appUrl}; ${contact})`,
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me",
  stripeKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  resendKey: process.env.RESEND_API_KEY ?? "",
  replyTo: process.env.EMAIL_REPLY_TO ?? process.env.COMPANY_EMAIL ?? "",
  emailFrom: process.env.EMAIL_FROM ?? `${BRAND} <${contact}>`,
  vapidPublic: process.env.VAPID_PUBLIC_KEY ?? "",
  vapidPrivate: process.env.VAPID_PRIVATE_KEY ?? "",
  vapidSubject: process.env.VAPID_SUBJECT ?? `mailto:${contact}`,
  mediaDir: process.env.MEDIA_DIR ?? "./.data/media",
  adminEmails: (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
};
export const isProd = process.env.NODE_ENV === "production";
