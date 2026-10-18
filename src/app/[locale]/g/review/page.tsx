import { Header } from "@/components/Header";
import { GuideReviewForm } from "@/components/Guides";
import { requestCurrency } from "@/lib/fx";
import { reviewableBooking } from "@/lib/guides";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function GuideReview({ params, searchParams }: { params: { locale: Locale }; searchParams: { b?: string; t?: string } }) {
  const t = getDict(params.locale);
  const r = searchParams.b && searchParams.t ? await reviewableBooking(searchParams.b, searchParams.t) : null;
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <div className="stack" style={{ paddingTop: 12 }}>
        {!r || !r.confirmed ? <p className="card" style={{ padding: 16 }}>{t.gdRateInvalid}</p>
          : r.review ? <p className="card" style={{ padding: 16 }}>✓ {t.gdRateThanks}</p>
          : !r.started ? <p className="card" style={{ padding: 16 }}>{t.gdRateEarly}</p>
          : <GuideReviewForm t={t} bookingId={r.booking.id} token={searchParams.t!} guide={r.guide.name} />}
      </div>
    </main>
  );
}
