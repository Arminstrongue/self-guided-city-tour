import { Header } from "@/components/Header";
import { InviteLanding } from "@/components/Invite";
import { requestCurrency } from "@/lib/fx";
import { profileByHandle, counts } from "@/lib/social";
import { currentTraveller } from "@/lib/wallet";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: Locale; handle: string } }) {
  const p = await profileByHandle(params.handle);
  const t = getDict(params.locale);
  return { title: p ? `${p.name} — ${t.ivJoinTitle}` : "VOYBU", robots: { index: false } };
}

/** Página de boas-vindas de um convite: quem convidou + entrar com email. */
export default async function InvitePage({ params }: { params: { locale: Locale; handle: string } }) {
  const t = getDict(params.locale);
  const p = await profileByHandle(params.handle);
  const me = await currentTraveller();
  const inviter = p ? { handle: p.handle, name: p.name, photo: p.photo, bio: p.bio, isPrivate: p.isPrivate, followers: (await counts(p.email)).followers } : null;
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <InviteLanding locale={params.locale} inviter={inviter} signed={Boolean(me)} />
    </main>
  );
}
