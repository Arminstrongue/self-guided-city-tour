"use client";
/** Avaliações verificadas de negócios: formulário (link do email) e lista na ficha do negócio. */
import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { useDict } from "@/i18n/client-dict";

export type MReview = { stars: number; comment: string | null; author: string | null; at: string };

export function Stars({ n, size = 14 }: { n: number; size?: number }) {
  return <span className="mr-stars" style={{ fontSize: size }} aria-label={`${n} / 5`}>{"★".repeat(Math.round(n))}<span className="off">{"★".repeat(5 - Math.round(n))}</span></span>;
}

/** "★ 4,8 · 12 avaliações verificadas" (nada se ainda não houver avaliações). */
export function RatingLine({ t, locale, rating, count }: { t: Dict; locale: Locale; rating: number | null; count: number }) {
  if (!rating || !count) return null;
  const nf = new Intl.NumberFormat(INTL_LOCALE[locale], { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return <span className="mr-line"><b><span className="mr-star" aria-hidden="true">★</span> {nf.format(rating)}</b> · {count === 1 ? t.mr.one : fmt(t.mr.many, { n: count })}</span>;
}

export function ReviewList({ t, locale, list }: { t: Dict; locale: Locale; list: MReview[] }) {
  const df = new Intl.DateTimeFormat(INTL_LOCALE[locale], { month: "short", year: "numeric" });
  return (
    <ul className="mr-list">{list.map((r, i) => (
      <li key={i}>
        <span className="mr-h"><Stars n={r.stars} /> <b>{r.author ?? t.mr.anon}</b> <small>· {df.format(new Date(r.at))}</small></span>
        {r.comment && <p>{r.comment}</p>}
      </li>
    ))}</ul>
  );
}

/** Na ficha do negócio: carrega as avaliações quando a ficha abre. */
export function OfferReviews({ t, locale, id, count }: { t: Dict; locale: Locale; id: string; count: number }) {
  const [list, setList] = useState<MReview[] | null>(null);
  useEffect(() => { if (count) fetch(`/api/merchants/reviews?id=${id}`).then((r) => r.json()).then((j) => setList(j.list ?? [])).catch(() => setList([])); }, [id, count]);
  if (!count || !list?.length) return null;
  return (
    <section className="mr-box">
      <span className="label">✓ {t.mr.verified}</span>
      <ReviewList t={t} locale={locale} list={list.slice(0, 5)} />
      <small className="hint">{t.mr.why}</small>
    </section>
  );
}

export function MerchantReviewForm({ t: tProp, bookingId, token, merchant }: { t?: Dict; bookingId: string; token: string; merchant: string }) {
  const t = useDict(tProp);
  const [stars, setStars] = useState(0); const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error" | "offensive">("idle");
  if (state === "done") return <div className="card stack" style={{ padding: 16 }}><b>✓ {t.mr.thanks}</b></div>;
  return (
    <div className="card stack rate" style={{ gap: 12, padding: 16 }}>
      <b style={{ fontSize: 18 }}>{fmt(t.mr.title, { m: merchant })}</b>
      <div className="star-pick" role="radiogroup">{[1, 2, 3, 4, 5].map((k) => <button key={k} type="button" role="radio" aria-checked={stars === k} aria-label={`${k} / 5`} className={k <= stars ? "on" : ""} onClick={() => setStars(k)}>★</button>)}</div>
      <textarea rows={3} maxLength={600} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t.mr.comment} />
      <small className="hint">{t.mr.public}</small>
      {state === "error" && <p className="err">{t.tsError}</p>}
      {state === "offensive" && <p className="err">{t.mp.offensive}</p>}
      <button className="btn press" disabled={!stars || state === "busy"} onClick={async () => {
        setState("busy");
        const r = await fetch("/api/merchants/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, token, stars, comment }) }).catch(() => null);
        const j = r ? await r.json().catch(() => ({})) : {};
        setState(r?.ok ? "done" : j.error === "offensive" ? "offensive" : "error");
      }}>{t.mr.send}</button>
    </div>
  );
}
