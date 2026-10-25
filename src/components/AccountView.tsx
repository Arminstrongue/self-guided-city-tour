"use client";
import { Coins, SunMoon } from "lucide-react";
import { CURRENCIES, CURRENCY_COOKIE } from "@/lib/currency";
import { myCurrency } from "./TravelTools";
import { useDict } from "@/i18n/client-dict";
/**
 * "Definições e atividade" ao estilo do iOS: pesquisa no topo, secções agrupadas com ícones e setas,
 * e páginas de detalhe com navegação para trás. Perfil, privacidade, mensagens, bloqueados, silenciados,
 * publicações ocultadas, notificações (push), idioma, dados, sessões e apagar a conta.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Activity as ActivityIc, Check, Star, Type, Plus, X, Heart, MessageCircle as CommentIc, Archive, Bell, Bookmark, Ban, ChevronLeft, ChevronRight, CircleHelp, Download, EyeOff, FileText, Info, Languages, Lock,
  LogOut, MessageCircle, MonitorSmartphone, Search, Shield, Trash2, UserRound, VolumeX, WifiOff, type LucideIcon
} from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { LOCALES, fmt } from "@/i18n/core";
import { posterUrl } from "./FeedVideo";
import { Avatar, ProfileEditor, act, loadSocial, type PublicProfile, type Social } from "./Social";

type Acc = {
  email: string; hasProfile: boolean; isPrivate: boolean; dmPolicy: "circle" | "following" | "none";
  notif: Partial<Record<NotifKey, boolean>>; lang: string; blocked: PublicProfile[]; muted: PublicProfile[];
  hidden: { id: string; handle: string; text: string }[]; push: { enabled: boolean; key: string };
  hiddenWords: string[]; closeFriends: (PublicProfile & { close: boolean })[];
};
type Activity = { likes: { posts: { id: string; handle: string; text: string; photo: boolean; video: string | null }[] }; comments: { id: string; text: string; at: string; postId: string; postText: string; photo: boolean; handle: string }[] };
type NotifKey = "like" | "comment" | "follow" | "message" | "story_reply" | "video";
const NOTIF_KEYS: NotifKey[] = ["message", "like", "comment", "follow", "story_reply", "video"];
type Page = "root" | "privacy" | "messages" | "blocked" | "muted" | "hidden" | "notifs" | "language" | "delete" | "activity" | "close" | "words" | "currency" | "appearance";

function b64ToBytes(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}
const langName = (l: string, inL: string) => { try { return new Intl.DisplayNames([inL], { type: "language" }).of(l) ?? l; } catch { return l; } };

type Row = { k: string; I: LucideIcon; label: string; sub?: string; value?: string; href?: string; go?: Page; run?: () => void; red?: boolean; blue?: boolean; dl?: boolean };

/** Tema da app: como o sistema, claro ou escuro (guardado neste aparelho). */
function themeNow(): "system" | "light" | "dark" { try { const v = localStorage.getItem("sgct:theme"); return v === "light" || v === "dark" ? v : "system"; } catch { return "system"; } }
function setTheme(m: "system" | "light" | "dark") {
  try { if (m === "system") localStorage.removeItem("sgct:theme"); else localStorage.setItem("sgct:theme", m); } catch { /* ignorar */ }
  if (m === "system") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = m;
}
function currencyName(c: string, locale: string) { try { return new Intl.DisplayNames([locale], { type: "currency" }).of(c) ?? c; } catch { return c; } }

