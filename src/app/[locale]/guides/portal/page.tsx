import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { GuideForm, PayoutsButton, RespondButtons, ShareProfile } from "@/components/Guides";
import { GuideAvatar, eurH, langNames } from "@/components/GuideCard";
import { requestCurrency } from "@/lib/fx";
import { loadCities, loadCity } from "@/lib/content";
import { cityName } from "@/data/cities";
import { currentGuide, expireStale, guideBookings, syncPayouts } from "@/lib/guides";
import { fmtEur, fmtWhen } from "@/lib/guide-emails";
import { env } from "@/lib/env";
import { missingLegal } from "@/lib/guide-input";
import { GUIDE_FEE } from "@/lib/pricing";
import { fmt } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function GuidePortal({ params }: { params: { locale: Locale } }) {
  let g = await currentGuide();
  if (!g) redirect(`/${params.locale}/guides/join`);
  const L = params.locale;
  const t = getDict(L);
  if (g.stripeAccountId && !g.payoutsReady) { const ready = await syncPayouts(g); g = { ...g, payoutsReady: ready }; }
  await expireStale().catch(() => 0);
  const all = await guideBookings(g.id);
  const city = await loadCity(g.city);
  const tz = city?.tz;
  const cities = (await loadCities()).map((c) => ({ id: c.id, name: cityName(c, L) })).sort((a, b) => a.name.localeCompare(b.name));
  const now = Date.now();
  const ends = (b: (typeof all)[number]) => b.startAt.getTime() + b.hours * 3600_000;
  const requests = all.filter((b) => b.status === "requested");
  const upcoming = all.filter((b) => b.status === "confirmed" && ends(b) > now);
  const done = all.filter((b) => (b.status === "confirmed" && ends(b) <= now) || b.status === "completed");
  const past = all.filter((b) => !requests.includes(b) && !upcoming.includes(b)).reverse().slice(0, 30);
  const approved = g.status === "active";
  const visible = approved && g.payoutsReady;
  const netC = (c: number) => Math.round(c * (1 - GUIDE_FEE));
  const net = (c: number) => fmtEur(netC(c), L);
  const sumNet = (xs: typeof all) => fmtEur(xs.reduce((a, b) => a + netC(b.amountCents), 0), L);
  const profileUrl = `${env.appUrl}/${L}/g/${g.id}`;

  // Perfil completo: o que mais pesa na conversão de um guia.
  const tips = [
    { ok: Boolean(g.photo), txt: t.gpTipPhoto },
    { ok: g.bio.trim().length >= 150, txt: t.gpTipBio },
    { ok: g.languages.length >= 2, txt: t.gpTipLangs },
    { ok: Boolean(g.meetingPoint?.trim()), txt: t.gpTipMeet },
    { ok: Boolean(g.licenseNo?.trim()), txt: t.gpTipLicense }
  ];
  const pct = Math.round((100 * (tips.filter((x) => x.ok).length + 1)) / (tips.length + 1));
  const steps = [true, approved, g.payoutsReady, visible];
  const current = steps.findIndex((s) => !s);
  const blocked = g.status === "suspended" || g.status === "rejected";
  const legalMissing = missingLegal(g).length > 0 || !g.independentAt;

  const row = (b: (typeof all)[number]) => (
    <div key={b.id} className={`card bk${b.status === "requested" ? " bk-hot" : ""}`}>
      <div className="row-between"><b style={{ fontSize: 17 }}>{b.name}</b><span className={`chip st-${b.status}`}>{t.gpBs[b.status as keyof typeof t.gpBs] ?? b.status}</span></div>
      <span className="bk-when">📅 {fmtWhen(b.startAt, L, tz)} · {b.hours} h · {b.people} 👤</span>
      <span className="row-between"><span className="hint">{b.status === "confirmed" ? `${b.email}${b.phone ? ` · ${b.phone}` : ""}` : ""}</span><b className="bk-net">{net(b.amountCents)}</b></span>
      {b.note && <p className="hint bk-note">“{b.note}”</p>}
      {b.status === "requested" && b.respondBy && <><span className="bad-txt" style={{ fontSize: 14 }}>⏱ {fmt(t.gpReplyBy, { d: fmtWhen(b.respondBy, L, tz) })}</span><RespondButtons id={b.id} /></>}
    </div>
  );

  return (
    <main className="app">
      <Header locale={L} currency={requestCurrency()} />
      <div className="stack" style={{ gap: 18 }}>
        <section className="gp-hero">
          <div className="gp-hero-top">
            <span className="label gp-eyebrow">{t.gpTitle}</span>
            <form action={`/api/guides/logout?locale=${L}`} method="post"><button className="gp-out">{t.gpLogout}</button></form>
          </div>
          <div className="gp-id">
            <span className="gp-ring"><GuideAvatar g={g} size={76} /></span>
            <div className="stack" style={{ gap: 4, minWidth: 0 }}>
              <h1 className="gp-name">{fmt(t.gpHello, { n: g.name.split(" ")[0] })}</h1>
              <span className="gp-meta">📍 {city ? cityName(city, L) : g.city} · {fmt(t.gdPerH, { p: eurH(g.hourlyCents, L) })}</span>
              <span className="gp-meta">🗣 {langNames(g.languages, L).join(" · ")}</span>
            </div>
          </div>
          <div className="gp-status">
            <span className={`gp-pill ${approved ? "ok" : blocked ? "bad" : "wait"}`}>{approved ? "✓ " : blocked ? "✕ " : "⏳ "}{t.gpStatus[g.status]}</span>
            <span className={`gp-pill ${g.payoutsReady ? "ok" : "wait"}`}>{g.payoutsReady ? `✓ ${t.gpPayDone}` : t.gpPay}</span>
          </div>
          {visible && <div className="grid2"><Link className="btn gp-light press" href={`/${L}/g/${g.id}`}>{t.gpView}</Link><ShareProfile url={profileUrl} title={g.name} /></div>}
        </section>

        {legalMissing && (
          <section className="card gp-legal">
            <b>⚠️ {t.gpLegalTitle}</b>
            <span className="hint">{t.gpLegalSub}</span>
          </section>
        )}

        {!visible && !blocked && (
          <section className="card gp-steps">
            <b style={{ fontSize: 17 }}>{t.gpStepsTitle}</b>
            <ol>
              {t.gpSteps.map((s, i) => <li key={s} className={steps[i] ? "done" : i === current ? "now" : ""}><span className="gp-dot">{steps[i] ? "✓" : i + 1}</span><span>{s}</span></li>)}
            </ol>
            {!g.payoutsReady && <><p className="hint">{t.gpPayHint}</p><PayoutsButton locale={L} ready={false} /></>}
            {g.payoutsReady && !approved && <p className="hint">{t.gpHidden}</p>}
          </section>
        )}

        <section className="gp-kpis">
          <div className="card gp-kpi"><span className="label">{t.gpNext}</span><b>{sumNet(upcoming)}</b><span className="hint">{upcoming.length} {t.gpTourN[upcoming.length === 1 ? 0 : 1]}</span></div>
          <div className="card gp-kpi"><span className="label">{t.gpEarned}</span><b>{sumNet(done)}</b><span className="hint">{done.length} {t.gpTourN[done.length === 1 ? 0 : 1]}</span></div>
          <div className="card gp-kpi"><span className="label">{t.gpRating}</span><b>{g.ratingCount ? `★ ${(g.ratingSum / g.ratingCount).toFixed(1)}` : "—"}</b><span className="hint">{g.ratingCount ? (g.ratingCount === 1 ? t.gdReview1 : fmt(t.gdReviews, { n: g.ratingCount })) : t.gdNew}</span></div>
        </section>
        <p className="hint" style={{ marginTop: -10 }}>{fmt(t.gpNetNote, { f: Math.round(GUIDE_FEE * 100) })}</p>

        <section className="stack" style={{ gap: 10 }}>
          <h2 className="gp-h2">{t.gpRequests}{requests.length > 0 && <span className="gp-count">{requests.length}</span>}</h2>
          {requests.length ? requests.map(row) : (
            <div className="card gp-empty"><span aria-hidden="true">📬</span><b>{t.gpEmptyTitle}</b><span className="hint">{t.gpEmptySub}</span></div>
          )}
        </section>
        {upcoming.length > 0 && <section className="stack" style={{ gap: 10 }}><h2 className="gp-h2">{t.gpUpcoming}</h2>{upcoming.map(row)}</section>}

        {pct < 100 && (
          <section className="card gp-tips">
            <div className="row-between"><b>{t.gpTips}</b><span className="hint">{fmt(t.gpComplete, { p: pct })}</span></div>
            <div className="progress"><span style={{ display: "block", height: "100%", width: `${pct}%`, background: "var(--cobalt)", borderRadius: 6 }} /></div>
            <ul>{tips.map((x) => <li key={x.txt} className={x.ok ? "ok" : ""}>{x.ok ? "✓" : "○"} {x.txt}</li>)}</ul>
          </section>
        )}

        {g.payoutsReady && (
          <section className="card gp-pay">
            <div className="stack" style={{ gap: 2 }}><b>💳 {t.gpPayouts}</b><span className="hint">{t.gpPaySub}</span></div>
            <PayoutsButton locale={L} ready />
          </section>
        )}

        {past.length > 0 && <details className="card gp-fold"><summary><b>{t.gpPast}</b><span className="hint">{past.length}</span></summary><div className="stack" style={{ gap: 10, marginTop: 12 }}>{past.map(row)}</div></details>}

        <details className="card gp-fold" open={legalMissing || undefined}><summary><b>✎ {t.gpEdit}</b></summary>
          <div style={{ marginTop: 14 }}><GuideForm locale={L} cities={cities} mode="edit" declared={Boolean(g.independentAt)}
            initial={{ activityRegNo: g.activityRegNo ?? "", insurer: g.insurer ?? "", policyNo: g.policyNo ?? "", taxId: g.taxId ?? "", taxCountry: g.taxCountry ?? "", address: g.address ?? "", birthDate: g.birthDate ?? "", name: g.name, phone: g.phone ?? "", city: g.city, languages: g.languages, bio: g.bio, hourly: String(g.hourlyCents / 100), maxPeople: String(g.maxPeople), meetingPoint: g.meetingPoint ?? "", licenseNo: g.licenseNo ?? "", photo: g.photo }} /></div>
        </details>
      </div>
    </main>
  );
}
