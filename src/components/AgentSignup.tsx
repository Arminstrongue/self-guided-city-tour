"use client";
import { useDict } from "@/i18n/client-dict";
import { useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";

export function AgentSignup({ locale, t: tProp }: { locale: Locale; t?: Dict }) {
  const t = useDict(tProp);
  const [mode, setMode] = useState<"new" | "login">("new");
  const [f, setF] = useState({ name: "", email: "", phone: "", country: "" });
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [devLink, setDevLink] = useState<string | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(f.email) || (mode === "new" && f.name.trim().length < 2)) return setState("error");
    setState("busy");
    const res = await fetch("/api/agents", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...(mode === "new" ? f : { email: f.email }), country: f.country || undefined, phone: f.phone || undefined, locale }) }).catch(() => null);
    const j = res && res.ok ? await res.json() : null;
    if (!j) return setState("error");
    setDevLink(j.devLink); setState("sent");
  }

  if (state === "sent") return (
    <div className="verdict-box ok"><b>{t.agSent}</b>{devLink && <p className="hint">Dev: <a href={devLink}>{t.agOpenPortal}</a></p>}</div>
  );
  return (
    <form className="card stack" style={{ gap: 10, padding: 14 }} onSubmit={submit} noValidate>
      <div className="mode-switch" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "new"} onClick={() => setMode("new")}>{t.agJoin}</button>
        <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => setMode("login")}>{t.agLogin}</button>
      </div>
      {mode === "new" && <div className="field"><label htmlFor="ag-n">{t.name}</label><input id="ag-n" value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></div>}
      <div className="field"><label htmlFor="ag-e">{t.email}</label><input id="ag-e" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></div>
      {mode === "new" && (
        <div className="grid2">
          <div className="field"><label htmlFor="ag-p">{t.agPhone}</label><input id="ag-p" type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" /></div>
          <div className="field"><label htmlFor="ag-c">{t.agCountry}</label><input id="ag-c" maxLength={2} placeholder="PT" value={f.country} onChange={(e) => set("country", e.target.value.toUpperCase())} /></div>
        </div>
      )}
      {state === "error" && <p className="err">{t.mErr}</p>}
      <button className="btn tram" disabled={state === "busy"}>{mode === "new" ? t.agJoinBtn : t.agLoginBtn}</button>
    </form>
  );
}
