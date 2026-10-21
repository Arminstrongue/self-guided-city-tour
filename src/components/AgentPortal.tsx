"use client";
import { useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { ExtLink } from "./ExtLink";

type Lead = { id: string; name: string; kind: string; city: string | null; contact: string | null; email: string | null; phone: string | null; status: string; notes: string | null };
type Client = { id: string; name: string; plan: string; status: string; city: string };
type Comm = { id: string; description: string | null; amountCents: number; paidAt: string | null; createdAt: string };

const KINDS = ["shop", "food", "cafe", "guesthouse", "hotel", "exp", "company", "other"] as const;
const STATUSES = ["new", "contacted", "proposal", "won", "lost"] as const;

export function AgentPortal({ locale, t, agent, link, leads: initial, clients, comm, due, paid, cities }: {
  locale: Locale; t: Dict; agent: { name: string; code: string; status: string }; link: string;
  leads: Lead[]; clients: Client[]; comm: Comm[]; due: number; paid: number; cities: { id: string; name: string }[];
}) {
  const [leads, setLeads] = useState(initial);
  const [f, setF] = useState({ name: "", kind: "food", city: cities[0]?.id ?? "", contact: "", email: "", phone: "", notes: "" });
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const eur = (c: number) => new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency: "EUR" }).format(c / 100);
  const kindName = (k: string) => (t.agKinds as Record<string, string>)[k] ?? k;
  const stName = (s: string) => (t.agSt as Record<string, string>)[s] ?? s;
  const counts = STATUSES.map((s) => ({ s, n: leads.filter((l) => l.status === s).length }));
  const pitch = fmt(t.agPitch, { link });

  async function add(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (f.name.trim().length < 2) return setErr(t.mErr);
    const res = await fetch("/api/agents/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) }).catch(() => null);
    if (!res?.ok) return setErr(t.errGeneric);
    const l = await res.json() as Lead;
    setLeads([l, ...leads]); setF({ ...f, name: "", contact: "", email: "", phone: "", notes: "" });
  }
  async function setStatus(id: string, status: string) {
    setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
    await fetch(`/api/agents/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }).catch(() => null);
  }

  return (
    <div className="stack">
      <div className="row-between">
        <div><span className="label">{t.agHello}</span><h1 style={{ fontSize: 26 }}>{agent.name}</h1></div>
        <button className="link-btn" onClick={async () => { await fetch("/api/agents/logout", { method: "POST" }); window.location.href = `/${locale}/agents`; }}>{t.agLogout}</button>
      </div>
      {agent.status === "pending" && <p className="note">{t.agPending}</p>}

      <div className="kpis3">
        <div className="card kpi"><span className="label">{t.agDue}</span><b className="num">{eur(due)}</b></div>
        <div className="card kpi"><span className="label">{t.agPaid}</span><b className="num">{eur(paid)}</b></div>
        <div className="card kpi"><span className="label">{t.agClients}</span><b className="num">{clients.length}</b></div>
      </div>

      <div className="card stack" style={{ gap: 8, padding: 14 }}>
        <b>{t.agYourLink}</b>
        <p className="hint">{t.agLinkHint}</p>
        <code className="codebox">{link}</code>
        <div className="acts">
          <button type="button" onClick={() => { void navigator.clipboard?.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? "✓" : t.copy}</button>
          <ExtLink href={`https://wa.me/?text=${encodeURIComponent(pitch)}`}>WhatsApp</ExtLink>
          <ExtLink href={`mailto:?subject=${encodeURIComponent("Self Guided City Tour")}&body=${encodeURIComponent(pitch)}`}>Email</ExtLink>
        </div>
        <p className="hint">{t.agCode}: <b className="num">{agent.code}</b></p>
      </div>

      <div className="card stack" style={{ gap: 8, padding: 14 }}>
        <b>{t.agPipeline}</b>
        <div className="pipeline">{counts.map((c) => <span key={c.s} className={`pill st-${c.s}`}>{stName(c.s)} <b className="num">{c.n}</b></span>)}</div>
        {leads.length === 0 && <p className="hint">{t.agNoLeads}</p>}
        {leads.map((l) => (
          <div key={l.id} className="lead">
            <div style={{ minWidth: 0 }}>
              <b>{l.name}</b>
              <p className="hint">{kindName(l.kind)}{l.city ? ` · ${cities.find((c) => c.id === l.city)?.name ?? l.city}` : ""}{l.contact ? ` · ${l.contact}` : ""}</p>
              <p className="hint">{[l.phone, l.email].filter(Boolean).join(" · ")}</p>
            </div>
            <select aria-label={t.agStatus} value={l.status} onChange={(e) => setStatus(l.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{stName(s)}</option>)}
            </select>
          </div>
        ))}
      </div>

      <form className="card stack" style={{ gap: 10, padding: 14 }} onSubmit={add} noValidate>
        <b>{t.agAddLead}</b>
        <div className="field"><label htmlFor="l-n">{t.mName}</label><input id="l-n" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="grid2">
          <div className="field"><label htmlFor="l-k">{t.mCat}</label><select id="l-k" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{KINDS.map((k) => <option key={k} value={k}>{kindName(k)}</option>)}</select></div>
          <div className="field"><label htmlFor="l-c">{t.mCity}</label><select id="l-c" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </div>
        <div className="grid2">
          <div className="field"><label htmlFor="l-p">{t.agContact}</label><input id="l-p" value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></div>
          <div className="field"><label htmlFor="l-t">{t.agPhone}</label><input id="l-t" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        </div>
        <div className="field"><label htmlFor="l-e">{t.email}</label><input id="l-e" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div className="field"><label htmlFor="l-no">{t.agNotes}</label><input id="l-no" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
        {err && <p className="err">{err}</p>}
        <button className="btn">{t.agAddBtn}</button>
      </form>

      <div className="card stack" style={{ gap: 6, padding: 14 }}>
        <b>{t.agClients}</b>
        {clients.length === 0 ? <p className="hint">{t.agNoClients}</p> : clients.map((c) => (
          <div key={c.id} className="row-between"><span>{c.name} <span className="hint">· {c.plan}</span></span><span className={c.status === "active" ? "ok-txt" : "hint"}>{c.status}</span></div>
        ))}
      </div>

      <div className="card stack" style={{ gap: 6, padding: 14 }}>
        <b>{t.agCommissions}</b>
        {comm.length === 0 ? <p className="hint">{t.agNoComm}</p> : comm.map((c) => (
          <div key={c.id} className="row-between"><span>{c.description ?? "—"}</span><span className="num">{eur(c.amountCents)} {c.paidAt ? "✓" : ""}</span></div>
        ))}
        <p className="hint">{t.agTerms}</p>
      </div>
    </div>
  );
}
