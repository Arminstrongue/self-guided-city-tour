"use client";
/**
 * Rede social da carteira (fase 2): feed, histórias de 24 h, publicações com foto, gostos e comentários.
 * Leve: as fotos vêm por URL (com cache) e só carregam quando aparecem no ecrã.
 */
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fmt } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { HOBBIES, HOBBY_ICON, type Hobby } from "@/lib/explore";
import { SheetX } from "@/components/WinNav";
import { Avatar, FollowBtn, Verified, type PublicProfile, type Social } from "./Social";
import { SearchPick } from "./SearchPick";
import { RichText } from "./PostExtras";
import { EmojiButton, emojiLabels } from "./Emoji";
import { FeedVideo, posterUrl } from "./FeedVideo";
import dynamic from "next/dynamic";
// Partes pesadas só quando são abertas.
const ReelsViewer = dynamic(() => import("./Reels").then((m) => m.ReelsViewer), { ssr: false });
const ShareSheet = dynamic(() => import("./PostExtras").then((m) => m.ShareSheet), { ssr: false });
const StoryReply = dynamic(() => import("./Chat").then((m) => m.StoryReply), { ssr: false });
import { I, Heart, MessageCircle, Send, Bookmark, Ellipsis, Play, Camera } from "./Ico";
import { useLive, type LiveEvent } from "@/lib/live-client";

