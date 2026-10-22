import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Header } from "@/components/Header";
import { requestCurrency } from "@/lib/fx";
import { db, schema } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { activateFromSession } from "@/lib/merchants";
import { env } from "@/lib/env";
import { cityName } from "@/data/cities";
import { bookKind } from "@/lib/booking";
import { loadCities } from "@/lib/content";
import { fmt } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function MerchantDone({ params, searchParams }: { params: { locale: Locale }; searchParams: { id?: string; session_id?: string } }) {
  const t = getDict(params.locale);
  if (!searchParams.id || !/^[0-9a-f-]{36}$/.test(searchParams.id)) notFound();
  const d = await db();
  let [m] = await d.select().from(schema.merchants).where(eq(schema.merchants.id, searchParams.id)).limit(1);
  if (!m) notFound();
  if (m.status === "pending" && searchParams.session_id?.startsWith("cs_")) {
    const s = await stripe().checkout.sessions.retrieve(searchParams.session_id);
    if (s.metadata?.merchantId === m.id) m = (await activateFromSession(s)) ?? m;
  }
  const city = (await loadCities({ includeInactive: true })).find((c) => c.id === m.city)!;
  const stop = city.stops.find((s) => s.id === m.stopId);
  const qrUrl = `${env.appUrl}/${city.id}?ref=${m.refCode}`;
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <div className="stack">
        <h1 style={{ fontSize: 28 }}>✓ {t.mDone}</h1>
        {m.status === "active"
          ? <p>{fmt(t.mDoneSub, { city: cityName(city, params.locale), stop: stop?.n ?? "" })}</p>
          : <p className="note">{m.plan === "basic" ? t.mReview : t.mPending}</p>}
        {m.bookMode === "request" && bookKind(m.category) && <p className="hint">{fmt(t.mDoneNext, { email: m.email })}</p>}
        <span className="label">{t.mYour}</span>
        <div className="offer" style={{ borderStyle: "solid" }}>
          {m.photoCount > 0 && <img className="mb-thumb" src={`/api/merchants/photo/${m.id}`} alt="" />}
          <div style={{ flex: 1 }}><span className="cat">{t.cats[m.category as keyof typeof t.cats]}</span><b>{m.name}</b>{m.offer}</div>
          {m.plan !== "basic" && <span className="feat">{t.featured}</span>}
        </div>
        {m.plan === "partner" && (
          <div className="card stack" style={{ gap: 8 }}>
            <p className="hint">{t.mQR}</p>
            <code style={{ wordBreak: "break-all" }}>{qrUrl}</code>
          </div>
        )}
      </div>
    </main>
  );
}