export function AccountView({ t: tProp, locale }: { t?: Dict; locale: Locale }) {
  const t = useDict(tProp);
  const s = t.st;
  const [a, setA] = useState<Acc | null | "auth">(null);
  const [social, setSocial] = useState<Social | null>(null);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");
  const [pushState, setPushState] = useState<"unknown" | "on" | "off" | "denied" | "unsupported" | "ios">("unknown");
  const [del, setDel] = useState("");
  const [busy, setBusy] = useState("");
  const [page, setPage] = useState<Page>("root");
  const [q, setQ] = useState("");
  const [actv, setActv] = useState<Activity | null>(null);
  const [actTab, setActTab] = useState<"likes" | "comments">("likes");
  const [cq, setCq] = useState("");
  const [word, setWord] = useState("");
  useEffect(() => {
    if (page !== "activity" || actv) return;
    fetch("/api/me/activity", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((r) => setActv(r ?? { likes: { posts: [] }, comments: [] })).catch(() => null);
  }, [page, actv]);
  const load = async () => {
    const r = await fetch("/api/me/account", { cache: "no-store" }).catch(() => null);
    if (r?.status === 401) return setA("auth");
    setA(r?.ok ? await r.json() : null);
    setSocial(await loadSocial());
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    (async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return setPushState(ios && !standalone ? "ios" : "unsupported");
      if (Notification.permission === "denied") return setPushState("denied");
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setPushState(sub ? "on" : "off");
    })().catch(() => setPushState("unsupported"));
  }, []);
  // Navegação: o botão "voltar" do telemóvel regressa à lista principal.
  useEffect(() => {
    const f = () => setPage((h) => (location.hash.startsWith("#st:") ? (location.hash.slice(4) as Page) : h === "root" ? h : "root"));
    window.addEventListener("popstate", f); return () => window.removeEventListener("popstate", f);
  }, []);
  // Abrir diretamente uma subpágina (ex.: /wallet/account#st:notifs a partir das notificações).
  useEffect(() => { if (location.hash.startsWith("#st:")) setPage(location.hash.slice(4) as Page); }, []);
  const go = (p: Page) => { setPage(p); history.pushState(null, "", `#st:${p}`); window.scrollTo(0, 0); };
  const back = () => { if (location.hash.startsWith("#st:")) history.back(); else setPage("root"); };
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };
  async function put(v: Record<string, unknown>) {
    if (!a || a === "auth") return;
    setA({ ...a, ...v } as Acc);
    await fetch("/api/me/account", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) }).catch(() => null);
    flash(t.acSaved);
  }
  async function pushOn() {
    if (!a || a === "auth" || !a.push.key) return;
    setBusy("push");
    try {
      const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register("/sw.js"));
      await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setPushState(perm === "denied" ? "denied" : "off"); return; }
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(a.push.key) }));
      await fetch("/api/me/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub.toJSON(), lang: locale }) });
      setPushState("on"); flash(t.acPushOnDone);
    } catch { flash(t.acErr); } finally { setBusy(""); }
  }
  async function pushOff() {
    setBusy("push");
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) { await fetch("/api/me/push", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }).catch(() => null); await sub.unsubscribe().catch(() => null); }
    setPushState("off"); setBusy("");
  }
  function logout() {
    const f = document.createElement("form"); f.method = "post"; f.action = `/api/me/logout?locale=${locale}`; document.body.appendChild(f);
    void import("@/lib/offline-client").then((m) => m.clearPersonalCache()).finally(() => f.submit());
  }

  const prof = social?.profile ?? null;
  const ok = a && a !== "auth" ? a : null;
  const groups = useMemo<{ h: string; rows: Row[] }[]>(() => {
    if (!ok) return [];
    const onN = NOTIF_KEYS.filter((k) => ok.notif[k] !== false).length;
    return [
      { h: s.gUse, rows: [
        { k: "saved", I: Bookmark, label: s.saved, href: `/${locale}/wallet#saved` },
        ...(prof ? [{ k: "activity", I: ActivityIc, label: t.cf.activity, sub: t.cf.activitySub, go: "activity" as Page }] : []),
        ...(prof ? [{ k: "archive", I: Archive, label: s.archive, href: `/${locale}/u/${prof.handle}?tab=archive` }] : []),
        { k: "notifs", I: Bell, label: t.acNotifs, value: pushState === "on" ? s.on : `${onN}/${NOTIF_KEYS.length}`, go: "notifs" as Page },
        { k: "lang", I: Languages, label: s.language, value: langName(locale, locale), go: "language" as Page },
        { k: "currency", I: Coins, label: t.gkCurrency, value: myCurrency(), go: "currency" as Page },
        { k: "appearance", I: SunMoon, label: t.ap.title, value: t.ap[themeNow()], go: "appearance" as Page },
        { k: "offline", I: WifiOff, label: s.offline, href: `/${locale}/wallet#offline` }
      ] },
      { h: s.gSee, rows: [
        ...(prof ? [{ k: "privacy", I: Lock, label: t.acPrivacy, value: ok.isPrivate ? s.private : s.public, go: "privacy" as Page }] : []),
        ...(prof ? [{ k: "close", I: Star, label: t.cf.close, value: String(ok.closeFriends.filter((x) => x.close).length), go: "close" as Page }] : []),
        { k: "blocked", I: Ban, label: t.acBlocked, value: String(ok.blocked.length), go: "blocked" as Page }
      ] },
      { h: s.gInteract, rows: [
        { k: "messages", I: MessageCircle, label: t.acWhoDm, sub: t.acDm[ok.dmPolicy], go: "messages" as Page },
        ...(prof ? [{ k: "words", I: Type, label: t.cf.words, value: ok.hiddenWords.length ? String(ok.hiddenWords.length) : undefined, go: "words" as Page }] : [])
      ] },
      { h: s.gWhat, rows: [
        { k: "muted", I: VolumeX, label: s.muted, value: String(ok.muted.length), go: "muted" as Page },
        { k: "hidden", I: EyeOff, label: s.hidden, value: String(ok.hidden.length), go: "hidden" as Page }
      ] },
      { h: s.gApp, rows: [
        { k: "export", I: Download, label: t.acExport, sub: t.acExportHint, href: "/api/me/export", dl: true },
        { k: "outall", I: MonitorSmartphone, label: t.acOutAll, run: async () => { setBusy("out"); const r = await fetch("/api/me/account/signout-all", { method: "POST" }).catch(() => null); setBusy(""); flash(r?.ok ? t.acOutDone : t.acErr); } }
      ] },
      { h: s.gSupport, rows: [
        { k: "help", I: CircleHelp, label: s.help, href: `/${locale}/support` },
        { k: "privacyc", I: Shield, label: t.lPrivacy, href: `/${locale}/legal/privacy` },
        { k: "terms", I: FileText, label: s.terms, href: `/${locale}/legal/terms` },
        { k: "about", I: Info, label: s.about, href: `/${locale}/about` }
      ] },
      { h: s.gLogin, rows: [
        { k: "logout", I: LogOut, label: t.wSignOut, red: true, run: logout },
        { k: "delete", I: Trash2, label: t.acDelete, red: true, go: "delete" as Page }
      ] }
    ];
  }, [ok, prof, pushState, locale, t, s]); // eslint-disable-line react-hooks/exhaustive-deps

  if (a === null) return <p className="hint" style={{ marginTop: 24 }}>{t.exLoading}</p>;
  if (a === "auth") return <div className="card gp-empty" style={{ marginTop: 16 }}><span aria-hidden="true">🔐</span><b>{t.acSignIn}</b><a className="btn press" href={`/${locale}/wallet`} style={{ width: "auto" }}>{t.wSignIn}</a></div>;
  const toggle = (k: NotifKey) => put({ notif: { ...a.notif, [k]: a.notif[k] === false } });

  const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const shown = q.trim() ? groups.map((g) => ({ ...g, rows: g.rows.filter((r) => norm(`${r.label} ${r.sub ?? ""} ${g.h}`).includes(norm(q.trim()))) })).filter((g) => g.rows.length) : groups;

  const RowEl = ({ r }: { r: Row }) => {
    const inner = <>
      <r.I size={22} strokeWidth={1.8} aria-hidden="true" className="st-ic" />
      <span className="st-tx"><span>{r.label}</span>{r.sub && <small>{r.sub}</small>}</span>
      {r.value && <span className="st-val">{r.value}</span>}
      {!r.red && <ChevronRight size={18} className="st-chev" aria-hidden="true" />}
    </>;
    const cls = `st-row${r.red ? " red" : ""}`;
    if (r.href) return <a className={cls} href={r.href} {...(r.dl ? { download: true } : {})}>{inner}</a>;
    return <button type="button" className={cls} disabled={r.k === "outall" && busy === "out"} onClick={() => (r.go ? go(r.go) : r.run?.())}>{inner}</button>;
  };
  const Person = ({ p, label, onClick }: { p: PublicProfile; label: string; onClick: () => void }) => (
    <div className="st-row st-person">
      <a href={`/${locale}/u/${p.handle}`} className="st-person-l"><Avatar p={p} size={40} /><span className="st-tx"><span>{p.name}</span><small>@{p.handle}</small></span></a>
      <button type="button" className="st-pill" onClick={onClick}>{label}</button>
    </div>
  );
  const Nav = ({ title }: { title: string }) => (
    <div className="st-nav">
      <button type="button" className="st-back" onClick={back} aria-label={t.close}><ChevronLeft size={24} aria-hidden="true" /></button>
      <b>{title}</b><span />
    </div>
  );

  return (
    <div className="st">
      {msg && <p className="note ac-flash" role="status">✓ {msg}</p>}

      {page === "root" && <>
        <h1 className="st-title">{s.title}</h1>
        <label className="st-search"><Search size={17} aria-hidden="true" /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={s.search} aria-label={s.search} /></label>

        {!q && <>
          <span className="st-h">{s.gAccount}</span>
          <div className="st-group">
            <button type="button" className="st-row st-acc" onClick={() => setEditing(true)}>
              {prof ? <Avatar p={prof} size={56} /> : <span className="st-ic-big"><UserRound size={28} aria-hidden="true" /></span>}
              <span className="st-tx"><span className="st-me-n">{prof?.name ?? t.acNoProfile}</span><small>{prof ? `@${prof.handle} · ` : ""}{a.email}</small><small>{s.accSub}</small></span>
              <ChevronRight size={18} className="st-chev" aria-hidden="true" />
            </button>
            {prof && <a className="st-row" href={`/${locale}/u/${prof.handle}`}><UserRound size={22} strokeWidth={1.8} className="st-ic" aria-hidden="true" /><span className="st-tx"><span>{t.acView}</span></span><ChevronRight size={18} className="st-chev" aria-hidden="true" /></a>}
          </div>
        </>}

        {shown.map((g) => (
          <section key={g.h} className="st-sec">
            <span className="st-h">{g.h}</span>
            <div className="st-group">{g.rows.map((r) => <RowEl key={r.k} r={r} />)}</div>
          </section>
        ))}
        {q && shown.length === 0 && <p className="hint st-empty">{s.noResults}</p>}
      </>}

      {page === "privacy" && <>
        <Nav title={t.acPrivacy} />
        <div className="st-group">
          <label className="st-row st-switch"><span className="st-tx"><span>{t.scPrivate}</span></span>
            <input type="checkbox" role="switch" checked={a.isPrivate} onChange={(e) => void put({ isPrivate: e.target.checked })} /></label>
        </div>
        <p className="st-note">{t.scPrivateHint}</p>
      </>}

      {page === "messages" && <>
        <Nav title={t.acWhoDm} />
        <div className="st-group">
          {(["circle", "following", "none"] as const).map((k) => (
            <button key={k} type="button" className="st-row" onClick={() => void put({ dmPolicy: k })} aria-pressed={a.dmPolicy === k}>
              <span className="st-tx"><span>{t.acDm[k]}</span></span>{a.dmPolicy === k && <span className="st-check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      </>}

      {page === "blocked" && <>
        <Nav title={t.acBlocked} />
        {a.blocked.length === 0 ? <p className="st-note">{t.acBlockedNone}</p> : (
          <div className="st-group">{a.blocked.map((p) => <Person key={p.handle} p={p} label={t.acUnblock} onClick={async () => { await act(p.handle, "unblock"); setA({ ...a, blocked: a.blocked.filter((x) => x.handle !== p.handle) }); flash(t.acUnblocked); }} />)}</div>
        )}
      </>}

      {page === "muted" && <>
        <Nav title={s.muted} />
        <p className="st-note">{s.mutedSub}</p>
        {a.muted.length === 0 ? <p className="st-note">{s.mutedNone}</p> : (
          <div className="st-group">{a.muted.map((p) => <Person key={p.handle} p={p} label={s.unmute} onClick={() => { setA({ ...a, muted: a.muted.filter((x) => x.handle !== p.handle) }); void put({ unmute: p.handle }); }} />)}</div>
        )}
      </>}

      {page === "hidden" && <>
        <Nav title={s.hidden} />
        <p className="st-note">{s.hiddenSub}</p>
        {a.hidden.length === 0 ? <p className="st-note">{s.hiddenNone}</p> : (
          <div className="st-group">{a.hidden.map((h) => (
            <div key={h.id} className="st-row">
              <EyeOff size={20} strokeWidth={1.8} className="st-ic" aria-hidden="true" />
              <span className="st-tx"><span>@{h.handle}</span><small className="st-clip">{h.text || "📷"}</small></span>
              <button type="button" className="st-pill" onClick={() => { setA({ ...a, hidden: a.hidden.filter((x) => x.id !== h.id) }); void put({ unhide: h.id }); }}>{s.unhide}</button>
            </div>
          ))}</div>
        )}
      </>}

      {page === "activity" && <>
        <Nav title={t.cf.activity} />
        <div className="ios-seg" role="tablist">
          <button role="tab" aria-selected={actTab === "likes"} className={actTab === "likes" ? "on" : ""} onClick={() => setActTab("likes")}><Heart size={14} aria-hidden="true" /> {t.cf.likes}</button>
          <button role="tab" aria-selected={actTab === "comments"} className={actTab === "comments" ? "on" : ""} onClick={() => setActTab("comments")}><CommentIc size={14} aria-hidden="true" /> {t.cf.comments}</button>
        </div>
        {!actv ? <p className="st-note">…</p> : actTab === "likes" ? (
          actv.likes.posts.length === 0 ? <p className="st-note">{t.cf.noLikes}</p> : (
            <div className="pf-grid st-grid">{actv.likes.posts.map((x) => (
              <a key={x.id} className="pf-tile" href={`/${locale}/wallet#post:${x.id}`} aria-label={x.text.slice(0, 60) || `@${x.handle}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {x.video === "ready" ? <img src={posterUrl(x.id)} alt="" loading="lazy" /> : x.photo ? <img src={`/api/social/photo/${x.id}`} alt="" loading="lazy" /> : <span className="pf-tile-t"><span>{x.text}</span></span>}
              </a>
            ))}</div>
          )
        ) : actv.comments.length === 0 ? <p className="st-note">{t.cf.noComments}</p> : (
          <div className="st-group">{actv.comments.map((c) => (
            <div key={c.id} className="st-row st-act">
              <a className="st-act-l" href={`/${locale}/wallet#post:${c.postId}`}>
                <span className="st-tx"><span className="st-clip">{c.text}</span><small>{fmt(t.cf.onPost, { h: c.handle })} · {new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(c.at))}</small></span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {c.photo && <img className="st-thumb" src={`/api/social/photo/${c.postId}`} alt="" loading="lazy" />}
              </a>
              <button type="button" className="st-pill" onClick={async () => {
                setActv({ ...actv, comments: actv.comments.filter((x) => x.id !== c.id) });
                await fetch(`/api/social/post/${c.postId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "uncomment", commentId: c.id }) }).catch(() => null);
              }}>{t.cf.delete}</button>
            </div>
          ))}</div>
        )}
      </>}

      {page === "close" && <>
        <Nav title={t.cf.close} />
        <p className="st-note">{t.cf.closeSub}</p>
        {a.closeFriends.length === 0 ? <p className="st-note">{t.cf.closeNone}</p> : <>
          <label className="st-search"><Search size={17} aria-hidden="true" /><input type="search" value={cq} onChange={(e) => setCq(e.target.value)} placeholder={t.cf.search} aria-label={t.cf.search} /></label>
          <div className="st-group">{a.closeFriends.filter((p) => !cq.trim() || norm(`${p.name} ${p.handle}`).includes(norm(cq.trim()))).map((p) => (
            <div key={p.handle} className="st-row st-person">
              <a href={`/${locale}/u/${p.handle}`} className="st-person-l"><Avatar p={p} size={40} /><span className="st-tx"><span>{p.name}</span><small>@{p.handle}</small></span></a>
              <button type="button" className={`st-round ${p.close ? "on" : ""}`} aria-pressed={p.close} aria-label={p.close ? t.cf.remove : t.cf.add}
                onClick={() => { const on = !p.close; setA({ ...a, closeFriends: a.closeFriends.map((x) => (x.handle === p.handle ? { ...x, close: on } : x)) }); void fetch("/api/me/account", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ close: { handle: p.handle, on } }) }).catch(() => null); }}>
                {p.close ? <Check size={16} aria-hidden="true" /> : null}
              </button>
            </div>
          ))}</div>
        </>}
      </>}

      {page === "words" && <>
        <Nav title={t.cf.words} />
        <p className="st-note">{t.cf.wordsSub}</p>
        <form className="st-group st-add" onSubmit={(e) => { e.preventDefault(); const w = word.trim(); if (!w) return; const list = [...new Set([...a.hiddenWords, w.toLowerCase()])]; setA({ ...a, hiddenWords: list }); setWord(""); void put({ hiddenWords: list }); }}>
          <input value={word} maxLength={40} onChange={(e) => setWord(e.target.value)} placeholder={t.cf.wordsPh} aria-label={t.cf.wordsPh} />
          <button type="submit" className="st-pill" disabled={!word.trim()} aria-label={t.cf.add}><Plus size={16} aria-hidden="true" /> {t.cf.add}</button>
        </form>
        {a.hiddenWords.length === 0 ? <p className="st-note">{t.cf.wordsNone}</p> : (
          <div className="st-chips">{a.hiddenWords.map((w) => (
            <span key={w} className="st-chip">{w}<button type="button" aria-label={`${t.cf.remove} ${w}`} onClick={() => { const list = a.hiddenWords.filter((x) => x !== w); setA({ ...a, hiddenWords: list }); void put({ hiddenWords: list }); }}><X size={14} aria-hidden="true" /></button></span>
          ))}</div>
        )}
      </>}

      {page === "notifs" && <>
        <Nav title={t.acNotifs} />
        <div className="st-group">
          <div className="st-row st-push">
            {!a.push.enabled ? <small className="hint">{t.acPushServerOff}</small>
              : pushState === "on" ? <>
                  <span className="st-tx"><span>✅ {t.acPushOn}</span></span>
                  <button type="button" className="st-pill" onClick={async () => { const r = await fetch("/api/me/push/test", { method: "POST" }).then((x) => x.json()).catch(() => null); flash(r?.sent ? t.acPushTestSent : t.acErr); }}>{t.acPushTest}</button>
                  <button type="button" className="st-pill" disabled={busy === "push"} onClick={() => void pushOff()}>{t.acPushOffBtn}</button>
                </>
              : pushState === "denied" ? <small className="hint">{t.acPushDenied}</small>
              : pushState === "ios" ? <small className="hint">{t.acPushIos}</small>
              : pushState === "unsupported" ? <small className="hint">{t.acPushNo}</small>
              : <button type="button" className="btn press" disabled={busy === "push"} onClick={() => void pushOn()}>🔔 {t.acPushOnBtn}</button>}
          </div>
        </div>
        <p className="st-note">{t.acNotifsHint}</p>
        <div className="st-group">
          {NOTIF_KEYS.map((k) => (
            <label key={k} className="st-row st-switch"><span className="st-tx"><span>{t.acNotif[k]}</span></span>
              <input type="checkbox" role="switch" checked={a.notif[k] !== false} onChange={() => void toggle(k)} /></label>
          ))}
        </div>
      </>}

      {page === "language" && <>
        <Nav title={s.language} />
        <div className="st-group">
          {LOCALES.map((l) => (
            <a key={l} className="st-row" href={`/${l}/wallet/account`} lang={l} onClick={() => void put({ lang: l })}>
              <span className="st-tx"><span>{langName(l, l)}</span>{l !== locale && <small>{langName(l, locale)}</small>}</span>
              {l === locale && <span className="st-check" aria-hidden="true">✓</span>}
            </a>
          ))}
        </div>
      </>}

      {page === "currency" && <>
        <Nav title={t.gkCurrency} />
        <div className="st-group">
          {CURRENCIES.map((c) => (
            <button key={c} type="button" className="st-row" onClick={() => { document.cookie = `${CURRENCY_COOKIE}=${c}; path=/; max-age=${365 * 86400}; samesite=lax`; window.location.reload(); }}>
              <span className="st-tx"><span>{c}</span><small>{currencyName(c, locale)}</small></span>
              {c === myCurrency() && <span className="st-check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      </>}

      {page === "appearance" && <>
        <Nav title={t.ap.title} />
        <div className="st-group">
          {(["system", "light", "dark"] as const).map((m) => (
            <button key={m} type="button" className="st-row" onClick={() => { setTheme(m); setPage("root"); }}>
              <span className="st-tx"><span>{t.ap[m]}</span></span>
              {themeNow() === m && <span className="st-check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      </>}

      {page === "delete" && <>
        <Nav title={t.acDelete} />
        <div className="st-group st-del">
          <p className="ac-del-txt">{t.acDeleteHint}</p>
          <label className="ac-del-lbl" htmlFor="acdel">{t.acDeleteType}</label>
          <input id="acdel" className="ac-del-in" value={del} onChange={(e) => setDel(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off" placeholder="DELETE" />
          <button type="button" className="ac-del-btn" disabled={del !== "DELETE" || busy === "del"} onClick={async () => {
            setBusy("del");
            const r = await fetch("/api/me/account", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: "DELETE" }) }).catch(() => null);
            if (r?.ok) { await wipeDevice(); location.href = `/${locale}`; } else { setBusy(""); flash(t.acErr); }
          }}>{t.acDeleteBtn}</button>
        </div>
      </>}

      {editing && <ProfileEditor t={t} initial={prof} onClose={(c) => { setEditing(false); if (c) void load(); }} />}
    </div>
  );
}

/** Depois de apagar a conta: limpa também o que ficou neste aparelho (armazenamento, diário offline, cópias guardadas). */
async function wipeDevice() {
  try { localStorage.clear(); } catch { /* ignorar */ }
  try { sessionStorage.clear(); } catch { /* ignorar */ }
  try { indexedDB.deleteDatabase("sgct-diary"); } catch { /* ignorar */ }
  try { if ("caches" in window) for (const k of await caches.keys()) await caches.delete(k); } catch { /* ignorar */ }
}
