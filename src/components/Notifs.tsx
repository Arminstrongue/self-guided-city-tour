"use client";
/** Centro de notificações: gostos, comentários, seguidores, pedidos, respostas a histórias. Atualiza em tempo real. */
import { useCallback, useEffect, useRef, useState } from "react";
import { fmt } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { SheetX } from "@/components/WinNav";
import { useLive } from "@/lib/live-client";
import { Avatar, act, type PublicProfile } from "./Social";
import { PostCard, ago, type PostItem } from "./Feed";

/** Agrupa gostos na mesma publicação e novos seguidores: "Ana e mais 3 gostaram da sua publicação". */
type Group = { lead: Item; actors: PublicProfile[] };
function group(list: Item[]): Group[] {
  const out: Group[] = []; const by = new Map<string, Group>();
  for (const n of list) {
    const k = n.type === "like" && n.post ? `like:${n.post.id}` : n.type === "follow" ? "follow" : n.type === "video_ready" ? null : n.type === "comment" && n.post ? `comment:${n.post.id}` : null;
    const g = k ? by.get(k) : undefined;
    if (g) { if (!g.actors.some((a) => a.handle === n.actor.handle)) g.actors.push(n.actor); continue; }
    const ng = { lead: n, actors: [n.actor] }; out.push(ng); if (k) by.set(k, ng);
  }
  return out;
}

type Item = { id: string; type: "split" | "mention" | "like" | "comment" | "follow" | "request" | "accepted" | "story_reply" | "video_ready" | "invite_joined"; text: string; at: string; read: boolean; actor: PublicProfile; post: { id: string; photo: boolean; kind: string } | null; split?: string | null };

export function NotifsSheet({ t, locale, cities, onClose, onRead }: { t: Dict; locale: Locale; cities: Record<string, string>; onClose: () => void; onRead: () => void }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [post, setPost] = useState<{ p: PostItem; a: PublicProfile } | null | "none">(null);
  const [done, setDone] = useState<Record<string, string>>({});
  const newIds = useRef<Set<string> | null>(null); // as que estavam por ler quando abriu
  const load = useCallback(async () => {
    const j = await fetch("/api/me/notifications", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    const list: Item[] = j?.items ?? [];
    if (!newIds.current) newIds.current = new Set(list.filter((n) => !n.read).map((n) => n.id));
    else list.forEach((n) => { if (!n.read) newIds.current!.add(n.id); });
    setItems(list);
    await fetch("/api/me/notifications", { method: "POST" }).catch(() => null);
    onRead();
  }, [onRead]);
  useEffect(() => { void load(); }, [load]);
  useLive(useCallback((ev) => { if (ev.t === "notif") void load(); }, [load]));

  async function openPost(id: string) {
    setPost(null);
    const j = await fetch(`/api/social/post/${id}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    const p = j?.posts?.[0];
    setPost(p ? { p, a: j.authors[p.handle] } : "none");
  }
  function go(n: Item) {
    if (n.type === "story_reply") { onClose(); location.hash = `chat:${n.actor.handle}`; return; }
    if (n.type === "split" && n.split) { onClose(); location.hash = `split:${n.split}`; return; }
    if (n.post && n.type !== "follow") return void openPost(n.post.id);
    location.href = `/${locale}/u/${n.actor.handle}`;
  }
  const isNew = (n: Item) => !n.read || Boolean(newIds.current?.has(n.id));
  const fresh = group(items?.filter(isNew) ?? []);
  const old = group(items?.filter((n) => !isNew(n)) ?? []);
  const who = (g: Group) => g.actors.length === 1 ? g.actors[0].name
    : g.actors.length === 2 ? fmt(t.ntAnd, { a: g.actors[0].name, b: g.actors[1].name })
    : fmt(t.ntOthers, { a: g.actors[0].name, k: g.actors.length - 1 });
  const row = (g: Group) => { const n = g.lead; return (
    <div key={n.id} className={`nt-row ${isNew(n) ? "new" : ""}`}>
      {g.actors.length > 1
        ? <span className="nt-stack" aria-hidden="true">{g.actors.slice(0, 2).map((a) => <Avatar key={a.handle} p={a} size={32} />)}</span>
        : <a href={`/${locale}/u/${n.actor.handle}`} aria-label={n.actor.name}><Avatar p={n.actor} size={44} /></a>}
      <button className="nt-txt" onClick={() => go(n)}>
        <span>{fmt(g.actors.length > 1 && (n.type === "like" || n.type === "comment" || n.type === "follow") ? t.ntMany[n.type] : t.ntTypes[n.type], { n: who(g), x: n.text })}</span>
        <small className="hint">{ago(n.at, locale)}</small>
      </button>
      {n.type === "request" ? (
        done[n.id] ? <small className="hint">{done[n.id]}</small> : (
          <span className="row" style={{ gap: 6, flexWrap: "nowrap" }}>
            <button className="sc-follow on" onClick={async () => { await act(n.actor.handle, "accept"); setDone({ ...done, [n.id]: "✓" }); }}>{t.scAccept}</button>
            <button className="sc-follow" aria-label={t.close} onClick={async () => { await act(n.actor.handle, "decline"); setDone({ ...done, [n.id]: "—" }); }}>✕</button>
          </span>
        )
      ) : n.post?.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="nt-thumb" src={`/api/social/photo/${n.post.id}`} alt="" loading="lazy" onClick={() => go(n)} />
      ) : null}
    </div>
  ); };
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack nt-sheet" style={{ gap: 10 }} onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={onClose} label={t.close} />
        <b style={{ fontSize: 19 }}>🔔 {t.ntTitle}</b>
        {items === null && <p className="hint">{t.exLoading}</p>}
        {items?.length === 0 && <div className="gp-empty"><span aria-hidden="true">🔔</span><b>{t.ntEmpty}</b><p className="hint" style={{ margin: 0 }}>{t.ntEmptySub}</p></div>}
        {fresh.length > 0 && <><b className="ex-day">{t.ntNew}</b>{fresh.map(row)}</>}
        {old.length > 0 && <><b className="ex-day">{t.ntEarlier}</b>{old.map(row)}</>}
        <a className="link-btn" href={`/${locale}/wallet/account#notifications`} style={{ fontSize: 13 }}>⚙︎ {t.ntSettings}</a>
      </div>
      {post !== null && (
        <div className="sheet-bg" style={{ zIndex: 95 }} onClick={(e) => { e.stopPropagation(); setPost(null); }}>
          <div className="sheet pf-one" onClick={(e) => e.stopPropagation()}>
            <SheetX onClose={() => setPost(null)} label={t.close} />
            {post === "none" ? <p className="hint" style={{ padding: 24 }}>{t.scNotFound}</p>
              : <PostCard t={t} locale={locale} post={post.p} author={post.a} cities={cities} onDeleted={() => setPost(null)} />}
          </div>
        </div>
      )}
    </div>
  );
}
