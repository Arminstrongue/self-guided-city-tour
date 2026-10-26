import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { env } from "./env";

/** Token assinado (HMAC-SHA256) com o email do viajante. Usado no cookie e no link do email. */
export const ACCESS_COOKIE = "sgct_access";
export const ACCESS_TTL_S = 31 * 24 * 3600;

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const sign = (data: string) => createHmac("sha256", env.secret).update(data).digest("base64url");

export function createAccessToken(email: string, ttlS = ACCESS_TTL_S): string {
  const now = Math.floor(Date.now() / 1000);
  const body = b64(JSON.stringify({ e: email.toLowerCase(), x: now + ttlS, i: now }));
  return `${body}.${sign(body)}`;
}

/** Token com finalidade (ex.: "agent"): um token de viajante nunca serve para outra área e vice-versa. */
export function createPurposeToken(email: string, purpose: string, ttlS = ACCESS_TTL_S): string {
  const body = b64(JSON.stringify({ e: email.toLowerCase(), p: purpose, x: Math.floor(Date.now() / 1000) + ttlS }));
  return `${body}.${sign(body)}`;
}
export function readPurposeToken(token: string | undefined | null, purpose: string): string | null {
  const r = verify(token);
  return r && r.p === purpose ? r.e : null;
}

function verify(token: string | undefined | null): { e: string; p?: string; i: number } | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { e, p, x, i } = JSON.parse(Buffer.from(body, "base64url").toString()) as { e: string; p?: string; x: number; i?: number };
    if (typeof e !== "string" || x < Date.now() / 1000) return null;
    return { e, p, i: i ?? 0 };
  } catch { return null; }
}

export function readAccessToken(token: string | undefined | null): string | null {
  const r = verify(token);
  return r && !r.p ? r.e : null;
}

/** Email e data de emissão (segundos) do token de sessão — para "terminar sessão em todos os dispositivos". */
export function readAccessTokenFull(token: string | undefined | null): { email: string; iat: number } | null {
  const r = verify(token);
  return r && !r.p ? { email: r.e, iat: r.i } : null;
}

/**
 * Código de 6 dígitos para entrar no mesmo navegador onde se pediu (o link do email abre muitas vezes noutro navegador,
 * por exemplo no navegador interno do Gmail). Sem estado: o pedido devolve um "desafio" assinado com o email e um HMAC do código.
 */
export const CODE_TTL_S = 30 * 60;
const codeTag = (email: string, code: string) => `otp:${createHmac("sha256", env.secret).update(`otp|${email.toLowerCase()}|${code}`).digest("base64url").slice(0, 22)}`;
export function createSignInCode(email: string): { code: string; challenge: string } {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  return { code, challenge: createPurposeToken(email, codeTag(email, code), CODE_TTL_S) };
}
/** Email do desafio se o código estiver certo e dentro do prazo; senão null. */
export function checkSignInCode(challenge: string, code: string): string | null {
  const clean = code.replace(/\D/g, "");
  if (clean.length !== 6) return null;
  const [body] = challenge.split(".");
  let email = "";
  try { email = String((JSON.parse(Buffer.from(body ?? "", "base64url").toString()) as { e?: string }).e ?? ""); } catch { return null; }
  return email ? readPurposeToken(challenge, codeTag(email, clean)) : null;
}
/** Email do desafio (sem validar o código, mas com a assinatura verificada) — para limitar tentativas por email.
 *  Um desafio forjado com o email de outra pessoa não conta, por isso não serve para lhe bloquear a entrada. */
export function challengeEmail(challenge: string): string | null {
  const r = verify(challenge);
  return r && r.p?.startsWith("otp:") ? r.e : null;
}
