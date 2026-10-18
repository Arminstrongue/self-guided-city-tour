/** Cartões de guia (lista, destaque na página da cidade, cabeçalho do perfil). Sem estado: serve no servidor. */
import Link from "next/link";
import type { Guide } from "@/lib/db/schema";
import { fmt, INTL_LOCALE, type Dict, type Locale } from "@/i18n/dictionaries";

export function langNames(codes: string[], locale: Locale) {
  try {
    const dn = new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "language" });
    return codes.map((c) => { const n = dn.of(c) ?? c; return n.charAt(0).toUpperCase() + n.slice(1); });
  } catch { return codes.map((c) => c.toUpperCase()); }
}
export const eurH = (cents: number, locale: Locale) =>
  new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency: "EUR", maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);

export function GuideAvatar({ g, size = 64 }: { g: Pick<Guide, "id" | "name" | "photo">; size?: number }) {
  const style = { width: size, height: size, borderRadius: "50%", flex: "none" as const };
  return g.photo
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={`/api/guides/photo/${g.id}?v=${g.photo.length}`} alt="" width={size} height={size} style={{ ...style, objectFit: "cover" }} loading="lazy" />
    : <span className="g-ini" style={{ ...style, fontSize: size * 0.4 }} aria-hidden="true">{g.name.trim().charAt(0).toUpperCase()}</span>;
}

export function GuideStars({ g, t }: { g: Pick<Guide, "ratingSum" | "ratingCount">; t: Dict }) {
  if (!g.ratingCount) return <span className="chip">{t.gdNew}</span>;
  const avg = g.ratingSum / g.ratingCount;
  return <span className="g-stars"><b>★ {avg.toFixed(1)}</b> <span className="hint">· {g.ratingCount === 1 ? t.gdReview1 : fmt(t.gdReviews, { n: g.ratingCount })}</span></span>;
}

export function GuideCard({ g, t, locale }: { g: Guide; t: Dict; locale: Locale }) {
  return (
    <Link href={`/${locale}/g/${g.id}`} className="card g-card press">
      <GuideAvatar g={g} />
      <span className="stack" style={{ gap: 4, minWidth: 0 }}>
        <span className="row-between" style={{ gap: 8 }}><b className="g-name">{g.name}</b><b className="num">{fmt(t.gdPerH, { p: eurH(g.hourlyCents, locale) })}</b></span>
        <GuideStars g={g} t={t} />
        <span className="hint g-langs">🗣 {langNames(g.languages, locale).join(" · ")}</span>
        <span className="hint g-bio">{g.bio}</span>
      </span>
    </Link>
  );
}
