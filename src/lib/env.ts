/** Leitura central das variáveis de ambiente (só no servidor). */
export const env = {
  appUrl: (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me",
  stripeKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  resendKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "Self Guided City Tour <hello@selfguidedcitytour.com>",
  adminEmails: (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
};
export const isProd = process.env.NODE_ENV === "production";
