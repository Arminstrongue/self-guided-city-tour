import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";

/** Token assinado (HMAC-SHA256) com o email do viajante. Usado no cookie e no link do email. */
export const ACCESS_COOKIE = "sgct_access";
export const ACCESS_TTL_S = 31 * 24 * 3600;

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const sign = (data: string) => createHmac("sha256", env.secret).update(data).digest("base64url");

export function createAccessToken(email: string, ttlS = ACCESS_TTL_S): string {
  const body = b64(JSON.stringify({ e: email.toLowerCase(), x: Math.floor(Date.now() / 1000) + ttlS }));
  return `${body}.${sign(body)}`;
}

export function readAccessToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { e, x } = JSON.parse(Buffer.from(body, "base64url").toString()) as { e: string; x: number };
    if (typeof e !== "string" || x < Date.now() / 1000) return null;
    return e;
  } catch { return null; }
}
