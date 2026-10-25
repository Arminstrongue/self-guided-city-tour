"use client";
/** Fotografias (galeria, visualizador em ecrã inteiro, slideshow) e avaliações do Google. */
import { useEffect, useRef, useState } from "react";
import type { Media, Photo, Review } from "@/lib/media";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { ExtLink } from "./ExtLink";
import Portal from "./Portal";

export type { Media, Photo, Review };
type CityMedia = { cover: Photo[]; stops: Record<string, Photo | null> };

/* ---------- Dados ---------- */

const memo = new Map<string, Promise<unknown>>();
function load<T>(url: string): Promise<T | null> {
  if (!memo.has(url)) memo.set(url, fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null));
  return memo.get(url) as Promise<T | null>;
}

export function useCityMedia(cityId: string, cover = false) {
  const [v, setV] = useState<CityMedia | null>(null);
  useEffect(() => { let live = true; void load<CityMedia>(`/api/media?city=${cityId}${cover ? "&cover=1" : ""}`).then((j) => { if (live) setV(j); }); return () => { live = false; }; }, [cityId, cover]);
  return v;
}

export function useStopMedia(cityId: string, stopId: string | null, locale: Locale) {
  const [v, setV] = useState<Media | null>(null);
  useEffect(() => {
    if (!stopId) return;
    let live = true; setV(null);
    void load<Media>(`/api/media?city=${cityId}&stop=${stopId}&locale=${locale}`).then((j) => { if (live) setV(j && Array.isArray(j.photos) ? { ...j, reviews: j.reviews ?? [] } : { photos: [], reviews: [], rating: null, ratings: null, placeId: null, mapsUrl: null } as unknown as Media); });
    return () => { live = false; };
  }, [cityId, stopId, locale]);
  return v;
}

/** Carrega quando o elemento está perto do ecrã. */
export function useNear<T extends Element>(margin = "300px") {
  const ref = useRef<T | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (!("IntersectionObserver" in window)) { setNear(true); return; }
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { setNear(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [near, margin]);
  return [ref, near] as const;
}

/* ---------- Imagem ---------- */

/** Fotos do Wikimedia: várias resoluções, para ecrãs de alta densidade verem a imagem nítida. */
function wikiSrcSet(src: string): string | undefined {
  const m = src.match(/\/(\d{3,4})px-/);
  if (!m || !/upload\.wikimedia\.org/.test(src)) return undefined;
  return [500, 960, 1280].map((w) => `${src.replace(/\/\d{3,4}px-/, `/${w}px-`)} ${w}w`).join(", ");
}

/** Autor e licença de uma foto (obrigatório nas licenças Creative Commons), discreto no canto da imagem. */
export function Credit({ p }: { p?: Photo | null }) {
  if (!p) return null;
  const pd = /public domain|^pd\b|cc0/i.test(p.license);
  return <span className="ph-credit" title={`${p.credit} · ${p.license}`}>{pd ? "" : "© "}{p.credit}{p.license ? ` · ${p.license}` : ""}</span>;
}

export function Img({ src, alt = "", className = "", eager = false }: { src?: string | null; alt?: string; className?: string; eager?: boolean }) {
  const [ok, setOk] = useState(false);
  const [bad, setBad] = useState(false);
  if (!src || bad) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} srcSet={wikiSrcSet(src)} sizes={wikiSrcSet(src) ? "(min-width: 760px) 50vw, 100vw" : undefined} alt={alt} className={`img ${ok ? "ok" : ""} ${className}`} loading={eager ? "eager" : "lazy"} decoding="async"
      referrerPolicy="no-referrer" onLoad={() => setOk(true)} onError={() => setBad(true)} ref={(el) => { if (el?.complete && el.naturalWidth) setOk(true); }} />
  );
}

/* ---------- Slideshow do herói ---------- */

export function Slides({ photos, interval = 5200 }: { photos: Photo[]; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (photos.length < 2) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const id = setInterval(() => setI((x) => (x + 1) % photos.length), reduce ? interval * 2 : interval);
    return () => clearInterval(id);
  }, [photos.length, interval]);
  const cur = photos[i];
  return (
    <>
      <div className="slides" aria-hidden="true">
        {photos.map((p, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.url} src={p.url} alt="" className={k === i ? "on" : ""} loading={k === 0 ? "eager" : "lazy"} referrerPolicy="no-referrer" />
        ))}
      </div>
      {cur && <span className="credit">{cur.credit} · {cur.license}</span>}
      {photos.length > 1 && <div className="dots" aria-hidden="true">{photos.map((p, k) => <i key={p.url} className={k === i ? "on" : ""} />)}</div>}
    </>
  );
}

