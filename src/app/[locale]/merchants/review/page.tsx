import { Header } from "@/components/Header";
import { MerchantReviewForm } from "@/components/MerchantReviews";
import { requestCurrency } from "@/lib/fx";
import { reviewableBooking } from "@/lib/merchant-reviews";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function MerchantReview(props: { params: Promise<{ locale: Locale }>; searchParams: Promise<{ b?: string; t?: string }> }) {
  const sp = await props.searchParams;
  const params = await props.params;
  const t = getDict(params.locale);
  const r = sp.b && sp.t ? await reviewableBooking(sp.b, sp.t) : null;
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <div className="stack" style={{ paddingTop: 12 }}>
        {!r || !r.confirmed ? <p className="card" style={{ padding: 16 }}>{t.mr.invalid}</p>
          : r.review ? <p className="card" style={{ padding: 16 }}>✓ {t.mr.thanks}</p>
          : !r.started ? <p className="card" style={{ padding: 16 }}>{t.mr.early}</p>
          : <MerchantReviewForm t={t} bookingId={r.booking.id} token={sp.t!} merchant={r.merchant.name} />}
      </div>
    </main>
  );
}
