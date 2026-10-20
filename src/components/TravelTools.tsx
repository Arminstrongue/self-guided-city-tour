"use client";
/** Ferramentas de viagem: conversor de moeda (funciona sem rede), cidades offline e dividir despesas com amigos. */
import { useCallback, useEffect, useMemo, useState } from "react";
import { fmt, INTL_LOCALE, type Dict, type Locale } from "@/i18n/dictionaries";
import { convert, CURRENCIES, CURRENCY_COOKIE, formatMoney } from "@/lib/currency";
import { offlineList, offlineReady, removeCity, saveCity, type OfflineInfo } from "@/lib/offline-client";
import { SheetX } from "@/components/WinNav";
import { Avatar, type PublicProfile } from "./Social";
import { I, ArrowLeftRight, CloudDownload, Receipt, Wrench } from "./Ico";
import type { LucideIcon } from "lucide-react";

export type ToolTab = "fx" | "offline" | "split";

const ls = {
  get<T>(k: string, d: T): T { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignorar */ } }
};
export const myCurrency = () => (typeof document !== "undefined" ? document.cookie.match(new RegExp(`${CURRENCY_COOKIE}=([A-Z]{3})`))?.[1] : null) ?? "EUR";

/* ---------- Taxas: rede, senão a última cópia guardada ---------- */
type Fx = { rates: Record<string, number>; date: string; offline: boolean };
function useRates() {
  const [fx, setFx] = useState<Fx | null>(null);
  useEffect(() => {
    const saved = ls.get<Fx | null>("sgct:fx", null);
    if (saved) setFx({ ...saved, offline: true });
    fetch("/api/fx").then((r) => (r.ok ? r.json() : Promise.reject())).then((j) => { const v = { rates: j.rates, date: j.date, offline: false }; setFx(v); ls.set("sgct:fx", v); })
      .catch(() => { if (saved) setFx({ ...saved, offline: true }); });
  }, []);
  return fx;
}

