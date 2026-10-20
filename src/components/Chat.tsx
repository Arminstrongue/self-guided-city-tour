"use client";
/**
 * Rede social da carteira (fase 3): conversas privadas com seguidores e com quem segue.
 * Leve: a caixa de entrada carrega quando abre o separador; a conversa aberta pede só as mensagens novas a cada 4 s.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fmt, type Dict, type Locale } from "@/i18n/dictionaries";
import { Avatar, act, type PublicProfile, type Social } from "./Social";
import { ago } from "./Feed";
import { useLive, type LiveEvent } from "@/lib/live-client";
import { EmojiButton, emojiLabels } from "./Emoji";
import { PostSheet } from "./PostExtras";
import { I, Plus, Mic, SendHorizontal } from "./Ico";

type Ref = { kind: "story" | "post"; id: string; text: string } | { kind: "loc"; lat: number; lng: number };
type Msg = {
  id: string; text: string; ref: Ref | null; at: string; mine: boolean; read: boolean;
  photo?: boolean; audio?: boolean; reply?: { id: string; text: string; mine: boolean } | null; reactions?: { e: string; n: number; mine: boolean }[];
};
const REACTS = ["❤️", "😂", "😮", "😢", "👍", "🙏"];
const media = (id: string, k: "photo" | "audio") => `/api/chat/media/${id}?k=${k}`;
/** Foto para a conversa: lado maior ≤ 1280 px, JPEG ≤ ~400 KB. */
async function chatPhoto(file: File) {
  const img = await createImageBitmap(file);
  const k = Math.min(1, 1280 / Math.max(img.width, img.height));
  const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  let q = 0.82, d = c.toDataURL("image/jpeg", q);
  while (d.length > 460_000 && q > 0.35) { q -= 0.08; d = c.toDataURL("image/jpeg", q); }
  return d;
}
type Thread = { peer: PublicProfile; canSend: boolean; more: boolean; messages: Msg[]; seenUntil: string | null };
type Row = { peer: PublicProfile; unread: number; last: { text: string; at: string; mine: boolean; read: boolean } };

