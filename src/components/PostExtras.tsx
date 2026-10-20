"use client";
/** Extras das publicações: texto com @menções/#hashtags/links, partilhar (conversa ou link), abrir uma publicação, hashtags e guardados. */
import { Fragment, useEffect, useState } from "react";
import { fmt, type Dict, type Locale } from "@/i18n/dictionaries";
import { SheetX } from "@/components/WinNav";
import { Avatar, type PublicProfile } from "./Social";
import { PostCard, type PostItem } from "./Feed";

type Page = { posts: PostItem[]; authors: Record<string, PublicProfile>; next: string | null };

/** Texto com @nome → perfil, #tag → página da hashtag e endereços → link. */
export function RichText({ text, locale }: { text: string; locale: Locale }) {
  const parts = text.split(/((?:^|(?<=[^\w@]))@[a-z0-9._]{3,24}|#[\p{L}\p{N}_]{2,40}|https?:\/\/[^\s]+)/giu);
  return <>{parts.map((x, i) => {
    if (!x) return null;
    if (/^@[a-z0-9._]{3,24}$/i.test(x)) return <a key={i} className="rt-at" href={`/${locale}/u/${x.slice(1).toLowerCase()}`}>{x}</a>;
    if (/^#[\p{L}\p{N}_]{2,40}$/u.test(x)) return <a key={i} className="rt-tag" href={`/${locale}/wallet#tag:${encodeURIComponent(x.slice(1).toLowerCase())}`}>{x}</a>;
    if (/^https?:\/\//.test(x)) return <a key={i} className="rt-link" href={x} target="_blank" rel="noreferrer nofollow">{x.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)}</a>;
    return <Fragment key={i}>{x}</Fragment>;
  })}</>;
}

/** Partilhar: enviar numa conversa privada, ou pelo telemóvel / copiar o link. */
export function ShareSheet({ t, locale, post, onClose }: { t: Dict; locale: Locale; post: PostItem; onClose: () => void }) {
  const [people, setPeople] = useState<PublicProfile[] | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${location.origin}/${locale}/wallet#post:${post.id}` : "";
  useEffect(() => { fetch("/api/chat?contacts=1").then((r) => (r.ok ? r.json() : null)).then((j) => setPeople(j?.contacts ?? [])).catch(() => setPeople([])); }, []);
  async function to(h: string) {
    setSent({ ...sent, [h]: true });
    await fetch(`/api/chat/${encodeURIComponent(h)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "share", post: post.id }) }).catch(() => null);
  }
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={onClose} label={t.close} />
        <b style={{ fontSize: 17 }}>↗ {t.shTitle}</b>
        <div className="sh-row">
          <button className="sh-big" onClick={async () => { try { if (navigator.share) { await navigator.share({ url: link, text: post.text.slice(0, 100) }); return; } } catch { return; } await navigator.clipboard.writeText(link).catch(() => null); setCopied(true); }}>
            <span>🔗</span><small>{copied ? `✓ ${t.scCopied}` : t.shLink}</small></button>
          <a className="sh-big" href={`https://wa.me/?text=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer"><span>🟢</span><small>WhatsApp</small></a>
        </div>
        <b className="ex-day">{t.shSendTo}</b>
        {people === null && <small className="hint">{t.exLoading}</small>}
        {people?.length === 0 && <small className="hint">{t.chNoContacts}</small>}
        {people?.map((p) => (
          <div key={p.handle} className="sc-row">
            <span className="sc-row-l"><Avatar p={p} /><span className="stack" style={{ gap: 0, minWidth: 0 }}><b className="ad-ellip">{p.name}</b><small className="hint">@{p.handle}</small></span></span>
            <button className={`sc-follow ${sent[p.handle] ? "" : "on"}`} disabled={sent[p.handle]} onClick={() => void to(p.handle)}>{sent[p.handle] ? `✓ ${t.chSent}` : t.chSend}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Uma publicação em folha (de uma notificação, partilha ou link). */
export function PostSheet({ t, locale, id, cities, onClose }: { t: Dict; locale: Locale; id: string; cities: Record<string, string>; onClose: () => void }) {
  const [v, setV] = useState<{ p: PostItem; a: PublicProfile } | null | "none">(null);
  useEffect(() => {
    fetch(`/api/social/post/${id}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null))
      .then((j) => { const p = j?.posts?.[0]; setV(p ? { p, a: j.authors[p.handle] } : "none"); }).catch(() => setV("none"));
  }, [id]);
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet pf-one" onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={onClose} label={t.close} />
        {v === null ? <p className="hint" style={{ padding: 24 }}>{t.exLoading}</p> : v === "none" ? <p className="hint" style={{ padding: 24 }}>{t.scNotFound}</p>
          : <PostCard t={t} locale={locale} post={v.p} author={v.a} cities={cities} onDeleted={onClose} />}
      </div>
    </div>
  );
}

/** Publicações de uma #hashtag. */
export function TagSheet({ t, locale, tag, cities, onClose }: { t: Dict; locale: Locale; tag: string; cities: Record<string, string>; onClose: () => void }) {
  const [page, setPage] = useState<Page | null>(null);
  useEffect(() => { fetch(`/api/social/tag?t=${encodeURIComponent(tag)}`).then((r) => (r.ok ? r.json() : null)).then((j) => setPage(j ?? { posts: [], authors: {}, next: null })).catch(() => setPage({ posts: [], authors: {}, next: null })); }, [tag]);
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack tg" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={onClose} label={t.close} />
        <b className="tg-h">#{tag}</b>
        <small className="hint">{page ? fmt(t.tgCount, { n: page.posts.length + (page.next ? "+" : "") }) : t.exLoading}</small>
        {page?.posts.length === 0 && <p className="hint">{t.pfEmpty}</p>}
        {page?.posts.map((p) => page.authors[p.handle] && <PostCard key={p.id} t={t} locale={locale} post={p} author={page.authors[p.handle]} cities={cities} />)}
      </div>
    </div>
  );
}

/** Separador "Guardados" no perfil. */
export function SavedGrid({ t, locale, cities }: { t: Dict; locale: Locale; cities: Record<string, string> }) {
  const [page, setPage] = useState<Page | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { fetch("/api/social/saved", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => setPage(j ?? { posts: [], authors: {}, next: null })).catch(() => setPage({ posts: [], authors: {}, next: null })); }, [open]);
  if (page === null) return <div className="pf-grid">{[0, 1, 2].map((i) => <span key={i} className="pf-tile sk" />)}</div>;
  if (page.posts.length === 0) return <div className="card gp-empty"><span aria-hidden="true">🔖</span><b>{t.svEmpty}</b><p className="hint" style={{ margin: 0 }}>{t.svEmptySub}</p></div>;
  return <>
    <div className="pf-grid">{page.posts.map((p) => (
      <button key={p.id} className="pf-tile" onClick={() => setOpen(p.id)} aria-label={p.text.slice(0, 60) || t.pfPost}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.video === "ready" ? <img src={`/api/social/video/${p.id}?poster=1`} alt="" loading="lazy" /> : p.photo ? <img src={`/api/social/photo/${p.id}`} alt="" loading="lazy" /> : <span className="pf-tile-t">{p.text}</span>}
      </button>
    ))}</div>
    {open && <PostSheet t={t} locale={locale} id={open} cities={cities} onClose={() => setOpen(null)} />}
  </>;
}
