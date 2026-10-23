"use client";
/** Centro de notificações: gostos, comentários, seguidores, pedidos, respostas a histórias. Atualiza em tempo real. */
import { useCallback, useEffect, useRef, useState } from "react";
import { fmt } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { SheetX } from "@/components/WinNav";
import { useLive } from "@/lib/live-client";
import { Avatar, act, type PublicProfile } from "./Social";
import { PostCard, ago, type PostItem } from "./Feed";
import Portal from "@/components/Portal";
import { achievementText } from "@/lib/achievement-text";
import { toast } from "@/lib/toast";
import { AtSign, Bell, ChevronLeft, ChevronRight, Film, Gift, Heart, Medal, MessageCircle, Receipt, Reply, Settings, UserCheck, UserPlus, X } from "lucide-react";

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

type Item = { id: string; type: "split" | "mention" | "like" | "comment" | "follow" | "request" | "accepted" | "story_reply" | "video_ready" | "invite_joined" | "achievement"; text: string; at: string; read: boolean; actor: PublicProfile; post: { id: string; photo: boolean; kind: string } | null; split?: string | null; me?: "following" | "requested" | "none" };

const BADGE: Partial<Record<Item["type"], { I: typeof Heart; c: string }>> = {
  like: { I: Heart, c: "#ff3b30" }, comment: { I: MessageCircle, c: "#0a84ff" }, mention: { I: AtSign, c: "#5e5ce6" }, follow: { I: UserPlus, c: "#34c759" },
  request: { I: UserPlus, c: "#34c759" }, accepted: { I: UserCheck, c: "#34c759" }, story_reply: { I: Reply, c: "#ff9f0a" }, video_ready: { I: Film, c: "#5856d6" },
  invite_joined: { I: Gift, c: "#ff2d55" }, split: { I: Receipt, c: "#30b0c7" }
};