const post = (handle: string, body: Record<string, string>) =>
  fetch(`/api/chat/${encodeURIComponent(handle)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    .then(async (r) => ({ ok: r.ok, j: await r.json().catch(() => null) })).catch(() => ({ ok: false, j: null }));

/** Abre uma conversa (fica no histórico do navegador, para o botão voltar a fechar). */
let pushed = false;
export function openChat(handle: string) {
  pushed = true;
  history.pushState(null, "", `#chat:${handle}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
export const chatFromHash = () => { const h = decodeURIComponent(window.location.hash.slice(1)); return h.startsWith("chat:") ? h.slice(5) : null; };

/* ---------- Separador Mensagens ---------- */
export function ChatTab({ t, locale, social, onEdit, onRead }: { t: Dict; locale: Locale; social: Social; onEdit: () => void; onRead: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [contacts, setContacts] = useState<PublicProfile[] | null>(null);
  const [picking, setPicking] = useState(false);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const load = useCallback(() => fetch("/api/chat?contacts=1", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null))
    .then((j) => { setRows(j?.threads ?? []); setContacts(j?.contacts ?? []); }).catch(() => setRows([])), []);
  useEffect(() => { if (social.profile) void load(); }, [load, social.profile]);
  useEffect(() => {
    const read = () => setOpen(chatFromHash());
    read(); window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  // A caixa de entrada atualiza-se a cada 20 s enquanto está visível.
  useEffect(() => {
    if (!social.profile || open) return;
    const id = setInterval(() => { if (document.visibilityState === "visible") void load(); }, 60_000);
    return () => clearInterval(id);
  }, [load, social.profile, open]);
  const reload = useRef<ReturnType<typeof setTimeout> | null>(null);
  useLive(useCallback((ev: LiveEvent) => {
    if (ev.t === "msg" || ev.t === "unsend" || ev.t === "read") { if (reload.current) clearTimeout(reload.current); reload.current = setTimeout(() => void load(), 500); }
  }, [load]));
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return (rows ?? []).filter((r) => !k || r.peer.name.toLowerCase().includes(k) || r.peer.handle.includes(k));
  }, [rows, q]);
  if (!social.profile) return (
    <div className="card gp-empty"><span aria-hidden="true">💬</span><b>{t.scCreateTitle}</b><p className="hint" style={{ margin: 0 }}>{t.scCreateSub}</p><button className="btn press" style={{ width: "auto", marginTop: 8 }} onClick={onEdit}>{t.scCreate}</button></div>
  );
  return (
    <section className="stack" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
        <div className="sc-search" style={{ flex: 1 }}><span aria-hidden="true">🔎</span><input type="search" placeholder={t.chSearch} value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <button className="ch-newbtn" onClick={() => setPicking(!picking)} aria-expanded={picking} aria-label={t.chNew} title={t.chNew}>✏️</button>
      </div>
      {picking && (
        <div className="card stack" style={{ gap: 4, padding: 12 }}>
          <b>{t.chPick}</b>
          {contacts === null && <small className="hint">{t.exLoading}</small>}
          {contacts?.length === 0 && <small className="hint">{t.chNoContacts}</small>}
          {contacts?.map((p) => (
            <button key={p.handle} className="ch-row" onClick={() => { setPicking(false); openChat(p.handle); }}>
              <Avatar p={p} size={40} /><span className="stack" style={{ gap: 0, minWidth: 0, flex: 1, textAlign: "start" }}><b className="ad-ellip">{p.name}</b><small className="hint">@{p.handle}</small></span>
            </button>
          ))}
        </div>
      )}
      {rows === null && <p className="hint">{t.exLoading}</p>}
      {rows && rows.length === 0 && !picking && (
        <div className="card gp-empty"><span aria-hidden="true">💬</span><b>{t.chEmpty}</b><p className="hint" style={{ margin: 0 }}>{t.chEmptySub}</p>
          <button className="btn press" style={{ width: "auto", marginTop: 8 }} onClick={() => setPicking(true)}>✏️ {t.chNew}</button></div>
      )}
      {list.length > 0 && (
        <div className="card ch-list">
          {list.map((r) => (
            <button key={r.peer.handle} className={`ch-row ${r.unread ? "unread" : ""}`} onClick={() => openChat(r.peer.handle)}>
              <Avatar p={r.peer} size={52} />
              <span className="stack" style={{ gap: 2, minWidth: 0, flex: 1, textAlign: "start" }}>
                <b className="ad-ellip">{r.peer.name}</b>
                <small className="ad-ellip ch-last">{r.last.mine ? t.chYou : ""}{r.last.text} · {ago(r.last.at, locale)}</small>
              </span>
              {r.unread > 0 && <span className="ch-dot" aria-label={String(r.unread)}>{r.unread > 9 ? "9+" : r.unread}</span>}
            </button>
          ))}
        </div>
      )}
      <p className="hint" style={{ fontSize: 12, margin: 0 }}>🔒 {t.chPrivacy}</p>
      {open && <ChatThread t={t} locale={locale} handle={open} onClose={() => {
        if (pushed) { pushed = false; history.back(); } else { history.replaceState(null, "", "#chat"); setOpen(null); }
        void load(); onRead();
      }} />}
    </section>
  );
}

/* ---------- Uma conversa ---------- */
const dayKey = (iso: string) => new Date(iso).toDateString();
function dayLabel(iso: string, t: Dict, locale: Locale) {
  const d = new Date(iso), now = new Date();
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return t.chToday;
  if (d.toDateString() === y.toDateString()) return t.chYesterday;
  return d.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
}

export function ChatThread({ t, locale, handle, onClose }: { t: Dict; locale: Locale; handle: string; onClose: () => void }) {
  const [th, setTh] = useState<Thread | null | "none">(null);
  const [txt, setTxt] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [sure, setSure] = useState(false);
  const [reported, setReported] = useState(false);
  const [sending, setSending] = useState(false);
  const [warn, setWarn] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const last = useRef<string | null>(null);
  const stick = useRef(true);
  const scrollEnd = () => requestAnimationFrame(() => { const b = box.current; if (b) b.scrollTop = b.scrollHeight; });

  useEffect(() => {
    let alive = true;
    fetch(`/api/chat/${encodeURIComponent(handle)}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : "none")).then((j) => {
      if (!alive) return;
      setTh(j); if (j !== "none") { last.current = j.messages.at(-1)?.at ?? null; scrollEnd(); }
    }).catch(() => alive && setTh("none"));
    return () => { alive = false; };
  }, [handle]);

  const [typingAt, setTypingAt] = useState(0);
  const [, tick] = useState(0);
  const sentTyping = useRef(0);
  // Pede ao servidor as mensagens depois da última (também as marca como lidas).
  const pull = useCallback(async () => {
      const q = last.current ? `?after=${encodeURIComponent(last.current)}` : "";
      const j: Thread | null = await fetch(`/api/chat/${encodeURIComponent(handle)}${q}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      if (!j) return;
      setTh((cur) => {
        if (!cur || cur === "none") return cur;
        const ids = new Set(cur.messages.map((m) => m.id));
        const fresh = j.messages.filter((m) => !ids.has(m.id));
        if (fresh.length) { last.current = fresh.at(-1)!.at; if (stick.current) scrollEnd(); }
        return { ...cur, canSend: j.canSend, seenUntil: j.seenUntil, messages: fresh.length ? [...cur.messages, ...fresh] : cur.messages };
      });
  }, [handle]);
  // Tempo real: as mensagens chegam logo; o pedido a cada 20 s é só uma rede de segurança.
  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === "visible") void pull(); }, 20_000);
    const vis = () => { if (document.visibilityState === "visible") void pull(); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", vis); };
  }, [pull]);
  const onLive = useCallback((ev: LiveEvent) => {
    if (!("peer" in ev) || ev.peer !== handle) return;
    if (ev.t === "msg") {
      setTh((cur) => {
        if (!cur || cur === "none" || cur.messages.some((m) => m.id === ev.m.id)) return cur;
        return { ...cur, messages: [...cur.messages, ev.m] };
      });
      if (!ev.m.mine) { setTypingAt(0); void pull(); } // marca como lida
      if (stick.current || ev.m.mine) scrollEnd();
    }
    if (ev.t === "unsend") setTh((cur) => (cur && cur !== "none" ? { ...cur, messages: cur.messages.filter((m) => m.id !== ev.id) } : cur));
    if (ev.t === "read") setTh((cur) => (cur && cur !== "none" ? { ...cur, seenUntil: ev.at } : cur));
    if (ev.t === "react") setTh((cur) => (cur && cur !== "none" ? { ...cur, messages: cur.messages.map((m) => (m.id === ev.id ? { ...m, reactions: ev.reactions } : m)) } : cur));
    if (ev.t === "typing") { setTypingAt(Date.now()); if (stick.current) scrollEnd(); setTimeout(() => tick((x) => x + 1), 4200); }
  }, [handle, pull]);
  useLive(onLive);
  const isTyping = Date.now() - typingAt < 4000;
  function typed() {
    if (Date.now() - sentTyping.current < 3000) return;
    sentTyping.current = Date.now();
    void post(handle, { action: "typing" });
  }

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const [reply, setReply] = useState<Msg | null>(null);
  const [attach, setAttach] = useState(false);
  const [rec, setRec] = useState<{ start: number; mr: MediaRecorder; chunks: Blob[] } | null>(null);
  const [, recTick] = useState(0);
  const [viewer, setViewer] = useState<string | null>(null);
  const [postOpen, setPostOpen] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!rec) return; const id = setInterval(() => recTick((x) => x + 1), 500); return () => clearInterval(id); }, [rec]);
  const added = (m: Msg) => {
    setTh((cur) => (cur && cur !== "none" && !cur.messages.some((x) => x.id === m.id) ? { ...cur, messages: [...cur.messages, m] } : cur));
    last.current = m.at; stick.current = true; scrollEnd(); setReply(null);
  };
  async function sendBody(body: Record<string, unknown>) {
    setSending(true);
    const r = await fetch(`/api/chat/${encodeURIComponent(handle)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(async (x) => ({ ok: x.ok, j: await x.json().catch(() => null) })).catch(() => ({ ok: false, j: null }));
    setSending(false);
    if (r.ok && r.j?.message) added(r.j.message);
    else if (r.j?.error === "offensive") { setWarn(t.mdOffensive); setTimeout(() => setWarn(""), 4000); }
    return r.ok;
  }
  async function sendPhoto(f: File) {
    setAttach(false);
    try { await sendBody({ action: "send", text: txt.trim(), photo: await chatPhoto(f), ...(reply ? { replyTo: reply.id } : {}) }); setTxt(""); } catch { setWarn(t.pfErr); }
  }
  function sendLocation() {
    setAttach(false);
    navigator.geolocation?.getCurrentPosition((pos) => void sendBody({ action: "location", lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { setWarn(t.chLocDenied); setTimeout(() => setWarn(""), 4000); }, { enableHighAccuracy: true, timeout: 12_000 });
  }
  async function startRec() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find((x) => MediaRecorder.isTypeSupported?.(x)) ?? "";
      const mr = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      mr.start(250);
      setRec({ start: Date.now(), mr, chunks });
    } catch { setWarn(t.chMicDenied); setTimeout(() => setWarn(""), 4000); }
  }
  function stopRec(sendIt: boolean) {
    if (!rec) return;
    const { mr, chunks } = rec;
    mr.onstop = async () => {
      mr.stream.getTracks().forEach((tr) => tr.stop());
      if (!sendIt || !chunks.length) return;
      const blob = new Blob(chunks, { type: (mr.mimeType || "audio/webm").split(";")[0] });
      setSending(true);
      const r = await fetch(`/api/chat/${encodeURIComponent(handle)}/voice${reply ? `?reply=${reply.id}` : ""}`, { method: "POST", headers: { "Content-Type": blob.type || "audio/webm" }, body: blob })
        .then(async (x) => ({ ok: x.ok, j: await x.json().catch(() => null) })).catch(() => ({ ok: false, j: null }));
      setSending(false);
      if (r.ok && r.j?.message) added(r.j.message); else { setWarn(t.pfErr); setTimeout(() => setWarn(""), 3000); }
    };
    mr.stop(); setRec(null);
  }
  async function reactTo(m: Msg, e: string) {
    const mineNow = m.reactions?.find((x) => x.mine)?.e;
    const emoji = mineNow === e ? null : e;
    setSel(null);
    const r = await fetch(`/api/chat/${encodeURIComponent(handle)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "react", id: m.id, emoji }) }).then((x) => x.json()).catch(() => null);
    if (r?.reactions) setTh((cur) => (cur && cur !== "none" ? { ...cur, messages: cur.messages.map((x) => (x.id === m.id ? { ...x, reactions: r.reactions } : x)) } : cur));
  }
  async function send(e: React.FormEvent) {
    e.preventDefault();
    const v = txt.trim();
    if (!v || sending || !th || th === "none") return;
    setSending(true); setTxt("");
    const r = await post(handle, { action: "send", text: v, ...(reply ? { replyTo: reply.id } : {}) });
    setSending(false);
    if (r.ok && r.j?.message) added(r.j.message);
    else { setTxt(v); if (r.j?.error === "not_allowed") setTh({ ...th, canSend: false }); if (r.j?.error === "offensive") { setWarn(t.mdOffensive); setTimeout(() => setWarn(""), 4000); } }
  }
  async function earlier() {
    if (!th || th === "none" || !th.messages.length) return;
    const b = box.current; const h0 = b?.scrollHeight ?? 0;
    const j: Thread | null = await fetch(`/api/chat/${encodeURIComponent(handle)}?before=${encodeURIComponent(th.messages[0].at)}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    if (!j) return;
    setTh({ ...th, more: j.more, messages: [...j.messages, ...th.messages] });
    requestAnimationFrame(() => { if (b) b.scrollTop = b.scrollHeight - h0; });
  }

  const p = th && th !== "none" ? th.peer : null;
  const lastMine = th && th !== "none" ? [...th.messages].reverse().find((m) => m.mine) : undefined;
  return (
    <div className="ch-view" role="dialog" aria-modal="true" aria-label={p?.name ?? handle}>
      <header className="ch-head">
        <button className="ch-ic" onClick={onClose} aria-label={t.navBack} title={t.navBack}>←</button>
        {p ? <a className="ch-who" href={`/${locale}/u/${p.handle}`}><Avatar p={p} size={36} /><span className="stack" style={{ gap: 0, minWidth: 0 }}><b className="ad-ellip">{p.name}</b><small className="hint">@{p.handle}</small></span></a> : <span style={{ flex: 1 }} />}
        {p && <button className="ch-ic" onClick={() => { setMenu(!menu); setSure(false); }} aria-label="⋯">⋯</button>}
        <button className="ch-ic" onClick={onClose} aria-label={t.close} title={t.close}>✕</button>
      </header>
      {menu && p && (
        <div className="stack sc-menu ch-menu" style={{ gap: 6 }}>
          <button className={sure ? "danger" : ""} onClick={async () => { if (!sure) return setSure(true); await post(handle, { action: "clear" }); onClose(); }}>🗑 {sure ? t.chClearSure : t.chClear}</button>
          <button onClick={async () => { await act(p.handle, "block"); onClose(); }}>🚫 {t.scBlock}</button>
          {reported ? <p className="note">✓ {t.scReportDone}</p> : (
            <div className="stack" style={{ gap: 6 }}><b>⚑ {t.scReport}</b>
              <div className="ex-chips">{(Object.keys(t.scReasons) as (keyof typeof t.scReasons)[]).map((r) => <button key={r} onClick={async () => { await act(p.handle, "report", { reason: r, note: "chat" }); setReported(true); }}>{t.scReasons[r]}</button>)}</div></div>
          )}
        </div>
      )}
      <div className="ch-msgs" ref={box} onScroll={(e) => { const b = e.currentTarget; stick.current = b.scrollHeight - b.scrollTop - b.clientHeight < 80; }}>
        {th === null && <p className="hint" style={{ textAlign: "center" }}>{t.exLoading}</p>}
        {th === "none" && <p className="hint" style={{ textAlign: "center" }}>{t.scNotFound}</p>}
        {th && th !== "none" && <>
          {th.more && <button className="link-btn ch-earlier" onClick={() => void earlier()}>{t.chEarlier}</button>}
          {th.messages.length === 0 && p && (
            <div className="ch-hello"><Avatar p={p} size={84} /><b>{p.name}</b><small className="hint">@{p.handle}</small><small className="hint">🔒 {t.chPrivacy}</small></div>
          )}
          {th.messages.map((m, i) => {
            const prev = th.messages[i - 1];
            const newDay = !prev || dayKey(prev.at) !== dayKey(m.at);
            const tail = !th.messages[i + 1] || th.messages[i + 1].mine !== m.mine || dayKey(th.messages[i + 1].at) !== dayKey(m.at);
            return (
              <div key={m.id} className="ch-line-wrap">
                {newDay && <div className="ch-day">{dayLabel(m.at, t, locale)}</div>}
                <div className={`ch-line ${m.mine ? "me" : "them"}`}>
                  {m.reply && <span className="ch-quote">↩︎ {m.reply.mine ? t.chYou : `${p?.name.split(" ")[0] ?? ""}: `}{m.reply.text}</span>}
                  {m.ref?.kind === "story" && <span className="ch-ref">↩︎ {m.mine ? t.chStoryReplyMine : t.chStoryReply}{m.ref.text ? ` · “${m.ref.text}”` : ""}</span>}
                  {m.ref?.kind === "post" && <a className="ch-card" href={`#post:${m.ref.id}`} onClick={(e) => { e.preventDefault(); setPostOpen((m.ref as { id: string }).id); }}><span>🔗</span><span className="stack" style={{ gap: 0, minWidth: 0 }}><b>{t.chPostShared}</b><small className="ad-ellip">{m.ref.text}</small></span></a>}
                  {m.ref?.kind === "loc" && <a className="ch-card loc" href={`https://www.google.com/maps/search/?api=1&query=${m.ref.lat},${m.ref.lng}`} target="_blank" rel="noreferrer"><span>📍</span><span className="stack" style={{ gap: 0 }}><b>{t.chLocation}</b><small>{m.ref.lat.toFixed(4)}, {m.ref.lng.toFixed(4)} · {t.chOpenMap}</small></span></a>}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {m.photo && <button className="ch-photo" onClick={() => setViewer(media(m.id, "photo"))}><img src={media(m.id, "photo")} alt="" loading="lazy" /></button>}
                  {m.audio && <audio className="ch-audio" controls preload="metadata" src={media(m.id, "audio")} />}
                  {m.text ? (
                    <button className={`ch-bub ${tail ? "tail" : ""}`} onClick={() => setSel(sel === m.id ? null : m.id)} title={new Date(m.at).toLocaleString(locale)}>
                      {m.text}
                    </button>
                  ) : <button className="ch-more" onClick={() => setSel(sel === m.id ? null : m.id)} aria-label="⋯">⋯</button>}
                  {m.reactions && m.reactions.length > 0 && <span className="ch-rx">{m.reactions.map((x) => <button key={x.e} className={x.mine ? "on" : ""} onClick={() => void reactTo(m, x.e)}>{x.e}{x.n > 1 ? ` ${x.n}` : ""}</button>)}</span>}
                  {sel === m.id && <span className="ch-pop">
                    <span className="ch-rbar">{REACTS.map((e) => <button key={e} onClick={() => void reactTo(m, e)} className={m.reactions?.find((x) => x.mine)?.e === e ? "on" : ""}>{e}</button>)}</span>
                    <span className="ch-meta">{new Date(m.at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                      <button className="link-btn" onClick={() => { setReply(m); setSel(null); taRef.current?.focus(); }}>↩︎ {t.chReply}</button>
                      {m.mine && <button className="link-btn" onClick={async () => { await post(handle, { action: "unsend", id: m.id }); setTh({ ...th, messages: th.messages.filter((x) => x.id !== m.id) }); setSel(null); }}>{t.chUnsend}</button>}</span>
                  </span>}
                  {m.mine && lastMine?.id === m.id && <small className="ch-seen">{th.seenUntil && th.seenUntil >= m.at ? t.chSeen : t.chSent}</small>}
                </div>
              </div>
            );
          })}
          {isTyping && p && <div className="ch-line them"><span className="ch-typing" aria-label={t.chTyping}><i /><i /><i /></span></div>}
        </>}
      </div>
      {warn && <p className="err ch-warn">{warn}</p>}
      {th && th !== "none" && (th.canSend ? (
        <>
        {reply && <div className="ch-replying"><span className="ad-ellip">↩︎ {t.chReplyingTo} <b>{reply.mine ? t.chYou.replace(/:\s*$/, "") : p?.name}</b>: {reply.text || (reply.photo ? "📷" : reply.audio ? "🎤" : "📍")}</span><button aria-label={t.close} onClick={() => setReply(null)}>✕</button></div>}
        {attach && <div className="ch-attach">
          <button onClick={() => fileRef.current?.click()}><span>📷</span>{t.chPhoto}</button>
          <button onClick={sendLocation}><span>📍</span>{t.chLocation}</button>
        </div>}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void sendPhoto(f); }} />
        {rec ? (
          <div className="ch-say ch-rec">
            <button type="button" className="ch-ic" aria-label={t.close} onClick={() => stopRec(false)}>✕</button>
            <span className="ch-rec-dot" aria-hidden="true" /><b className="num">{Math.floor((Date.now() - rec.start) / 60000)}:{String(Math.floor((Date.now() - rec.start) / 1000) % 60).padStart(2, "0")}</b>
            <span className="hint" style={{ flex: 1 }}>{t.chRecording}</span>
            <button type="button" className="ch-send" aria-label={t.chSend} onClick={() => stopRec(true)}><I icon={SendHorizontal} size={20} /></button>
          </div>
        ) : (
        <form className="ch-say" onSubmit={send}>
          <button type="button" className={`ch-plus ${attach ? "on" : ""}`} aria-label={t.chAttach} aria-expanded={attach} onClick={() => setAttach(!attach)}><I icon={Plus} size={22} /></button>
          <EmojiButton target={taRef} value={txt} set={setTxt} max={1000} labels={emojiLabels(t)} />
          <textarea ref={taRef} rows={1} value={txt} maxLength={1000} placeholder={t.chPh} aria-label={t.chPh}
            onChange={(e) => { setTxt(e.target.value); if (e.target.value) typed(); e.target.style.height = "auto"; e.target.style.height = `${Math.min(120, e.target.scrollHeight)}px`; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !("ontouchstart" in window)) { e.preventDefault(); void send(e as unknown as React.FormEvent); } }} />
          {txt.trim() || typeof MediaRecorder === "undefined"
            ? <button className="ch-send" disabled={!txt.trim() || sending} aria-label={t.chSend}><I icon={SendHorizontal} size={20} /></button>
            : <button type="button" className="ch-send mic" disabled={sending} aria-label={t.chVoice} title={t.chVoice} onClick={() => void startRec()}><I icon={Mic} size={21} /></button>}
        </form>
        )}
        </>
      ) : <p className="hint ch-cant">{t.chCant}</p>)}
      {postOpen && <PostSheet t={t} locale={locale} id={postOpen} cities={{}} onClose={() => setPostOpen(null)} />}
      {viewer && <div className="ch-viewer" onClick={() => setViewer(null)}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={viewer} alt="" /></div>}
    </div>
  );
}