/* ---------- Visualizador em ecrã inteiro ---------- */

export function Lightbox({ title, photos, start = null, onClose, t }: { title: string; photos: Photo[]; start?: number | null; onClose: () => void; t: Dict }) {
  // Com uma só foto abre logo a foto; com várias abre a grelha (ou a foto pedida).
  const [view, setView] = useState<number | null>(start ?? (photos.length === 1 ? 0 : null));
  const [cur, setCur] = useState(start ?? 0);
  const strip = useRef<HTMLDivElement | null>(null);
  const thumbs = useRef<HTMLDivElement | null>(null);
  const go = (i: number) => { const el = strip.current; const k = Math.max(0, Math.min(photos.length - 1, i)); if (el) el.scrollTo({ left: k * el.clientWidth, behavior: "smooth" }); setCur(k); };
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (view !== null && photos.length > 1) setView(null); else onClose(); }
      if (view !== null && e.key === "ArrowRight") go(cur + 1);
      if (view !== null && e.key === "ArrowLeft") go(cur - 1);
    };
    window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", key); };
  }); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (view === null || !strip.current) return;
    strip.current.scrollTo({ left: view * strip.current.clientWidth, behavior: "instant" as ScrollBehavior });
    setCur(view);
  }, [view]);
  // Miniatura ativa sempre visível.
  useEffect(() => { thumbs.current?.children[cur]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); }, [cur]);
  const onScroll = () => { const el = strip.current; if (el && el.clientWidth) setCur(Math.round(el.scrollLeft / el.clientWidth)); };
  const p = photos[cur];
  return (
    <Portal>
      <div className="lb" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="lb-top">
          {view !== null && photos.length > 1 ? <button className="lb-x" onClick={() => setView(null)} aria-label={t.photos}>▦</button> : <span style={{ width: 40 }} />}
          <b>{title} · <span className="num">{view !== null && photos.length > 1 ? `${cur + 1} / ${photos.length}` : `${photos.length} ${t.photos.toLowerCase()}`}</span></b>
          <button className="lb-x" onClick={onClose} aria-label={t.close}>✕</button>
        </div>
        {view === null ? (
          <div className="lb-grid">
            {photos.map((ph, k) => <button key={ph.url} onClick={() => setView(k)} aria-label={`${t.photos} ${k + 1}`}><Img src={ph.thumb} alt="" /></button>)}
          </div>
        ) : (
          <>
            <div className="lb-stage">
              <div className="lb-view" ref={strip} onScroll={onScroll}>
                {photos.map((ph, k) => (
                  <figure key={ph.url}>
                    <Img src={ph.url} alt="" eager={Math.abs(k - cur) <= 1} />
                  </figure>
                ))}
              </div>
              {photos.length > 1 && <>
                <button className="lb-arrow l" onClick={() => go(cur - 1)} disabled={cur === 0} aria-label="‹">‹</button>
                <button className="lb-arrow r" onClick={() => go(cur + 1)} disabled={cur === photos.length - 1} aria-label="›">›</button>
              </>}
            </div>
            <p className="lb-cap">{p ? (p.page ? <a href={p.page} target="_blank" rel="noreferrer">{p.credit} · {p.license}</a> : `${p.credit} · ${p.license}`) : null}</p>
            {photos.length > 1 && (
              <div className="lb-thumbs" ref={thumbs}>
                {photos.map((ph, k) => <button key={ph.url} className={k === cur ? "on" : ""} onClick={() => go(k)} aria-label={`${t.photos} ${k + 1}`}><Img src={ph.thumb} alt="" /></button>)}
              </div>
            )}
          </>
        )}
      </div>
    </Portal>
  );
}

