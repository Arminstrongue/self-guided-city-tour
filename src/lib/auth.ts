import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import FacebookProvider from "next-auth/providers/facebook";
import { db, schema } from "./db";
import { cookies } from "next/headers";
import { env } from "./env";
import { readPurposeToken } from "./access-token";
import { sessionsAfter } from "./session-revoke";
import { createPrivateKey, sign } from "node:crypto";

/**
 * Segredo do "Entrar com a Apple": a Apple pede um JWT assinado com a chave .p8 que expira (máx. 6 meses).
 * Em vez de o gerar à mão de 6 em 6 meses, gera-se aqui a partir de APPLE_TEAM_ID + APPLE_KEY_ID + APPLE_PRIVATE_KEY
 * e renova-se sozinho. (APPLE_SECRET fixo continua a funcionar, se preferir.)
 */
let appleCache: { jwt: string; exp: number } | null = null;
export function appleSecret(now = Date.now()): string {
  if (process.env.APPLE_SECRET) return process.env.APPLE_SECRET;
  if (appleCache && appleCache.exp - now > 30 * 86400_000) return appleCache.jwt;
  const team = process.env.APPLE_TEAM_ID ?? "", kid = process.env.APPLE_KEY_ID ?? "", raw = process.env.APPLE_PRIVATE_KEY ?? "";
  // A chave pode vir com "\n" literais (uma linha no .env) ou em base64.
  const pem = raw.includes("BEGIN") ? raw.replace(/\\n/g, "\n") : Buffer.from(raw, "base64").toString("utf8");
  const b64 = (o: object | Buffer) => (Buffer.isBuffer(o) ? o : Buffer.from(JSON.stringify(o))).toString("base64url");
  const iat = Math.floor(now / 1000), exp = iat + 150 * 86400;
  const head = `${b64({ alg: "ES256", kid })}.${b64({ iss: team, iat, exp, aud: "https://appleid.apple.com", sub: process.env.APPLE_ID })}`;
  const sig = sign("sha256", Buffer.from(head), { key: createPrivateKey(pem), dsaEncoding: "ieee-p1363" });
  appleCache = { jwt: `${head}.${b64(sig)}`, exp: exp * 1000 };
  return appleCache.jwt;
}
const appleReady = () => Boolean(process.env.APPLE_ID && (process.env.APPLE_SECRET || (process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY)));

export const ADMIN_COOKIE = "sgct_admin";
export const isAdminEmail = (e: string | null | undefined) => Boolean(e && env.adminEmails.includes(e.toLowerCase()));

/** Só ativa os fornecedores com credenciais definidas. */
function providers() {
  const list = [];
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    list.push(GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }));
  if (appleReady()) {
    // getter: o NextAuth lê o segredo em cada pedido, por isso a renovação automática chega sem reiniciar.
    const opts = { clientId: process.env.APPLE_ID as string } as { clientId: string; clientSecret: string };
    Object.defineProperty(opts, "clientSecret", { get: () => appleSecret(), enumerable: true });
    list.push(AppleProvider(opts));
  }
  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET)
    list.push(FacebookProvider({ clientId: process.env.FACEBOOK_CLIENT_ID, clientSecret: process.env.FACEBOOK_CLIENT_SECRET }));
  return list;
}

export const authOptions: NextAuthOptions = {
  providers: providers(),
  session: { strategy: "jwt" },
  // A Apple devolve o login com um POST vindo de appleid.apple.com: os cookies de verificação (state/PKCE/nonce)
  // têm de ser SameSite=None para chegarem nesse pedido. Só em produção (https).
  ...(process.env.NODE_ENV === "production" ? { cookies: Object.fromEntries((["state", "pkceCodeVerifier", "nonce"] as const).map((k) => [k, {
    name: `__Secure-next-auth.${k === "pkceCodeVerifier" ? "pkce.code_verifier" : k}`,
    options: { httpOnly: true, sameSite: "none" as const, path: "/", secure: true, maxAge: 900 }
  }])) } : {}),
  secret: env.secret,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      const d = await db();
      await d.insert(schema.users).values({ email: user.email.toLowerCase(), name: user.name ?? null, provider: account?.provider ?? null })
        .onConflictDoUpdate({ target: schema.users.email, set: { name: user.name ?? undefined, provider: account?.provider ?? undefined } });
      return true;
    },
    // Sessões Google/Apple/Facebook também obedecem a "terminar sessão em todos os dispositivos" e a apagar a conta.
    // A hora de entrada (authAt) fica fixa: o NextAuth renova o token a cada pedido, por isso o "iat" não serve.
    // Sessão revogada → erro aqui: o NextAuth apaga o cookie e a sessão deixa de existir de vez.
    async jwt({ token, user }) {
      if (user) token.authAt = Math.floor(Date.now() / 1000);
      const email = typeof token.email === "string" ? token.email.toLowerCase() : null;
      const at = typeof token.authAt === "number" ? token.authAt : typeof token.iat === "number" ? token.iat : 0;
      if (email && at < (await sessionsAfter(email))) throw new Error("session_revoked");
      return token;
    },
    async session({ session, token }) {
      const email = session.user?.email?.toLowerCase();
      const at = typeof token.authAt === "number" ? token.authAt : typeof token.iat === "number" ? token.iat : 0;
      if (email && at < (await sessionsAfter(email))) return { expires: session.expires } as typeof session;
      return session;
    }
  }
};

export function enabledProviders(): { id: string; name: string }[] {
  return authOptions.providers.map((p) => ({ id: p.id, name: p.name }));
}

export async function sessionEmail(): Promise<string | null> {
  const s = await getServerSession(authOptions);
  return s?.user?.email?.toLowerCase() ?? null;
}

/** Só em desenvolvimento local: DEV_ADMIN=1 abre o painel sem login social. Ignorado em produção. */
const devAdmin = () => process.env.NODE_ENV === "development" && process.env.DEV_ADMIN === "1";

export async function isAdmin(): Promise<boolean> {
  if (devAdmin()) return true;
  // Entrada por link no email (sem depender de Google/Apple): cookie assinado e email ainda na lista ADMIN_EMAILS.
  if (isAdminEmail(readPurposeToken(cookies().get(ADMIN_COOKIE)?.value, "admin"))) return true;
  const email = await sessionEmail().catch(() => null);
  return isAdminEmail(email);
}
