"use client";
/**
 * Música nas publicações e histórias: biblioteca "Self Guided City Tour Originals" (faixas da casa, sem direitos de terceiros)
 * ou som próprio (o autor confirma que tem os direitos). Um só som a tocar de cada vez, com o som ligado/desligado partilhado.
 */
import { useEffect, useRef, useState } from "react";
import { Music2, Play, Pause, Check, Upload, Volume2, VolumeX } from "lucide-react";
import { fmt } from "@/i18n/core";
import type { Dict } from "@/i18n/dictionaries";
import { MUSIC, MUSIC_ARTIST, type Track } from "@/data/music";
import { claim, isMuted, onMuted, release, setMuted } from "@/lib/media-bus";
import { SheetX } from "@/components/WinNav";

export type PickedMusic = { lib: string; title: string; artist: string; url: string } | { own: string; title: string; artist: string; url: string };
type MusicView = { title: string; artist: string; url: string };

/** Etiqueta da música (com barras a mexer quando toca). */
export function MusicSticker({ m, playing = false, onClick, label, dark = false }: { m: MusicView; playing?: boolean; onClick?: () => void; label?: string; dark?: boolean }) {
  const inner = <>
    <span className={`mu-eq ${playing ? "on" : ""}`} aria-hidden="true"><i /><i /><i /><i /></span>
    <span className="mu-st-t"><b>{m.title}</b>{m.artist && <small> · {m.artist}</small>}</span>
  </>;
  return onClick
    ? <button type="button" className={`mu-st ${dark ? "dark" : ""}`} onClick={onClick} aria-label={label ?? m.title}>{inner}</button>
    : <span className={`mu-st ${dark ? "dark" : ""}`}>{inner}</span>;
}

/** Toca a música de uma publicação quando está visível e o som está ligado. */
export function usePostMusic(url: string | null | undefined) {
  const box = useRef<HTMLDivElement | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const [muted, setM] = useState(isMuted());
  const [playing, setPlaying] = useState(false);
  const visible = useRef(false);
  useEffect(() => onMuted(setM), []);
  useEffect(() => {
    if (!url) return;
    const a = new Audio(); a.src = url; a.loop = true; a.preload = "none"; audio.current = a;
    a.onplay = () => setPlaying(true); a.onpause = () => { setPlaying(false); release(a); };
    return () => { a.pause(); release(a); audio.current = null; };
  }, [url]);
  useEffect(() => {
    const el = box.current, a = audio.current; if (!el || !a) return;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
      if (e.isIntersecting && !isMuted()) void claim(a); else a.pause();
    }, { threshold: 0.65 });
    io.observe(el); return () => io.disconnect();
  }, [url]);
  useEffect(() => { const a = audio.current; if (!a) return; if (muted) a.pause(); else if (visible.current) void claim(a); }, [muted]);
  const toggle = () => { const a = audio.current; if (!a) return; if (muted) { setMuted(false); void claim(a); } else if (a.paused) void claim(a); else setMuted(true); };
  return { box, playing, muted, toggle };
}

/** Botão de som por cima da foto de uma publicação com música. */
export function SoundButton({ muted, onClick, t }: { muted: boolean; onClick: () => void; t: Dict }) {
  return <button type="button" className="fv-btn mu-sound" onClick={(e) => { e.stopPropagation(); onClick(); }} aria-label={muted ? t.rlUnmute : t.rlMute} title={muted ? t.rlUnmute : t.rlMute}>
    {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}</button>;
}