export type PostItem = {
  id: string; kind: "post" | "story"; handle: string; text: string; photo: boolean; city: string | null; tag: string | null; bg: string | null;
  at: string; expiresAt: string | null; likes: number; liked: boolean; comments: number; mine: boolean; canComment: boolean;
  video?: "processing" | "ready" | "failed" | null; duration?: number | null;
  photos?: number; saved?: boolean;
};
type Page = { posts: PostItem[]; authors: Record<string, PublicProfile>; next: string | null };
type Ring = { handle: string; items: PostItem[]; mine: boolean; last: string };
const BGS = ["sunset", "ocean", "forest", "night", "rose", "sand"] as const;
const photoUrl = (id: string) => `/api/social/photo/${id}`;
const postAct = (id: string, body: Record<string, string>) =>
  fetch(`/api/social/post/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()).catch(() => null);

export function ago(iso: string, locale: Locale) {
  const s = (Date.now() - Date.parse(iso)) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
  if (s < 60) return rtf.format(0, "minute");
  if (s < 3600) return rtf.format(-Math.floor(s / 60), "minute");
  if (s < 86400) return rtf.format(-Math.floor(s / 3600), "hour");
  if (s < 604800) return rtf.format(-Math.floor(s / 86400), "day");
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short" });
}

/** Foto da publicação reduzida no telemóvel: lado maior ≤ 1080 px, recorte entre 4:5 e 1,91:1, JPEG ≤ ~350 KB. */
async function postPhoto(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  let sw = img.width, sh = img.height;
  if (sw / sh < 0.8) sh = sw / 0.8; else if (sw / sh > 1.91) sw = sh * 1.91;
  const k = Math.min(1, 1080 / Math.max(sw, sh));
  const c = document.createElement("canvas"); c.width = Math.round(sw * k); c.height = Math.round(sh * k);
  c.getContext("2d")!.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, c.width, c.height);
  let q = 0.82, data = c.toDataURL("image/jpeg", q);
  while (data.length > 460_000 && q > 0.35) { q -= 0.08; data = c.toDataURL("image/jpeg", q); }
  return data;
}

/* ---------- Histórias ---------- */
function useSeen() {
  const [seen, setSeen] = useState<string[]>([]);
  useEffect(() => { try { setSeen(JSON.parse(localStorage.getItem("sgct:seen") ?? "[]")); } catch { /* ignorar */ } }, []);
  const mark = useCallback((id: string) => setSeen((s) => {
    if (s.includes(id)) return s;
    const n = [...s, id].slice(-400);
    try { localStorage.setItem("sgct:seen", JSON.stringify(n)); } catch { /* ignorar */ }
    return n;
  }), []);
  return { seen, mark };
}

export function StoryRing({ p, size = 64, state, onClick, label }: { p: { photo: string | null; name: string }; size?: number; state: "new" | "seen" | "none"; onClick?: () => void; label?: string }) {
  return (
    <button type="button" className={`st-ring ${state}`} onClick={onClick} aria-label={label} style={{ width: size + 8, height: size + 8 }}>
      <Avatar p={p} size={size} />
    </button>
  );
}

function StoriesBar({ t, me, rings, authors, onOpen, onAdd, seen }: { t: Dict; me: PublicProfile; rings: Ring[]; authors: Record<string, PublicProfile>; onOpen: (i: number) => void; onAdd: () => void; seen: string[] }) {
  const mineIdx = rings.findIndex((r) => r.mine);
  return (
    <div className="st-bar" role="list">
      <div className="st-item" role="listitem">
        <span className="st-me">
          <StoryRing p={me} state={mineIdx >= 0 ? "seen" : "none"} onClick={() => (mineIdx >= 0 ? onOpen(mineIdx) : onAdd())} label={t.pfYourStory} />
          <button type="button" className="st-plus" onClick={onAdd} aria-label={t.pfAddStory}>+</button>
        </span>
        <small>{t.pfYourStory}</small>
      </div>
      {rings.map((r, i) => r.mine ? null : (
        <div key={r.handle} className="st-item" role="listitem">
          <StoryRing p={authors[r.handle]} state={r.items.every((x) => seen.includes(x.id)) ? "seen" : "new"} onClick={() => onOpen(i)} label={authors[r.handle]?.name} />
          <small className="ad-ellip">{authors[r.handle]?.name.split(" ")[0]}</small>
        </div>
      ))}
    </div>
  );
}

export function StoryViewer({ t, locale, rings, authors, start, onClose, onSeen, onChanged }: {
  t: Dict; locale: Locale; rings: Ring[]; authors: Record<string, PublicProfile>; start: number; onClose: () => void; onSeen?: (id: string) => void; onChanged?: () => void;
}) {
  const [ri, setRi] = useState(start);
  const [ii, setIi] = useState(0);
  const [pause, setPause] = useState(false);
  const [typing, setTyping] = useState(false);
  const paused = pause || typing;
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const ring = rings[ri]; const item = ring?.items[ii];
  const next = useCallback(() => {
    if (!ring) return onClose();
    if (ii < ring.items.length - 1) setIi(ii + 1);
    else if (ri < rings.length - 1) { setRi(ri + 1); setIi(0); }
    else onClose();
  }, [ring, ii, ri, rings.length, onClose]);
  const prev = () => { if (ii > 0) setIi(ii - 1); else if (ri > 0) { setRi(ri - 1); setIi(0); } };
  useEffect(() => { if (item) onSeen?.(item.id); }, [item, onSeen]);
  useEffect(() => {
    if (!item || paused) return;
    const id = setTimeout(next, 5500);
    return () => clearTimeout(id);
  }, [item, paused, next]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  if (!ring || !item) return null;
  const a = authors[ring.handle];
  const isLiked = liked[item.id] ?? item.liked;
  return (
    <div className="st-view" role="dialog" aria-modal="true" aria-label={a?.name}>
      <div className={`st-card ${item.photo ? "" : `sg-bg-${item.bg ?? "ocean"}`}`}
        onPointerDown={() => setPause(true)} onPointerUp={() => setPause(false)} onPointerLeave={() => setPause(false)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {item.photo && <img src={photoUrl(item.id)} alt="" className="st-img" />}
        {item.text && <p className={`st-text ${item.photo ? "cap" : ""}`}>{item.text}</p>}
        <div className="st-prog">{ring.items.map((x, j) => <span key={x.id}><i className={j < ii ? "done" : j === ii ? (paused ? "run paused" : "run") : ""} key={`${x.id}-${j === ii ? ri : 0}`} /></span>)}</div>
        <div className="st-head">
          <a href={`/${locale}/u/${ring.handle}`} className="row" style={{ gap: 8, color: "#fff", textDecoration: "none", minWidth: 0 }}>
            {a && <Avatar p={a} size={32} />}<b className="ad-ellip">{a?.name}</b><small style={{ opacity: .8 }}>{ago(item.at, locale)}</small>
          </a>
          <SheetX onClose={onClose} label={t.close} />
        </div>
        <button className="st-tap l" aria-label={t.navBack} onClick={prev} />
        <button className="st-tap r" aria-label={t.navFwd} onClick={next} />
        <div className="st-foot">
          {item.mine ? (
            <button className="st-btn" onClick={async () => { await postAct(item.id, { action: "delete" }); onChanged?.(); onClose(); }}>🗑 {t.pfDelete}</button>
          ) : (
            <>
              <StoryReply t={t} storyId={item.id} name={a?.name.split(" ")[0] ?? ""} onFocus={setTyping} />
              <button className={`st-btn st-like ${isLiked ? "on" : ""}`} aria-pressed={isLiked} aria-label={t.pfLike} onClick={async () => { setLiked({ ...liked, [item.id]: !isLiked }); await postAct(item.id, { action: isLiked ? "unlike" : "like" }); }}>{isLiked ? "❤️" : "🤍"}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Nova publicação / história ---------- */
export function Composer({ t, social, cities, defaultCity, startKind = "post", onClose }: {
  t: Dict; social: Social; cities: Record<string, string>; defaultCity: string | null; startKind?: "post" | "story" | "video"; onClose: (created: "post" | "story" | "video" | null) => void;
}) {
  const [kind, setKind] = useState<"post" | "story" | "video">(startKind);
  const [video, setVideo] = useState<{ file: File; url: string; secs: number } | null>(null);
  const [pct, setPct] = useState<number | null>(null);
  const capRef = useRef<HTMLTextAreaElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [more, setMore] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [city, setCity] = useState<string | null>(defaultCity);
  const [tag, setTag] = useState<Hobby | null>(null);
  const [bg, setBg] = useState<(typeof BGS)[number]>("ocean");
  const [busy, setBusy] = useState<"" | "photo" | "send">("");
  const [err, setErr] = useState("");
  const max = kind === "story" ? 200 : 500;
  useEffect(() => () => { if (video) URL.revokeObjectURL(video.url); }, [video]);
  async function pickVideo(f: File) {
    setErr("");
    if (f.size > 80 * 1024 * 1024) return setErr(t.rlTooBig);
    const url = URL.createObjectURL(f);
    const secs = await new Promise<number>((res) => { const v = document.createElement("video"); v.preload = "metadata"; v.onloadedmetadata = () => res(v.duration || 0); v.onerror = () => res(0); v.src = url; });
    setVideo({ file: f, url, secs });
  }
  function sendVideo() {
    if (!video) return;
    setBusy("send"); setErr(""); setPct(0);
    const q = new URLSearchParams({ text: text.slice(0, 500), ...(city ? { city } : {}), ...(tag ? { tag } : {}) });
    const x = new XMLHttpRequest();
    x.open("POST", `/api/social/videos?${q}`);
    x.setRequestHeader("Content-Type", video.file.type || "video/mp4");
    x.upload.onprogress = (e) => { if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100)); };
    x.onload = () => {
      setBusy(""); setPct(null);
      if (x.status >= 200 && x.status < 300) return onClose("video");
      let j: { error?: string } = {}; try { j = JSON.parse(x.responseText); } catch { /* ignorar */ }
      setErr(j.error === "too_big" || x.status === 413 ? t.rlTooBig : j.error === "offensive" ? t.mdOffensive : j.error === "busy" || x.status === 429 ? t.rlBusy : t.pfErr);
    };
    x.onerror = () => { setBusy(""); setPct(null); setErr(t.pfErr); };
    x.send(video.file);
  }
  async function send() {
    if (kind === "video") return sendVideo();
    if (!photo && !text.trim()) return;
    setBusy("send"); setErr("");
    const r = await fetch("/api/social/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, text: text.slice(0, max), photo, extra: kind === "post" ? more : [], city, tag, bg: kind === "story" ? bg : null }) }).catch(() => null);
    const j = await r?.json().catch(() => null);
    setBusy("");
    if (r?.ok) return onClose(kind);
    setErr(j?.error === "too_many" ? t.pfTooMany : j?.error === "offensive" ? t.mdOffensive : t.pfErr);
  }
  return (
    <div className="sheet-bg" onClick={() => onClose(null)}>
      <div className="sheet stack pf-comp" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={() => onClose(null)} label={t.close} />
        <b style={{ fontSize: 19 }}>{t.pfNew}</b>
        <div className="sc-seg pf-seg3">{(["post", "video", "story"] as const).map((k) => <button key={k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{k === "post" ? `🖼 ${t.pfPost}` : k === "video" ? `🎬 ${t.rlVideo}` : `⏱ ${t.pfStory}`}</button>)}</div>
        {kind === "video" ? (<>
          {video ? <video src={video.url} className="pf-prev pf-prev-v" controls playsInline muted /> : null}
          <label className="btn ghost press pf-pick">
            {video ? `🔄 ${t.rlChange}` : `🎬 ${t.rlPick}`}
            <input type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void pickVideo(f); }} />
          </label>
          <small className="hint">{video && video.secs > 60 ? `✂️ ${t.rlTrim}` : t.rlRules}</small>
          {pct !== null && <div className="pf-up"><i style={{ width: `${pct}%` }} /><span>{fmt(t.rlUploading, { n: pct })}</span></div>}
        </>) : kind === "story" && !photo ? (
          <div className={`pf-prev-story sg-bg-${bg}`}><p>{text || t.pfStoryText}</p></div>
        ) : photo && kind === "post" && more.length ? (
          <div className="pf-multi">{[photo, ...more].map((src, i) => (
            <span key={i} className="pf-multi-i">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" /><button type="button" aria-label="✕" onClick={() => { if (i === 0) { setPhoto(more[0] ?? null); setMore(more.slice(1)); } else setMore(more.filter((_, k) => k !== i - 1)); }}>✕</button>
            </span>
          ))}</div>
        ) : photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="pf-prev" />
        ) : null}
        {kind !== "video" && <label className="btn ghost press pf-pick">
          {busy === "photo" ? t.pfPhotoBusy : photo ? (kind === "post" ? `➕ ${t.pfAddMore}` : `🔄 ${t.pfChange}`) : `📷 ${kind === "post" ? t.pfPhotos : t.pfPhoto}`}
          <input type="file" accept="image/*" hidden multiple={kind === "post"} onChange={async (e) => {
            const files = Array.from(e.target.files ?? []); e.target.value = "";
            if (!files.length) return;
            setBusy("photo");
            try {
              if (kind !== "post") { setPhoto(await postPhoto(files[0])); }
              else {
                let first = photo; const add: string[] = [];
                for (const f of files) { const d = await postPhoto(f); if (!first) first = d; else add.push(d); }
                setPhoto(first); setMore((m) => [...m, ...add].slice(0, 5));
              }
            } catch { setErr(t.pfErr); }
            setBusy("");
          }} />
        </label>}
        {photo && kind !== "video" && !more.length && <button className="link-btn" style={{ alignSelf: "flex-start" }} onClick={() => setPhoto(null)}>✕ {t.pfRemovePhoto}</button>}
        {kind === "story" && !photo && <div className="pf-bgs">{BGS.map((b) => <button key={b} aria-label={b} aria-pressed={bg === b} className={`sg-bg-${b} ${bg === b ? "on" : ""}`} onClick={() => setBg(b)} />)}</div>}
        <div className="field pf-cap"><EmojiButton target={capRef} value={text} set={setText} max={max} labels={emojiLabels(t)} /><textarea ref={capRef} rows={kind === "story" ? 2 : 3} maxLength={max} placeholder={kind === "story" ? t.pfStoryText : t.pfCaption} value={text} onChange={(e) => setText(e.target.value)} aria-label={t.pfCaption} />
          <small className="hint" style={{ textAlign: "end" }}>{text.length}/{max}</small></div>
        {kind !== "story" && <>
          <SearchPick id="pfc" label={t.pfCity} placeholder={t.spCity} noneLabel={t.pfNoCity} value={city} onChange={(v) => setCity(v)}
            options={Object.entries(cities).sort((a, b) => a[1].localeCompare(b[1])).map(([id, n]) => ({ value: id, label: n, icon: "📍" }))} />
          <b style={{ fontSize: 14 }}>{t.pfTag}</b>
          <div className="sc-chips">{HOBBIES.map((h) => <button key={h} className={`sc-chip ${tag === h ? "on" : ""}`} onClick={() => setTag(tag === h ? null : h)}>{HOBBY_ICON[h]} {t.hob[h]}</button>)}</div>
        </>}
        <p className="hint" style={{ margin: 0, fontSize: 13 }}>{social.profile?.isPrivate ? `🔒 ${t.pfWhoPriv}` : `🌍 ${t.pfWhoPub}`}{kind === "story" ? ` · ${t.pfStoryNote}` : ""}</p>
        {err && <p className="err">{err}</p>}
        <button className="btn press" disabled={busy !== "" || (kind === "video" ? !video : !photo && !text.trim())} onClick={() => void send()}>{busy === "send" ? "…" : t.pfPublish}</button>
      </div>
    </div>
  );
}

/** Miniatura que, se a foto falhar, mostra o texto da publicação em vez de um ícone partido. */
export function TileImg({ src, text }: { src: string; text: string }) {
  const [bad, setBad] = useState(false);
  // eslint-disable-next-line @next/next/no-img-element
  return bad ? <span className="pf-tile-t"><span>{text}</span></span> : <img src={src} alt="" loading="lazy" decoding="async" onError={() => setBad(true)} />;
}

/* ---------- Uma publicação ---------- */
type Comment = { id: string; text: string; at: string; author: PublicProfile; canDelete: boolean };
export function PostCard({ t, locale, post, author, cities, onDeleted }: { t: Dict; locale: Locale; post: PostItem; author: PublicProfile; cities: Record<string, string>; onDeleted?: () => void }) {
  const [p, setP] = useState(post);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Comment[] | null>(null);
  const [txt, setTxt] = useState("");
  const [menu, setMenu] = useState(false);
  const [sure, setSure] = useState(false);
  const [reported, setReported] = useState(false);
  const [burst, setBurst] = useState(false);
  const cRef = useRef<HTMLInputElement>(null);
  useEffect(() => setP(post), [post]);
  const [reel, setReel] = useState(false);
  const [slide, setSlide] = useState(0);
  const [sharing, setSharing] = useState(false);
  useLive(useCallback((ev: LiveEvent) => { if (ev.t === "video" && ev.id === post.id) setP((x) => ({ ...x, video: ev.status })); }, [post.id]));
  async function toggleLike(force?: boolean) {
    const on = force ?? !p.liked;
    if (on === p.liked) return;
    setP({ ...p, liked: on, likes: p.likes + (on ? 1 : -1) });
    const r = await postAct(p.id, { action: on ? "like" : "unlike" });
    if (r?.likes !== undefined) setP((x) => ({ ...x, likes: r.likes, liked: on }));
  }
  async function loadComments() {
    const r = await fetch(`/api/social/post/${p.id}`, { cache: "no-store" }).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    setList(r?.comments ?? []);
    if (r) setP((x) => ({ ...x, comments: r.comments.length, canComment: r.canComment }));
  }
  async function send(e: React.FormEvent) {
    e.preventDefault();
    const v = txt.trim(); if (!v) return;
    setTxt("");
    await postAct(p.id, { action: "comment", text: v });
    await loadComments();
  }
  return (
    <article className="card pf-card">
      <header className="pf-head">
        <a href={`/${locale}/u/${author.handle}`} className="pf-who"><Avatar p={author} size={36} />
          <span className="stack" style={{ gap: 0, minWidth: 0 }}><b className="ad-ellip">{author.name}<Verified handle={author.handle} /></b>
            <small className="hint ad-ellip">{p.city && cities[p.city] ? `📍 ${cities[p.city]} · ` : ""}{ago(p.at, locale)}</small></span></a>
        <button className="wl-ic pf-more" aria-label="⋯" onClick={() => { setMenu(!menu); setSure(false); }}><I icon={Ellipsis} size={20} /></button>
      </header>
      {menu && (
        <div className="stack sc-menu" style={{ gap: 6, margin: "0 12px 8px" }}>
          {p.mine ? (
            <button className={sure ? "danger" : ""} onClick={async () => { if (!sure) return setSure(true); await postAct(p.id, { action: "delete" }); onDeleted?.(); }}>🗑 {sure ? t.pfDeleteSure : t.pfDelete}</button>
          ) : reported ? <p className="note">✓ {t.pfReported}</p> : (
            <><b>⚑ {t.pfReport}</b>
              <div className="ex-chips">{(Object.keys(t.scReasons) as (keyof typeof t.scReasons)[]).map((r) => <button key={r} onClick={async () => { await postAct(p.id, { action: "report", reason: r }); setReported(true); }}>{t.scReasons[r]}</button>)}</div></>
          )}
        </div>
      )}
      {sharing && <ShareSheet t={t} locale={locale} post={p} onClose={() => setSharing(false)} />}
      {p.video && <FeedVideo t={t} locale={locale} p={p} onOpen={() => setReel(true)} onLike={(f) => void toggleLike(f)}
        onComments={() => { setOpen(true); if (!list) void loadComments(); }} onShare={() => setSharing(true)} />}
      {reel && <ReelsViewer t={t} locale={locale} cities={cities} initial={{ posts: [p], authors: { [author.handle]: author }, next: new Date().toISOString() }} onClose={() => setReel(false)} />}
      {p.photo && (
        <div className="pf-photo" onDoubleClick={() => { void toggleLike(true); setBurst(true); setTimeout(() => setBurst(false), 700); }}>
          {(p.photos ?? 1) > 1 ? <>
            <div className="pf-car" onScroll={(e) => { const el = e.currentTarget; setSlide(Math.round(el.scrollLeft / el.clientWidth)); }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {Array.from({ length: p.photos ?? 1 }, (_, i) => <img key={i} src={`${photoUrl(p.id)}${i ? `?i=${i}` : ""}`} alt={i ? "" : p.text.slice(0, 80)} loading="lazy" decoding="async" />)}
            </div>
            <span className="pf-car-n">{slide + 1}/{p.photos}</span>
            <span className="pf-dots">{Array.from({ length: p.photos ?? 1 }, (_, i) => <i key={i} className={i === slide ? "on" : ""} />)}</span>
          </> : <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl(p.id)} alt={p.text.slice(0, 80)} loading="lazy" decoding="async" onError={(e) => { const box = e.currentTarget.closest(".pf-photo") as HTMLElement | null; if (box) box.style.display = "none"; }} />
          </>}
          {burst && <span className="pf-burst" aria-hidden="true"><I icon={Heart} size={96} solid /></span>}
        </div>
      )}
      <div className="pf-acts">
        {!p.video && <>
          <button className={`pf-act ${p.liked ? "on" : ""}`} aria-pressed={p.liked} aria-label={t.pfLike} onClick={() => void toggleLike()}><I icon={Heart} size={26} solid={p.liked} /></button>
          <button className="pf-act" aria-label={t.pfComments} onClick={() => { setOpen(!open); if (!list) void loadComments(); }}><I icon={MessageCircle} size={26} /></button>
          <button className="pf-act" aria-label={t.shTitle} onClick={() => setSharing(true)}><I icon={Send} size={24} /></button>
        </>}
        {p.tag && <span className="pf-tag">{HOBBY_ICON[p.tag as Hobby]} {t.hob[p.tag as Hobby]}</span>}
        <button className={`pf-act pf-save ${p.saved ? "on" : ""}`} aria-pressed={Boolean(p.saved)} aria-label={t.svSave} title={t.svSave}
          onClick={async () => { const on = !p.saved; setP({ ...p, saved: on }); await postAct(p.id, { action: on ? "save" : "unsave" }); }}><I icon={Bookmark} size={25} solid={Boolean(p.saved)} /></button>
      </div>
      <div className="pf-body">
        {p.likes > 0 && <b className="num" style={{ fontSize: 14 }}>{p.likes === 1 ? t.pfLike1 : fmt(t.pfLikes, { n: p.likes })}</b>}
        {p.text && <p className={p.photo ? "" : "pf-big"}><b>{author.handle}</b> <RichText text={p.text} locale={locale} /></p>}
        {p.comments > 0 && !open && <button className="link-btn hint" onClick={() => { setOpen(true); void loadComments(); }}>{fmt(t.pfView, { n: p.comments })}</button>}
        {open && (
          <div className="stack pf-coms" style={{ gap: 8 }}>
            {list === null && <small className="hint">{t.exLoading}</small>}
            {list?.map((c) => (
              <div key={c.id} className="pf-com">
                <a href={`/${locale}/u/${c.author.handle}`}><Avatar p={c.author} size={26} /></a>
                <p><b>{c.author.handle}</b> {c.text} <small className="hint">{ago(c.at, locale)}</small></p>
                {c.canDelete && <button aria-label={t.pfDelete} title={t.pfDelete} onClick={async () => { await postAct(p.id, { action: "uncomment", commentId: c.id }); await loadComments(); }}>✕</button>}
              </div>
            ))}
            {p.canComment ? (
              <form className="pf-say" onSubmit={send}>
                <EmojiButton target={cRef} value={txt} set={setTxt} max={300} labels={emojiLabels(t)} />
                <input ref={cRef} value={txt} maxLength={300} onChange={(e) => setTxt(e.target.value)} placeholder={t.pfCommentPh} aria-label={t.pfCommentPh} />
                <button className="link-btn" disabled={!txt.trim()}>{t.pfSend}</button>
              </form>
            ) : <small className="hint">{t.pfOnlyCircle}</small>}
          </div>
        )}
      </div>
    </article>
  );
}

/* ---------- Separador Feed ---------- */
export function FeedTab({ t, locale, social, cities, myCities, onEdit }: { t: Dict; locale: Locale; social: Social; cities: Record<string, string>; myCities: string[]; onEdit: () => void }) {
  // #feed:<cidade> abre logo o feed dessa cidade (ex.: a partir da ficha de uma cidade visitada).
  const [scope, setScope] = useState<string>(() => { if (typeof window === "undefined") return "following"; const m = window.location.hash.match(/^#feed:([a-z]{2,12})$/); return m ? m[1] : "following"; });
  const [picking, setPicking] = useState(false);
  const [page, setPage] = useState<Page | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [rings, setRings] = useState<{ rings: Ring[]; authors: Record<string, PublicProfile> }>({ rings: [], authors: {} });
  const [viewer, setViewer] = useState<number | null>(null);
  const [comp, setComp] = useState<"post" | "story" | null>(null);
  // As histórias aparecem no topo da carteira (antes de "A seguir"), se a página tiver esse lugar.
  const [storySlot, setStorySlot] = useState<HTMLElement | null>(null);
  useEffect(() => { setStorySlot(document.getElementById("wl-stories")); }, []);
  const { seen, mark } = useSeen();
  const req = useRef(0);
  const feedUrl = (before?: string | null) => `/api/social/feed?${scope === "following" ? "" : `city=${scope}&`}${before ? `before=${encodeURIComponent(before)}` : ""}`;
  const load = useCallback(async () => {
    const n = ++req.current;
    setPage(null);
    const r = await fetch(feedUrl(), { cache: "no-store" }).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    if (n === req.current) setPage(r ?? { posts: [], authors: {}, next: null });
  }, [scope]); // eslint-disable-line react-hooks/exhaustive-deps
  const loadStories = useCallback(() => fetch("/api/social/stories", { cache: "no-store" }).then((x) => (x.ok ? x.json() : null)).then((r) => r && setRings(r)).catch(() => null), []);
  useEffect(() => { if (social.profile) void load(); }, [load, social.profile]);
  useEffect(() => { if (social.profile) void loadStories(); }, [loadStories, social.profile]);
  async function more() {
    if (!page?.next) return;
    setLoadingMore(true);
    const r: Page | null = await fetch(feedUrl(page.next), { cache: "no-store" }).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    setLoadingMore(false);
    if (r) setPage({ posts: [...page.posts, ...r.posts.filter((x) => !page.posts.some((y) => y.id === x.id))], authors: { ...page.authors, ...r.authors }, next: r.next });
  }
  if (!social.profile) return (
    <div className="card gp-empty"><span aria-hidden="true">📸</span><b>{t.scCreateTitle}</b><p className="hint" style={{ margin: 0 }}>{t.scCreateSub}</p><button className="btn press" style={{ width: "auto", marginTop: 8 }} onClick={onEdit}>{t.scCreate}</button></div>
  );
  const me = social.profile;
  const chips = [...new Set([...me.cities, ...myCities])].filter((c) => cities[c]);
  const evCity = scope !== "following" ? scope : chips[0] ?? null;
  return (
    <section className="stack pf-feed" style={{ gap: 12 }}>
      {(() => { const bar = <StoriesBar t={t} me={me} rings={rings.rings} authors={rings.authors} seen={seen} onOpen={setViewer} onAdd={() => setComp("story")} />; return storySlot ? createPortal(bar, storySlot) : bar; })()}
      <button className="pf-new" onClick={() => setComp("post")}><Avatar p={me} size={36} /><span>{t.pfShare}</span><b aria-hidden="true"><I icon={Camera} size={22} /></b></button>
      <div className="ex-chips pf-scope">
        <button className={scope === "following" ? "on" : ""} onClick={() => setScope("following")}>👥 {t.pfFollowing}</button>
        {[...chips, ...(scope !== "following" && !chips.includes(scope) ? [scope] : [])].map((c) => <button key={c} className={scope === c ? "on" : ""} onClick={() => setScope(c)}>📍 {cities[c]}</button>)}
        <button className={`pf-city-pick ${picking ? "on" : ""}`} onClick={() => setPicking(!picking)}>＋ {t.pfOtherCity}</button>
      </div>
      {picking && <SearchPick placeholder={t.spCity} value={null} onChange={(v) => { if (v) { setScope(v); setPicking(false); } }}
        options={Object.entries(cities).sort((x, y) => x[1].localeCompare(y[1])).map(([id, n]) => ({ value: id, label: n, icon: "📍" }))} />}
      {page === null && <div className="pf-skel card" aria-hidden="true" />}
      {page && page.posts.length === 0 && <><div className="card gp-empty"><span aria-hidden="true">🌅</span><b>{t.pfEmpty}</b><p className="hint" style={{ margin: 0 }}>{t.pfEmptyF}</p></div>
        <SuggestStrip t={t} locale={locale} />{evCity && <EventsStrip t={t} locale={locale} city={evCity} cityName={cities[evCity]} />}</>}
      {page?.posts.map((p, i) => page.authors[p.handle] && (
        <Fragment key={p.id}>
          <PostCard t={t} locale={locale} post={p} author={page.authors[p.handle]} cities={cities}
            onDeleted={() => setPage({ ...page, posts: page.posts.filter((x) => x.id !== p.id) })} />
          {i === 1 && scope === "following" && <SuggestStrip t={t} locale={locale} />}
          {i === 4 && evCity && <EventsStrip t={t} locale={locale} city={evCity} cityName={cities[evCity]} />}
        </Fragment>
      ))}
      {page?.next && <button className="btn ghost press" disabled={loadingMore} onClick={() => void more()}>{loadingMore ? "…" : t.pfMore}</button>}
      {viewer !== null && <StoryViewer t={t} locale={locale} rings={rings.rings} authors={rings.authors} start={viewer} onSeen={mark} onChanged={loadStories} onClose={() => setViewer(null)} />}
      {comp && <Composer t={t} social={social} cities={cities} defaultCity={scope !== "following" ? scope : me.cities[0] ?? null} startKind={comp}
        onClose={(c) => { setComp(null); if (c === "post" || c === "video") void load(); if (c === "story") void loadStories(); }} />}
    </section>
  );
}

/* ---------- Perfil de outro viajante: histórias e grelha de publicações ---------- */
export function ProfilePosts({ t, locale, handle, cities, author }: { t: Dict; locale: Locale; handle: string; cities: Record<string, string>; author: PublicProfile }) {
  const [page, setPage] = useState<Page | null>(null);
  const [open, setOpen] = useState<PostItem | null>(null);
  const [reel, setReel] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/social/u/${encodeURIComponent(handle)}/posts`, { cache: "no-store" }).then((x) => (x.ok ? x.json() : null)).then((r) => setPage(r ?? { posts: [], authors: {}, next: null })).catch(() => setPage({ posts: [], authors: {}, next: null }));
  }, [handle]);
  async function more() {
    if (!page?.next) return;
    const r: Page | null = await fetch(`/api/social/u/${encodeURIComponent(handle)}/posts?before=${encodeURIComponent(page.next)}`).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    if (r) setPage({ posts: [...page.posts, ...r.posts], authors: { ...page.authors, ...r.authors }, next: r.next });
  }
  return (
    <section className="stack" style={{ gap: 10 }}>
      <h2 className="gp-h2">📸 {t.pfPostsT} {page && <small className="hint num">· {page.posts.length}{page.next ? "+" : ""}</small>}</h2>
      {page === null && <div className="pf-grid">{[0, 1, 2].map((i) => <span key={i} className="pf-tile sk" />)}</div>}
      {page && page.posts.length === 0 && <p className="hint">{t.pfNoPosts}</p>}
      {page && page.posts.length > 0 && <div className="pf-grid">{page.posts.map((p) => (
        <button key={p.id} className="pf-tile" onClick={() => (p.video === "ready" ? setReel(p.id) : setOpen(p))} aria-label={p.text.slice(0, 60) || t.pfPost}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {p.video === "ready" ? <><img src={posterUrl(p.id)} alt="" loading="lazy" /><span className="pf-tile-v" aria-hidden="true"><I icon={Play} size={14} solid /></span></>
            : p.video ? <span className="pf-tile-t">{p.video === "processing" ? "⏳" : "⚠️"}</span>
            : p.photo ? <><TileImg src={photoUrl(p.id)} text={p.text} />{(p.photos ?? 1) > 1 && <span className="pf-tile-v" aria-hidden="true">❐</span>}</> : <span className="pf-tile-t"><span>{p.text}</span></span>}
          {p.likes > 0 && <small className="pf-tile-l"><I icon={Heart} size={12} solid /> {p.likes}</small>}
        </button>
      ))}</div>}
      {page?.next && <button className="btn ghost press" onClick={() => void more()}>{t.pfMore}</button>}
      {reel && <ReelsViewer t={t} locale={locale} cities={cities} handle={handle} startId={reel} onClose={() => setReel(null)} />}
      {open && (
        <div className="sheet-bg" onClick={() => setOpen(null)}>
          <div className="sheet pf-one" onClick={(e) => e.stopPropagation()}>
            <SheetX onClose={() => setOpen(null)} label={t.close} />
            <PostCard t={t} locale={locale} post={open} author={page?.authors[open.handle] ?? author} cities={cities}
              onDeleted={() => { setPage(page ? { ...page, posts: page.posts.filter((x) => x.id !== open.id) } : page); setOpen(null); }} />
          </div>
        </div>
      )}
    </section>
  );
}