/* ---------- Conversor ---------- */
export function FxConverter({ t, locale, from: from0 }: { t: Dict; locale: Locale; from?: string | null }) {
  const fx = useRates();
  const il = INTL_LOCALE[locale];
  const [s, setS] = useState(() => ({ amount: "10", from: "EUR", to: "USD" }));
  useEffect(() => {
    const saved = ls.get<{ from: string; to: string } | null>("sgct:fxpair", null);
    const to = myCurrency();
    const from = from0 && from0 !== to ? from0 : saved?.from ?? (to === "EUR" ? "USD" : "EUR");
    setS((v) => ({ ...v, from, to: saved && !from0 ? saved.to : to }));
  }, [from0]);
  const upd = (v: Partial<typeof s>) => { const n = { ...s, ...v }; setS(n); ls.set("sgct:fxpair", { from: n.from, to: n.to }); };
  const amt = Number(s.amount.replace(",", ".")) || 0;
  const out = fx ? convert(amt, s.from, s.to, fx.rates) : null;
  const one = fx ? convert(1, s.from, s.to, fx.rates) : null;
  const nf = (v: number, c: string) => formatMoney(v, c, il);
  const common = [1, 5, 10, 20, 50, 100, 500];
  return (
    <div className="stack tt-fx" style={{ gap: 12 }}>
      <div className="tt-fx-box">
        <label className="tt-fx-row">
          <select aria-label={t.currency} value={s.from} onChange={(e) => upd({ from: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
          <input aria-label={t.fxAmount} inputMode="decimal" value={s.amount} onChange={(e) => upd({ amount: e.target.value.replace(/[^\d.,]/g, "").slice(0, 12) })} />
        </label>
        <button className="tt-swap press" aria-label={t.fxSwap} title={t.fxSwap} onClick={() => upd({ from: s.to, to: s.from })}>⇅</button>
        <label className="tt-fx-row out">
          <select aria-label={t.currency} value={s.to} onChange={(e) => upd({ to: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
          <b className="num" aria-live="polite">{out === null ? "—" : nf(out, s.to)}</b>
        </label>
      </div>
      <small className="hint num">{one !== null && fmt(t.fxRate, { a: s.from, b: nf(one, s.to) })}{fx && <> · {fx.offline ? `📴 ${t.fxOfflineRates}` : fmt(t.fxUpdated, { d: fx.date })}</>}</small>
      <b className="ex-day">{t.fxCommon}</b>
      <div className="tt-fx-table">
        {fx && common.map((v) => (
          <button key={v} className="press" onClick={() => upd({ amount: String(v) })}>
            <span className="num">{nf(v, s.from)}</span><b className="num">{nf(convert(v, s.from, s.to, fx.rates) ?? 0, s.to)}</b>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Offline ---------- */
function useOffline() {
  const [list, setList] = useState<Record<string, OfflineInfo>>({});
  useEffect(() => { const r = () => setList(offlineList()); r(); window.addEventListener("sgct:offline", r); return () => window.removeEventListener("sgct:offline", r); }, []);
  return list;
}

/** Botão no roteiro (e na lista): descarregar, atualizar ou remover a cidade. */
export function OfflineButton({ t, locale, city, compact = false }: { t: Dict; locale: Locale; city: string; compact?: boolean }) {
  const list = useOffline();
  const [busy, setBusy] = useState<{ d: number; n: number } | null>(null);
  const [err, setErr] = useState(false);
  const info = list[city];
  const d = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  async function go() {
    setErr(false);
    if (!(await offlineReady())) { setErr(true); return; }
    setBusy({ d: 0, n: 1 });
    try { await saveCity(city, locale, (dd, n) => setBusy({ d: dd, n })); } catch { setErr(true); }
    setBusy(null);
  }
  if (busy) return (
    <div className="of-btn busy" role="status"><span>⬇</span><span className="stack" style={{ gap: 4, flex: 1 }}><b>{fmt(t.ofSaving, { d: busy.d, n: busy.n })}</b><i className="of-bar"><i style={{ width: `${(busy.d / Math.max(1, busy.n)) * 100}%` }} /></i></span></div>
  );
  if (info) return (
    <div className={`of-btn done ${compact ? "sm" : ""}`}>
      <span>✅</span>
      <span className="stack" style={{ gap: 0, flex: 1, minWidth: 0 }}><b>{t.ofDone}</b><small className="hint">{fmt(t.ofSaved, { d: d.format(new Date(info.at)) })}</small></span>
      <button className="link-btn" onClick={() => void go()}>{t.ofUpdate}</button>
      <button className="link-btn danger" onClick={() => void removeCity(city, locale)} aria-label={t.ofRemove}>{compact ? "✕" : t.ofRemove}</button>
    </div>
  );
  return (
    <div className="stack" style={{ gap: 6 }}>
      <button className={`of-btn press ${compact ? "sm" : ""}`} onClick={() => void go()}><span>⬇</span><span className="stack" style={{ gap: 0, flex: 1, textAlign: "start" }}><b>{t.ofBtn}</b>{!compact && <small className="hint">{t.ofSub}</small>}</span></button>
      {err && <small className="ch-warn">{t.ofUnavailable}</small>}
    </div>
  );
}

export function OfflineTab({ t, locale, cities, mine }: { t: Dict; locale: Locale; cities: Record<string, string>; mine: string[] }) {
  const list = useOffline();
  const ids = [...new Set([...mine, ...Object.keys(list)])].filter((id) => cities[id]);
  return (
    <div className="stack" style={{ gap: 12 }}>
      <p className="hint" style={{ margin: 0 }}>{t.ofSub}</p>
      {ids.length === 0 && <div className="card gp-empty"><span aria-hidden="true">📴</span><b>{t.ofNone}</b></div>}
      {ids.map((id) => (
        <div key={id} className="card stack" style={{ gap: 8, padding: 12 }}>
          <a className="row" href={`/${locale}/tour/${id}`} style={{ justifyContent: "space-between", textDecoration: "none", color: "inherit" }}><b>{cities[id]}</b><span className="hint">→</span></a>
          <OfflineButton t={t} locale={locale} city={id} compact />
        </div>
      ))}
      <small className="hint">🗺 {t.ofMapTip}</small>
    </div>
  );
}

/* ---------- Dividir despesas ---------- */
type Member = { id: string; name: string; handle: string | null; photo: string | null; me: boolean };
type Item = { id: string; kind: "expense" | "settle"; title: string; amount: number; origAmount: number; origCurrency: string; payer: string; shares: Record<string, number>; at: string; mine: boolean };
type Group = { id: string; title: string; currency: string; owner: boolean; members: Member[]; items: Item[]; balances: Record<string, number>; transfers: { from: string; to: string; amount: number }[]; total: number };
type GroupRow = { id: string; title: string; currency: string; people: number; balance: number; total: number };

const prof = (m: Member): PublicProfile => ({ handle: m.handle ?? m.name, name: m.name, bio: "", photo: m.photo, isPrivate: false });

export function SplitTab({ t, locale, open: open0 }: { t: Dict; locale: Locale; open?: string | null }) {
  const [rows, setRows] = useState<GroupRow[] | null | "auth">(null);
  const [open, setOpen] = useState<string | null>(open0 ?? null);
  const [creating, setCreating] = useState(false);
  const il = INTL_LOCALE[locale];
  const load = useCallback(() => {
    fetch("/api/me/split", { cache: "no-store" }).then((r) => (r.status === 401 ? "auth" : r.ok ? r.json().then((j) => j.groups) : Promise.reject()))
      .then(setRows).catch(() => setRows([]));
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (open0) setOpen(open0); }, [open0]);
  if (open) return <GroupView t={t} locale={locale} id={open} onBack={() => { setOpen(null); load(); }} />;
  if (rows === "auth") return <p className="hint">{t.wSignSub}</p>;
  return (
    <div className="stack" style={{ gap: 10 }}>
      {rows === null && [0, 1].map((i) => <div key={i} className="card wl-skel" style={{ height: 64 }} />)}
      {rows?.length === 0 && <div className="card gp-empty"><span aria-hidden="true">➗</span><b>{t.spEmpty}</b><p className="hint" style={{ margin: 0 }}>{t.spEmptySub}</p></div>}
      {rows?.map((g) => (
        <button key={g.id} className="card sp-row press" onClick={() => setOpen(g.id)}>
          <span className="sp-ic" aria-hidden="true">🧾</span>
          <span className="stack" style={{ gap: 2, flex: 1, minWidth: 0, textAlign: "start" }}>
            <b className="ad-ellip">{g.title}</b>
            <small className="hint">{fmt(t.spPeopleN, { n: g.people })} · {formatMoney(g.total / 100, g.currency, il)}</small>
          </span>
          <Bal t={t} v={g.balance} cur={g.currency} il={il} />
        </button>
      ))}
      <button className="btn press" onClick={() => setCreating(true)}>＋ {t.spNew}</button>
      {creating && <NewGroup t={t} onClose={(id) => { setCreating(false); if (id) setOpen(id); else load(); }} />}
    </div>
  );
}

function Bal({ t, v, cur, il }: { t: Dict; v: number; cur: string; il: string }) {
  if (Math.abs(v) < 1) return <small className="sp-bal ok">✓ {t.spSettled}</small>;
  const s = formatMoney(Math.abs(v) / 100, cur, il);
  return v > 0 ? <small className="sp-bal plus num">{fmt(t.spOwed, { v: s })}</small> : <small className="sp-bal minus num">{fmt(t.spOwe, { v: s })}</small>;
}

function useContacts() {
  const [c, setC] = useState<PublicProfile[]>([]);
  useEffect(() => { fetch("/api/chat?contacts=1").then((r) => (r.ok ? r.json() : null)).then((j) => setC(j?.contacts ?? [])).catch(() => undefined); }, []);
  return c;
}

function NewGroup({ t, onClose }: { t: Dict; onClose: (id?: string) => void }) {
  const contacts = useContacts();
  const [f, setF] = useState({ title: "", currency: "EUR" });
  const [picked, setPicked] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { setF((v) => ({ ...v, currency: myCurrency() })); }, []);
  async function create() {
    if (!f.title.trim()) return;
    setBusy(true); setErr("");
    const people = [...picked.map((handle) => ({ handle })), ...[...names, ...(name.trim() ? [name.trim()] : [])].map((n) => ({ name: n }))];
    const r = await fetch("/api/me/split", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, people }) }).then((x) => x.json()).catch(() => null);
    setBusy(false);
    if (r?.id) onClose(r.id); else setErr(r?.error === "offensive" ? t.mdOffensive : t.spFail);
  }
  return (
    <div className="sheet-bg" style={{ zIndex: 96 }} onClick={() => onClose()}>
      <div className="sheet stack" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={() => onClose()} label={t.close} />
        <b style={{ fontSize: 18 }}>🧾 {t.spNew}</b>
        <div className="field"><label htmlFor="sp-t">{t.spTitle}</label><input id="sp-t" value={f.title} maxLength={60} placeholder={t.spTitlePh} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
        <div className="field"><label htmlFor="sp-c">{t.spCurrency}</label><select id="sp-c" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <b className="ex-day">{t.spPeople}</b>
        {contacts.length > 0 && <div className="sp-chips">{contacts.map((p) => {
          const on = picked.includes(p.handle);
          return <button key={p.handle} className={`sp-chip press ${on ? "on" : ""}`} onClick={() => setPicked(on ? picked.filter((h) => h !== p.handle) : [...picked, p.handle])}><Avatar p={p} size={22} />{p.name}{on && " ✓"}</button>;
        })}</div>}
        {names.length > 0 && <div className="sp-chips">{names.map((n) => <button key={n} className="sp-chip on press" onClick={() => setNames(names.filter((x) => x !== n))}>👤 {n} ✕</button>)}</div>}
        <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
          <div className="field" style={{ flex: 1, margin: 0 }}><input aria-label={t.spAddName} placeholder={t.spAddName} value={name} maxLength={40} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) { e.preventDefault(); setNames([...names, name.trim()]); setName(""); } }} /></div>
          <button className="sc-follow on" disabled={!name.trim()} onClick={() => { setNames([...names, name.trim()]); setName(""); }}>＋</button>
        </div>
        {err && <small className="ch-warn">{err}</small>}
        <button className="btn press" disabled={busy || !f.title.trim()} onClick={() => void create()}>{t.spCreate}</button>
      </div>
    </div>
  );
}

function GroupView({ t, locale, id, onBack }: { t: Dict; locale: Locale; id: string; onBack: () => void }) {
  const [g, setG] = useState<Group | null | "none">(null);
  const [adding, setAdding] = useState(false);
  const [person, setPerson] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const il = INTL_LOCALE[locale];
  const money = (c: number, cur = (g as Group)?.currency) => formatMoney(c / 100, cur, il);
  useEffect(() => {
    fetch(`/api/me/split/${id}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject())).then(setG).catch(() => setG("none"));
  }, [id]);
  async function act(body: Record<string, unknown>) {
    const r = await fetch(`/api/me/split/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((x) => x.json()).catch(() => null);
    if (r?.group) setG(r.group);
    return r;
  }
  if (g === null) return <div className="card wl-skel" style={{ height: 160 }} />;
  if (g === "none") return <div className="stack"><button className="link-btn" onClick={onBack}><span className="rtl-flip">←</span> {t.ttSplit}</button><p className="hint">{t.spNotFound}</p></div>;
  const by = Object.fromEntries(g.members.map((m) => [m.id, m]));
  const nm = (mid: string) => (by[mid]?.me ? t.spYou : by[mid]?.name ?? "?");
  const me = g.members.find((m) => m.me);
  return (
    <div className="stack sp-g" style={{ gap: 12 }}>
      <button className="link-btn" style={{ alignSelf: "flex-start" }} onClick={onBack}><span className="rtl-flip">←</span> {t.ttSplit}</button>
      <div className="card stack sp-head" style={{ gap: 6 }}>
        <b style={{ fontSize: 20 }}>{g.title}</b>
        <span className="hint">{t.spTotal}: <b className="num" style={{ color: "var(--ink)" }}>{money(g.total)}</b> · {fmt(t.spPeopleN, { n: g.members.length })}</span>
        {me && <Bal t={t} v={g.balances[me.id] ?? 0} cur={g.currency} il={il} />}
        <div className="sp-faces">{g.members.map((m) => <span key={m.id} title={m.name}><Avatar p={prof(m)} size={30} /></span>)}<button className="sp-add press" aria-label={t.spAddPerson} title={t.spAddPerson} onClick={() => setPerson(true)}>＋</button></div>
      </div>
      <button className="btn press" onClick={() => setAdding(true)}>＋ {t.spAddExp}</button>

      <b className="ex-day">🤝 {t.spSettleUp}</b>
      {g.transfers.length === 0 ? <p className="hint" style={{ margin: 0 }}>{g.items.length ? t.spAllSettled : t.spNoExp}</p> : g.transfers.map((x) => (
        <div key={`${x.from}-${x.to}`} className="card sp-tr">
          <span className="stack" style={{ gap: 0, flex: 1, minWidth: 0 }}><span>{fmt(t.spPays, { a: nm(x.from), b: nm(x.to) })}</span><b className="num">{money(x.amount)}</b></span>
          <button className="sc-follow on" onClick={() => void act({ action: "settle", from: x.from, to: x.to, amount: x.amount })}>✓ {t.spMarkPaid}</button>
        </div>
      ))}

      <b className="ex-day">⚖️ {t.spBalances}</b>
      <div className="card stack" style={{ gap: 8, padding: 12 }}>
        {g.members.map((m) => (
          <div key={m.id} className="sp-line"><span className="row" style={{ gap: 8, flexWrap: "nowrap", minWidth: 0 }}><Avatar p={prof(m)} size={26} /><span className="ad-ellip">{m.me ? `${m.name} (${t.spYou})` : m.name}</span></span>
            <b className={`num ${(g.balances[m.id] ?? 0) > 0 ? "plus" : (g.balances[m.id] ?? 0) < 0 ? "minus" : ""}`}>{(g.balances[m.id] ?? 0) > 0 ? "+" : ""}{money(g.balances[m.id] ?? 0)}</b></div>
        ))}
      </div>

      <b className="ex-day">🧾 {t.spExpenses}</b>
      {g.items.length === 0 && <p className="hint" style={{ margin: 0 }}>{t.spNoExp}</p>}
      {g.items.map((it) => (
        <div key={it.id} className={`card sp-item ${it.kind}`}>
          <span className="sp-ic" aria-hidden="true">{it.kind === "settle" ? "💸" : "🧾"}</span>
          <span className="stack" style={{ gap: 1, flex: 1, minWidth: 0 }}>
            <b className="ad-ellip">{it.kind === "settle" ? fmt(t.spPayment, { a: nm(it.payer), b: nm(Object.keys(it.shares)[0]) }) : it.title || t.spExpenses}</b>
            {it.kind === "expense" && <small className="hint">{fmt(t.spPaid, { a: nm(it.payer), v: money(it.amount) })}{it.origCurrency !== g.currency && ` (${money(it.origAmount, it.origCurrency)})`}{me && it.shares[me.id] ? ` · ${fmt(t.spYourShare, { v: money(it.shares[me.id]) })}` : ""}</small>}
            <small className="hint">{new Intl.DateTimeFormat(il, { day: "numeric", month: "short" }).format(new Date(it.at))}</small>
          </span>
          {it.kind === "settle" && <b className="num">{money(it.amount)}</b>}
          {(it.mine || g.owner) && <button className="link-btn danger" aria-label={t.ofRemove} onClick={() => void act({ action: "remove", item: it.id })}>🗑</button>}
        </div>
      ))}

      <button className={`btn ghost press ${confirmDel ? "danger" : ""}`} onClick={async () => {
        if (!confirmDel) { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 4000); return; }
        await fetch(`/api/me/split/${id}`, { method: "DELETE" }).catch(() => null); onBack();
      }}>{g.owner ? `🗑 ${t.spDelete}` : `↪️ ${t.spLeave}`}{confirmDel ? "?" : ""}</button>

      {adding && <ExpenseSheet t={t} locale={locale} g={g} onClose={() => setAdding(false)} onSave={act} />}
      {person && <PersonSheet t={t} g={g} onClose={() => setPerson(false)} onSave={act} />}
    </div>
  );
}

function ExpenseSheet({ t, locale, g, onClose, onSave }: { t: Dict; locale: Locale; g: Group; onClose: () => void; onSave: (b: Record<string, unknown>) => Promise<{ ok?: boolean; error?: string } | null> }) {
  const me = g.members.find((m) => m.me);
  const [f, setF] = useState({ title: "", amount: "", currency: g.currency, payer: me?.id ?? g.members[0].id });
  const [among, setAmong] = useState<string[]>(g.members.map((m) => m.id));
  const [custom, setCustom] = useState(false);
  const [parts, setParts] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fx = useRates();
  const il = INTL_LOCALE[locale];
  const amt = Number(f.amount.replace(",", ".")) || 0;
  const conv = fx && f.currency !== g.currency ? convert(amt, f.currency, g.currency, fx.rates) : null;
  const sumParts = useMemo(() => Object.values(parts).reduce((a, v) => a + (Number(v.replace(",", ".")) || 0), 0), [parts]);
  const each = among.length ? amt / among.length : 0;
  async function save() {
    if (!(amt > 0)) return;
    if (custom && Math.abs(sumParts - amt) > 0.011) { setErr(t.spSharesErr); return; }
    setBusy(true); setErr("");
    const shares = custom ? Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, Number(v.replace(",", ".")) || 0]).filter(([, v]) => (v as number) > 0)) : undefined;
    const r = await onSave({ action: "expense", title: f.title.trim(), amount: amt, currency: f.currency, payer: f.payer, among: custom ? [] : among, shares });
    setBusy(false);
    if (r?.ok) onClose(); else setErr(r?.error === "offensive" ? t.mdOffensive : r?.error === "shares" ? t.spSharesErr : t.spFail);
  }
  return (
    <div className="sheet-bg" style={{ zIndex: 96 }} onClick={onClose}>
      <div className="sheet stack" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={onClose} label={t.close} />
        <b style={{ fontSize: 18 }}>🧾 {t.spAddExp}</b>
        <div className="field"><label htmlFor="ex-t">{t.spWhat}</label><input id="ex-t" value={f.title} maxLength={60} placeholder="🍽 · 🚕 · 🏨 · 🎟" onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
        <div className="row" style={{ gap: 8, flexWrap: "nowrap", alignItems: "flex-end" }}>
          <div className="field" style={{ flex: 1, margin: 0 }}><label htmlFor="ex-a">{t.fxAmount}</label><input id="ex-a" inputMode="decimal" value={f.amount} placeholder="0" onChange={(e) => setF({ ...f, amount: e.target.value.replace(/[^\d.,]/g, "").slice(0, 10) })} /></div>
          <div className="field" style={{ width: 110, margin: 0 }}><select aria-label={t.currency} value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        </div>
        {conv !== null && amt > 0 && <small className="hint num">{fmt(t.spConverted, { v: formatMoney(conv, g.currency, il) })}</small>}
        <div className="field"><label htmlFor="ex-p">{t.spPaidBy}</label><select id="ex-p" value={f.payer} onChange={(e) => setF({ ...f, payer: e.target.value })}>{g.members.map((m) => <option key={m.id} value={m.id}>{m.me ? `${m.name} (${t.spYou})` : m.name}</option>)}</select></div>
        <div className="seg-2" role="tablist">
          <button role="tab" aria-selected={!custom} className={!custom ? "on" : ""} onClick={() => setCustom(false)}>{t.spSplitEq}</button>
          <button role="tab" aria-selected={custom} className={custom ? "on" : ""} onClick={() => setCustom(true)}>{t.spSplitCustom}</button>
        </div>
        {!custom ? <>
          <b className="ex-day">{t.spAmong}</b>
          <div className="sp-chips">{g.members.map((m) => {
            const on = among.includes(m.id);
            return <button key={m.id} className={`sp-chip press ${on ? "on" : ""}`} onClick={() => setAmong(on ? among.filter((x) => x !== m.id) : [...among, m.id])}><Avatar p={prof(m)} size={22} />{m.me ? t.spYou : m.name}{on && amt > 0 && <small className="num"> {formatMoney(each, f.currency, il)}</small>}</button>;
          })}</div>
        </> : (
          <div className="card stack" style={{ gap: 8, padding: 12 }}>
            {g.members.map((m) => (
              <div key={m.id} className="sp-line"><span className="ad-ellip">{m.me ? t.spYou : m.name}</span>
                <input className="sp-part num" inputMode="decimal" placeholder="0" value={parts[m.id] ?? ""} onChange={(e) => setParts({ ...parts, [m.id]: e.target.value.replace(/[^\d.,]/g, "").slice(0, 10) })} aria-label={m.name} /></div>
            ))}
            <small className={`num ${Math.abs(sumParts - amt) > 0.011 ? "ch-warn" : "hint"}`}>{formatMoney(sumParts, f.currency, il)} / {formatMoney(amt, f.currency, il)}</small>
          </div>
        )}
        {err && <small className="ch-warn">{err}</small>}
        <button className="btn press" disabled={busy || !(amt > 0) || (!custom && !among.length)} onClick={() => void save()}>{t.spAddExp}</button>
      </div>
    </div>
  );
}

function PersonSheet({ t, g, onClose, onSave }: { t: Dict; g: Group; onClose: () => void; onSave: (b: Record<string, unknown>) => Promise<{ ok?: boolean; error?: string } | null> }) {
  const contacts = useContacts().filter((c) => !g.members.some((m) => m.handle === c.handle));
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  async function add(b: Record<string, unknown>) {
    const r = await onSave({ action: "member", ...b });
    if (r?.ok) onClose(); else setErr(r?.error === "offensive" ? t.mdOffensive : t.spFail);
  }
  return (
    <div className="sheet-bg" style={{ zIndex: 96 }} onClick={onClose}>
      <div className="sheet stack" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={onClose} label={t.close} />
        <b style={{ fontSize: 18 }}>＋ {t.spAddPerson}</b>
        {contacts.map((p) => (
          <div key={p.handle} className="sc-row">
            <span className="sc-row-l"><Avatar p={p} /><span className="stack" style={{ gap: 0, minWidth: 0 }}><b className="ad-ellip">{p.name}</b><small className="hint">@{p.handle}</small></span></span>
            <button className="sc-follow on" onClick={() => void add({ handle: p.handle })}>＋</button>
          </div>
        ))}
        <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
          <div className="field" style={{ flex: 1, margin: 0 }}><input aria-label={t.spAddName} placeholder={t.spAddName} value={name} maxLength={40} onChange={(e) => setName(e.target.value)} /></div>
          <button className="sc-follow on" disabled={!name.trim()} onClick={() => void add({ name: name.trim() })}>＋</button>
        </div>
        {err && <small className="ch-warn">{err}</small>}
      </div>
    </div>
  );
}

/* ---------- Folha com as três ferramentas ---------- */
export function ToolsSheet({ t, locale, cities, mine, localCur, tab: tab0, split, signed, onClose }: {
  t: Dict; locale: Locale; cities: Record<string, string>; mine: string[]; localCur?: string | null; tab: ToolTab; split?: string | null; signed: boolean; onClose: () => void;
}) {
  const [tab, setTab] = useState<ToolTab>(tab0);
  useEffect(() => setTab(tab0), [tab0]);
  const tabs: [ToolTab, LucideIcon, string][] = [["fx", ArrowLeftRight, t.ttFx], ["offline", CloudDownload, t.ttOffline], ["split", Receipt, t.ttSplit]];
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack tt" style={{ gap: 14 }} onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={onClose} label={t.close} />
        <b style={{ fontSize: 19 }} className="row" ><span className="qi q3 sm"><I icon={Wrench} size={17} /></span>{t.ttTools}</b>
        <nav className="seg-3" role="tablist">
          {tabs.map(([k, ic, label]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}><I icon={ic} size={17} on={tab === k} />{label}</button>)}
        </nav>
        {tab === "fx" && <FxConverter t={t} locale={locale} from={localCur} />}
        {tab === "offline" && <OfflineTab t={t} locale={locale} cities={cities} mine={mine} />}
        {tab === "split" && (signed ? <SplitTab t={t} locale={locale} open={split} /> : <p className="hint">{t.wSignSub}</p>)}
      </div>
    </div>
  );
}