/* ---------- Escolher música ---------- */
export function MusicPicker({ t, current, onPick, onClose }: { t: Dict; current: PickedMusic | null; onPick: (m: PickedMusic | null) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"lib" | "own">(current && "own" in current ? "own" : "lib");
  const [preview, setPreview] = useState<string | null>(null);
  const a = useRef<HTMLAudioElement | null>(null);
  useEffect(() => { a.current = new Audio(); return () => { a.current?.pause(); }; }, []);
  function play(id: string, url: string, start = 0) {
    const el = a.current; if (!el) return;
    if (preview === id) { el.pause(); setPreview(null); return; }
    el.src = url; el.currentTime = start; void claim(el); setPreview(id);
    el.onended = () => setPreview(null);
  }
  const pick = (m: PickedMusic) => { a.current?.pause(); onPick(m); onClose(); };
  return (
    <div className="sheet-bg" style={{ zIndex: 97 }} onClick={onClose}>
      <div className="sheet stack mu-pick" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={onClose} label={t.close} />
        <b style={{ fontSize: 19 }} className="row"><span className="qi q4 sm"><Music2 size={16} aria-hidden="true" /></span>{t.muTitle}</b>
        <div className="seg-2" role="tablist">
          <button role="tab" aria-selected={tab === "lib"} className={tab === "lib" ? "on" : ""} onClick={() => setTab("lib")}>{t.muOriginals}</button>
          <button role="tab" aria-selected={tab === "own"} className={tab === "own" ? "on" : ""} onClick={() => setTab("own")}>{t.muOwn}</button>
        </div>
        {tab === "lib" ? (
          <div className="stack" style={{ gap: 8 }}>
            <small className="hint">{t.muOriginalsSub}</small>
            {MUSIC.map((tr) => <TrackRow key={tr.id} t={t} tr={tr} on={preview === tr.id} chosen={Boolean(current && "lib" in current && current.lib === tr.id)}
              onPlay={() => play(tr.id, `/music/${tr.id}.m4a`)} onUse={() => pick({ lib: tr.id, title: tr.title, artist: MUSIC_ARTIST, url: `/music/${tr.id}.m4a` })} />)}
          </div>
        ) : <OwnSound t={t} onPick={pick} />}
        {current && <button className="btn ghost press" onClick={() => { a.current?.pause(); onPick(null); onClose(); }}>{t.muRemove}</button>}
      </div>
    </div>
  );
}

function TrackRow({ t, tr, on, chosen, onPlay, onUse }: { t: Dict; tr: Track; on: boolean; chosen: boolean; onPlay: () => void; onUse: () => void }) {
  return (
    <div className={`mu-row ${chosen ? "chosen" : ""}`}>
      <button type="button" className="mu-cover press" style={{ background: `linear-gradient(135deg,${tr.colors[0]},${tr.colors[1]})` }} onClick={onPlay} aria-label={on ? "Pause" : "Play"}>
        {on ? <Pause size={20} fill="currentColor" aria-hidden="true" /> : <Play size={20} fill="currentColor" aria-hidden="true" />}
      </button>
      <span className="stack" style={{ gap: 1, flex: 1, minWidth: 0 }}>
        <b className="ad-ellip">{tr.title}</b>
        <small className="hint">{t.muMood[tr.mood]} · {tr.bpm} BPM · 0:30</small>
      </span>
      <span className={`mu-eq ${on ? "on" : ""}`} aria-hidden="true"><i /><i /><i /><i /></span>
      <button type="button" className={`sc-follow ${chosen ? "" : "on"}`} onClick={onUse}>{chosen ? <Check size={16} aria-hidden="true" /> : t.muUse}</button>
    </div>
  );
}

function OwnSound({ t, onPick }: { t: Dict; onPick: (m: PickedMusic) => void }) {
  const [file, setFile] = useState<{ f: File; url: string; dur: number } | null>(null);
  const [start, setStart] = useState(0);
  const [title, setTitle] = useState("");
  const [rights, setRights] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [playing, setPlaying] = useState(false);
  const a = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => { a.current?.pause(); if (file) URL.revokeObjectURL(file.url); }, [file]);
  async function choose(f: File) {
    setErr("");
    if (f.size > 20 * 1024 * 1024) return setErr(t.muTooBig);
    const url = URL.createObjectURL(f);
    const dur = await new Promise<number>((res) => { const x = new Audio(); x.preload = "metadata"; x.onloadedmetadata = () => res(x.duration || 0); x.onerror = () => res(0); x.src = url; });
    setFile({ f, url, dur }); setStart(0); setTitle(f.name.replace(/\.[^.]+$/, "").slice(0, 60));
  }
  function listen() {
    if (!file) return;
    if (!a.current) a.current = new Audio();
    const el = a.current;
    if (playing) { el.pause(); setPlaying(false); return; }
    el.src = file.url; el.currentTime = start; void claim(el); setPlaying(true);
    const stopAt = start + 30;
    el.ontimeupdate = () => { if (el.currentTime >= stopAt) { el.pause(); setPlaying(false); } };
  }
  async function upload() {
    if (!file || !rights) return;
    setBusy(true); setErr("");
    const r = await fetch(`/api/social/music?start=${start.toFixed(1)}`, { method: "POST", headers: { "Content-Type": file.f.type || "audio/mpeg" }, body: file.f }).catch(() => null);
    const j = await r?.json().catch(() => null);
    setBusy(false);
    if (!j?.id) return setErr(j?.error === "too_big" ? t.muTooBig : t.muErr);
    a.current?.pause();
    onPick({ own: j.id, title: title.trim() || t.muOwn, artist: "", url: file.url });
  }
  const max = Math.max(0, (file?.dur ?? 0) - 30);
  const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return (
    <div className="stack" style={{ gap: 10 }}>
      <small className="hint">{t.muOwnSub}</small>
      <label className="mu-drop press">
        <Upload size={20} aria-hidden="true" /><b>{file ? file.f.name : t.muChoose}</b>
        <input type="file" accept="audio/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void choose(f); }} />
      </label>
      {file && <>
        <div className="field"><label htmlFor="mu-n">{t.muName}</label><input id="mu-n" value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} /></div>
        {max > 0 && <div className="stack" style={{ gap: 4 }}>
          <small className="hint num">{fmt(t.muStart, { s: clock(start) })} → {clock(Math.min(file.dur, start + 30))}</small>
          <input type="range" className="mu-range" min={0} max={max} step={0.5} value={start} onChange={(e) => { setStart(Number(e.target.value)); a.current?.pause(); setPlaying(false); }} aria-label={t.muStartLabel} />
        </div>}
        <button type="button" className="btn ghost press" onClick={listen}>{playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />} {t.listen}</button>
        <label className="row mu-rights"><input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} /><span>{t.muRights}</span></label>
        {err && <small className="ch-warn">{err}</small>}
        <button className="btn press" disabled={!rights || busy} onClick={() => void upload()}>{busy ? t.muUploading : t.muUse}</button>
      </>}
      {!file && err && <small className="ch-warn">{err}</small>}
    </div>
  );
}
