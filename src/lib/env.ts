/** Leitura central das variáveis de ambiente (só no servidor). */
// O domínio vem só de APP_URL: mudar de domínio = mudar o .env (APP_URL, DOMAIN) e reiniciar.
const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "").replace(/^http:\/\/(?!localhost|127\.0\.0\.1)/, "https://");
const host = new URL(appUrl).host;
const contact = process.env.COMPANY_EMAIL ?? `hello@${host.replace(/:\d+$/, "")}`;
/**
 * Chave que assina todas as sessões (viajante, admin, guias, parceiros). Em produção é obrigatória e longa:
 * sem ela, qualquer pessoa conseguiria forjar uma sessão de administrador. A app recusa arrancar.
 */
function secretOf(): string {
  const s = process.env.NEXTAUTH_SECRET ?? "";
  const building = process.env.NEXT_PHASE === "phase-production-build";
  // Só no servidor: no navegador as variáveis secretas nunca existem (e não devem existir).
  const server = typeof window === "undefined";
  if (server && process.env.NODE_ENV === "production" && !building && s.length < 32) {
    throw new Error("NEXTAUTH_SECRET em falta ou curta (mínimo 32 caracteres). Gere com: openssl rand -base64 48");
  }
  return s || "dev-secret-change-me";
}
export const BRAND = process.env.BRAND_NAME ?? "VOYBU";
export const env = {
  appUrl, host, contact,
  /** User-Agent educado para Wikipedia/Wikimedia/Overpass (pedem contacto). */
  ua: `${BRAND.replace(/\s+/g, "")}/1.0 (${appUrl}; ${contact})`,
  secret: secretOf(),
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