/** Grelha de 3 fotos com "Ver todas" — abre o visualizador. */
export function PhotoGrid({ title, photos, t }: { title: string; photos: Photo[]; t: Dict }) {
  const [open, setOpen] = useState<number | null | undefined>(undefined);
  if (photos.length === 0) return <div className="pgrid skel" aria-hidden="true" />;
  const show = photos.slice(0, 3);
  return (
    <>
      <div className="pgrid" style={show.length < 3 ? { gridTemplateColumns: "1fr", gridTemplateRows: "1fr" } : undefined}>
        {show.map((p, k) => (
          <button key={p.url} onClick={() => setOpen(k)} aria-label={`${t.photos} ${k + 1}`}>
            <Img src={k === 0 ? p.url : p.thumb} alt="" />
            {k === show.length - 1 && photos.length > show.length && <span className="more">+{photos.length - show.length}</span>}
          </button>
        ))}
      </div>
      {open !== undefined && <Lightbox title={title} photos={photos} start={open} onClose={() => setOpen(undefined)} t={t} />}
    </>
  );
}

/** Fila deslizante de miniaturas. */
export function PhotoStrip({ title, photos, t }: { title: string; photos: Photo[]; t: Dict }) {
  const [open, setOpen] = useState<number | null | undefined>(undefined);
  if (photos.length === 0) return null;
  return (
    <>
      <div className="strip">
        {photos.map((p, k) => <button key={p.url} onClick={() => setOpen(k)} aria-label={`${t.photos} ${k + 1}`}><Img src={p.thumb} alt="" /></button>)}
      </div>
      {open !== undefined && <Lightbox title={title} photos={photos} start={open} onClose={() => setOpen(undefined)} t={t} />}
    </>
  );
}

/* ---------- Avaliações ---------- */

export function Stars({ v }: { v: number }) {
  const full = Math.round(v);
  return <span className="stars" aria-label={`${v.toFixed(1)} / 5`}>{[1, 2, 3, 4, 5].map((k) => <span key={k} className={k <= full ? "" : "off"}>★</span>)}</span>;
}

export function GoogleReviews({ m, t, locale }: { m: Media; t: Dict; locale: Locale }) {
  const nf = new Intl.NumberFormat(INTL_LOCALE[locale]);
  return (
    <div className="stack" style={{ gap: 12 }}>
      {m.rating !== null && (
        <div className="rating">
          <span className="big num">{m.rating.toFixed(1)}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Stars v={m.rating} />
            <small className="num">{fmt(t.gReviews, { n: nf.format(m.ratings ?? 0) })}</small>
          </div>
          <span className="g-logo" style={{ marginInlineStart: "auto" }} aria-label="Google Maps">Google Maps</span>
        </div>
      )}
      {m.reviews.length > 0 && (
        <div className="revs">
          {m.reviews.map((r, k) => (
            <ExtLink key={k} href={r.url ?? m.mapsUrl ?? "#"} className="rev">
              <span className="who">
                {r.avatar ? <Img src={r.avatar} alt="" /> : <span className="av">{r.author.slice(0, 1)}</span>}
                <span><b>{r.author}</b><small>{r.when}</small></span>
              </span>
              <Stars v={r.rating} />
              <p>{r.text}</p>
              {r.translated && <small className="rev-tr">{t.revTr}</small>}
            </ExtLink>
          ))}
        </div>
      )}
      <div className="links-row">
        {m.placeId && <ExtLink className="dark" href={`https://search.google.com/local/writereview?placeid=${encodeURIComponent(m.placeId)}`}>★ {t.writeReview}</ExtLink>}
        {m.mapsUrl && <ExtLink href={m.mapsUrl}>{m.rating !== null ? t.allReviews : t.seeOnMaps} ↗</ExtLink>}
      </div>
      {m.rating !== null && <span className="hint">{t.reviewsSrc}</span>}
    </div>
  );
}

/** Fotos e avaliações de uma paragem aberta no roteiro. */
export function StopMedia({ cityId, stopId, name, t, locale }: { cityId: string; stopId: string; name: string; t: Dict; locale: Locale }) {
  const m = useStopMedia(cityId, stopId, locale);
  if (!m) return <div className="strip" aria-hidden="true">{[0, 1, 2].map((k) => <button key={k} className="skel" tabIndex={-1} />)}</div>;
  return (
    <>
      {m.photos.length > 0 && <><span className="label">{t.photos} · <span className="num">{m.photos.length}</span></span><PhotoStrip title={name} photos={m.photos} t={t} /></>}
      <GoogleReviews m={m} t={t} locale={locale} />
    </>
  );
}
