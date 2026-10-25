"use client";
/**
 * Foto de perfil: criar um avatar (fundo + símbolo ou iniciais), usar uma foto ou um momento de um vídeo,
 * com zoom, enquadramento por arrasto e estilos (vivo, P&B, ilustração). Tudo no telemóvel, sem enviar o original.
 */
import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/i18n/dictionaries";
import Portal from "./Portal";
import { SheetX } from "./WinNav";

const SIZE = 320;
export const AV_BGS = [
  ["#ff6b4a", "#ffb36b"], ["#102A43", "#3b6fa0"], ["#14a38b", "#56d8c3"], ["#7b5cd6", "#b89cff"],
  ["#e5484d", "#ff9a8b"], ["#0f9d58", "#a8e063"], ["#f7b733", "#fc4a1a"], ["#232526", "#606c88"]
] as const;
export const AV_SYMBOLS = ["✈️", "🧳", "🌍", "🗺️", "🏝️", "🏔️", "🗼", "🎒", "📸", "🚆", "⛵", "🌇", "🍜", "🎨", "⚽", "🌸"] as const;
type Filter = "none" | "vivid" | "mono" | "art";

export const initialsOf = (name: string) => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "V";

/** Aplica o estilo aos píxeis (sem ctx.filter, que o Safari antigo ignora). */
export function stylize(d: Uint8ClampedArray, f: Filter) {
  if (f === "none") return;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    if (f === "mono") { const v = Math.min(255, Math.max(0, (y - 128) * 1.1 + 128)); r = g = b = v; }
    else {
      const k = f === "art" ? 1.7 : 1.45; // saturação
      r = y + (r - y) * k; g = y + (g - y) * k; b = y + (b - y) * k;
      const c = f === "art" ? 1.25 : 1.12; // contraste
      r = (r - 128) * c + 128; g = (g - 128) * c + 128; b = (b - 128) * c + 128;
      if (f === "art") { const q = 255 / 5; r = Math.round(r / q) * q; g = Math.round(g / q) * q; b = Math.round(b / q) * q; } // posterização
    }
    d[i] = Math.min(255, Math.max(0, r)); d[i + 1] = Math.min(255, Math.max(0, g)); d[i + 2] = Math.min(255, Math.max(0, b));
  }
}

function toJpeg(c: HTMLCanvasElement) {
  let q = 0.86, out = c.toDataURL("image/jpeg", q);
  while (out.length > 130_000 && q > 0.4) { q -= 0.08; out = c.toDataURL("image/jpeg", q); }
  return out;
}

