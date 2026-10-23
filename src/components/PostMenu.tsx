"use client";
/**
 * Menu "⋯" de uma publicação, ao estilo de uma folha de ações do iOS: grupos arredondados,
 * ícones à esquerda, ação destrutiva a vermelho e "Cancelar" separado em baixo.
 * Autor: editar, fixar, arquivar, ocultar gostos, desligar comentários, partilhar, copiar link, apagar.
 * Outros: guardar, partilhar, copiar link, ocultar, silenciar a conta, denunciar.
 */
import { useEffect, useRef, useState } from "react";
import {
  Archive, ArchiveRestore, Bookmark, BookmarkMinus, EyeOff, Flag, Heart, HeartOff, Link2, MessageCircle, MessageCircleOff,
  Pencil, Pin, PinOff, Share, Trash2, VolumeX, ChevronRight, ChevronLeft, type LucideIcon
} from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import Portal from "./Portal";

export type MenuPost = {
  id: string; mine: boolean; saved?: boolean; text: string; photo: boolean; video?: string | null;
  archived?: boolean; pinned?: boolean; hideLikes?: boolean; commentsOff?: boolean;
};
type Patch = Partial<Omit<MenuPost, "id" | "mine" | "video">>;
type Act = (body: Record<string, string>) => Promise<{ error?: string; text?: string } | null>;
type Row = { k: string; I: LucideIcon; label: string; sub?: string; red?: boolean; go?: boolean; run: () => void };

