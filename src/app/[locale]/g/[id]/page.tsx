import { dedupeText } from "@/lib/guide-input";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { vagueMeeting } from "@/lib/guide-input";
import { GuideAvatar, GuideStars, eurH, langNames } from "@/components/GuideCard";
import { BookGuide } from "@/components/Guides";
import { requestCurrency } from "@/lib/fx";
import { loadCity } from "@/lib/content";
import { cityName } from "@/data/cities";
import { currentGuide, publicGuide } from "@/lib/guides";
import { isAdmin } from "@/lib/auth";
import { fmt } from "@/i18n/core";
import { getDict, type Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function GuidePage({ params, searchParams }: { params: { locale: Locale; id: string }; searchParams: { booked?: string } }) {
  let r = await publicGuide(params.id);
  let preview = false;
  if (!r) {
    // Pré-visualização: o administrador ou o próprio guia veem o perfil antes de estar público.
    const me = await currentGuide().catch(() => null);
    if ((await isAdmin()) || me?.id === params.id) { r = await publicGuide(params.id, true); preview = Boolean(r); }
  }
  if (!r) notFound();
  const { guide: g, reviews } = r;
  const t = getDict(params.locale);
  const city = await loadCity(g.city);
  const bookable = g.payoutsReady && !preview;
  return (
    <main className="app">
      <Header locale={params.locale} currency={requestCurrency()} />
      <div className="stack">
        {preview && <div className="card" style={{ padding: 14, borderInlineStart: "4px solid var(--warn)" }}><b>👁 Pré-visualização</b><div className="hint">Este perfil ainda não está visível para os viajantes ({g.status === "pending" ? "à espera de aprovação" : g.status}). As reservas ficam ativas depois de aprovado.</div></div>}
        {searchParams.booked && <div className="card" style={{ padding: 16, borderInlineStart: "4px solid #34c759" }}><b>✓ {fmt(t.gdBooked2, { g: g.name })}</b></div>}
        <div className="g-hero">
          <GuideAvatar g={g} size={88} />
          <div className="stack" style={{ gap: 4 }}>
            <h1 style={{ fontSize: 28 }}>{g.name}</h1>
            <GuideStars g={g} t={t} />
            <span className="g-badge">✓ {t.gdVerified}{city ? ` · ${cityName(city, params.locale)}` : ""}</span>
            <span className="hint">{t.gdVerifiedHow}</span>
          </div>
        </div>
        <div className="card rows" style={{ paddingBlock: 6 }}>
          <div><span>💶</span><b className="num">{fmt(t.gdPerH, { p: eurH(g.hourlyCents, params.locale) })}</b></div>
          <div><span>🗣 {t.gdLangs}</span><span style={{ textAlign: "end" }}>{langNames(g.languages, params.locale).join(" · ")}</span></div>
          <div><span>👥</span><span>{fmt(t.gdUpTo, { n: g.maxPeople })}</span></div>
          <div><span>📍 {t.gdMeet}</span><span style={{ textAlign: "end" }}>{g.meetingPoint && !vagueMeeting(g.meetingPoint)
            ? <>{g.meetingPoint}<br /><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${g.meetingPoint}, ${city ? cityName(city, "en") : ""}`)}`} target="_blank" rel="noopener noreferrer">{t.seeOnMaps} ↗</a></>
            : <span className="hint">{t.gdMeetTbc}</span>}</span></div>
        </div>
        <section className="stack" style={{ gap: 8 }}><h2 style={{ fontSize: 20 }}>{t.gdAbout}</h2>
          {g.languages[0] && g.languages[0] !== params.locale && <span className="hint">✍️ {fmt(t.gdBioLang, { l: langNames([g.languages[0]], params.locale)[0] ?? g.languages[0] })}</span>}
          <p style={{ whiteSpace: "pre-line" }} lang={g.languages[0] ?? undefined}>{dedupeText(g.bio)}</p>
          {/* A biografia é escrita pelo guia na língua dele: tradução automática à distância de um toque. */}
          <a className="link-btn" style={{ alignSelf: "flex-start" }} target="_blank" rel="noopener noreferrer"
            href={`https://translate.google.com/?sl=auto&tl=${params.locale === "zh" ? "zh-CN" : params.locale}&text=${encodeURIComponent(dedupeText(g.bio).slice(0, 1800))}&op=translate`}>🌐 {t.gdTranslate} ↗</a></section>
        {bookable && <section className="card stack" style={{ padding: 16 }}><h2 style={{ fontSize: 20 }}>{t.gdBook}</h2><p className="hint g-indep">🧑‍💼 {fmt(t.gdIndep, { g: g.name })} <a href={`/${params.locale}/legal/terms`} target="_blank" rel="noreferrer">{t.lTerms}</a></p><BookGuide t={t} locale={params.locale} guide={{ id: g.id, name: g.name, hourlyCents: g.hourlyCents, maxPeople: g.maxPeople }} tz={city?.tz} /></section>}
        {reviews.length > 0 && (
          <section className="stack" style={{ gap: 8 }}>
            <h2 style={{ fontSize: 20 }}>{t.gdRevTitle}</h2>
            {reviews.map((rv) => (
              <div key={rv.id} className="card g-rev">
                <div className="row-between"><b>{rv.author ?? "—"}</b><span className="g-stars"><b>{"★".repeat(rv.stars)}</b><span className="hint">{"★".repeat(5 - rv.stars)}</span></span></div>
                {rv.comment && <p>{rv.comment}</p>}
                <span className="hint">{rv.createdAt.toISOString().slice(0, 10)}</span>
              </div>
            ))}
          </section>
        )}
        {city && <Link className="mini" href={`/${params.locale}/guides/${city.id}`}>← {t.gdSeeAll}</Link>}
      </div>
    </main>
  );
}
