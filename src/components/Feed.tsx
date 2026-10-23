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
const PostMenu = dynamic(() => import("./PostMenu").then((m) => m.PostMenu), { ssr: false });
const ShareSheet = dynamic(() => import("./PostExtras").then((m) => m.ShareSheet), { ssr: false });
const StoryReply = dynamic(() => import("./Chat").then((m) => m.StoryReply), { ssr: false });
import { I, Heart, MessageCircle, Send, Bookmark, Ellipsis, Play, Camera } from "./Ico";
import { Archive, Pin, Grid3x3, Bookmark as BookmarkIc, ImagePlus, Clapperboard, CircleDashed, Music2, MapPin, Hash, Palette, X, Lock, Globe2, Volume2, VolumeX } from "lucide-react";
import { MusicSticker, SoundButton, usePostMusic, type PickedMusic } from "./Music";
import { toast, withUndo } from "@/lib/toast";
import { claim, isMuted, onMuted, release, setMuted } from "@/lib/media-bus";
const MusicPicker = dynamic(() => import("./Music").then((m) => m.MusicPicker), { ssr: false });
import { useLive, type LiveEvent } from "@/lib/live-client";
import Portal from "@/components/Portal";
import { QrTile } from "@/components/ProfileQR";

export type PostItem = {
  id: string; kind: "post" | "story"; handle: string; text: string; photo: boolean; city: string | null; tag: string | null; bg: string | null;
  at: string; expiresAt: string | null; likes: number; liked: boolean; comments: number; mine: boolean; canComment: boolean;
  video?: "processing" | "ready" | "failed" | null; duration?: number | null;
  photos?: number; saved?: boolean; music?: { title: string; artist: string; url: string } | null;
  archived?: boolean; pinned?: boolean; hideLikes?: boolean; commentsOff?: boolean; edited?: boolean;
};
type Page = { posts: PostItem[]; authors: Record<string, PublicProfile>; next: string | null };
export type Ring = { handle: string; items: PostItem[]; mine: boolean; last: string };
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

function StoriesBar({ t, locale, me, rings, authors, onOpen, onAdd, seen }: { t: Dict; locale: string; me: PublicProfile; rings: Ring[]; authors: Record<string, PublicProfile>; onOpen: (i: number) => void; onAdd: () => void; seen: string[] }) {
  const mineIdx = rings.findIndex((r) => r.mine);
  return (
    <div className="st-wrap" role="list">
    <div className="st-bar">
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
    <QrTile t={t} locale={locale} me={me} />
    </div>
  );
}

