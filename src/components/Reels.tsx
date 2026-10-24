"use client";
import { useDict } from "@/i18n/client-dict";
/**
 * Vídeos em ecrã inteiro, estilo TikTok: deslizar para cima/baixo, tocam sozinhos quando aparecem,
 * toque para pausar, duplo toque para gostar, som ligado/desligado, gostos, comentários e partilhar.
 * Leve: só o vídeo visível e o seguinte carregam; os outros ficam pela capa.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { fmt } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { HOBBY_ICON, type Hobby } from "@/lib/explore";
import { Avatar, FollowBtn, Verified, type PublicProfile, type Social } from "./Social";
import { Composer, ago, type PostItem } from "./Feed";
import { EmojiButton, emojiLabels } from "./Emoji";
import { I, Heart, MessageCircle, Send, Ellipsis, Volume2, VolumeX, Play, X, Plus, Clapperboard } from "./Ico";

type Page = { posts: PostItem[]; authors: Record<string, PublicProfile>; next: string | null };
import { Scrub, videoUrl, posterUrl, compact } from "./FeedVideo";
import Portal from "@/components/Portal";
export { videoUrl, posterUrl };
const postAct = (id: string, body: Record<string, string>) =>
  fetch(`/api/social/post/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()).catch(() => null);

/* ---------- Visualizador ---------- */
export function ReelsViewer({ t, locale, cities, scope: scope0 = "foryou", handle, initial, startId, onClose, showTabs = false, onCreate }: {
  t: Dict; locale: Locale; cities: Record<string, string>; scope?: "foryou" | "following"; handle?: string;
  initial?: Page; startId?: string; onClose: () => void; showTabs?: boolean; onCreate?: () => void;
}) {
  const [scope, setScope] = useState(scope0);
  const [page, setPage] = useState<Page | null>(initial ?? null);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [comments, setComments] = useState<PostItem | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const loading = useRef(false);
  const url = (before?: string | null) => `/api/social/videos?scope=${scope}${handle ? `&handle=${encodeURIComponent(handle)}` : ""}${before ? `&before=${encodeURIComponent(before)}` : ""}`;

  useEffect(() => {
    if (initial && scope === scope0) return;
    setPage(null); setActive(0);
    fetch(url(), { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => setPage(j ?? { posts: [], authors: {}, next: null })).catch(() => setPage({ posts: [], authors: {}, next: null }));
  }, [scope]); // eslint-disable-line react-hooks/exhaustive-deps

  // Começar no vídeo pedido.
  useEffect(() => {
    if (!startId || !page) return;
    const i = page.posts.findIndex((p) => p.id === startId);
    if (i > 0) requestAnimationFrame(() => box.current?.children[i]?.scrollIntoView({ behavior: "instant" as ScrollBehavior }));
  }, [startId, page === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const more = useCallback(async () => {
    if (!page?.next || loading.current) return;
    loading.current = true;
    const r: Page | null = await fetch(url(page.next), { cache: "no-store" }).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    loading.current = false;
    if (r) setPage((cur) => cur && { posts: [...cur.posts, ...r.posts.filter((x) => !cur.posts.some((y) => y.id === x.id))], authors: { ...cur.authors, ...r.authors }, next: r.next });
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Qual vídeo está no ecrã (≥ 60 % visível).
  useEffect(() => {
    const b = box.current; if (!b || !page) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); }), { root: b, threshold: 0.6 });
    Array.from(b.children).forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [page]);
  useEffect(() => { if (page && active >= page.posts.length - 3) void more(); }, [active, page, more]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (comments) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "j") box.current?.children[active + 1]?.scrollIntoView({ behavior: "smooth" });
      if (e.key === "ArrowUp" || e.key === "k") box.current?.children[active - 1]?.scrollIntoView({ behavior: "smooth" });
      if (e.key === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [active, onClose, comments]);
  // Bloqueia o scroll da página por trás.
  useEffect(() => { const o = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = o; }; }, []);

  const patch = (id: string, v: Partial<PostItem>) => setPage((cur) => cur && { ...cur, posts: cur.posts.map((p) => (p.id === id ? { ...p, ...v } : p)) });
  return (
    <div className="rl" role="dialog" aria-modal="true" aria-label={t.rlTitle}>
      <div className="rl-top">
        <button className="rl-ic" onClick={onClose} aria-label={t.close} title={t.close}><I icon={X} size={20} /></button>
        {showTabs ? (
          <div className="rl-tabs">
            {(["following", "foryou"] as const).map((s) => <button key={s} className={scope === s ? "on" : ""} onClick={() => setScope(s)}>{s === "foryou" ? t.rlForYou : t.pfFollowing}</button>)}
          </div>
        ) : <b className="rl-ttl">{handle ? `@${handle}` : t.rlTitle}</b>}
        {onCreate ? <button className="rl-ic" onClick={onCreate} aria-label={t.rlNew} title={t.rlNew}><I icon={Plus} size={22} /></button> : <span style={{ width: 40 }} />}
      </div>
      <div className="rl-feed" ref={box}>
        {page === null && <div className="rl-slide"><span className="rl-spin" aria-label={t.exLoading} /></div>}
        {page?.posts.length === 0 && (
          <div className="rl-slide rl-empty"><span className="rl-empty-ic" aria-hidden="true"><I icon={Clapperboard} size={34} /></span><b>{t.rlEmpty}</b><p>{scope === "following" ? t.rlEmptyF : t.rlEmptySub}</p>
            {onCreate && <button className="btn press" style={{ width: "auto" }} onClick={onCreate}>＋ {t.rlNew}</button>}</div>
        )}
        {page?.posts.map((p, i) => (
          <Reel key={p.id} i={i} t={t} locale={locale} p={p} a={page.authors[p.handle]} cities={cities}
            active={i === active} near={Math.abs(i - active) <= 1} muted={muted} setMuted={setMuted}
            onPatch={(v) => patch(p.id, v)} onComments={() => setComments(p)}
            onDeleted={() => setPage((cur) => cur && { ...cur, posts: cur.posts.filter((x) => x.id !== p.id) })} />
        ))}
      </div>
      {comments && <ReelComments t={t} locale={locale} post={comments} onClose={(n) => { if (n !== null) patch(comments.id, { comments: n }); setComments(null); }} />}
    </div>
  );
}

function Reel({ i, t, locale, p, a, cities, active, near, muted, setMuted, onPatch, onComments, onDeleted }: {
  i: number; t: Dict; locale: Locale; p: PostItem; a?: PublicProfile; cities: Record<string, string>;
  active: boolean; near: boolean; muted: boolean; setMuted: (m: boolean) => void;
  onPatch: (v: Partial<PostItem>) => void; onComments: () => void; onDeleted: () => void;
}) {
  const v = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [prog, setProg] = useState(0);
  const [burst, setBurst] = useState(0);
  const [more, setMore] = useState(false);
  const [menu, setMenu] = useState(false);
  const [shared, setShared] = useState(false);
  const lastTap = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = v.current; if (!el) return;
    if (active && !paused) { el.play().catch(() => { el.muted = true; setMuted(true); el.play().catch(() => null); }); }
    else el.pause();
    if (!active) { setPaused(false); setMenu(false); }
  }, [active, paused, setMuted]);
  useEffect(() => { if (v.current) v.current.muted = muted; }, [muted]);

  async function like(force?: boolean) {
    const on = force ?? !p.liked;
    if (on === p.liked) return;
    onPatch({ liked: on, likes: p.likes + (on ? 1 : -1) });
    const r = await postAct(p.id, { action: on ? "like" : "unlike" });
    if (r?.likes !== undefined) onPatch({ likes: r.likes, liked: on });
  }
  function tap() {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      lastTap.current = 0; setBurst(Date.now()); void like(true); return;
    }
    lastTap.current = now;
    tapTimer.current = setTimeout(() => setPaused((x) => !x), 280);
  }
  async function share() {
    const link = `${location.origin}/${locale}/v/${p.id}`;
    try { if (navigator.share) await navigator.share({ title: a?.name, text: p.text.slice(0, 100), url: link }); else { await navigator.clipboard.writeText(link); setShared(true); setTimeout(() => setShared(false), 2000); } } catch { /* cancelado */ }
  }
  const city = p.city && cities[p.city];
  return (
    <section className="rl-slide" data-i={i}>
      <video ref={v} className="rl-video" src={near ? videoUrl(p.id) : undefined} poster={posterUrl(p.id)} playsInline loop muted={muted}
        preload={active ? "auto" : near ? "metadata" : "none"}
        onLoadedMetadata={(e) => { const el = e.currentTarget; el.classList.toggle("fill", el.videoHeight > el.videoWidth); }} onTimeUpdate={(e) => { const el = e.currentTarget; if (el.duration) setProg(el.currentTime / el.duration); }} onClick={tap} />
      {paused && <span className="rl-play" aria-hidden="true"><I icon={Play} size={36} solid /></span>}
      {burst > 0 && <span key={burst} className="rl-burst" aria-hidden="true"><I icon={Heart} size={110} solid /></span>}
      <button className="rl-sound" onClick={() => setMuted(!muted)} aria-label={muted ? t.rlUnmute : t.rlMute}><I icon={muted ? VolumeX : Volume2} size={19} /></button>

      <div className="rl-rail">
        {a && <a href={`/${locale}/u/${a.handle}`} className="rl-av" aria-label={a.name}><Avatar p={a} size={46} /></a>}
        <button className={`rl-btn ${p.liked ? "on" : ""}`} onClick={() => void like()} aria-pressed={p.liked} aria-label={t.pfLike}><span><I icon={Heart} size={32} solid={p.liked} /></span><small>{compact(p.likes, locale)}</small></button>
        <button className="rl-btn" onClick={onComments} aria-label={t.pfComments}><span><I icon={MessageCircle} size={31} /></span><small>{compact(p.comments, locale)}</small></button>
        <button className="rl-btn" onClick={() => void share()} aria-label={t.rlShare}><span><I icon={Send} size={29} /></span><small>{shared ? "✓" : t.rlShare}</small></button>
        <button className="rl-btn" onClick={() => setMenu(!menu)} aria-label="⋯"><span><I icon={Ellipsis} size={30} /></span></button>
      </div>
      {menu && (
        <div className="rl-menu">
          {p.mine ? <button onClick={async () => { await postAct(p.id, { action: "delete" }); onDeleted(); }}>🗑 {t.pfDelete}</button>
            : (Object.keys(t.scReasons) as (keyof typeof t.scReasons)[]).map((r) => <button key={r} onClick={async () => { await postAct(p.id, { action: "report", reason: r }); setMenu(false); }}>⚑ {t.scReasons[r]}</button>)}
        </div>
      )}

      <div className="rl-info">
        {a && <div className="row" style={{ gap: 8, alignItems: "center" }}>
          <a href={`/${locale}/u/${a.handle}`} className="rl-handle">@{a.handle}<Verified handle={a.handle} /></a>
          {!p.mine && <FollowBtn t={t} handle={a.handle} rel="none" />}
        </div>}
        {p.text && <p className={`rl-cap ${more ? "open" : ""}`} onClick={() => setMore(!more)}>{p.text}</p>}
        <small className="rl-meta">{city ? `📍 ${city} · ` : ""}{p.tag ? `${HOBBY_ICON[p.tag as Hobby]} ${t.hob[p.tag as Hobby]} · ` : ""}{ago(p.at, locale)}</small>
      </div>
      <Scrub v={v} prog={prog} label={t.rlVideo} />
    </section>
  );
}

