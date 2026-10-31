"use client";
/**
 * Atualizações dos viajantes (estilo Waze): ver, confirmar ("ainda está / já não está"), denunciar e acrescentar
 * sinais, mudanças de caminho, avisos, alertas, dicas e fotos/vídeos numa cidade ou paragem.
 */
import { signedStatus } from "@/lib/signed";
import { useCallback, useEffect, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { compressPhoto } from "@/lib/trip-local";
import type { PublicUpdate, UpdateKind } from "@/lib/updates";
import Portal from "./Portal";

export const UPDATE_ICON: Record<UpdateKind, string> = { sign: "🪧", path: "🛤", warn: "⚠️", alert: "🚨", tip: "💡", photo: "📷" };
const KINDS: UpdateKind[] = ["alert", "warn", "sign", "path", "tip", "photo"];
const REASONS = ["false", "offensive", "spam", "danger", "privacy", "other"] as const;

function ago(iso: string, locale: Locale) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  const rtf = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], { numeric: "auto" });
  return m < 60 ? rtf.format(-Math.max(1, m), "minute") : m < 1440 ? rtf.format(-Math.round(m / 60), "hour") : rtf.format(-Math.round(m / 1440), "day");
}

export function useUpdates(city: string, stop?: string) {
  const [list, setList] = useState<PublicUpdate[] | null>(null);
  const load = useCallback(() => {
    fetch(`/api/updates?city=${city}${stop ? `&stop=${stop}` : ""}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null))
      .then((j: { list?: PublicUpdate[] } | null) => setList(j?.list ?? [])).catch(() => setList([]));
  }, [city, stop]);
  useEffect(load, [load]);
  return { list, reload: load, setList };
}

function UpdateCard({ u, t, locale, stops, signed, onChange }: { u: PublicUpdate; t: Dict; locale: Locale; stops: Record<string, string>; signed: boolean; onChange: (u: PublicUpdate | null) => void }) {
  const [reporting, setReporting] = useState(false);
  const [msg, setMsg] = useState("");
  const [zoom, setZoom] = useState(false);
  async function vote(v: 1 | -1) {
    if (!signed || u.mine) return;
    const r = await fetch(`/api/updates/${u.id}/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ v }) }).catch(() => null);
    const j = r?.ok ? await r.json() as { up: number; down: number; hidden: boolean } : null;
    if (j) onChange(j.hidden ? null : { ...u, up: j.up, down: j.down, myVote: v });
  }
  async function report(reason: string) {
    setReporting(false);
    const r = await fetch(`/api/updates/${u.id}/report`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) }).catch(() => null);
    if (r?.ok) { setMsg(t.tu.reported); const j = await r.json() as { hidden: boolean }; if (j.hidden) setTimeout(() => onChange(null), 1500); }
  }
  async function del() {
    const r = await fetch(`/api/updates/${u.id}`, { method: "DELETE" }).catch(() => null);
    if (r?.ok) onChange(null);
  }
  const exp = u.expiresAt ? new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(u.expiresAt)) : null;
  return (
    <article className={`tu-card k-${u.kind}`}>
      <header className="tu-h">
        <span className="tu-k">{UPDATE_ICON[u.kind]} {t.tu.kinds[u.kind]}</span>
        <span className="hint">{ago(u.at, locale)} · {u.by ? fmt(t.tu.by, { h: u.by }) : t.tu.anon}</span>
      </header>
      {u.text && <p className="tu-text">{u.text}</p>}
      {(u.stop && stops[u.stop]) || u.place ? <p className="tu-where">📍 {[u.stop ? stops[u.stop] : "", u.place].filter(Boolean).join(" · ")}</p> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {u.hasPhoto && <button type="button" className="tu-ph" onClick={() => setZoom(true)} aria-label={t.tu.kinds.photo}><img src={`/api/updates/${u.id}/photo`} alt="" loading="lazy" /></button>}
      <div className="tu-acts">
        {u.postId && <a className="tu-chip" href={`/${locale}/wallet#post:${u.postId}`}>{t.tu.video1}</a>}
        {u.lat !== null && u.lng !== null && <a className="tu-chip" href={`https://www.google.com/maps/search/?api=1&query=${u.lat},${u.lng}`} target="_blank" rel="noopener noreferrer">🗺 {t.tu.map}</a>}
        {exp && <span className="tu-exp">⏳ {fmt(t.tu.expires, { t: exp })}</span>}
      </div>
      <div className="tu-vote">
        <button type="button" className={u.myVote === 1 ? "on" : ""} disabled={!signed || u.mine} aria-pressed={u.myVote === 1} onClick={() => void vote(1)}>👍 {t.tu.still} <b className="num">{u.up}</b></button>
        <button type="button" className={u.myVote === -1 ? "on" : ""} disabled={!signed || u.mine} aria-pressed={u.myVote === -1} onClick={() => void vote(-1)}>👎 {t.tu.gone} <b className="num">{u.down}</b></button>
        {u.mine ? <button type="button" className="tu-more danger" onClick={() => void del()}>{t.tu.del}</button>
          : signed && <button type="button" className="tu-more" onClick={() => setReporting((x) => !x)}>⋯ {t.tu.report}</button>}
      </div>
      {reporting && <div className="tu-rep" role="group" aria-label={t.tu.reportQ}><small>{t.tu.reportQ}</small>{REASONS.map((r) => <button key={r} type="button" onClick={() => void report(r)}>{t.tu.reasons[r]}</button>)}</div>}
      {msg && <p className="hint" role="status">{msg}</p>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {zoom && <Portal><div className="tu-zoom" onClick={() => setZoom(false)} role="dialog" aria-modal="true"><img src={`/api/updates/${u.id}/photo`} alt="" /></div></Portal>}
    </article>
  );
}

function AddSheet({ t, locale, city, cityName, stops, defStop, onClose }: { t: Dict; locale: Locale; city: string; cityName: string; stops: Record<string, string>; defStop?: string; onClose: (added: boolean) => void }) {
  const [kind, setKind] = useState<UpdateKind>("tip");
  const [text, setText] = useState("");
  const [stop, setStop] = useState(defStop ?? "");
  const [place, setPlace] = useState("");
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  function locate() {
    setErr("");
    navigator.geolocation?.getCurrentPosition((p) => setPos({ lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5) }), () => setErr(t.tu.locErr), { enableHighAccuracy: true, timeout: 10_000 });
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (!text.trim() && !photo && !video) { setErr(t.tu.text); return; }
    let postId: string | null = null;
    if (video) {
      setBusy(t.tu.uploading);
      const r = await fetch(`/api/social/videos?city=${city}&text=${encodeURIComponent(text.slice(0, 500))}`, { method: "POST", headers: { "Content-Type": video.type || "video/mp4" }, body: video }).catch(() => null);
      if (r?.status === 409) { setBusy(""); setErr(t.tu.videoNeedsProfile); return; }
      const j = r?.ok ? await r.json() as { id: string } : null;
      if (!j) { setBusy(""); setErr(t.tu.err); return; }
      postId = j.id;
    }
    setBusy(t.tu.posting);
    const r = await fetch("/api/updates", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, kind, text, stop: stop || null, place, lat: pos?.lat ?? null, lng: pos?.lng ?? null, photo: photo || null, postId }) }).catch(() => null);
    setBusy("");
    if (r?.ok) { onClose(true); return; }
    const j = await r?.json().catch(() => null) as { error?: string } | null;
    setErr(j?.error === "offensive" ? t.mdOffensive : j?.error === "rate" ? t.tu.errRate : t.tu.err);
  }
  return (
    <Portal><div className="as-bg" onClick={() => onClose(false)}>
      <form className="as ps tu-add" role="dialog" aria-modal="true" aria-label={t.tu.add} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <span className="as-grab" aria-hidden="true" />
        <div className="ps-h"><span className="ps-ic" aria-hidden="true">📣</span><div className="stack" style={{ gap: 2, flex: 1 }}><b className="ps-n">{t.tu.add.replace(/^＋\s*/, "")}</b><span className="hint">{cityName}</span></div>
          <button type="button" className="mu2-x ps-x" onClick={() => onClose(false)} aria-label={t.close}>✕</button></div>
        <div className="tu-kinds" role="radiogroup">
          {KINDS.map((k) => <button key={k} type="button" role="radio" aria-checked={kind === k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>{UPDATE_ICON[k]} {t.tu.kinds[k]}</button>)}
        </div>
        <div className="field"><label htmlFor="tu-t">{t.tu.text}</label>
          <textarea id="tu-t" rows={3} maxLength={500} value={text} onChange={(e) => setText(e.target.value)} placeholder={t.tu.hints[kind]} /></div>
        <div className="grid2">
          <div className="field"><label htmlFor="tu-s">{t.tu.stop}</label>
            <select id="tu-s" value={stop} onChange={(e) => setStop(e.target.value)}><option value="">—</option>{Object.entries(stops).map(([id, n]) => <option key={id} value={id}>{n}</option>)}</select></div>
          <div className="field"><label htmlFor="tu-p">{t.tu.place}</label><input id="tu-p" maxLength={120} value={place} onChange={(e) => setPlace(e.target.value)} /></div>
        </div>
        <div className="tu-media">
          <button type="button" className={`tu-chip ${pos ? "on" : ""}`} onClick={locate}>{pos ? t.tu.locOn : t.tu.myLoc}</button>
          <label className={`tu-chip ${photo ? "on" : ""}`}>{t.tu.photo}<input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await compressPhoto(f).catch(() => "")); }} /></label>
          <label className={`tu-chip ${video ? "on" : ""}`}>{t.tu.video}<input type="file" accept="video/*" hidden onChange={(e) => setVideo(e.target.files?.[0] ?? null)} /></label>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photo && <img className="tu-prev" src={photo} alt="" />}
        {video && <p className="hint">🎬 {video.name}</p>}
        <p className="hint">{t.tu.photoNote}</p>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn press" disabled={!!busy}>{busy || t.tu.post}</button>
      </form>
    </div></Portal>
  );
}

