"use client";
import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";

/**
 * "Pagou com outro email?": envia um código de 6 dígitos para esse email e, confirmado, os passes
 * comprados com ele passam a pertencer a esta conta (sem precisar de mudar de conta).
 */
export function LinkPass({ t, locale }: { t: Dict; locale: Locale }) {
  const l = t.lp;
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  useEffect(() => { if (new URLSearchParams(window.location.search).get("linkpass")) setOpen(true); }, []);
  async function call(body: object) {
    setBusy(true); setMsg(null);
    const r = await fetch("/api/me/passes/link", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    setBusy(false);
    const j = r ? await r.json().catch(() => ({})) : {};
    return { ok: Boolean(r?.ok), j: j as { challenge?: string; linked?: number; error?: string; devCode?: string } };
  }
  async function send() {
    const { ok, j } = await call({ email: email.trim(), locale });
    if (!ok) { setMsg({ text: j.error === "same" ? l.same : j.error === "rate" ? l.rate : l.err }); return; }
    setChallenge(j.challenge ?? ""); if (j.devCode) setCode(j.devCode);
  }
  async function verify() {
    const { ok, j } = await call({ challenge, code: code.replace(/\D/g, "") });
    if (!ok) { setMsg({ text: j.error === "code" ? l.badCode : l.err }); return; }
    if (!j.linked) { setMsg({ text: l.none }); return; }
    setMsg({ ok: true, text: fmt(l.done, { n: j.linked }) });
    setTimeout(() => window.location.reload(), 1200);
  }
  if (!open) return <button type="button" className="link-btn lp-open" onClick={() => setOpen(true)}>{l.open}</button>;
  return (
    <div className="card lp">
      <b>{l.title}</b>
      <p className="hint">{l.sub}</p>
      {!challenge ? (
        <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="lp-row">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={l.email} aria-label={l.email} autoComplete="email" />
          <button className="btn press" disabled={busy || !email}>{l.send}</button>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void verify(); }} className="lp-row">
          <input inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" aria-label={fmt(l.code, { e: email })} />
          <button className="btn press" disabled={busy || code.replace(/\D/g, "").length !== 6}>{l.confirm}</button>
        </form>
      )}
      {challenge && !msg && <p className="hint">{fmt(l.code, { e: email })}</p>}
      {msg && <p className={msg.ok ? "bp-ok" : "err"} role="status">{msg.text}</p>}
    </div>
  );
}
