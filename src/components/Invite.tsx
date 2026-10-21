"use client";
/** Convidar amigos (email, SMS, WhatsApp, link, contactos do telemóvel) e a página de boas-vindas do convite. */
import { useEffect, useState } from "react";
import { fmt } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { SheetX } from "@/components/WinNav";
import { REFERRAL_FRIEND_PCT } from "@/lib/pricing";
import { Avatar, FollowBtn, type PublicProfile } from "./Social";
import Portal from "@/components/Portal";

type Info = { handle: string; link: string; sent: number; joined: number; friends: PublicProfile[]; rewards?: { paidFriends: number; earned: number; credit: number; friendPct: number; reward: number } };
const eur = (c: number, l: string) => new Intl.NumberFormat(l, { style: "currency", currency: "EUR" }).format(c / 100);
type Contact = { name?: string[]; email?: string[]; tel?: string[] };

export function InviteSheet({ t, locale, onClose }: { t: Dict; locale: Locale; onClose: () => void }) {
  const [info, setInfo] = useState<Info | null | "no_profile">(null);
  const [emails, setEmails] = useState("");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const canPick = typeof navigator !== "undefined" && "contacts" in navigator && "ContactsManager" in window;
  useEffect(() => {
    fetch(`/api/invites?l=${locale}`, { cache: "no-store" }).then(async (r) => setInfo(r.status === 409 ? "no_profile" : r.ok ? await r.json() : null)).catch(() => setInfo(null));
  }, [locale]);
  if (info === "no_profile") return (
    <Portal><div className="sheet-bg" onClick={onClose}><div className="sheet stack" style={{ gap: 10 }} onClick={(e) => e.stopPropagation()}>
      <SheetX onClose={onClose} label={t.close} /><b style={{ fontSize: 19 }}>✉️ {t.ivTitle}</b><p className="hint">{t.ivNeedProfile}</p></div></div></Portal>
  );
  const link = info?.link ?? "";
  const text = fmt(t.ivText, { link });
  const record = (channel: "sms" | "whatsapp" | "link", p?: string) =>
    fetch("/api/invites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "record", channel, ...(p ? { phone: p } : {}) }) }).catch(() => null);
  const cleanPhone = (p: string) => p.replace(/[^\d+]/g, "").replace(/^00/, "+");
  const phoneOk = /^\+?[1-9]\d{7,14}$/.test(cleanPhone(phone));

  async function sendEmails(e: React.FormEvent) {
    e.preventDefault();
    const list = emails.split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean);
    if (!list.length) return;
    setBusy(true); setMsg(null);
    const r = await fetch("/api/invites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "email", emails: list.slice(0, 10), note, locale }) }).catch(() => null);
    const j = await r?.json().catch(() => null);
    setBusy(false);
    if (r?.ok) { setMsg({ ok: true, text: fmt(j.sent === 1 ? t.ivSent1 : t.ivSent, { n: j.sent }) }); setEmails(""); setNote(""); }
    else setMsg({ ok: false, text: j?.error === "limit" ? fmt(t.ivLimit, { n: j.left ?? 0 }) : t.acErr });
  }
  async function pick() {
    try {
      const got = await (navigator as unknown as { contacts: { select: (p: string[], o: { multiple: boolean }) => Promise<Contact[]> } }).contacts.select(["name", "email", "tel"], { multiple: true });
      const em = got.flatMap((c) => c.email?.slice(0, 1) ?? []);
      const tel = got.flatMap((c) => (c.email?.length ? [] : c.tel?.slice(0, 1) ?? []));
      if (em.length) setEmails((x) => [x, ...em].filter(Boolean).join(", "));
      if (tel.length) setPhone(tel[0]);
    } catch { /* cancelado */ }
  }
  async function share() {
    try { if (navigator.share) { await navigator.share({ title: "HelloTravell", text: fmt(t.ivText, { link: "" }).trim(), url: link }); void record("link"); return; } } catch { return; }
    await navigator.clipboard.writeText(link).catch(() => null); setCopied(true); setTimeout(() => setCopied(false), 2000); void record("link");
  }
  return (
    <Portal><div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack iv" style={{ gap: 14 }} onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={onClose} label={t.close} />
        <b style={{ fontSize: 20 }}>✉️ {t.ivTitle}</b>
        <p className="hint" style={{ margin: 0 }}>{t.ivSub}</p>
        {info?.rewards && <div className="iv-gift"><b>🎁 {fmt(t.rfGiveGet, { p: info.rewards.friendPct, r: eur(info.rewards.reward, locale) })}</b><small>{fmt(t.rfHow, { p: info.rewards.friendPct, r: eur(info.rewards.reward, locale) })}</small></div>}
        {info?.rewards && (info.rewards.paidFriends > 0 || info.rewards.credit > 0) && <div className="iv-reward">
          <div><b className="num">{info.rewards.paidFriends}</b><small>{t.rfPaidFriends}</small></div>
          <div><b className="num">{eur(info.rewards.credit, locale)}</b><small>{t.rfCredit}</small></div>
        </div>}
        {info && info.joined > 0 && <p className="note" style={{ margin: 0 }}>🎉 {fmt(info.joined === 1 ? t.ivJoined1 : t.ivJoined, { n: info.joined })}</p>}

        {/* Link */}
        <div className="iv-link"><span className="ad-ellip">{link || "…"}</span><button className="sc-follow on" disabled={!link} onClick={() => void share()}>{copied ? `✓ ${t.scCopied}` : t.ivShare}</button></div>

        {/* Telefone */}
        <section className="stack" style={{ gap: 8 }}>
          <b>📱 {t.ivPhone}</b>
          <div className="field" style={{ margin: 0 }}><input type="tel" inputMode="tel" autoComplete="tel" placeholder="+351 912 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label={t.ivPhone} /></div>
          <div className="grid2">
            <a className={`btn press iv-sms ${phoneOk && link ? "" : "off"}`} aria-disabled={!phoneOk || !link}
              href={phoneOk && link ? `sms:${cleanPhone(phone)}${/iphone|ipad/i.test(typeof navigator !== "undefined" ? navigator.userAgent : "") ? "&" : "?"}body=${encodeURIComponent(text.replace("c=link", "c=sms"))}` : undefined}
              onClick={() => phoneOk && void record("sms", phone)}>💬 SMS</a>
            <a className={`btn press iv-wa ${phoneOk && link ? "" : "off"}`} aria-disabled={!phoneOk || !link} target="_blank" rel="noreferrer"
              href={phoneOk && link ? `https://wa.me/${cleanPhone(phone).replace("+", "")}?text=${encodeURIComponent(text.replace("c=link", "c=whatsapp"))}` : undefined}
              onClick={() => phoneOk && void record("whatsapp", phone)}>🟢 WhatsApp</a>
          </div>
          <small className="hint">{t.ivPhoneHint}</small>
        </section>

        {/* Email */}
        <form className="stack" style={{ gap: 8 }} onSubmit={sendEmails}>
          <b>✉️ {t.ivEmail}</b>
          <div className="field" style={{ margin: 0 }}><textarea rows={2} value={emails} onChange={(e) => setEmails(e.target.value)} placeholder={t.ivEmailPh} aria-label={t.ivEmail} autoCapitalize="none" /></div>
          <div className="field" style={{ margin: 0 }}><input value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder={t.ivNote} aria-label={t.ivNote} /></div>
          <button className="btn press" disabled={busy || !emails.trim()}>{busy ? "…" : t.ivSend}</button>
          {msg && <p className={msg.ok ? "note" : "err"} style={{ margin: 0 }}>{msg.ok ? "✓ " : ""}{msg.text}</p>}
        </form>
        {canPick && <button className="btn ghost press" onClick={() => void pick()}>📇 {t.ivContacts}</button>}

        {info && info.friends.length > 0 && <section className="stack" style={{ gap: 6 }}>
          <b>{t.ivFriends}</b>
          {info.friends.map((p) => <a key={p.handle} className="sc-row-l" href={`/${locale}/u/${p.handle}`}><Avatar p={p} size={36} /><span className="stack" style={{ gap: 0 }}><b>{p.name}</b><small className="hint">@{p.handle}</small></span></a>)}
        </section>}
        <small className="hint">{t.ivPrivacy}</small>
      </div>
    </div></Portal>
  );
}

/** Página de boas-vindas de quem recebeu um convite. */
export function InviteLanding({ t, locale, inviter, signed }: { t: Dict; locale: Locale; inviter: (PublicProfile & { followers: number }) | null; signed: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [dev, setDev] = useState<string | null>(null);
  return (
    <div className="stack iv-land" style={{ gap: 16, marginTop: 12 }}>
      <section className="card stack iv-hero" style={{ gap: 12, alignItems: "center", textAlign: "center" }}>
        {inviter ? <>
          <Avatar p={inviter} size={96} />
          <h1 style={{ margin: 0, fontSize: 26 }}>{fmt(t.ivLandTitle, { n: inviter.name })}</h1>
          <span className="hint">@{inviter.handle} · {inviter.followers} {inviter.followers === 1 ? t.scFollower : t.scFollowers}</span>
        </> : <h1 style={{ margin: 0, fontSize: 26 }}>{t.ivJoinTitle}</h1>}
        <p style={{ margin: 0 }}>{t.ivLandSub}</p>
        <p className="note ref-note" style={{ margin: 0 }}>🎁 {fmt(t.rfLand, { p: REFERRAL_FRIEND_PCT })}</p>
        <ul className="wl-benefits" style={{ textAlign: "start" }}>{t.ivLandPoints.map((b) => <li key={b}>✓ {b}</li>)}</ul>
      </section>
      {signed ? (
        <section className="card stack" style={{ gap: 10 }}>
          {inviter && <FollowBtn t={t} handle={inviter.handle} rel="none" />}
          <a className="btn press" href={`/${locale}/wallet`}>👛 {t.wallet}</a>
        </section>
      ) : (
        <section className="card stack wl-sign">
          <b style={{ fontSize: 18 }}>🔐 {t.ivLandCta}</b>
          {sent ? <p>✓ {fmt(t.wSent, { email })} {dev && <a href={dev}>dev</a>}</p> : (
            <form className="row" style={{ gap: 8, flexWrap: "nowrap" }} onSubmit={async (e) => {
              e.preventDefault();
              const r = await fetch("/api/me/link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, locale }) }).catch(() => null);
              const j = r?.ok ? await r.json() : null; if (j) { setSent(true); setDev(j.devLink ?? null); }
            }}>
              <div className="field" style={{ flex: 1, margin: 0 }}><input type="email" required placeholder="email@example.com" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
              <button className="btn press" style={{ width: "auto", whiteSpace: "nowrap" }}>{t.wSignBtn}</button>
            </form>
          )}
          <small className="hint">{inviter ? fmt(t.ivLandNote, { n: inviter.name }) : ""}</small>
        </section>
      )}
    </div>
  );
}
