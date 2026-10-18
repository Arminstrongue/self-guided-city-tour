import { env } from "./env";

/** Envia email transacional via Resend, se configurado. Devolve true se foi enviado. */
export async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
  if (!env.resendKey) { console.info(`[email desativado] ${to}: ${subject}`); return false; }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.emailFrom, to, subject, html, ...(text ? { text } : {}), ...(env.replyTo ? { reply_to: env.replyTo } : {}) })
  });
  if (!res.ok) console.error("Falha no envio de email", res.status, await res.text());
  return res.ok;
}
export const emailEnabled = () => Boolean(env.resendKey);
