"use client";
/**
 * Entrar por email: envia link + código de 6 dígitos. O código escreve-se aqui mesmo, por isso funciona
 * mesmo quando o link do email abre noutro navegador (Gmail, Outlook, outro telemóvel).
 * Mostra sempre o que aconteceu: a enviar, erro de envio, limite de pedidos, código errado.
 */
import { useState } from "react";
import type { Dict } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";

export function EmailSignIn({ t, locale, city, next }: { t: Dict; locale: string; city?: string | null; next?: string }) {
  const e = t.esi;
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [challenge, setChallenge] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [dev, setDev] = useState<{ link: string | null; code: string | null }>({ link: null, code: null });

  const errText = (k?: string) => (k === "rate" ? e.rate : k === "email" ? e.emailFail : k === "code" ? e.wrong : k === "invalid" ? e.invalid : e.net);

  async function send() {
    setBusy(true); setErr("");
    const r = await fetch("/api/me/link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), locale, ...(city ? { city } : {}) }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : null;
    setBusy(false);
    if (!r?.ok || !j?.challenge) { setErr(errText(j?.error)); return; }
    setChallenge(j.challenge); setCode(""); setDev({ link: j.devLink ?? null, code: j.devCode ?? null });
  }
  async function verify(c = code) {
    if (!challenge || c.replace(/\D/g, "").length !== 6) return;
    setBusy(true); setErr("");
    const r = await fetch("/api/me/code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ challenge, code: c }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : null;
    if (!r?.ok) { setBusy(false); setErr(errText(j?.error)); return; }
    window.location.href = next ?? `/${locale}${city ? `/tour/${city}` : "/wallet"}`;
  }

  if (challenge) return (
    <div className="stack esi" style={{ gap: 10 }}>
      <p style={{ margin: 0 }}>✓ {fmt(e.sentTo, { email: email.trim() })}</p>
      <form className="row" style={{ gap: 8, flexWrap: "nowrap" }} onSubmit={(ev) => { ev.preventDefault(); void verify(); }}>
        <div className="field" style={{ flex: 1, margin: 0 }}>
          <input className="esi-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]*" maxLength={7} placeholder="000000" aria-label={e.codeLabel} value={code} autoFocus
            onChange={(ev) => { const v = ev.target.value.replace(/[^\d]/g, "").slice(0, 6); setCode(v); setErr(""); if (v.length === 6) void verify(v); }} />
        </div>
        <button className="btn press" style={{ width: "auto", whiteSpace: "nowrap" }} disabled={busy || code.length !== 6}>{busy ? "…" : e.verify}</button>
      </form>
      {err && <p className="esi-err" role="alert">{err}</p>}
      <small className="hint">{e.spam}</small>
      <div className="row" style={{ gap: 14 }}>
        <button type="button" className="linkish" disabled={busy} onClick={() => void send()}>{e.resend}</button>
        <button type="button" className="linkish" onClick={() => { setChallenge(null); setErr(""); }}>{e.other}</button>
      </div>
      {(dev.link || dev.code) && <small className="hint">dev: {dev.code} {dev.link && <a href={dev.link}>link</a>}</small>}
    </div>
  );
  return (
    <div className="stack esi" style={{ gap: 8 }}>
      <form className="row" style={{ gap: 8, flexWrap: "nowrap" }} onSubmit={(ev) => { ev.preventDefault(); void send(); }}>
        <div className="field" style={{ flex: 1, margin: 0 }}><input id="wl-email" type="email" required placeholder="email@example.com" aria-label="Email" value={email} onChange={(ev) => { setEmail(ev.target.value); setErr(""); }} autoComplete="email" /></div>
        <button className="btn press" style={{ width: "auto", whiteSpace: "nowrap" }} disabled={busy}>{busy ? e.sending : t.wSignBtn}</button>
      </form>
      {err && <p className="esi-err" role="alert">{err}</p>}
      {/* Aceitação dos termos ao entrar (lojas: conteúdo criado pelos utilizadores exige termos com tolerância zero). */}
      <small className="hint esi-terms">{t.ag.pre} <a href={`/${locale}/legal/terms`}>{t.lTerms}</a> {t.ag.and} <a href={`/${locale}/legal/privacy`}>{t.lPrivacy}</a>. {t.ag.post}</small>
    </div>
  );
}