export function PostMenu({ t, locale, p, handle, act, onPatch, onShare, onDelete, onHide, onMute, onClose, toast }: {
  t: Dict; locale: Locale; p: MenuPost; handle: string; act: Act;
  onPatch: (x: Partial<Omit<MenuPost, "id" | "mine" | "video">>) => void; onShare: () => void; onDelete: () => void; onHide: () => void; onMute: () => void;
  onClose: () => void; toast: (s: string, err?: boolean) => void;
}) {
  const m = t.pm;
  const [view, setView] = useState<"main" | "delete" | "report" | "edit">("main");
  const [txt, setTxt] = useState(p.text);
  const [busy, setBusy] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (view === "edit") ta.current?.focus(); }, [view]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  /** Alteração otimista: aplica já, desfaz se o servidor recusar. */
  async function flip(action: string, patch: Patch, undo: Patch, ok: string) {
    onClose(); onPatch(patch);
    const r = await act({ action });
    if (!r || r.error) { onPatch(undo); toast(r?.error === "too_many" ? m.tTooMany : t.tsError, true); return; }
    toast(ok);
  }
  async function copy() {
    onClose();
    const url = `${location.origin}/${locale}/wallet#post:${p.id}`;
    try { await navigator.clipboard.writeText(url); toast(m.tCopied); } catch { toast(t.tsError, true); }
  }
  async function saveEdit() {
    setBusy(true);
    const r = await act({ action: "edit", text: txt });
    setBusy(false);
    if (!r || r.error) { toast(r?.error === "offensive" ? t.mdOffensive : t.tsError, true); return; }
    onPatch({ text: r.text ?? txt.trim() }); onClose();
  }

  const share: Row[] = [
    { k: "share", I: Share, label: m.share, run: () => { onClose(); onShare(); } },
    { k: "copy", I: Link2, label: m.copy, run: () => void copy() }
  ];
  const groups: { h?: string; rows: Row[] }[] = p.mine ? [
    { h: m.gManage, rows: [
      { k: "edit", I: Pencil, label: m.edit, go: true, run: () => setView("edit") },
      p.pinned ? { k: "unpin", I: PinOff, label: m.unpin, run: () => void flip("unpin", { pinned: false }, { pinned: true }, m.tUnpinned) }
        : { k: "pin", I: Pin, label: m.pin, run: () => void flip("pin", { pinned: true, archived: false }, { pinned: false, archived: p.archived }, m.tPinned) },
      p.archived ? { k: "unarchive", I: ArchiveRestore, label: m.unarchive, run: () => void flip("unarchive", { archived: false }, { archived: true }, m.tUnarchived) }
        : { k: "archive", I: Archive, label: m.archive, sub: m.archiveSub, run: () => void flip("archive", { archived: true, pinned: false }, { archived: false, pinned: p.pinned }, m.tArchived) }
    ] },
    { rows: [
      p.hideLikes ? { k: "showlikes", I: Heart, label: m.showLikes, run: () => void flip("showlikes", { hideLikes: false }, { hideLikes: true }, m.tLikesOn) }
        : { k: "hidelikes", I: HeartOff, label: m.hideLikes, sub: m.likesSub, run: () => void flip("hidelikes", { hideLikes: true }, { hideLikes: false }, m.tLikesOff) },
      p.commentsOff ? { k: "comon", I: MessageCircle, label: m.comOn, run: () => void flip("commentson", { commentsOff: false }, { commentsOff: true }, m.tComOn) }
        : { k: "comoff", I: MessageCircleOff, label: m.comOff, run: () => void flip("commentsoff", { commentsOff: true }, { commentsOff: false }, m.tComOff) }
    ] },
    { h: m.gShare, rows: share },
    { rows: [{ k: "delete", I: Trash2, label: m.delete, red: true, go: true, run: () => setView("delete") }] }
  ] : [
    { rows: [
      p.saved ? { k: "unsave", I: BookmarkMinus, label: m.unsave, run: () => void flip("unsave", { saved: false }, { saved: true }, t.tsUnsaved) }
        : { k: "save", I: Bookmark, label: m.save, run: () => void flip("save", { saved: true }, { saved: false }, t.tsSaved) },
      ...share
    ] },
    { h: m.gFeed, rows: [
      { k: "hide", I: EyeOff, label: m.hide, sub: m.hideSub, run: () => { onClose(); onHide(); } },
      { k: "mute", I: VolumeX, label: fmt(m.mute, { h: handle }), sub: m.muteSub, run: () => { onClose(); onMute(); } }
    ] },
    { rows: [{ k: "report", I: Flag, label: m.report, red: true, go: true, run: () => setView("report") }] }
  ];

  return (
    <Portal><div className="as-bg" onClick={onClose}>
      <div className="as" role="dialog" aria-modal="true" aria-label={view === "edit" ? m.editT : m.gManage} onClick={(e) => e.stopPropagation()}>
        <span className="as-grab" aria-hidden="true" />
        {view === "main" && groups.map((g, i) => (
          <div key={i} className="as-sec">
            {g.h && <span className="as-h">{g.h}</span>}
            <div className="as-group">
              {g.rows.map((r) => (
                <button key={r.k} type="button" className={`as-row${r.red ? " red" : ""}`} onClick={r.run}>
                  <r.I size={21} strokeWidth={1.9} aria-hidden="true" />
                  <span className="as-tx"><span>{r.label}</span>{r.sub && <small>{r.sub}</small>}</span>
                  {r.go && <ChevronRight size={18} className="as-chev" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>
        ))}

        {view === "delete" && (
          <div className="as-sec">
            <div className="as-group as-confirm">
              <div className="as-msg"><b>{m.delT}</b><small>{m.delS}</small></div>
              <button type="button" className="as-row red center" onClick={() => { onClose(); onDelete(); }}>{m.delete}</button>
            </div>
          </div>
        )}

        {view === "report" && (
          <div className="as-sec">
            <button type="button" className="as-back" onClick={() => setView("main")}><ChevronLeft size={18} aria-hidden="true" />{m.report}</button>
            <span className="as-h">{m.reportT}</span>
            <div className="as-group">
              {(Object.keys(t.scReasons) as (keyof typeof t.scReasons)[]).map((r) => (
                <button key={r} type="button" className="as-row" onClick={async () => { onClose(); await act({ action: "report", reason: r }); toast(t.pfReported); }}>
                  <span className="as-tx"><span>{t.scReasons[r]}</span></span><ChevronRight size={18} className="as-chev" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {view === "edit" && (
          <div className="as-sec">
            <div className="as-edit-h">
              <button type="button" className="as-link" onClick={() => setView("main")}>{m.cancel}</button>
              <b>{m.editT}</b>
              <button type="button" className="as-link bold" disabled={busy || (!txt.trim() && !p.photo && !p.video)} onClick={() => void saveEdit()}>{busy ? "…" : m.done}</button>
            </div>
            <div className="as-group"><textarea ref={ta} className="as-ta" rows={5} maxLength={2200} value={txt} onChange={(e) => setTxt(e.target.value)} aria-label={m.editT} /></div>
            <small className="as-count num">{txt.length}/2200</small>
          </div>
        )}

        {view !== "edit" && <button type="button" className="as-cancel" onClick={() => (view === "main" ? onClose() : setView("main"))}>{m.cancel}</button>}
      </div>
    </div></Portal>
  );
}

