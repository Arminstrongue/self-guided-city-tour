"use client";
/**
 * Destaques do perfil (como no Instagram): círculos com capa e título por baixo da bio.
 * No próprio perfil: "Novo" para criar a partir do arquivo de histórias, e no visualizador
 * "Mais" → editar, remover a história do destaque ou apagar o destaque (folha de ações iOS).
 */
import { useCallback, useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, MinusCircle } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import { toast } from "@/lib/toast";
import Portal from "./Portal";
import { StoryViewer, type PostItem, type Ring } from "./Feed";
import type { PublicProfile } from "./Social";

type HL = { id: string; title: string; cover: string | null; coverPhoto: boolean; bg: string | null; n: number };
type Open = { id: string; title: string; ring: Ring; authors: Record<string, PublicProfile> };
const photo = (id: string) => `/api/social/photo/${id}`;
const post = (body: unknown) => fetch("/api/social/highlights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  .then((r) => r.json()).catch(() => null) as Promise<{ id?: string; ok?: boolean; deleted?: boolean; error?: string } | null>;

function Cover({ h, size }: { h: Pick<HL, "cover" | "coverPhoto" | "bg" | "title">; size: number }) {
  return (
    <span className={`hl-c ${h.coverPhoto ? "" : "hl-plain"}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {h.cover && h.coverPhoto ? <img src={photo(h.cover)} alt="" loading="lazy" /> : <b>{(Array.from(h.title.replace(/^[^\p{L}\p{N}]+/u, "") || h.title)[0] ?? "").toUpperCase()}</b>}
    </span>
  );
}

export function HighlightsRow({ t, locale, handle, cities }: { t: Dict; locale: Locale; handle: string; cities: Record<string, string> }) {
  const [list, setList] = useState<HL[] | null>(null);
  const [me, setMe] = useState(false);
  const [open, setOpen] = useState<Open | null>(null);
  const [menu, setMenu] = useState<string | null>(null);   // história em que se abriu "Mais"
  const [confirm, setConfirm] = useState(false);
  const [edit, setEdit] = useState<{ id: string | null; title: string; ids: string[]; cover: string | null } | null>(null);
  const load = useCallback(() => fetch(`/api/social/highlights?handle=${encodeURIComponent(handle)}`, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null)).then((r) => { setList(r?.list ?? []); setMe(Boolean(r?.me)); }).catch(() => setList([])), [handle]);
  useEffect(() => { void load(); }, [load]);

  async function view(h: HL) {
    const r = await fetch(`/api/social/highlights?id=${h.id}`, { cache: "no-store" }).then((x) => (x.ok ? x.json() : null)).catch(() => null) as
      { id: string; title: string; handle: string; mine: boolean; items: PostItem[]; authors: Record<string, PublicProfile> } | null;
    if (!r?.items.length) { toast(t.tsError, { tone: "err" }); return; }
    setOpen({ id: r.id, title: r.title, authors: r.authors, ring: { handle: r.handle, items: r.items, mine: r.mine, last: r.items[r.items.length - 1].at } });
  }
  const closeAll = () => { setMenu(null); setConfirm(false); };

  if (list === null || (!me && list.length === 0)) return null;
  return (
    <>
      <div className="hl-row" role="list" aria-label={t.hl.title}>
        {me && (
          <button type="button" role="listitem" className="hl-i" onClick={() => setEdit({ id: null, title: "", ids: [], cover: null })}>
            <span className="hl-c hl-new" style={{ width: 66, height: 66 }}><Plus size={30} strokeWidth={1.6} aria-hidden="true" /></span>
            <small>{t.hl.new}</small>
          </button>
        )}
        {list.map((h) => (
          <button key={h.id} type="button" role="listitem" className="hl-i" onClick={() => void view(h)} aria-label={`${h.title} · ${h.n}`}>
            <span className="hl-ring"><Cover h={h} size={66} /></span>
            <small className="ad-ellip">{h.title}</small>
          </button>
        ))}
      </div>

      {open && (
        <Portal>
          <StoryViewer t={t} locale={locale} cities={cities} rings={[open.ring]} authors={open.authors} start={0} onClose={() => { setOpen(null); closeAll(); }}
            hl={{ title: open.title, paused: Boolean(menu), onMenu: (sid) => setMenu(sid) }} />
          {menu && (
            <div className="as-bg" style={{ zIndex: 200 }} onClick={closeAll}>
              <div className="as" role="dialog" aria-modal="true" aria-label={t.hl.about} onClick={(e) => e.stopPropagation()}>
                <span className="as-grab" aria-hidden="true" />
                {!confirm ? (
                  <div className="as-sec">
                    <span className="as-h">{t.hl.about}</span>
                    <div className="as-group">
                      <button type="button" className="as-row" onClick={() => { const ids = open.ring.items.map((x) => x.id); setEdit({ id: open.id, title: open.title, ids, cover: ids[0] ?? null }); setOpen(null); closeAll(); }}>
                        <Pencil size={21} strokeWidth={1.9} aria-hidden="true" /><span className="as-tx"><span>{t.hl.edit}</span></span>
                      </button>
                      <button type="button" className="as-row red" onClick={async () => {
                        const r = await post({ action: "remove", id: open.id, story: menu });
                        closeAll();
                        if (!r?.ok) { toast(t.tsError, { tone: "err" }); return; }
                        toast(r.deleted ? t.hl.tDeleted : t.hl.tRemoved);
                        const items = open.ring.items.filter((x) => x.id !== menu);
                        if (!items.length || r.deleted) setOpen(null); else setOpen({ ...open, ring: { ...open.ring, items } });
                        void load();
                      }}>
                        <MinusCircle size={21} strokeWidth={1.9} aria-hidden="true" /><span className="as-tx"><span>{t.hl.remove}</span></span>
                      </button>
                      <button type="button" className="as-row red" onClick={() => setConfirm(true)}>
                        <Trash2 size={21} strokeWidth={1.9} aria-hidden="true" /><span className="as-tx"><span>{t.hl.delete}</span></span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="as-sec">
                    <div className="as-group as-confirm">
                      <div className="as-msg"><b>{t.hl.delT}</b><small>{t.hl.delS}</small></div>
                      <button type="button" className="as-row red center" onClick={async () => { await post({ action: "delete", id: open.id }); setOpen(null); closeAll(); toast(t.hl.tDeleted); void load(); }}>{t.hl.delete}</button>
                    </div>
                  </div>
                )}
                <button type="button" className="as-cancel" onClick={closeAll}>{t.hl.cancel}</button>
              </div>
            </div>
          )}
        </Portal>
      )}

      {edit && <HighlightEditor t={t} locale={locale} init={edit} onClose={(changed) => { setEdit(null); if (changed) void load(); }} />}
    </>
  );
}

/** Criar ou editar um destaque: escolher histórias do arquivo, depois nome e capa. */
function HighlightEditor({ t, locale, init, onClose }: {
  t: Dict; locale: Locale; init: { id: string | null; title: string; ids: string[]; cover: string | null }; onClose: (changed: boolean) => void;
}) {
  const [all, setAll] = useState<PostItem[] | null>(null);
  const [sel, setSel] = useState<string[]>(init.ids);
  const [step, setStep] = useState<"pick" | "name">("pick");
  const [title, setTitle] = useState(init.title);
  const [cover, setCover] = useState<string | null>(init.cover);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch("/api/social/highlights?archive=1", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((r) => setAll(r?.posts ?? [])).catch(() => setAll([]));
  }, []);
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const df = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
  const byId = new Map((all ?? []).map((p) => [p.id, p]));
  const cov = (cover && sel.includes(cover) ? cover : sel[0]) ?? null;
  const covP = cov ? byId.get(cov) : undefined;

  async function save() {
    setBusy(true);
    const r = init.id ? await post({ action: "update", id: init.id, title, ids: sel, ...(cov ? { cover: cov } : {}) })
      : await post({ action: "create", title, ids: sel });
    if (r?.id && cov && cov !== sel[0]) await post({ action: "update", id: r.id, cover: cov });
    setBusy(false);
    if (!r || r.error) { toast(r?.error === "offensive" ? t.mdOffensive : t.tsError, { tone: "err" }); return; }
    toast(init.id ? t.hl.tSaved : t.hl.tCreated);
    onClose(true);
  }

  return (
    <Portal><div className="hl-ed" role="dialog" aria-modal="true" aria-label={init.id ? t.hl.edit : t.hl.new}>
      <div className="hl-nav">
        <button type="button" className="as-link" onClick={() => (step === "name" ? setStep("pick") : onClose(false))}>{t.hl.cancel}</button>
        <b>{step === "pick" ? t.hl.pick : init.id ? t.hl.edit : t.hl.name}</b>
        {step === "pick"
          ? <button type="button" className="as-link bold" disabled={!sel.length} onClick={() => setStep("name")}>{t.hl.next}</button>
          : <button type="button" className="as-link bold" disabled={busy || !sel.length} onClick={() => void save()}>{busy ? "…" : t.hl.done}</button>}
      </div>

      {step === "pick" ? (
        <div className="hl-body">
          {all === null && <p className="hint">…</p>}
          {all?.length === 0 && <p className="hint hl-none">{t.hl.none}</p>}
          {sel.length > 0 && <p className="hint">{fmt(t.hl.sel, { n: sel.length })}</p>}
          <div className="hl-grid">
            {all?.map((p) => {
              const n = sel.indexOf(p.id);
              return (
                <button key={p.id} type="button" className={`hl-tile ${p.photo ? "" : `sg-bg-${p.bg ?? "ocean"}`} ${n >= 0 ? "on" : ""}`} onClick={() => toggle(p.id)} aria-pressed={n >= 0}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.photo ? <img src={photo(p.id)} alt="" loading="lazy" /> : <span className="hl-tile-t">{p.text}</span>}
                  <small className="hl-date">{df.format(new Date(p.at))}</small>
                  <span className="hl-check" aria-hidden="true">{n >= 0 ? <b>{n + 1}</b> : null}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="hl-body hl-name">
          <Cover h={{ cover: cov, coverPhoto: Boolean(covP?.photo), bg: covP?.bg ?? null, title: title || t.hl.namePh }} size={108} />
          <input className="hl-in" value={title} maxLength={30} onChange={(e) => setTitle(e.target.value)} placeholder={t.hl.namePh} aria-label={t.hl.name} autoFocus />
          <span className="as-h hl-h">{t.hl.cover}</span>
          <p className="hint" style={{ margin: 0 }}>{t.hl.coverHint}</p>
          <div className="hl-strip">
            {sel.map((id) => { const p = byId.get(id); if (!p) return null; return (
              <button key={id} type="button" className={`hl-mini ${p.photo ? "" : `sg-bg-${p.bg ?? "ocean"}`} ${id === cov ? "on" : ""}`} onClick={() => setCover(id)} aria-pressed={id === cov}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.photo ? <img src={photo(id)} alt="" /> : null}
                {id === cov && <Check size={16} className="hl-mini-ok" aria-hidden="true" />}
              </button>
            ); })}
          </div>
        </div>
      )}
    </div></Portal>
  );
}
