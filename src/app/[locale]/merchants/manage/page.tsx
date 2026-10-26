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
import { reviewsOf } from "@/lib/merchant-reviews";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return { title: `${t.mp.title} | VOYBU`, robots: { index: false } };
}

/** Área do comerciante: entrar com link no email e gerir o próprio anúncio. */
export default async function Manage(
  props: { params: Promise<{ locale: Locale }>; searchParams: Promise<Record<string, string | undefined>> }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const email = await currentMerchantEmail();
  let body: React.ReactNode;
  if (!email) body = <MerchantLogin locale={params.locale} expired={searchParams.expired === "1"} />;
  else {
    const [rows, cities] = await Promise.all([merchantsOf(email), loadCities({ includeInactive: true })]);
    const ids = rows.map((r) => r.id);
    const [stats, bookings, revs] = await Promise.all([statsFor(ids), bookingsOf(ids), Promise.all(ids.map((id) => reviewsOf(id, 10)))]);
    const merchants: PortalMerchant[] = rows.map((r) => {
      const c = cities.find((x) => x.id === r.city);
      const s = c?.stops.find((x) => x.id === r.stopId);
      return {
        id: r.id, name: r.name, category: r.category, city: r.city, cityName: c ? cityName(c, params.locale) : r.city, stopName: s ? stopName(s, params.locale) : r.stopId,
        address: r.address, offer: r.offer, hours: r.hours, phone: r.phone, bookingUrl: r.bookingUrl, instagram: r.instagram, tiktok: r.tiktok, facebook: r.facebook,
        bookMode: r.bookMode, bookOptions: r.bookOptions, plan: r.plan, status: r.status, paused: r.paused, promo: r.promo ?? null, languages: r.languages, payments: r.payments, rating: r.ratingCount ? Math.round((r.ratingSum / r.ratingCount) * 10) / 10 : null, ratingCount: r.ratingCount,
        reviews: (revs[ids.indexOf(r.id)] ?? []).map((v) => ({ ...v, at: v.at.toISOString() })), photoCount: r.photoCount, rev: r.updatedAt ? r.updatedAt.getTime() : 0,
        billing: Boolean(r.stripeCustomerId) && r.plan !== "basic", stats: stats[r.id]
      };
    });
    body = <MerchantPortal locale={params.locale} email={email} merchants={merchants}
      bookings={bookings.map((b) => ({ id: b.id, merchantId: b.merchantId, option: b.option, dateFrom: b.dateFrom, dateTo: b.dateTo, time: b.time, people: b.people, units: b.units, name: b.name, email: b.email, phone: b.phone, note: b.note, status: b.status, createdAt: b.createdAt.toISOString() }))} />;
  }
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      {body}
    </main>
  );
}
