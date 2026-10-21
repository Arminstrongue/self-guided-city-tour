/** Leitura central das variáveis de ambiente (só no servidor). */
export const env = {
  // Em produção força https (os links nos emails não devem sair em http).
  appUrl: (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "").replace(/^http:\/\/(?!localhost|127\.0\.0\.1)/, "https://"),
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me",
  stripeKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  resendKey: process.env.RESEND_API_KEY ?? "",
  replyTo: process.env.EMAIL_REPLY_TO ?? process.env.COMPANY_EMAIL ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "HelloTravell <hello@hellotravell.com>",
  vapidPublic: process.env.VAPID_PUBLIC_KEY ?? "",
  vapidPrivate: process.env.VAPID_PRIVATE_KEY ?? "",
  vapidSubject: process.env.VAPID_SUBJECT ?? "mailto:hello@hellotravell.com",
  mediaDir: process.env.MEDIA_DIR ?? "./.data/media",
  adminEmails: (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
};
export const isProd = process.env.NODE_ENV === "production";
