"use client";
/** Comentários de viajantes sobre uma cidade ou um lugar: ler, escrever, apagar os meus, denunciar. */
import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Flag, Trash2, SendHorizontal } from "lucide-react";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { SheetX } from "@/components/WinNav";
import { toast } from "@/lib/toast";
import Portal from "@/components/Portal";

type Author = { handle: string; name: string; photo: string | null };
type Item = { id: string; text: string; at: string; author: Author; mine: boolean; canDelete: boolean };

function Av({ p, size = 36 }: { p: Author; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return p.photo ? <img className="sc-av" src={p.photo} alt="" style={{ width: size, height: size }} />
    : <span className="sc-av sc-av-i" style={{ width: size, height: size, fontSize: size * 0.42 }}>{(p.name || "?").trim().charAt(0).toUpperCase()}</span>;
}
function when(iso: string, locale: Locale) {
  const s = (Date.now() - Date.parse(iso)) / 1000;
  const rtf = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], { numeric: "auto", style: "short" });
  if (s < 3600) return rtf.format(-Math.max(1, Math.round(s / 60)), "minute");
  if (s < 86400) return rtf.format(-Math.round(s / 3600), "hour");
  if (s < 86400 * 30) return rtf.format(-Math.round(s / 86400), "day");
  return new Date(iso).toLocaleDateString(INTL_LOCALE[locale], { day: "numeric", month: "short", year: "numeric" });
}

export function PlaceComments({ t, locale, city, stop = "", compact = false }: { t: Dict; locale: Locale; city: string; stop?: string; compact?: boolean }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [total, setTotal] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const [txt, setTxt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const url = (before?: string | null) => `/api/comments?city=${city}${stop ? `&stop=${stop}` : ""}${before ? `&before=${encodeURIComponent(before)}` : ""}`;
  const load = useCallback(async () => {
    const j = await fetch(url(), { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    setItems(j?.items ?? []); setTotal(j?.total ?? 0); setNext(j?.next ?? null); setSigned(Boolean(j?.signed));
  }, [city, stop]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);
  async function more() {
    const j = await fetch(url(next), { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    if (j) { setItems((x) => [...(x ?? []), ...j.items]); setNext(j.next); }
  }
  async function send(e: React.FormEvent) {
    e.preventDefault();
    const v = txt.trim(); if (!v || busy) return;
    setBusy(true); setErr("");
    const r = await fetch("/api/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ city, stop, text: v }) }).catch(() => null);
    const j = await r?.json().catch(() => null);
    setBusy(false);
    if (r?.ok && j?.comment) { setItems((x) => [j.comment, ...(x ?? [])]); setTotal((n) => n + 1); setTxt(""); return; }
    setErr(j?.error === "no_profile" ? t.cmNeedProfile : j?.error === "offensive" ? t.mdOffensive : j?.error === "limit" ? t.cmLimit : r ? t.pfErr : t.tsOffline);
  }
  async function del(id: string) {
    setItems((x) => x?.filter((c) => c.id !== id) ?? null); setTotal((n) => n - 1);
    await fetch(`/api/comments/${id}`, { method: "DELETE" }).catch(() => null);
  }
  async function report(id: string) {
    await fetch(`/api/comments/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: "other" }) }).catch(() => null);
    toast(t.cmReported, { icon: "⚑" });
  }
  return (
    <div className={`cm ${compact ? "compact" : ""}`}>
      {signed ? (
        <form className="cm-form" onSubmit={send}>
          <textarea rows={2} maxLength={600} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={t.cmPlaceholder} aria-label={t.cmPlaceholder} />
          <button className="cm-send press" disabled={busy || !txt.trim()} aria-label={t.cmSend}><SendHorizontal size={18} aria-hidden="true" /></button>
        </form>
      ) : <a className="btn ghost press cm-sign" href={`/${locale}/wallet?signin=1`}><MessageCircle size={16} aria-hidden="true" /> {t.cmSignIn}</a>}
      {err && <p className="err" style={{ margin: 0 }}>{err}</p>}
      {items === null && <p className="hint">{t.exLoading}</p>}
      {items?.length === 0 && <p className="hint cm-empty">💬 {t.cmEmpty}</p>}
      {items && items.length > 0 && <small className="hint">{total === 1 ? t.cm1 : fmt(t.cmN, { n: total })}</small>}
      <ul className="cm-list">
        {items?.map((c) => (
          <li key={c.id} className="cm-item">
            <a href={`/${locale}/u/${c.author.handle}`} aria-label={c.author.name}><Av p={c.author} /></a>
            <div className="cm-body">
              <p><a href={`/${locale}/u/${c.author.handle}`}><b>{c.author.handle}</b></a> <span className="cm-text">{c.text}</span></p>
              <small className="hint">{when(c.at, locale)}
                {c.canDelete ? <button className="cm-act" onClick={() => void del(c.id)} aria-label={t.cmDelete}><Trash2 size={13} aria-hidden="true" /> {t.cmDelete}</button>
                  : signed && <button className="cm-act" onClick={() => void report(c.id)} aria-label={t.cmReport}><Flag size={13} aria-hidden="true" /> {t.cmReport}</button>}
              </small>
            </div>
          </li>
        ))}
      </ul>
      {next && <button className="link-btn" onClick={() => void more()}>{t.cmMore}</button>}
    </div>
  );
}

/** Botão "💬 n" de um lugar do roteiro que abre os comentários numa folha. */
export function CommentsButton({ t, locale, city, stop, title, count }: { t: Dict; locale: Locale; city: string; stop: string; title: string; count: number }) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="cm-btn" onClick={() => setOpen(true)}><MessageCircle size={15} aria-hidden="true" /> {count > 0 ? (count === 1 ? t.cm1 : fmt(t.cmN, { n: count })) : t.cmTitle}</button>
    {open && (
      <Portal><div className="sheet-bg" onClick={() => setOpen(false)}>
        <div className="sheet stack" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()}>
          <SheetX onClose={() => setOpen(false)} label={t.close} />
          <b style={{ fontSize: 19 }}>💬 {title}</b>
          <PlaceComments t={t} locale={locale} city={city} stop={stop} />
        </div>
      </div></Portal>
    )}
  </>;
}