/** Anel de histórias no perfil de outro viajante (abre o visualizador). */
export function ProfileStories({ t, locale, handle, author, size = 84 }: { t: Dict; locale: Locale; handle: string; author: PublicProfile; size?: number }) {
  const [r, setR] = useState<{ rings: Ring[]; authors: Record<string, PublicProfile> } | null>(null);
  const [open, setOpen] = useState(false);
  const { seen, mark } = useSeen();
  useEffect(() => { fetch(`/api/social/stories?handle=${encodeURIComponent(handle)}`, { cache: "no-store" }).then((x) => (x.ok ? x.json() : null)).then(setR).catch(() => null); }, [handle]);
  const ring = r?.rings[0];
  if (!ring) return <Avatar p={author} size={size} />;
  return <>
    <StoryRing p={author} size={size} state={ring.items.every((x) => seen.includes(x.id)) ? "seen" : "new"} onClick={() => setOpen(true)} label={author.name} />
    {open && r && <StoryViewer t={t} locale={locale} rings={r.rings} authors={r.authors} start={0} onSeen={mark} onClose={() => setOpen(false)} />}
  </>;
}

/* ---------- No meio do feed: viajantes sugeridos e o que há na cidade ---------- */
type Suggest = PublicProfile & { relation: "none" | "requested" | "following" | "self" | "blocked"; shared: number };
export function SuggestStrip({ t, locale }: { t: Dict; locale: Locale }) {
  const [list, setList] = useState<Suggest[] | null>(null);
  useEffect(() => { fetch("/api/social/search?q=").then((r) => (r.ok ? r.json() : null)).then((j) => setList((j?.people ?? []).filter((p: Suggest) => p.relation === "none").slice(0, 10))).catch(() => setList([])); }, []);
  if (!list || list.length === 0) return null;
  return (
    <section className="fs">
      <div className="row-between"><b className="fs-h">{t.fsSuggested}</b><a className="link-btn" href={`/${locale}/wallet#explore`}>{t.wSeeAll}</a></div>
      <div className="fs-row">{list.map((p) => (
        <div key={p.handle} className="fs-card">
          <a href={`/${locale}/u/${p.handle}`} className="stack" style={{ alignItems: "center", gap: 4, textDecoration: "none", color: "inherit" }}>
            <Avatar p={p} size={64} /><b className="ad-ellip">{p.name}<Verified handle={p.handle} /></b><small className="hint ad-ellip">@{p.handle}</small>
          </a>
          <FollowBtn t={t} handle={p.handle} rel={p.relation} />
        </div>
      ))}</div>
    </section>
  );
}