/** Selos de conversas e notificações por ler: atualizam em tempo real (com um pedido a cada 60 s por segurança). */
export function useUnread(enabled: boolean) {
  const [n, setN] = useState({ chats: 0, notifs: 0 });
  const check = useCallback(() => fetch("/api/me/notifications?count=1", { cache: "no-store" }).then((r) => r.json()).then((j) => setN({ chats: j.chats ?? 0, notifs: j.n ?? 0 })).catch(() => null), []);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useLive(useCallback((ev: LiveEvent) => {
    if (ev.t === "msg" || ev.t === "notif" || ev.t === "read") { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => void check(), 400); }
  }, [check]));
  useEffect(() => {
    if (!enabled) return;
    void check();
    const id = setInterval(() => { if (document.visibilityState === "visible") void check(); }, 60_000);
    const vis = () => { if (document.visibilityState === "visible") void check(); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", vis); };
  }, [enabled, check]);
  return { unread: n.chats, notifs: n.notifs, refreshUnread: check };
}

/** Responder a uma história (dentro do visualizador). */
export function StoryReply({ t, storyId, name, onFocus }: { t: Dict; storyId: string; name: string; onFocus: (f: boolean) => void }) {
  const [v, setV] = useState("");
  const [state, setState] = useState<"" | "sending" | "sent" | "err">("");
  useEffect(() => { setV(""); setState(""); }, [storyId]);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (!v.trim()) return;
    setState("sending");
    const r = await fetch("/api/chat/story", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ story: storyId, text: v.trim() }) }).catch(() => null);
    setState(r?.ok ? "sent" : "err"); if (r?.ok) setV("");
  }
  if (state === "sent") return <span className="st-btn">✓ {t.chSent}</span>;
  return (
    <form className="st-reply" onSubmit={go} onPointerDown={(e) => e.stopPropagation()}>
      <input value={v} maxLength={1000} onChange={(e) => setV(e.target.value)} placeholder={fmt(t.chReplyStory, { name })} aria-label={fmt(t.chReplyStory, { name })}
        onFocus={() => onFocus(true)} onBlur={() => onFocus(false)} />
      {v.trim() && <button disabled={state === "sending"} aria-label={t.chSend}><I icon={SendHorizontal} size={20} /></button>}
      {state === "err" && <small style={{ color: "#fff" }}>{t.chCant}</small>}
    </form>
  );
}