export function NotifsSheet({ t, locale, cities, onClose, onRead }: { t: Dict; locale: Locale; cities: Record<string, string>; onClose: () => void; onRead: () => void }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [post, setPost] = useState<{ p: PostItem; a: PublicProfile } | null | "none">(null);
  const [view, setView] = useState<"all" | "requests">("all");
  const [state, setState] = useState<Record<string, "accepted" | "declined">>({}); // por handle
  const [rel, setRel] = useState<Record<string, "following" | "requested">>({});   // seguir de volta
  const newIds = useRef<Set<string> | null>(null);
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
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);

  async function openPost(id: string) {
    setPost(null);
    const j = await fetch(`/api/social/post/${id}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    const p = j?.posts?.[0];
    setPost(p ? { p, a: j.authors[p.handle] } : "none");
  }
  function go(n: Item) {
    if (n.type === "achievement") { onClose(); location.hash = "points"; return; }
    if (n.type === "story_reply") { onClose(); location.hash = `chat:${n.actor.handle}`; return; }
    if (n.type === "split" && n.split) { onClose(); location.hash = `split:${n.split}`; return; }
    if (n.post && n.type !== "follow") return void openPost(n.post.id);
    location.href = `/${locale}/u/${n.actor.handle}`;
  }
  async function answer(n: Item, ok: boolean) {
    setState((x) => ({ ...x, [n.actor.handle]: ok ? "accepted" : "declined" }));
    const r = await act(n.actor.handle, ok ? "accept" : "decline");
    if (!r?.ok) { setState((x) => { const c = { ...x }; delete c[n.actor.handle]; return c; }); toast(t.tsError, { tone: "err" }); return; }
    toast(ok ? t.nt2.accepted : t.nt2.declined, { icon: ok ? "✓" : "🗑" });
  }
  async function followBack(n: Item) {
    const r = await act(n.actor.handle, "follow");
    if (r?.relation) setRel((x) => ({ ...x, [n.actor.handle]: r.relation === "following" ? "following" : "requested" }));
  }
  const isNew = (n: Item) => !n.read || Boolean(newIds.current?.has(n.id));
  const requests = (items ?? []).filter((n) => n.type === "request" && state[n.actor.handle] !== "declined");
  const pending = requests.filter((n) => !state[n.actor.handle]);
  const rest = (items ?? []).filter((n) => n.type !== "request");
  const now = Date.now(), DAY = 86_400_000;
  const buckets: [string, Item[]][] = [
    [t.nt2.today, rest.filter((n) => now - Date.parse(n.at) < DAY)],
    [t.nt2.week, rest.filter((n) => { const a = now - Date.parse(n.at); return a >= DAY && a < 7 * DAY; })],
    [t.nt2.month, rest.filter((n) => { const a = now - Date.parse(n.at); return a >= 7 * DAY && a < 30 * DAY; })],
    [t.nt2.older, rest.filter((n) => now - Date.parse(n.at) >= 30 * DAY)]
  ];
  const who = (g: Group) => g.actors.length === 1 ? g.actors[0].name
    : g.actors.length === 2 ? fmt(t.ntAnd, { a: g.actors[0].name, b: g.actors[1].name })
    : fmt(t.ntOthers, { a: g.actors[0].name, k: g.actors.length - 1 });
  /** Texto com o nome a negrito. */
  const sentence = (g: Group) => {
    const n = g.lead;
    if (n.type === "achievement") return <span>{achievementText(n.text, t)}</span>;
    const tpl = g.actors.length > 1 && (n.type === "like" || n.type === "comment" || n.type === "follow") ? t.ntMany[n.type] : t.ntTypes[n.type as Exclude<typeof n.type, "achievement">];
    if (!tpl.includes("{n}")) return <span>{fmt(tpl, { x: n.text })}</span>;
    const [a, b = ""] = tpl.split("{n}");
    return <span>{fmt(a, { x: n.text })}<b>{who(g)}</b>{fmt(b, { x: n.text })}</span>;
  };
  const short = (iso: string) => ago(iso, locale);
  const followBtn = (n: Item) => {
    const r = rel[n.actor.handle] ?? (n.me === "following" ? "following" : n.me === "requested" ? "requested" : null);
    return r ? <span className="nt2-btn ghost static">{r === "following" ? t.nt2.following : t.nt2.requested}</span>
      : <button type="button" className="nt2-btn" onClick={() => void followBack(n)}>{t.nt2.followBack}</button>;
  };
  const row = (g: Group) => {
    const n = g.lead, bd = BADGE[n.type];
    return (
      <li key={n.id} className={`nt2-row ${isNew(n) ? "new" : ""}`}>
        <span className="nt2-av">
          {n.type === "achievement" ? <span className="nt2-medal" aria-hidden="true"><Medal size={22} /></span>
            : g.actors.length > 1 ? <span className="nt2-pair" aria-hidden="true">{g.actors.slice(0, 2).map((a) => <Avatar key={a.handle} p={a} size={34} />)}</span>
              : <a href={`/${locale}/u/${n.actor.handle}`} aria-label={n.actor.name}><Avatar p={n.actor} size={46} /></a>}
          {bd && <i className="nt2-type" style={{ background: bd.c }} aria-hidden="true"><bd.I size={11} strokeWidth={2.6} /></i>}
        </span>
        <button type="button" className="nt2-txt" onClick={() => go(n)}>{sentence(g)} <small>{short(n.at)}</small></button>
        {n.type === "follow" && g.actors.length === 1 ? followBtn(n)
          : n.post?.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="nt2-thumb" src={`/api/social/photo/${n.post.id}`} alt="" loading="lazy" onClick={() => go(n)} />
          ) : null}
      </li>
    );
  };
  const reqRow = (n: Item) => {
    const st = state[n.actor.handle];
    return (
      <li key={n.id} className="nt2-row">
        <span className="nt2-av"><a href={`/${locale}/u/${n.actor.handle}`}><Avatar p={n.actor} size={46} /></a></span>
        <a className="nt2-txt nt2-who" href={`/${locale}/u/${n.actor.handle}`}><b>{n.actor.name}</b><small>@{n.actor.handle}</small></a>
        {st === "accepted" ? followBtn(n) : (
          <span className="nt2-acts">
            <button type="button" className="nt2-btn" onClick={() => void answer(n, true)}>{t.nt2.confirm}</button>
            <button type="button" className="nt2-btn ghost" onClick={() => void answer(n, false)}>{t.nt2.delete}</button>
          </span>
        )}
      </li>
    );
  };

  return (
    <Portal><div className="nt2-bg" onClick={onClose}>
      <div className="nt2" role="dialog" aria-modal="true" aria-label={t.ntTitle} onClick={(e) => e.stopPropagation()}>
        <span className="mu2-grab nt2-grab" aria-hidden="true" />
        <div className="nt2-head">
          {view === "requests"
            ? <button type="button" className="nt2-back" onClick={() => setView("all")} aria-label={t.navBack}><ChevronLeft size={26} aria-hidden="true" /></button> : null}
          <b>{view === "requests" ? t.nt2.requests : t.ntTitle}</b>
          <button type="button" className="nt2-x" onClick={onClose} aria-label={t.close}><X size={18} aria-hidden="true" /></button>
        </div>

        {items === null && <div className="nt2-skel">{[0, 1, 2, 3].map((i) => <span key={i} />)}</div>}

        {items && view === "all" && <>
          {pending.length > 0 && (
            <button type="button" className="nt2-req" onClick={() => setView("requests")}>
              <span className="nt2-pair big" aria-hidden="true">{pending.slice(0, 2).map((n) => <Avatar key={n.id} p={n.actor} size={38} />)}</span>
              <span className="nt2-req-t"><b>{t.nt2.requests}</b><small>{pending.length === 1 ? pending[0].actor.name : fmt(t.ntOthers, { a: pending[0].actor.name, k: pending.length - 1 })}</small></span>
              <span className="nt2-count num">{pending.length}</span>
              <ChevronRight size={18} className="nt2-chev" aria-hidden="true" />
            </button>
          )}
          {items.length === 0 && <div className="nt2-empty"><span aria-hidden="true"><Bell size={30} /></span><b>{t.ntEmpty}</b><small>{t.ntEmptySub}</small></div>}
          {buckets.map(([title, list]) => list.length > 0 && (
            <section key={title} className="nt2-sec">
              <span className="nt2-h">{title}</span>
              <ul className="nt2-list">{group(list).map(row)}</ul>
            </section>
          ))}
          <a className="nt2-set" href={`/${locale}/wallet/account#st:notifs`}><Settings size={18} aria-hidden="true" /><span>{t.ntSettings}</span><ChevronRight size={18} className="nt2-chev" aria-hidden="true" /></a>
        </>}

        {items && view === "requests" && (
          requests.length === 0 ? <div className="nt2-empty"><span aria-hidden="true"><UserCheck size={30} /></span><b>{t.nt2.none}</b></div>
            : <ul className="nt2-list">{requests.map(reqRow)}</ul>
        )}
      </div>
      {post !== null && (
        <div className="sheet-bg" style={{ zIndex: 1001 }} onClick={(e) => { e.stopPropagation(); setPost(null); }}>
          <div className="sheet pf-one" onClick={(e) => e.stopPropagation()}>
            <SheetX onClose={() => setPost(null)} label={t.close} />
            {post === "none" ? <p className="hint" style={{ padding: 24 }}>{t.scNotFound}</p>
              : <PostCard t={t} locale={locale} post={post.p} author={post.a} cities={cities} onDeleted={() => setPost(null)} />}
          </div>
        </div>
      )}
    </div></Portal>
  );
}