type Ev = { id: string; name: string; start: string; localDate: string; localTime: string | null; kind: string; venue: string | null; image: string | null; priceMin: number | null; currency: string | null; free?: boolean };
export function EventsStrip({ t, locale, city, cityName }: { t: Dict; locale: Locale; city: string; cityName: string }) {
  const [list, setList] = useState<Ev[] | null>(null);
  useEffect(() => { fetch(`/api/events?city=${city}`).then((r) => (r.ok ? r.json() : null)).then((j) => setList((j?.events ?? []).slice(0, 10))).catch(() => setList([])); }, [city]);
  if (!list || list.length === 0) return null;
  const df = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
  const price = (e: Ev) => (e.free ? `🆓 ${t.exFreeEntry}` : e.priceMin ? new Intl.NumberFormat(locale, { style: "currency", currency: e.currency ?? "EUR", maximumFractionDigits: 0 }).format(e.priceMin) : "");
  return (
    <section className="fs">
      <div className="row-between"><b className="fs-h">📅 {fmt(t.fsWhatsOn, { c: cityName })}</b><a className="link-btn" href={`/${locale}/wallet/agenda?city=${city}`}>{t.wSeeAll}</a></div>
      <div className="fs-row">{list.map((e) => (
        <a key={e.id} className="fs-ev" href={`/${locale}/wallet/agenda?city=${city}&ev=${encodeURIComponent(e.id)}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {e.image ? <img src={e.image} alt="" loading="lazy" /> : <span className="fs-ev-ph">🎟</span>}
          <span className="fs-ev-b"><b>{e.name}</b><small>{df(e.localDate)}{e.localTime ? ` · ${e.localTime}` : ""}</small>{price(e) && <i>{price(e)}</i>}</span>
        </a>
      ))}</div>
    </section>
  );
}
