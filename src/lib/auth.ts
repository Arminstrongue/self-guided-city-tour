import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import FacebookProvider from "next-auth/providers/facebook";
import { db, schema } from "./db";
import { env } from "./env";

/** Só ativa os fornecedores com credenciais definidas. */
function providers() {
  const list = [];
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    list.push(GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }));
  if (process.env.APPLE_ID && process.env.APPLE_SECRET)
    list.push(AppleProvider({ clientId: process.env.APPLE_ID, clientSecret: process.env.APPLE_SECRET }));
  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET)
    list.push(FacebookProvider({ clientId: process.env.FACEBOOK_CLIENT_ID, clientSecret: process.env.FACEBOOK_CLIENT_SECRET }));
  return list;
}

export const authOptions: NextAuthOptions = {
  providers: providers(),
  session: { strategy: "jwt" },
  secret: env.secret,
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      const d = await db();
      await d.insert(schema.users).values({ email: user.email.toLowerCase(), name: user.name ?? null, provider: account?.provider ?? null })
        .onConflictDoUpdate({ target: schema.users.email, set: { name: user.name ?? undefined, provider: account?.provider ?? undefined } });
      return true;
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

export async function isAdmin(): Promise<boolean> {
  const email = await sessionEmail();
  return Boolean(email && env.adminEmails.includes(email));
}