/** Secção completa: lista + botão adicionar. `stop` filtra a uma paragem. */
/** Há sessão? (sem dados pessoais) — partilhado entre as secções da página. */
export function useSigned(given?: boolean) {
  const [s, setS] = useState(given ?? false);
  useEffect(() => {
    if (given !== undefined) { setS(given); return; }
    void signedStatus().then((v) => setS(Boolean(v)));
  }, [given]);
  return s;
}

export function TravellerUpdates({ t, locale, city, cityName, stops, signed: signedIn, stop, onChange }: { t: Dict; locale: Locale; city: string; cityName: string; stops: Record<string, string>; signed?: boolean; stop?: string; onChange?: () => void }) {
  const signed = useSigned(signedIn);
  const { list, reload, setList } = useUpdates(city, stop);
  const [adding, setAdding] = useState(false);
  const [thanks, setThanks] = useState(false);
  return (
    <section className="tu stack" style={{ gap: 12 }} aria-labelledby="tu-h">
      <div><h2 id="tu-h" className="gp-h2 sm" style={{ margin: 0 }}>📣 {t.tu.title}</h2><p className="hint" style={{ margin: "2px 0 0" }}>{t.tu.sub}</p></div>
      {signed ? <button type="button" className="btn press" onClick={() => setAdding(true)}>{t.tu.add}</button>
        : <a className="btn ghost press" href={`/${locale}/wallet`}>🔐 {t.tu.signIn}</a>}
      {thanks && <p className="note" role="status">✓ {t.tu.thanks}</p>}
      {list === null ? <div className="wl-skel" aria-hidden="true"><i /></div>
        : list.length === 0 ? <div className="card gp-empty"><span aria-hidden="true">📣</span><b>{t.tu.empty}</b></div>
        : list.map((u) => <UpdateCard key={u.id} u={u} t={t} locale={locale} stops={stops} signed={signed} onChange={(n) => { setList((l) => (l ?? []).flatMap((x) => (x.id !== u.id ? [x] : n ? [n] : []))); onChange?.(); }} />)}
      <p className="hint tu-note">{t.tu.note}</p>
      {adding && <AddSheet t={t} locale={locale} city={city} cityName={cityName} stops={stops} defStop={stop} onClose={(ok) => { setAdding(false); if (ok) { setThanks(true); reload(); onChange?.(); } }} />}
    </section>
  );
}

/** No ecrã Agora: só alertas e avisos ainda válidos da cidade da viagem (até 2), com ligação para ver todos. */
export function TravellerAlerts({ t, locale, city, cityName }: { t: Dict; locale: Locale; city: string; cityName: string }) {
  const { list } = useUpdates(city);
  const top = (list ?? []).filter((u) => u.kind === "alert" || u.kind === "warn").slice(0, 2);
  if (!top.length) return null;
  return (
    <section className="card tu-live stack" style={{ gap: 8 }} aria-label={t.tu.live}>
      <span className="now-k">📣 {t.tu.live} · {cityName}</span>
      {top.map((u) => <p key={u.id} className="tu-live-r"><b>{UPDATE_ICON[u.kind]}</b> {u.text || t.tu.kinds[u.kind]} <span className="hint">· {ago(u.at, locale)}</span></p>)}
      <a className="link-btn" href={`/${locale}/tour/${city}#updates`}>{t.tu.title} →</a>
    </section>
  );
}
