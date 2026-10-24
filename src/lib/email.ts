import { env } from "./env";

/** Envia email transacional via Resend, se configurado. Devolve true se foi enviado. */
export async function sendEmail(to: string, subject: string, html: string, text?: string, replyTo?: string): Promise<boolean> {
  if (!env.resendKey) { console.info(`[email desativado] ${to}: ${subject}`); return false; }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.emailFrom, to, subject, html, ...(text ? { text } : {}), ...(replyTo || env.replyTo ? { reply_to: replyTo || env.replyTo } : {}) })
  });
  if (!res.ok) console.error("Falha no envio de email", res.status, await res.text());
  return res.ok;
}
export const emailEnabled = () => Boolean(env.resendKey);

/** Cabeçalho da marca nos emails: símbolo Route V (imagem do site) + VOYBU em azul-marinho. */
export function emailBrand(size = 15): string {
  return `<img src="${env.appUrl}/icon-192.png" width="28" height="28" alt="" style="vertical-align:middle;border:0;margin-right:6px"><span style="vertical-align:middle;font-size:${size + 3}px;font-weight:800;letter-spacing:.04em;color:#102A43">VOYBU</span>`;
}
