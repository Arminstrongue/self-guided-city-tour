import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { MerchantLogin, MerchantPortal, type PortalMerchant } from "@/components/MerchantPortal";
import { cityName } from "@/data/cities";
import { stopName } from "@/data/stop-names";
import { isLocale } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";
import { loadCities } from "@/lib/content";
import { requestCurrency } from "@/lib/fx";
import { bookingsOf, currentMerchantEmail, merchantsOf, statsFor } from "@/lib/merchant-portal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return { title: `${t.mp.title} | VOYBU`, robots: { index: false } };
}

/** Área do comerciante: entrar com link no email e gerir o próprio anúncio. */
export default async function Manage({ params, searchParams }: { params: { locale: Locale }; searchParams: Record<string, string | undefined> }) {
  if (!isLocale(params.locale)) notFound();
  const t = getDict(params.locale);
  const email = currentMerchantEmail();
  let body: React.ReactNode;
  if (!email) body = <MerchantLogin locale={params.locale} expired={searchParams.expired === "1"} />;
  else {
    const [rows, cities] = await Promise.all([merchantsOf(email), loadCities({ includeInactive: true })]);
    const ids = rows.map((r) => r.id);
    const [stats, bookings] = await Promise.all([statsFor(ids), bookingsOf(ids)]);
    const merchants: PortalMerchant[] = rows.map((r) => {
      const c = cities.find((x) => x.id === r.city);
      const s = c?.stops.find((x) => x.id === r.stopId);
      return {
        id: r.id, name: r.name, category: r.category, city: r.city, cityName: c ? cityName(c, params.locale) : r.city, stopName: s ? stopName(s, params.locale) : r.stopId,
        address: r.address, offer: r.offer, hours: r.hours, phone: r.phone, bookingUrl: r.bookingUrl, instagram: r.instagram, tiktok: r.tiktok, facebook: r.facebook,
        bookMode: r.bookMode, bookOptions: r.bookOptions, plan: r.plan, status: r.status, paused: r.paused, photoCount: r.photoCount, rev: r.updatedAt ? r.updatedAt.getTime() : 0,
        billing: Boolean(r.stripeCustomerId) && r.plan !== "basic", stats: stats[r.id]
      };
    });
    body = <MerchantPortal locale={params.locale} email={email} merchants={merchants}
      bookings={bookings.map((b) => ({ id: b.id, merchantId: b.merchantId, option: b.option, dateFrom: b.dateFrom, dateTo: b.dateTo, time: b.time, people: b.people, units: b.units, name: b.name, email: b.email, phone: b.phone, note: b.note, status: b.status, createdAt: b.createdAt.toISOString() }))} />;
  }
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      {body}
    </main>
  );
}