export function AvatarStudio({ t, name, onDone, onClose }: { t: Dict; name: string; onDone: (dataUrl: string) => void; onClose: () => void }) {
  const a = t.trv.av;
  const [tab, setTab] = useState<"create" | "photo" | "video">("create");
  const [bg, setBg] = useState(0);
  const [sym, setSym] = useState<string>("initials");
  const [src, setSrc] = useState<HTMLCanvasElement | HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState<Filter>("none");
  const [vid, setVid] = useState<{ url: string; dur: number; at: number } | null>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  // Desenha a pré-visualização sempre que algo muda.
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d")!; c.width = SIZE; c.height = SIZE;
    if ((tab === "photo" || tab === "video") && src) {
      const w = src instanceof HTMLImageElement ? src.naturalWidth : src.width, h = src instanceof HTMLImageElement ? src.naturalHeight : src.height;
      const base = SIZE / Math.min(w, h), s = base * zoom;
      const dw = w * s, dh = h * s;
      const maxX = Math.max(0, (dw - SIZE) / 2), maxY = Math.max(0, (dh - SIZE) / 2);
      const x = (SIZE - dw) / 2 + Math.max(-maxX, Math.min(maxX, pan.x)), y = (SIZE - dh) / 2 + Math.max(-maxY, Math.min(maxY, pan.y));
      ctx.fillStyle = "#111"; ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.drawImage(src, x, y, dw, dh);
      if (filter !== "none") { const img = ctx.getImageData(0, 0, SIZE, SIZE); stylize(img.data, filter); ctx.putImageData(img, 0, 0); }
    } else {
      const [c1, c2] = AV_BGS[bg];
      const gr = ctx.createLinearGradient(0, 0, SIZE, SIZE); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
      ctx.fillStyle = gr; ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (sym === "initials") { ctx.fillStyle = "#fff"; ctx.font = `800 ${SIZE * 0.4}px system-ui, -apple-system, Segoe UI, sans-serif`; ctx.fillText(initialsOf(name), SIZE / 2, SIZE / 2 + SIZE * 0.02); }
      else { ctx.font = `${SIZE * 0.5}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; ctx.fillText(sym, SIZE / 2, SIZE / 2 + SIZE * 0.03); }
    }
  }, [tab, bg, sym, src, zoom, pan, filter, name]);

  function loadImage(f: File) {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => { setSrc(img); setZoom(1); setPan({ x: 0, y: 0 }); };
    img.src = url;
  }
  function loadVideo(f: File) {
    if (vid) URL.revokeObjectURL(vid.url);
    setVid({ url: URL.createObjectURL(f), dur: 0, at: 0 }); setSrc(null); setZoom(1); setPan({ x: 0, y: 0 });
  }
  // Captura o fotograma atual do vídeo para uma tela (passa a ser a imagem de origem).
  function grab() {
    const v = video.current; if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0); setSrc(c);
  }
  useEffect(() => () => { if (vid) URL.revokeObjectURL(vid.url); }, [vid]);

  const ready = tab === "create" || Boolean(src);
  return (
    <Portal><div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack avs" style={{ gap: 14 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={a.title}>
        <SheetX onClose={onClose} label={t.close} />
        <b style={{ fontSize: 19 }}>{a.title}</b>
        <div className="avs-tabs" role="tablist">
          {(["create", "photo", "video"] as const).map((k) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); if (k === "create") setSrc(null); }}>{k === "create" ? a.create : k === "photo" ? a.photo : a.video}</button>)}
        </div>

        <div className="avs-stage">
          <canvas ref={cv} className="avs-cv" width={SIZE} height={SIZE} aria-label={a.title}
            onPointerDown={(e) => { if (!src) return; (e.target as HTMLElement).setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }; }}
            onPointerMove={(e) => { const d = drag.current; if (!d) return; const k = SIZE / (e.currentTarget as HTMLCanvasElement).clientWidth; setPan({ x: d.px + (e.clientX - d.x) * k, y: d.py + (e.clientY - d.y) * k }); }}
            onPointerUp={() => { drag.current = null; }} />
          {src && <small className="hint">{a.drag}</small>}
        </div>

        {tab === "create" && <>
          <span className="bp-h">{a.bg}</span>
          <div className="avs-row">{AV_BGS.map(([c1, c2], i) => <button key={i} type="button" aria-label={`${a.bg} ${i + 1}`} aria-pressed={bg === i} className={`avs-bg ${bg === i ? "on" : ""}`} style={{ background: `linear-gradient(135deg,${c1},${c2})` }} onClick={() => setBg(i)} />)}</div>
          <span className="bp-h">{a.symbol}</span>
          <div className="avs-row wrap">
            <button type="button" aria-pressed={sym === "initials"} className={`avs-sym ini ${sym === "initials" ? "on" : ""}`} onClick={() => setSym("initials")}>{initialsOf(name)}</button>
            {AV_SYMBOLS.map((s) => <button key={s} type="button" aria-pressed={sym === s} className={`avs-sym ${sym === s ? "on" : ""}`} onClick={() => setSym(s)}>{s}</button>)}
          </div>
        </>}

        {tab === "photo" && <label className="btn ghost press avs-pick">{a.pickPhoto}<input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) loadImage(f); }} /></label>}
        {tab === "video" && <>
          <label className="btn ghost press avs-pick">{a.pickVideo}<input type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) loadVideo(f); }} /></label>
          {vid && <>
            <video ref={video} src={vid.url} muted playsInline preload="auto" className="avs-video"
              onLoadedMetadata={(e) => { const d = e.currentTarget.duration || 0; setVid((v) => (v ? { ...v, dur: d } : v)); e.currentTarget.currentTime = Math.min(0.1, d); }}
              onSeeked={grab} onLoadedData={grab} />
            <label className="field"><span className="bp-h">{a.frame}</span>
              <input type="range" min={0} max={Math.max(0.1, vid.dur)} step={0.05} value={vid.at} onChange={(e) => { const at = Number(e.target.value); setVid({ ...vid, at }); if (video.current) video.current.currentTime = at; }} /></label>
          </>}
        </>}

        {(tab === "photo" || tab === "video") && src && <>
          <label className="field"><span className="bp-h">{a.zoom}</span><input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} /></label>
          <span className="bp-h">{a.filter}</span>
          <div className="avs-row wrap">{(["none", "vivid", "mono", "art"] as const).map((f) => <button key={f} type="button" aria-pressed={filter === f} className={`avs-chip ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>{a.filters[f]}</button>)}</div>
        </>}

        <button type="button" className="btn tram press" disabled={!ready} onClick={() => { if (cv.current) onDone(toJpeg(cv.current)); }}>{a.use}</button>
      </div>
    </div></Portal>
  );
}
