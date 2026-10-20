import { createHmac, timingSafeEqual } from "node:crypto";
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