/* ---------- Comentários (folha por cima do vídeo) ---------- */
type Comment = { id: string; text: string; at: string; author: PublicProfile; canDelete: boolean };
function ReelComments({ t, locale, post, onClose }: { t: Dict; locale: Locale; post: PostItem; onClose: (n: number | null) => void }) {
  const [list, setList] = useState<Comment[] | null>(null);
  const [can, setCan] = useState(post.canComment);
  const [txt, setTxt] = useState("");
  const iRef = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => {
    const r = await fetch(`/api/social/post/${post.id}`, { cache: "no-store" }).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    setList(r?.comments ?? []); if (r) setCan(r.canComment);
  }, [post.id]);
  useEffect(() => { void load(); }, [load]);
  return (
    <Portal><div className="sheet-bg" style={{ zIndex: 130 }} onClick={() => onClose(list?.length ?? null)}>
      <div className="sheet stack rl-coms" style={{ gap: 10 }} onClick={(e) => e.stopPropagation()}>
        <b style={{ textAlign: "center" }}>{list ? fmt(t.rlComments, { n: list.length }) : t.pfComments}</b>
        <div className="stack" style={{ gap: 10, overflowY: "auto", maxHeight: "50vh" }}>
          {list === null && <small className="hint">{t.exLoading}</small>}
          {list?.length === 0 && <small className="hint" style={{ textAlign: "center" }}>{t.rlNoComments}</small>}
          {list?.map((c) => (
            <div key={c.id} className="pf-com">
              <a href={`/${locale}/u/${c.author.handle}`}><Avatar p={c.author} size={30} /></a>
              <p><b>{c.author.handle}</b> {c.text} <small className="hint">{ago(c.at, locale)}</small></p>
              {c.canDelete && <button aria-label={t.pfDelete} onClick={async () => { await postAct(post.id, { action: "uncomment", commentId: c.id }); await load(); }}>✕</button>}
            </div>
          ))}
        </div>
        {can ? (
          <form className="pf-say" onSubmit={async (e) => { e.preventDefault(); const v = txt.trim(); if (!v) return; setTxt(""); await postAct(post.id, { action: "comment", text: v }); await load(); }}>
            <EmojiButton target={iRef} value={txt} set={setTxt} max={300} labels={emojiLabels(t)} />
            <input ref={iRef} value={txt} maxLength={300} onChange={(e) => setTxt(e.target.value)} placeholder={t.pfCommentPh} aria-label={t.pfCommentPh} />
            <button className="link-btn" disabled={!txt.trim()}>{t.pfSend}</button>
          </form>
        ) : <small className="hint">{t.pfOnlyCircle}</small>}
      </div>
    </div></Portal>
  );
}

