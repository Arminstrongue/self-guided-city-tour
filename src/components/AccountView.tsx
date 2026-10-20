"use client";
/**
 * Gerir a conta: perfil, privacidade, quem pode enviar mensagens, bloqueados, notificações (push),
 * descarregar os dados, terminar sessões e apagar a conta.
 */
import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { Avatar, ProfileEditor, act, loadSocial, type PublicProfile, type Social } from "./Social";

type Acc = {
  email: string; hasProfile: boolean; isPrivate: boolean; dmPolicy: "circle" | "following" | "none";
  notif: Partial<Record<NotifKey, boolean>>; lang: string; blocked: PublicProfile[]; push: { enabled: boolean; key: string };
};
type NotifKey = "like" | "comment" | "follow" | "message" | "story_reply" | "video";
const NOTIF_KEYS: NotifKey[] = ["message", "like", "comment", "follow", "story_reply", "video"];

function b64ToBytes(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function AccountView({ t, locale }: { t: Dict; locale: Locale }) {
  const [a, setA] = useState<Acc | null | "auth">(null);
  const [social, setSocial] = useState<Social | null>(null);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");
  const [pushState, setPushState] = useState<"unknown" | "on" | "off" | "denied" | "unsupported" | "ios">("unknown");
  const [del, setDel] = useState("");
  const [busy, setBusy] = useState("");
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

  if (a === null) return <p className="hint" style={{ marginTop: 24 }}>{t.exLoading}</p>;
  if (a === "auth") return <div className="card gp-empty" style={{ marginTop: 16 }}><span aria-hidden="true">🔐</span><b>{t.acSignIn}</b><a className="btn press" href={`/${locale}/wallet`} style={{ width: "auto" }}>{t.wSignIn}</a></div>;
  const prof = social?.profile ?? null;
  const toggle = (k: NotifKey) => put({ notif: { ...a.notif, [k]: a.notif[k] === false } });

  return (
    <div className="stack ac" style={{ gap: 16, marginTop: 8 }}>
      <h1 className="gp-h1" style={{ margin: 0 }}>👤 {t.acTitle}</h1>
      {msg && <p className="note ac-flash" role="status">✓ {msg}</p>}

      {/* Perfil */}
      <section className="card stack ac-sec" style={{ gap: 10 }}>
        <div className="row" style={{ gap: 14, flexWrap: "nowrap" }}>
          {prof ? <Avatar p={prof} size={64} /> : <span className="sc-av sc-av-i" style={{ width: 64, height: 64, fontSize: 26 }}>?</span>}
          <div className="stack" style={{ gap: 2, minWidth: 0, flex: 1 }}>
            <b className="ad-ellip" style={{ fontSize: 18 }}>{prof?.name ?? t.acNoProfile}</b>
            {prof && <span className="hint">@{prof.handle}</span>}
            <span className="hint ad-ellip" style={{ fontSize: 13 }}>✉️ {a.email}</span>
          </div>
        </div>
        <div className="grid2">
          <button className="btn press" onClick={() => setEditing(true)}>{prof ? t.scEdit : t.scCreate}</button>
          {prof && <a className="btn ghost press" href={`/${locale}/u/${prof.handle}`}>{t.acView}</a>}
        </div>
        <small className="hint">{t.acEmailNote}</small>
      </section>

      {/* Privacidade e segurança */}
      <section className="card stack ac-sec" style={{ gap: 12 }} id="privacy">
        <b className="sc-h">🔒 {t.acPrivacy}</b>
        {prof && <label className="sc-switch"><input type="checkbox" checked={a.isPrivate} onChange={(e) => void put({ isPrivate: e.target.checked })} /><span><b>{t.scPrivate}</b><small className="hint">{t.scPrivateHint}</small></span></label>}
        <b style={{ fontSize: 14 }}>💬 {t.acWhoDm}</b>
        <div className="ac-radio">
          {(["circle", "following", "none"] as const).map((k) => (
            <label key={k} className={a.dmPolicy === k ? "on" : ""}><input type="radio" name="dm" checked={a.dmPolicy === k} onChange={() => void put({ dmPolicy: k })} /><span>{t.acDm[k]}</span></label>
          ))}
        </div>
        <b style={{ fontSize: 14 }}>🚫 {t.acBlocked} <small className="hint num">· {a.blocked.length}</small></b>
        {a.blocked.length === 0 ? <small className="hint">{t.acBlockedNone}</small> : a.blocked.map((p) => (
          <div key={p.handle} className="sc-row">
            <span className="sc-row-l"><Avatar p={p} /><span className="stack" style={{ gap: 0, minWidth: 0 }}><b className="ad-ellip">{p.name}</b><small className="hint">@{p.handle}</small></span></span>
            <button className="sc-follow" onClick={async () => { await act(p.handle, "unblock"); setA({ ...a, blocked: a.blocked.filter((x) => x.handle !== p.handle) }); flash(t.acUnblocked); }}>{t.acUnblock}</button>
          </div>
        ))}
      </section>

      {/* Notificações */}
      <section className="card stack ac-sec" style={{ gap: 12 }} id="notifications">
        <b className="sc-h">🔔 {t.acNotifs}</b>
        <div className="ac-push">
          {!a.push.enabled ? <small className="hint">{t.acPushServerOff}</small>
            : pushState === "on" ? <>
                <span>✅ {t.acPushOn}</span>
                <span className="row" style={{ gap: 8 }}>
                  <button className="sc-follow" onClick={async () => { const r = await fetch("/api/me/push/test", { method: "POST" }).then((x) => x.json()).catch(() => null); flash(r?.sent ? t.acPushTestSent : t.acErr); }}>{t.acPushTest}</button>
                  <button className="sc-follow" disabled={busy === "push"} onClick={() => void pushOff()}>{t.acPushOffBtn}</button>
                </span>
              </>
            : pushState === "denied" ? <small className="hint">{t.acPushDenied}</small>
            : pushState === "ios" ? <small className="hint">{t.acPushIos}</small>
            : pushState === "unsupported" ? <small className="hint">{t.acPushNo}</small>
            : <button className="btn press" disabled={busy === "push"} onClick={() => void pushOn()}>🔔 {t.acPushOnBtn}</button>}
        </div>
        <small className="hint">{t.acNotifsHint}</small>
        {NOTIF_KEYS.map((k) => (
          <label key={k} className="ac-toggle"><span>{t.acNotif[k]}</span><input type="checkbox" role="switch" checked={a.notif[k] !== false} onChange={() => void toggle(k)} /></label>
        ))}
      </section>

      {/* Os seus dados e sessões */}
      <section className="card stack ac-sec" style={{ gap: 10 }}>
        <b className="sc-h">📦 {t.acData}</b>
        <a className="btn ghost press" href="/api/me/export" download>⬇️ {t.acExport}</a>
        <small className="hint">{t.acExportHint}</small>
        <button className="btn ghost press" disabled={busy === "out"} onClick={async () => { setBusy("out"); const r = await fetch("/api/me/account/signout-all", { method: "POST" }).catch(() => null); setBusy(""); flash(r?.ok ? t.acOutDone : t.acErr); }}>🔁 {t.acOutAll}</button>
        <form action={`/api/me/logout?locale=${locale}`} method="post"><button className="btn ghost press" style={{ width: "100%" }}>{t.wSignOut}</button></form>
        <a className="hint" href={`/${locale}/legal/privacy`} style={{ fontSize: 12 }}>{t.lPrivacy}</a>
      </section>

      {/* Apagar a conta */}
      <section className="card stack ac-sec ac-danger" style={{ gap: 10 }}>
        <b className="sc-h">⚠️ {t.acDelete}</b>
        <small className="hint">{t.acDeleteHint}</small>
        <div className="field"><label htmlFor="acdel">{t.acDeleteType}</label><input id="acdel" value={del} onChange={(e) => setDel(e.target.value)} autoCapitalize="characters" placeholder="DELETE" /></div>
        <button className="btn press danger" disabled={del !== "DELETE" || busy === "del"} onClick={async () => {
          setBusy("del");
          const r = await fetch("/api/me/account", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: "DELETE" }) }).catch(() => null);
          if (r?.ok) { try { localStorage.clear(); } catch { /* ignorar */ } location.href = `/${locale}`; } else { setBusy(""); flash(t.acErr); }
        }}>{t.acDeleteBtn}</button>
      </section>

      {editing && <ProfileEditor t={t} initial={prof} onClose={(c) => { setEditing(false); if (c) void load(); }} />}
    </div>
  );
}
