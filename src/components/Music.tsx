"use client";
/**
 * Música nas publicações e histórias: biblioteca "VOYBU Originals" (faixas da casa, sem direitos de terceiros)
 * ou som próprio (o autor confirma que tem os direitos). Um só som a tocar de cada vez, com o som ligado/desligado partilhado.
 */
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Check, Plus, Upload, Volume2, VolumeX, X } from "lucide-react";
import { fmt } from "@/i18n/core";
import type { Dict } from "@/i18n/dictionaries";
import { MUSIC, MUSIC_ARTIST, type Track } from "@/data/music";
import { claim, isMuted, onMuted, release, setMuted } from "@/lib/media-bus";
import Portal from "@/components/Portal";

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

/* ---------- Escolher música (escuro, estilo "estúdio": faixa em destaque, visualizador e lista) ---------- */
const BARS = Array.from({ length: 36 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45)));
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function MusicPicker({ t, current, onPick, onClose }: { t: Dict; current: PickedMusic | null; onPick: (m: PickedMusic | null) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"lib" | "own">(current && "own" in current ? "own" : "lib");
  const chosenId = current && "lib" in current ? current.lib : null;
  const [focus, setFocus] = useState<string>(chosenId ?? MUSIC[0].id);   // faixa em destaque
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [mood, setMood] = useState<Track["mood"] | "all">("all");
  const a = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const el = new Audio(); a.current = el;
    el.ontimeupdate = () => setPos(el.currentTime);
    el.onplay = () => setPlaying(true);
    el.onpause = () => setPlaying(false);
    el.onended = () => { setPlaying(false); setPos(0); };
    return () => { el.pause(); release(el); };
  }, []);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  const tr = MUSIC.find((x) => x.id === focus) ?? MUSIC[0];
  const url = (id: string) => `/music/${id}.m4a`;
  function play(id: string) {
    const el = a.current; if (!el) return;
    if (focus === id && !el.paused) { el.pause(); return; }
    if (focus !== id || !el.src.endsWith(url(id))) { el.src = url(id); setPos(0); }
    setFocus(id); void claim(el);
  }
  const pick = (m: PickedMusic) => { a.current?.pause(); onPick(m); onClose(); };
  const moods = [...new Set(MUSIC.map((x) => x.mood))];
  const list = MUSIC.filter((x) => mood === "all" || x.mood === mood);
  const dur = Math.max(1, a.current?.duration && isFinite(a.current.duration) ? a.current.duration : 30);
  const glow = { "--a1": tr.colors[0], "--a2": tr.colors[1] } as React.CSSProperties;

  return (
    <Portal><div className="mu2-bg" onClick={onClose}>
      <div className="mu2" role="dialog" aria-modal="true" aria-label={t.muTitle} onClick={(e) => e.stopPropagation()} style={glow}>
        <span className="mu2-grab" aria-hidden="true" />
        <div className="mu2-head">
          <div><b>{t.muTitle}</b><small>{MUSIC_ARTIST} · {fmt(t.mu2.tracks, { n: MUSIC.length })}</small></div>
          <button type="button" className="mu2-x" onClick={onClose} aria-label={t.close}><X size={18} aria-hidden="true" /></button>
        </div>
        <div className="mu2-seg" role="tablist">
          <button role="tab" aria-selected={tab === "lib"} className={tab === "lib" ? "on" : ""} onClick={() => setTab("lib")}>{t.muOriginals}</button>
          <button role="tab" aria-selected={tab === "own"} className={tab === "own" ? "on" : ""} onClick={() => { a.current?.pause(); setTab("own"); }}>{t.muOwn}</button>
        </div>

        {tab === "lib" ? <>
          <section className={`mu2-hero ${playing ? "on" : ""}`} aria-live="polite">
            <div className="mu2-top">
              <button type="button" className="mu2-art" onClick={() => play(tr.id)} aria-label={playing ? "Pause" : "Play"}>
                <span className="mu2-halo" aria-hidden="true" />
                <span className="mu2-disc" aria-hidden="true"><i /></span>
                <span className="mu2-pp">{playing ? <Pause size={26} fill="currentColor" aria-hidden="true" /> : <Play size={26} fill="currentColor" aria-hidden="true" />}</span>
              </button>
              <div className="mu2-meta">
                <small className="mu2-state">{playing ? t.mu2.playing : pos > 0 ? t.mu2.paused : t.mu2.tap}</small>
                <b>{tr.title}</b>
                <span>{t.muMood[tr.mood]} · {tr.bpm} BPM</span>
              </div>
            </div>
            <div className="mu2-viz" aria-hidden="true">
              {BARS.map((h, i) => <i key={i} style={{ "--h": h, "--d": `${0.6 + (i % 5) * 0.13}s`, "--o": `${(i % 7) * -0.11}s` } as React.CSSProperties} className={i / BARS.length <= pos / dur ? "past" : ""} />)}
            </div>
            <div className="mu2-time num"><span>{clock(pos)}</span><span>{clock(dur)}</span></div>
            {chosenId === tr.id
              ? <button type="button" className="mu2-cta done" onClick={onClose}><Check size={18} aria-hidden="true" /> {t.mu2.selected}</button>
              : <button type="button" className="mu2-cta" onClick={() => pick({ lib: tr.id, title: tr.title, artist: MUSIC_ARTIST, url: url(tr.id) })}>{t.mu2.useThis}</button>}
          </section>

          <div className="mu2-chips" role="tablist">
            <button className={mood === "all" ? "on" : ""} onClick={() => setMood("all")}>{t.mu2.all}</button>
            {moods.map((m) => <button key={m} className={mood === m ? "on" : ""} onClick={() => setMood(m)}>{t.muMood[m]}</button>)}
          </div>

          <ul className="mu2-list">
            {list.map((x) => {
              const on = focus === x.id, live = on && playing, chosen = chosenId === x.id;
              return (
                <li key={x.id} className={`${on ? "on" : ""} ${chosen ? "chosen" : ""}`}>
                  <button type="button" className="mu2-row" onClick={() => play(x.id)} aria-label={`${x.title} · ${live ? "Pause" : "Play"}`}>
                    <span className="mu2-mini" style={{ "--a1": x.colors[0], "--a2": x.colors[1] } as React.CSSProperties}>
                      {live ? <span className="mu-eq on" aria-hidden="true"><i /><i /><i /><i /></span> : <Play size={14} fill="currentColor" aria-hidden="true" />}
                    </span>
                    <span className="mu2-rt"><b>{x.title}</b><small>{t.muMood[x.mood]} · {x.bpm} BPM</small></span>
                    <small className="mu2-len num">0:30</small>
                  </button>
                  <button type="button" className={`mu2-add ${chosen ? "on" : ""}`} aria-label={chosen ? t.mu2.selected : t.muUse}
                    onClick={() => (chosen ? onClose() : pick({ lib: x.id, title: x.title, artist: MUSIC_ARTIST, url: url(x.id) }))}>
                    {chosen ? <Check size={16} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <small className="mu2-foot">{t.mu2.free}</small>
        </> : <div className="mu2-own"><OwnSound t={t} onPick={pick} /></div>}
        {current && <button className="mu2-remove" onClick={() => { a.current?.pause(); onPick(null); onClose(); }}>{t.muRemove}</button>}
      </div>
    </div></Portal>
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