const REACTIONS = ["😍", "😂", "😮", "🔥", "👏", "❤️"];
export function StoryViewer({ t, locale, rings, authors, start, onClose, onSeen, onChanged, cities, hl }: {
  t: Dict; locale: Locale; rings: Ring[]; authors: Record<string, PublicProfile>; start: number; onClose: () => void; onSeen?: (id: string) => void; onChanged?: () => void; cities?: Record<string, string>;
  hl?: { title: string; paused: boolean; onMenu: (storyId: string) => void }; // a ver um destaque: título e data no topo, "Mais" em vez de apagar
}) {
  const [ri, setRi] = useState(start);
  const [ii, setIi] = useState(0);
  const [pause, setPause] = useState(false);
  const [typing, setTyping] = useState(false);
  const [viewers, setViewers] = useState<{ n: number; list: (PublicProfile & { at: string; liked: boolean })[] } | null>(null);
  const [showViewers, setShowViewers] = useState(false);
  const [burst, setBurst] = useState<string | null>(null);
  const paused = pause || typing || showViewers || Boolean(hl?.paused);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const ring = rings[ri]; const item = ring?.items[ii];
  const [muted, setMutedS] = useState(isMuted());
  const [muPlaying, setMuPlaying] = useState(false);
  const au = useRef<HTMLAudioElement | null>(null);
  useEffect(() => onMuted(setMutedS), []);
  // Abrir uma história é um toque do utilizador: liga o som se houver música (como no Instagram).
  useEffect(() => { if (rings.some((r) => r.items.some((x) => x.music))) setMuted(false); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const muUrl = item?.music?.url ?? null;
  useEffect(() => {
    if (!muUrl) return;
    const el = new Audio(muUrl); el.loop = true; au.current = el;
    el.onplay = () => setMuPlaying(true); el.onpause = () => setMuPlaying(false);
    return () => { el.pause(); release(el); au.current = null; setMuPlaying(false); };
  }, [muUrl, item?.id]);
  useEffect(() => { const el = au.current; if (!el) return; if (paused || muted) el.pause(); else void claim(el); }, [paused, muted, muUrl, item?.id]);
  const next = useCallback(() => {
    if (!ring) return onClose();
    if (ii < ring.items.length - 1) setIi(ii + 1);
    else if (ri < rings.length - 1) { setRi(ri + 1); setIi(0); }
    else onClose();
  }, [ring, ii, ri, rings.length, onClose]);
  const prev = () => { if (ii > 0) setIi(ii - 1); else if (ri > 0) { setRi(ri - 1); setIi(0); } };
  useEffect(() => { if (item) onSeen?.(item.id); }, [item, onSeen]);
  // Conta a visualização (servidor) e, nas minhas histórias, mostra quem viu.
  useEffect(() => {
    if (!item) return;
    setViewers(null);
    if (!item.mine) { void postAct(item.id, { action: "view" }); return; }
    let live = true;
    void postAct(item.id, { action: "viewers" }).then((r) => { if (live && r?.viewers) setViewers({ n: r.viewers.length, list: r.viewers }); });
    return () => { live = false; };
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  async function react(e: string) {
    if (!item) return;
    setBurst(e); setTimeout(() => setBurst(null), 900);
    try { navigator.vibrate?.(10); } catch { /* sem vibração */ }
    const r = await fetch("/api/chat/story", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ story: item.id, text: e }) }).catch(() => null);
    toast(r?.ok ? t.chSent : t.chCant, { icon: r?.ok ? e : undefined, tone: r?.ok ? "ok" : "err" });
  }
  useEffect(() => {
    if (!item || paused) return;
    const id = setTimeout(next, 5500);
    return () => clearTimeout(id);
  }, [item, paused, next]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  // Gestos: deslizar para baixo fecha; para o lado muda de pessoa.
  const sw = useRef<{ x: number; y: number } | null>(null);
  const [dragY, setDragY] = useState(0);
  const onTouchStart = (e: React.TouchEvent) => { sw.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchMove = (e: React.TouchEvent) => { const s0 = sw.current; if (!s0) return; const dy = e.touches[0].clientY - s0.y; if (dy > 0 && dy > Math.abs(e.touches[0].clientX - s0.x)) setDragY(dy); };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s0 = sw.current; sw.current = null; setDragY(0); if (!s0) return;
    const dx = e.changedTouches[0].clientX - s0.x, dy = e.changedTouches[0].clientY - s0.y;
    if (dy > 90 && dy > Math.abs(dx)) return onClose();
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      const fwd = (document.dir === "rtl" ? -dx : dx) < 0;
      if (fwd) { if (ri < rings.length - 1) { setRi(ri + 1); setIi(0); } else onClose(); }
      else if (ri > 0) { setRi(ri - 1); setIi(0); }
    }
  };
  if (!ring || !item) return null;
  const a = authors[ring.handle];
  const isLiked = liked[item.id] ?? item.liked;
  return (
    <div className="st-view" role="dialog" aria-modal="true" aria-label={a?.name} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className={`st-card ${item.photo ? "" : `sg-bg-${item.bg ?? "ocean"}`}`} style={dragY ? { transform: `translateY(${dragY}px) scale(${1 - Math.min(dragY, 300) / 1500})`, borderRadius: 18 } : undefined}
        onPointerDown={() => setPause(true)} onPointerUp={() => setPause(false)} onPointerLeave={() => setPause(false)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {item.photo && <img src={photoUrl(item.id)} alt="" className="st-img" />}
        {item.text && <p className={`st-text ${item.photo ? "cap" : ""}`}>{item.text}</p>}
        {(item.music || (item.city && cities?.[item.city])) && <div className="st-music">
          {item.music && <MusicSticker m={item.music} playing={muPlaying} dark />}
          {item.city && cities?.[item.city] && <a className="st-loc" href={`#feed:${item.city}`} onClick={onClose} onPointerDown={(e) => e.stopPropagation()}>📍 {cities[item.city]}</a>}
        </div>}
        {burst && <span className="st-burst" aria-hidden="true">{burst}</span>}
        <div className="st-prog">{ring.items.map((x, j) => <span key={x.id}><i className={j < ii ? "done" : j === ii ? (paused ? "run paused" : "run") : ""} key={`${x.id}-${j === ii ? ri : 0}`} /></span>)}</div>
        <div className="st-head">
          <a href={`/${locale}/u/${ring.handle}`} className="row" style={{ gap: 8, color: "#fff", textDecoration: "none", minWidth: 0 }}>
            {a && <Avatar p={a} size={32} />}<b className="ad-ellip">{hl ? hl.title : a?.name}</b>
            <small style={{ opacity: .8 }}>{hl ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(item.at)) : ago(item.at, locale)}</small>
          </a>
          <span className="st-hr">
            {item.music && <button type="button" className="st-snd" onPointerDown={(e) => e.stopPropagation()} onClick={() => setMuted(!muted)} aria-label={muted ? t.rlUnmute : t.rlMute}>{muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}</button>}
            <SheetX onClose={onClose} label={t.close} />
          </span>
        </div>
        <button className="st-tap l" aria-label={t.navBack} onClick={prev} />
        <button className="st-tap r" aria-label={t.navFwd} onClick={next} />
        <div className="st-foot">
          {item.mine ? (<>
            <button className="st-btn st-seen" onPointerDown={(e) => e.stopPropagation()} onClick={() => setShowViewers(true)} aria-label={t.stSeenBy}>
              <span className="st-seen-av">{viewers?.list.slice(0, 3).map((v) => <Avatar key={v.handle} p={v} size={22} />)}</span>
              👁 {viewers ? fmt(t.stSeenN, { n: viewers.n }) : "…"}
            </button>
            <span style={{ flex: 1 }} />
            {hl ? <button className="st-btn" onPointerDown={(e) => e.stopPropagation()} onClick={() => hl.onMenu(item.id)} aria-label={t.hl.more}><I icon={Ellipsis} size={18} /> {t.hl.more}</button>
              : <button className="st-btn" onClick={async () => { await postAct(item.id, { action: "delete" }); onChanged?.(); onClose(); }}>🗑 {t.pfDelete}</button>}
          </>) : (
            <>
              {!typing && <div className="st-reacts" onPointerDown={(e) => e.stopPropagation()}>{REACTIONS.map((e) => <button key={e} type="button" onClick={() => void react(e)} aria-label={`${t.stReact} ${e}`}>{e}</button>)}</div>}
              <StoryReply t={t} storyId={item.id} name={a?.name.split(" ")[0] ?? ""} onFocus={setTyping} />
              <button className={`st-btn st-like ${isLiked ? "on" : ""}`} aria-pressed={isLiked} aria-label={t.pfLike} onClick={async () => { setLiked({ ...liked, [item.id]: !isLiked }); await postAct(item.id, { action: isLiked ? "unlike" : "like" }); }}>{isLiked ? "❤️" : "🤍"}</button>
            </>
          )}
        </div>
      </div>
      {showViewers && (
        <Portal><div className="sheet-bg" style={{ zIndex: 120 }} onClick={() => setShowViewers(false)}>
          <div className="sheet stack" style={{ gap: 8 }} onClick={(e) => e.stopPropagation()}>
            <SheetX onClose={() => setShowViewers(false)} label={t.close} />
            <b style={{ fontSize: 18 }}>👁 {fmt(t.stSeenN, { n: viewers?.n ?? 0 })}</b>
            {!viewers?.list.length && <p className="hint">{t.stNoViews}</p>}
            {viewers?.list.map((v) => (
              <a key={v.handle} className="gs-row" href={`/${locale}/u/${v.handle}`}><Avatar p={v} size={40} /><span className="gs-t"><b>{v.name}</b><small>@{v.handle} · {ago(v.at, locale)}</small></span>{v.liked && <span aria-label={t.pfLike}>❤️</span>}</a>
            ))}
          </div>
        </div></Portal>
      )}
    </div>
  );
}

/* ---------- Nova publicação / história ---------- */
export function Composer({ t, social, cities, defaultCity, startKind = "post", initialText = "", onClose }: {
  t: Dict; social: Social; cities: Record<string, string>; defaultCity: string | null; startKind?: "post" | "story" | "video"; initialText?: string; onClose: (created: "post" | "story" | "video" | null) => void;
}) {
  const [kind, setKind] = useState<"post" | "story" | "video">(startKind);
  const [video, setVideo] = useState<{ file: File; url: string; secs: number } | null>(null);
  const [pct, setPct] = useState<number | null>(null);
  const capRef = useRef<HTMLTextAreaElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [more, setMore] = useState<string[]>([]);
  const [text, setText] = useState(initialText);
  const [city, setCity] = useState<string | null>(defaultCity);
  const [tag, setTag] = useState<Hobby | null>(null);
  const [bg, setBg] = useState<(typeof BGS)[number]>("ocean");
  const [busy, setBusy] = useState<"" | "photo" | "send">("");
  const [err, setErr] = useState("");
  const [tool, setTool] = useState<"photo" | "music" | "bg" | "city" | "tag" | null>(null);
  const [music, setMusic] = useState<PickedMusic | null>(null);
  const [picking, setPicking] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const prevAudio = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => { prevAudio.current?.pause(); }, []);
  useEffect(() => { prevAudio.current?.pause(); setMusicOn(false); }, [music]);
  function toggleMusic() {
    if (!music) return;
    if (!prevAudio.current) prevAudio.current = new Audio();
    const el = prevAudio.current;
    if (musicOn) { el.pause(); setMusicOn(false); return; }
    if (el.src !== new URL(music.url, location.href).href) el.src = music.url;
    el.loop = true; void claim(el); setMusicOn(true);
  }
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
      if (x.status >= 200 && x.status < 300) { toast(t.tsVideoUp, { icon: "🎬" }); return onClose("video"); }
      let j: { error?: string } = {}; try { j = JSON.parse(x.responseText); } catch { /* ignorar */ }
      setErr(j.error === "too_big" || x.status === 413 ? t.rlTooBig : j.error === "offensive" ? t.mdOffensive : j.error === "busy" || x.status === 429 ? t.rlBusy : t.pfErr);
    };
    x.onerror = () => { setBusy(""); setPct(null); setErr(t.pfErr); };
    x.send(video.file);
  }
  async function send() {
    if (kind === "video") return sendVideo();
    if (!photo && !text.trim() && !music) return;
    prevAudio.current?.pause();
    setBusy("send"); setErr("");
    const r = await fetch("/api/social/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, text: text.slice(0, max), photo, extra: kind === "post" ? more : [], city, tag, bg: kind === "story" ? bg : null,
      music: music ? ("lib" in music ? { lib: music.lib } : { own: music.own, title: music.title }) : null }) }).catch(() => null);
    const j = await r?.json().catch(() => null);
    setBusy("");
    if (r?.ok) { toast(kind === "story" ? t.tsStoryPosted : t.tsPosted, { icon: "✓" }); return onClose(kind); }
    setErr(j?.error === "too_many" ? t.pfTooMany : j?.error === "offensive" ? t.mdOffensive : t.pfErr);
  }
  const isStory = kind === "story", isVideo = kind === "video";
  const photoInput = (
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
  );
  const storyCity = kind === "story" && city && cities[city] ? cities[city] : null;
  const sticker = (music || storyCity) && <div className="cp2-sticker">{music && <MusicSticker m={music} playing={musicOn} dark onClick={toggleMusic} />}{storyCity && <span className="st-loc">📍 {storyCity}</span>}</div>;
  const tools: { k: typeof tool; icon: React.ReactNode; label: string; value?: string | null; show: boolean }[] = [
    { k: "photo", icon: <ImagePlus size={20} aria-hidden="true" />, label: photo ? (kind === "post" ? t.pfAddMore : t.pfChange) : t.pfPhoto, show: !isVideo },
    { k: "music", icon: <Music2 size={20} aria-hidden="true" />, label: music ? music.title : t.muAdd, value: music ? "on" : null, show: !isVideo },
    { k: "bg", icon: <Palette size={20} aria-hidden="true" />, label: t.pfBg, show: isStory && !photo },
    { k: "city", icon: <MapPin size={20} aria-hidden="true" />, label: city && cities[city] ? cities[city] : t.pfCity, value: city, show: true },
    { k: "tag", icon: <Hash size={20} aria-hidden="true" />, label: tag ? t.hob[tag] : t.pfTopic, value: tag, show: !isStory }
  ];
  return (
    <Portal><div className="sheet-bg" onClick={() => onClose(null)}>
      <div className="sheet cp2" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={isStory ? t.pfNewStory : t.pfNew}>
        <div className="cp2-head">
          <button type="button" className="cp2-x press" onClick={() => onClose(null)} aria-label={t.close}><X size={20} aria-hidden="true" /></button>
          <b>{isStory ? t.pfNewStory : isVideo ? t.rlNew : t.pfNew}</b>
          <button type="button" className="cp2-share press" disabled={busy !== "" || (isVideo ? !video : !photo && !text.trim() && !music)} onClick={() => void send()}>{busy === "send" ? "…" : t.pfPublish}</button>
        </div>
        <div className="seg-3 cp2-seg" role="tablist">
          {([["post", <ImagePlus key="p" size={16} aria-hidden="true" />, t.pfPost], ["video", <Clapperboard key="v" size={16} aria-hidden="true" />, t.rlVideo], ["story", <CircleDashed key="s" size={16} aria-hidden="true" />, t.pfStoryShort]] as const).map(([k, ic, label]) => (
            <button key={k} role="tab" aria-selected={kind === k} className={kind === k ? "on" : ""} onClick={() => { setKind(k); setTool(null); }}>{ic}{label}</button>
          ))}
        </div>

        {isVideo ? (
          video ? <video src={video.url} className="cp2-media" controls playsInline muted /> : (
            <label className="cp2-drop press"><span className="qi q4"><Clapperboard size={26} aria-hidden="true" /></span><b>{t.rlPick}</b><small>{t.rlRules}</small>
              <input type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void pickVideo(f); }} /></label>
          )
        ) : isStory ? (
          <div className={`cp2-story ${photo ? "" : `sg-bg-${bg}`}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {photo && <img src={photo} alt="" />}
            <p className={photo ? "cap" : ""}>{text || (photo ? "" : t.pfStoryText)}</p>
            {photo && <button type="button" className="cp2-rm" onClick={() => setPhoto(null)} aria-label={t.pfRemovePhoto}><X size={16} aria-hidden="true" /></button>}
            {sticker}
          </div>
        ) : photo ? (
          <div className="cp2-photos">
            {[photo, ...more].map((src, i) => (
              <span key={i} className={`cp2-ph ${more.length ? "" : "one"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" />
                <button type="button" className="cp2-rm" aria-label={t.pfRemovePhoto} onClick={() => { if (i === 0) { setPhoto(more[0] ?? null); setMore(more.slice(1)); } else setMore(more.filter((_, k) => k !== i - 1)); }}><X size={14} aria-hidden="true" /></button>
              </span>
            ))}
            {more.length < 5 && <label className="cp2-ph add press"><ImagePlus size={24} aria-hidden="true" />{photoInput}</label>}
            {sticker}
          </div>
        ) : (
          <label className="cp2-drop press"><span className="qi q1"><ImagePlus size={26} aria-hidden="true" /></span><b>{busy === "photo" ? t.pfPhotoBusy : t.pfPhotos}</b><small>{t.pfOrText}</small>{photoInput}</label>
        )}
        {!isStory && !isVideo && !photo && sticker}
        {pct !== null && <div className="pf-up"><i style={{ width: `${pct}%` }} /><span>{fmt(t.rlUploading, { n: pct })}</span></div>}
        {isVideo && video && video.secs > 60 && <small className="hint">✂️ {t.rlTrim}</small>}

        <div className="cp2-cap">
          <textarea ref={capRef} rows={isStory ? 2 : 3} maxLength={max} placeholder={isStory ? t.pfStoryText : t.pfCaption} value={text} onChange={(e) => setText(e.target.value)} aria-label={t.pfCaption} />
          <span className="cp2-cap-f"><EmojiButton target={capRef} value={text} set={setText} max={max} labels={emojiLabels(t)} /><small className="hint num">{text.length}/{max}</small></span>
        </div>

        <div className="cp2-tools">
          {tools.filter((x) => x.show).map((x) => (
            x.k === "photo" ? (
              <label key={x.k} className="cp2-tool press">{x.icon}<span>{busy === "photo" ? t.pfPhotoBusy : x.label}</span>{photoInput}</label>
            ) : (
              <button key={x.k} type="button" className={`cp2-tool press ${tool === x.k ? "open" : ""} ${x.value ? "set" : ""}`} onClick={() => (x.k === "music" ? setPicking(true) : setTool(tool === x.k ? null : x.k))}>
                {x.icon}<span className="ad-ellip">{x.label}</span>
              </button>
            )
          ))}
        </div>
        {tool === "bg" && isStory && !photo && <div className="pf-bgs">{BGS.map((b) => <button key={b} aria-label={b} aria-pressed={bg === b} className={`sg-bg-${b} ${bg === b ? "on" : ""}`} onClick={() => setBg(b)} />)}</div>}
        {tool === "city" && <SearchPick id="pfc" label={t.pfCity} placeholder={t.spCity} noneLabel={t.pfNoCity} value={city} onChange={(v) => setCity(v)}
          options={Object.entries(cities).sort((a, b) => a[1].localeCompare(b[1])).map(([id, n]) => ({ value: id, label: n, icon: "📍" }))} />}
        {tool === "tag" && !isStory && <div className="sc-chips">{HOBBIES.map((h) => <button key={h} className={`sc-chip ${tag === h ? "on" : ""}`} onClick={() => setTag(tag === h ? null : h)}>{HOBBY_ICON[h]} {t.hob[h]}</button>)}</div>}

        <p className="cp2-who">{social.profile?.isPrivate ? <Lock size={14} aria-hidden="true" /> : <Globe2 size={14} aria-hidden="true" />}{social.profile?.isPrivate ? t.pfWhoPriv : t.pfWhoPub}{isStory ? ` · ${t.pfStoryNote}` : ""}</p>
        {err && <p className="err">{err}</p>}
        <button className="btn press cp2-go" disabled={busy !== "" || (isVideo ? !video : !photo && !text.trim() && !music)} onClick={() => void send()}>{busy === "send" ? "…" : t.pfPublish}</button>
        {picking && <MusicPicker t={t} current={music} onPick={(m) => { setMusic(m); setMusicOn(false); }} onClose={() => setPicking(false)} />}
      </div>
    </div></Portal>
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
export function PostCard({ t, locale, post, author, cities, onDeleted, onMoved }: {
  t: Dict; locale: Locale; post: PostItem; author: PublicProfile; cities: Record<string, string>; onDeleted?: () => void;
  onMoved?: (p: PostItem) => void; // arquivada/reposta: a lista do perfil tira-a do separador atual
}) {
  const [p, setP] = useState(post);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Comment[] | null>(null);
  const [txt, setTxt] = useState("");
  const [menu, setMenu] = useState(false);
  const [burst, setBurst] = useState(false);
  const cRef = useRef<HTMLInputElement>(null);
  useEffect(() => setP(post), [post]);
  const [reel, setReel] = useState(false);
  const [slide, setSlide] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [gone, setGone] = useState(false);
  const mu = usePostMusic(p.video ? null : p.music?.url);
  useLive(useCallback((ev: LiveEvent) => { if (ev.t === "video" && ev.id === post.id) setP((x) => ({ ...x, video: ev.status })); }, [post.id]));
  async function toggleLike(force?: boolean) {
    const on = force ?? !p.liked;
    if (on === p.liked) return;
    setP({ ...p, liked: on, likes: p.likes + (on ? 1 : -1) });
    const r = await postAct(p.id, { action: on ? "like" : "unlike" });
    if (r?.likes !== undefined) setP((x) => ({ ...x, likes: r.likes, liked: on }));
    else if (!r) { setP((x) => ({ ...x, liked: !on, likes: x.likes + (on ? -1 : 1) })); toast(navigator.onLine ? t.tsError : t.tsOffline, { tone: "err" }); }
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
  if (gone) return null;
  return (
    <article className="card pf-card">
      <header className="pf-head">
        <a href={`/${locale}/u/${author.handle}`} className="pf-who"><Avatar p={author} size={36} />
          <span className="stack" style={{ gap: 0, minWidth: 0 }}><b className="ad-ellip">{author.name}<Verified handle={author.handle} /></b>
            <small className="hint ad-ellip">{p.city && cities[p.city] ? `📍 ${cities[p.city]} · ` : ""}{ago(p.at, locale)}</small></span></a>
        {(p.pinned || p.archived) && <span className="pf-flag">{p.archived ? <><Archive size={13} aria-hidden="true" /> {t.pm.archived}</> : <><Pin size={13} aria-hidden="true" /> {t.pm.pinned}</>}</span>}
        <button className="wl-ic pf-more" aria-label="⋯" aria-haspopup="dialog" onClick={() => setMenu(true)}><I icon={Ellipsis} size={20} /></button>
      </header>
      {p.music && !p.video && <div className="pf-music" ref={p.photo ? undefined : mu.box}><MusicSticker m={p.music} playing={mu.playing} onClick={mu.toggle} label={mu.muted ? t.rlUnmute : t.rlMute} /></div>}
      {menu && (
        <PostMenu t={t} locale={locale} p={p} handle={author.handle} act={(body) => postAct(p.id, body)} onClose={() => setMenu(false)}
          toast={(x, err) => toast(x, err ? { tone: "err" } : {})}
          onPatch={(x) => setP((cur) => { const n = { ...cur, ...x }; if ("archived" in x && x.archived !== cur.archived) onMoved?.(n); return n; })}
          onShare={() => setSharing(true)}
          onDelete={() => withUndo(t.tsDeleted, t.tsUndo, { icon: "🗑", apply: () => setGone(true), revert: () => setGone(false), commit: async () => { await postAct(p.id, { action: "delete" }); onDeleted?.(); } })}
          onHide={() => withUndo(t.pm.tHidden, t.tsUndo, { icon: "🙈", apply: () => setGone(true), revert: () => setGone(false), commit: async () => { await postAct(p.id, { action: "hide" }); } })}
          onMute={() => withUndo(fmt(t.pm.tMuted, { h: author.handle }), t.tsUndo, { icon: "🔕", apply: () => setGone(true), revert: () => setGone(false), commit: async () => { await postAct(p.id, { action: "mute" }); } })} />
      )}
      {sharing && <ShareSheet t={t} locale={locale} post={p} onClose={() => setSharing(false)} />}
      {p.video && <FeedVideo t={t} locale={locale} p={p} onOpen={() => setReel(true)} onLike={(f) => void toggleLike(f)}
        onComments={() => { setOpen(true); if (!list) void loadComments(); }} onShare={() => setSharing(true)} />}
      {reel && <ReelsViewer t={t} locale={locale} cities={cities} initial={{ posts: [p], authors: { [author.handle]: author }, next: new Date().toISOString() }} onClose={() => setReel(false)} />}
      {p.photo && (
        <div className="pf-photo" ref={p.music ? mu.box : undefined} onDoubleClick={() => { void toggleLike(true); setBurst(true); setTimeout(() => setBurst(false), 700); }}>
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
          {p.music && <SoundButton muted={mu.muted || !mu.playing} onClick={mu.toggle} t={t} />}
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
          onClick={async () => { const on = !p.saved; setP({ ...p, saved: on }); toast(on ? t.tsSaved : t.tsUnsaved, { icon: "🔖" }); const r = await postAct(p.id, { action: on ? "save" : "unsave" }); if (!r) { setP((x) => ({ ...x, saved: !on })); toast(t.tsError, { tone: "err" }); } }}><I icon={Bookmark} size={25} solid={Boolean(p.saved)} /></button>
      </div>
      <div className="pf-body">
        {p.likes > 0 && (!p.hideLikes || p.mine) && <b className="num" style={{ fontSize: 14 }}>{p.likes === 1 ? t.pfLike1 : fmt(t.pfLikes, { n: p.likes })}{p.hideLikes && <small className="hint" style={{ fontWeight: 400 }}> · {t.pm.tLikesOff}</small>}</b>}
        {p.text && <p className={p.photo ? "" : "pf-big"}><b>{author.handle}</b> <RichText text={p.text} locale={locale} />{p.edited && <small className="hint"> · {t.pm.edited}</small>}</p>}
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
            ) : <small className="hint">{p.commentsOff ? t.pm.tComOff : t.pfOnlyCircle}</small>}
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
      {(() => { const bar = <StoriesBar t={t} locale={locale} me={me} rings={rings.rings} authors={rings.authors} seen={seen} onOpen={setViewer} onAdd={() => setComp("story")} />; return storySlot ? createPortal(bar, storySlot) : bar; })()}
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
      {viewer !== null && <StoryViewer t={t} locale={locale} cities={cities} rings={rings.rings} authors={rings.authors} start={viewer} onSeen={mark} onChanged={loadStories} onClose={() => setViewer(null)} />}
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
  const [isMe, setIsMe] = useState(false);
  // Separadores como no iOS: grelha, vídeos e, no próprio perfil, guardados e arquivo.
  const [tab, setTab] = useState<"grid" | "reels" | "saved" | "archive">(() => {
    if (typeof window === "undefined") return "grid";
    const q = new URLSearchParams(location.search).get("tab");
    return q === "archive" || q === "saved" || q === "reels" ? q : "grid";
  });
  const arch = tab === "archive";
  // No Arquivo: publicações ou histórias (as histórias ficam 1 ano, só o autor vê).
  const [archKind, setArchKind] = useState<"posts" | "stories">("posts");
  const [stories, setStories] = useState<PostItem[] | null>(null);
  const [storyAt, setStoryAt] = useState<number | null>(null);
  useEffect(() => {
    if (!arch || archKind !== "stories" || stories) return;
    fetch("/api/social/highlights?archive=1", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((r) => setStories(r?.posts ?? [])).catch(() => setStories([]));
  }, [arch, archKind, stories]);
  const base = tab === "saved" ? "/api/social/saved?" : `/api/social/u/${encodeURIComponent(handle)}/posts?${arch ? "archive=1&" : ""}`;
  useEffect(() => {
    setPage(null);
    fetch(base, { cache: "no-store" }).then((x) => (x.ok ? x.json() : null)).then((r) => { setPage(r ?? { posts: [], authors: {}, next: null }); if (r?.me) setIsMe(true); }).catch(() => setPage({ posts: [], authors: {}, next: null }));
  }, [base]);
  const shownPosts = tab === "reels" ? (page?.posts ?? []).filter((x) => x.video === "ready") : page?.posts ?? [];
  const drop = (id: string) => setPage((pg) => (pg ? { ...pg, posts: pg.posts.filter((x) => x.id !== id) } : pg));
  async function more() {
    if (!page?.next) return;
    const r: Page | null = await fetch(`${base}before=${encodeURIComponent(page.next)}`).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    if (r) setPage({ posts: [...page.posts, ...r.posts], authors: { ...page.authors, ...r.authors }, next: r.next });
  }
  return (
    <section className="stack" style={{ gap: 10 }}>
      <div className="pf-tabs" role="tablist" aria-label={t.pfPostsT}>
        {([{ k: "grid", Ic: Grid3x3, label: t.pm.postsTab }, { k: "reels", Ic: Clapperboard, label: t.st.reels },
          ...(isMe ? [{ k: "saved", Ic: BookmarkIc, label: t.st.saved }, { k: "archive", Ic: Archive, label: t.pm.archiveTab }] : [])] as { k: typeof tab; Ic: typeof Archive; label: string }[]).map(({ k, Ic, label }) => (
          <button key={k} role="tab" aria-selected={tab === k} aria-label={label} title={label} className={tab === k ? "on" : ""}
            onClick={() => { setTab(k); const u = new URL(location.href); if (k === "grid") u.searchParams.delete("tab"); else u.searchParams.set("tab", k); history.replaceState(null, "", u); }}>
            <Ic size={24} strokeWidth={tab === k ? 2.2 : 1.7} aria-hidden="true" />
          </button>
        ))}
      </div>
      {arch && (
        <div className="ios-seg" role="tablist">
          <button role="tab" aria-selected={archKind === "posts"} className={archKind === "posts" ? "on" : ""} onClick={() => setArchKind("posts")}>{t.hl.posts}</button>
          <button role="tab" aria-selected={archKind === "stories"} className={archKind === "stories" ? "on" : ""} onClick={() => setArchKind("stories")}>{t.hl.stories}</button>
        </div>
      )}
      {arch && archKind === "stories" ? (<>
        <p className="hint" style={{ margin: 0 }}>{t.hl.archiveSub}</p>
        {stories === null ? <div className="pf-grid">{[0, 1, 2].map((i) => <span key={i} className="pf-tile sk" />)}</div>
          : stories.length === 0 ? <p className="hint pf-empty">{t.hl.none}</p> : (
            <div className="pf-grid hl-arch">{stories.map((x, i) => (
              <button key={x.id} className={`pf-tile hl-tile ${x.photo ? "" : `sg-bg-${x.bg ?? "ocean"}`}`} onClick={() => setStoryAt(i)} aria-label={x.text.slice(0, 60) || t.hl.stories}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {x.photo ? <img src={photoUrl(x.id)} alt="" loading="lazy" /> : <span className="hl-tile-t">{x.text}</span>}
                <small className="hl-date">{new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "2-digit" }).format(new Date(x.at))}</small>
              </button>
            ))}</div>
          )}
        {storyAt !== null && stories && <StoryViewer t={t} locale={locale} cities={cities} rings={stories.map((x) => ({ handle: x.handle, items: [x], mine: true, last: x.at }))}
          authors={{ [author.handle]: author }} start={storyAt} onClose={() => setStoryAt(null)} onChanged={() => setStories(null)} />}
      </>) : <>
      {page === null && <div className="pf-grid">{[0, 1, 2].map((i) => <span key={i} className="pf-tile sk" />)}</div>}
      {page && shownPosts.length === 0 && <p className="hint pf-empty">{arch ? t.pm.archiveEmpty : tab === "saved" ? t.svEmptySub : t.pfNoPosts}</p>}
      {page && shownPosts.length > 0 && <div className="pf-grid">{shownPosts.map((p) => (
        <button key={p.id} className="pf-tile" onClick={() => (p.video === "ready" ? setReel(p.id) : setOpen(p))} aria-label={p.text.slice(0, 60) || t.pfPost}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {p.video === "ready" ? <><img src={posterUrl(p.id)} alt="" loading="lazy" /><span className="pf-tile-v" aria-hidden="true"><I icon={Play} size={14} solid /></span></>
            : p.video ? <span className="pf-tile-t">{p.video === "processing" ? "⏳" : "⚠️"}</span>
            : p.photo ? <><TileImg src={photoUrl(p.id)} text={p.text} />{(p.photos ?? 1) > 1 && <span className="pf-tile-v" aria-hidden="true">❐</span>}</> : <span className="pf-tile-t"><span>{p.text}</span></span>}
          {p.likes > 0 && (!p.hideLikes || p.mine) && <small className="pf-tile-l"><I icon={Heart} size={12} solid /> {p.likes}</small>}
          {p.pinned && !arch && <span className="pf-tile-pin" aria-label={t.pm.pinned}><Pin size={13} aria-hidden="true" /></span>}
        </button>
      ))}</div>}
      {page?.next && <button className="btn ghost press" onClick={() => void more()}>{t.pfMore}</button>}
      </>}
      {reel && <ReelsViewer t={t} locale={locale} cities={cities} handle={handle} startId={reel} onClose={() => setReel(null)} />}
      {open && (
        <Portal><div className="sheet-bg" onClick={() => setOpen(null)}>
          <div className="sheet pf-one" onClick={(e) => e.stopPropagation()}>
            <SheetX onClose={() => setOpen(null)} label={t.close} />
            <PostCard t={t} locale={locale} post={open} author={page?.authors[open.handle] ?? author} cities={cities}
              onDeleted={() => { drop(open.id); setOpen(null); }}
              onMoved={(np) => { drop(np.id); setOpen(null); }} />
          </div>
        </div></Portal>
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