/** Separador Vídeos da carteira: abre logo o feed em ecrã inteiro. */
export function VideosTab({ t, locale, social, cities, onClose, onEdit }: { t: Dict; locale: Locale; social: Social | null; cities: Record<string, string>; onClose: () => void; onEdit: () => void }) {
  const [comp, setComp] = useState(false);
  const [key, setKey] = useState(0);
  if (!social?.profile) return (
    <div className="card gp-empty"><span aria-hidden="true">🎬</span><b>{t.scCreateTitle}</b><p className="hint" style={{ margin: 0 }}>{t.scCreateSub}</p><button className="btn press" style={{ width: "auto", marginTop: 8 }} onClick={onEdit}>{t.scCreate}</button></div>
  );
  return <>
    <ReelsViewer key={key} t={t} locale={locale} cities={cities} showTabs onClose={onClose} onCreate={() => setComp(true)} />
    {comp && <div style={{ position: "relative", zIndex: 140 }}><Composer t={t} social={social} cities={cities} defaultCity={social.profile.cities[0] ?? null} startKind="video" onClose={(c) => { setComp(false); if (c) setKey((k) => k + 1); }} /></div>}
  </>;
}

/** Página de um vídeo partilhado (/v/<id>). */
export function VideoPage({ t: tProp, locale, id, cities }: { t?: Dict; locale: Locale; id: string; cities: Record<string, string> }) {
  const t = useDict(tProp);
  const [init, setInit] = useState<Page | null | "none" | "auth">(null);
  useEffect(() => {
    fetch(`/api/social/post/${id}`, { cache: "no-store" }).then(async (r) => {
      if (r.status === 401) return setInit("auth");
      const j = r.ok ? await r.json() : null;
      setInit(j?.posts?.[0]?.video === "ready" ? { posts: j.posts, authors: j.authors, next: new Date().toISOString() } : "none");
    }).catch(() => setInit("none"));
  }, [id]);
  if (init === null) return <p className="hint" style={{ marginTop: 24 }}>{t.exLoading}</p>;
  if (init === "auth") return <div className="card gp-empty" style={{ marginTop: 16 }}><span aria-hidden="true">🎬</span><b>{t.rlSignIn}</b><a className="btn press" href={`/${locale}/wallet`} style={{ width: "auto" }}>{t.wSignIn}</a></div>;
  if (init === "none") return <div className="card gp-empty" style={{ marginTop: 16 }}><span aria-hidden="true">🙈</span><b>{t.scNotFound}</b><a className="btn press" href={`/${locale}/wallet`} style={{ width: "auto" }}>{t.wallet}</a></div>;
  return <ReelsViewer t={t} locale={locale} cities={cities} initial={init} onClose={() => { location.href = `/${locale}/wallet#videos`; }} />;
}
