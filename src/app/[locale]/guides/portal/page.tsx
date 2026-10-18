import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { GuideForm, PayoutsButton, RespondButtons } from "@/components/Guides";
import { GuideAvatar, GuideStars } from "@/components/GuideCard";
import { requestCurrency } from "@/lib/fx";
import { loadCities, loadCity } from "@/lib/content";
import { cityName } from "@/data/cities";
import { currentGuide, expireStale, guideBookings, syncPayouts } from "@/lib/guides";
import { fmtEur, fmtWhen } from "@/lib/guide-emails";
import { GUIDE_FEE } from "@/lib/pricing";
import { fmt, getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function GuidePortal({ params }: { params: { locale: Locale } }) {
  let g = await currentGuide();
  if (!g) redirect(`/${params.locale}/guides/join`);
  const t = getDict(params.locale);
  if (g.stripeAccountId && !g.payoutsReady) { const ready = await syncPayouts(g); g = { ...g, payoutsReady: ready }; }
  await expireStale().catch(() => 0);
  const all = await guideBookings(g.id);
  const city = await loadCity(g.city);
  const tz = city?.tz;
  const cities = (await loadCities()).map((c) => ({ id: c.id, name: cityName(c, params.locale) })).sort((a, b) => a.name.localeCompare(b.name));
  const now = Date.now();
  const requests = all.filter((b) => b.status === "requested");
  const upcoming = all.filter((b) => b.status === "confirmed" && b.startAt.getTime() + b.hours * 3600_000 > now);
  const past = all.filter((b) => !requests.includes(b) && !upcoming.includes(b)).reverse().slice(0, 30);
  const visible = g.status === "active" && g.payoutsReady;
  const net = (c: number) => fmtEur(Math.round(c * (1 - GUIDE_FEE)), params.locale);
  const row = (b: (typeof all)[number]) => (
    <div key={b.id} className="card bk">
      <div className="row-between"><b>{b.name}</b><span className="chip">{t.gpBs[b.status as keyof typeof t.gpBs] ?? b.status}</span></div>
      <span>{fmtWhen(b.startAt, params.locale, tz)} · {b.hours} h · {b.people} 👤</span>
      <span className="hint">{fmt(t.gpYouGet, { a: net(b.amountCents) })}{b.status === "confirmed" ? ` · ${b.email}${b.phone ? ` · ${b.phone}` : ""}` : ""}</span>
      {b.note && <p className="hint">“{b.note}”</p>}
      {b.status === "requested" && b.respondBy && <><span className="bad-txt" style={{ fontSize: 14 }}>{fmt(t.gpReplyBy, { d: fmtWhen(b.respondBy, params.locale, tz) })}</span><RespondButtons t={t} id={b.id} /></>}
    </div>
  );
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <div className="stack">
        <div className="row-between"><h1 style={{ fontSize: 28 }}>{t.gpTitle}</h1>
          <form action={`/api/guides/logout?locale=${params.locale}`} method="post"><button className="link-btn">{t.gpLogout}</button></form></div>
        <div className="g-hero"><GuideAvatar g={g} size={64} /><div className="stack" style={{ gap: 4 }}><b style={{ fontSize: 20 }}>{g.name}</b><GuideStars g={g} t={t} /></div></div>
        <div className="card stack" style={{ gap: 10, padding: 16 }}>
          <span><b>{g.status === "active" ? "✓ " : "⏳ "}{t.gpStatus[g.status]}</b></span>
          <span>{g.payoutsReady ? `✓ ${t.gpPayDone}` : t.gpPayHint}</span>
          <PayoutsButton t={t} locale={params.locale} ready={g.payoutsReady} />
          <span className="hint">{visible ? t.gpVisible : t.gpHidden}</span>
          {visible && <Link className="mini" href={`/${params.locale}/g/${g.id}`}>{t.gpView} →</Link>}
        </div>
        <h2 style={{ fontSize: 20 }}>{t.gpRequests}</h2>
        {requests.length ? requests.map(row) : <p className="hint">{t.gpNone}</p>}
        {upcoming.length > 0 && <><h2 style={{ fontSize: 20 }}>{t.gpUpcoming}</h2>{upcoming.map(row)}</>}
        {past.length > 0 && <><h2 style={{ fontSize: 20 }}>{t.gpPast}</h2>{past.map(row)}</>}
        <details className="card" style={{ padding: 16 }}><summary><b>{t.gpEdit}</b></summary>
          <div style={{ marginTop: 12 }}><GuideForm t={t} locale={params.locale} cities={cities} mode="edit"
            initial={{ name: g.name, phone: g.phone ?? "", city: g.city, languages: g.languages, bio: g.bio, hourly: String(g.hourlyCents / 100), maxPeople: String(g.maxPeople), meetingPoint: g.meetingPoint ?? "", licenseNo: g.licenseNo ?? "", photo: g.photo }} /></div>
        </details>
      </div>
    </main>
  );
}
