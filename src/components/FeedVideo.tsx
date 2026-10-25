"use client";
/** Vídeo dentro do feed (leve: não carrega o ecrã inteiro nem os comentários até serem precisos). */
import { useEffect, useRef, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import type { PostItem } from "./Feed";
import { I, Heart, MessageCircle, Send, Volume2, VolumeX, Play, Pause, Maximize2 } from "./Ico";

export const videoUrl = (id: string) => `/api/social/video/${id}`;
export const posterUrl = (id: string) => `/api/social/video/${id}?poster=1`;
export const compact = (n: number, locale: Locale) => new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);

/* ---------- Vídeo no feed: toca sozinho, toque pausa, duplo toque gosta, som e expandir no próprio vídeo ---------- */
import { claim, isMuted, onMuted, release, setMuted as setFeedMuted } from "@/lib/media-bus";
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Barra de progresso que se pode arrastar para avançar/recuar. */
export function Scrub({ v, prog, label }: { v: React.RefObject<HTMLVideoElement | null>; prog: number; label: string }) {
  const [drag, setDrag] = useState<number | null>(null);
  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    let x = (e.clientX - r.left) / r.width; if (document.dir === "rtl") x = 1 - x;
    x = Math.min(1, Math.max(0, x)); setDrag(x);
    const el = v.current; if (el?.duration) el.currentTime = x * el.duration;
  };
  return (
    <div className={`vscrub ${drag !== null ? "on" : ""}`} role="slider" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((drag ?? prog) * 100)}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); seek(e); }}
      onPointerMove={(e) => { if (drag !== null) seek(e); }} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)}>
      <i style={{ width: `${(drag ?? prog) * 100}%` }}><b /></i>
    </div>
  );
}

export function FeedVideo({ t, locale, p, onOpen, onLike, onComments, onShare }: {
  t: Dict; locale: Locale; p: PostItem; onOpen: () => void; onLike: (force?: boolean) => void; onComments: () => void; onShare: () => void;
}) {
  const v = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(isMuted());
  const [paused, setPaused] = useState(true);
  const [byUser, setByUser] = useState(false);
  const [prog, setProg] = useState(0);
  const [left, setLeft] = useState(p.duration ?? 0);
  const [flash, setFlash] = useState<{ k: "play" | "pause"; at: number } | null>(null);
  const [burst, setBurst] = useState(0);
  const lastTap = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => onMuted(setMuted), []);
  useEffect(() => { if (v.current) v.current.muted = muted; }, [muted]);
  // Toca quando está bem visível (a não ser que o viajante o tenha pausado); pára quando sai do ecrã.
  useEffect(() => {
    const el = v.current; if (!el || p.video !== "ready") return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !byUser) void claim(el);
      else if (!e.isIntersecting) el.pause();
    }, { threshold: 0.65 });
    io.observe(el); return () => io.disconnect();
  }, [p.video, byUser]);
  function tap() {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      lastTap.current = 0; setBurst(now); onLike(true); return;
    }
    lastTap.current = now;
    tapTimer.current = setTimeout(() => {
      const el = v.current; if (!el) return;
      if (el.paused) { void claim(el); setByUser(false); setFlash({ k: "play", at: Date.now() }); }
      else { el.pause(); setByUser(true); setFlash({ k: "pause", at: Date.now() }); }
    }, 280);
  }
  if (p.video === "processing") return <div className="pf-vproc"><span className="rl-spin" /> {t.rlProcessing}</div>;
  if (p.video === "failed") return <div className="pf-vproc">⚠️ {t.rlFailed}</div>;
  const compactN = (n: number) => compact(n, locale);
  return (
    <div className="fv">
      <video ref={v} src={videoUrl(p.id)} poster={posterUrl(p.id)} muted={muted} playsInline loop preload="metadata" onClick={tap}
        onPlay={() => setPaused(false)} onPause={(e) => { release(e.currentTarget); setPaused(true); }}
        onTimeUpdate={(e) => { const el = e.currentTarget; if (el.duration) { setProg(el.currentTime / el.duration); setLeft(el.duration - el.currentTime); } }} />
      {paused && !flash && <span className="fv-big" aria-hidden="true"><I icon={Play} size={30} solid /></span>}
      {flash && <span key={flash.at} className="fv-flash" aria-hidden="true" onAnimationEnd={() => setFlash(null)}><I icon={flash.k === "play" ? Play : Pause} size={30} solid /></span>}
      {burst > 0 && <span key={burst} className="fv-burst" aria-hidden="true"><I icon={Heart} size={96} solid /></span>}
      <span className="fv-time num">{clock(left)}</span>
      <button className="fv-btn fv-expand" onClick={(e) => { e.stopPropagation(); onOpen(); }} aria-label={t.rlOpen} title={t.rlOpen}><I icon={Maximize2} size={18} /></button>
      <button className="fv-btn fv-vol" onClick={(e) => { e.stopPropagation(); setFeedMuted(!muted); }} aria-label={muted ? t.rlUnmute : t.rlMute} title={muted ? t.rlUnmute : t.rlMute}>
        <I icon={muted ? VolumeX : Volume2} size={18} /></button>
      <div className="fv-rail">
        <button className={`fv-act ${p.liked ? "on" : ""}`} aria-pressed={p.liked} aria-label={t.pfLike} onClick={(e) => { e.stopPropagation(); onLike(); }}><I icon={Heart} size={26} solid={p.liked} /><small className="num">{compactN(p.likes)}</small></button>
        <button className="fv-act" aria-label={t.pfComments} onClick={(e) => { e.stopPropagation(); onComments(); }}><I icon={MessageCircle} size={26} /><small className="num">{compactN(p.comments)}</small></button>
        <button className="fv-act" aria-label={t.shTitle} onClick={(e) => { e.stopPropagation(); onShare(); }}><I icon={Send} size={24} /><small>{t.rlShare}</small></button>
      </div>
      <Scrub v={v} prog={prog} label={t.rlVideo} />
    </div>
  );
}

