"use client";
import { SheetX } from "@/components/WinNav";
import { AvatarStudio } from "./AvatarStudio";
import type { TravelPrefs } from "@/lib/db/schema";
/**
 * Rede social da carteira (fase 1): perfil, pessoas (pesquisa, pedidos, seguidores), algoritmo e aparência.
 * Tudo leve: só carrega dados quando o viajante abre cada parte.
 */
import { useEffect, useMemo, useState } from "react";
import { fmt } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { HOBBIES, HOBBY_ICON, type Hobby } from "@/lib/explore";
import { ACCENT_HEX, applyTheme, readTheme, type Accent, type Theme } from "@/lib/theme";
import Portal from "@/components/Portal";

export type PublicProfile = { handle: string; name: string; bio: string; photo: string | null; isPrivate: boolean };
export type MyProfile = PublicProfile & { theme: Theme; accent: Accent; cities: string[]; lessOf: string[] };
export type Social = { profile: MyProfile | null; count: { followers: number; following: number; requests: number }; followers: PublicProfile[]; following: PublicProfile[]; requests: PublicProfile[] };
type Rel = "none" | "requested" | "following" | "self" | "blocked";

export async function loadSocial(): Promise<Social | null> {
  const r = await fetch("/api/me/profile", { cache: "no-store" }).catch(() => null);
  if (!r?.ok) return null;
  const j = await r.json();
  return { profile: j.profile ?? null, count: j.count ?? { followers: 0, following: 0, requests: 0 }, followers: j.followers ?? [], following: j.following ?? [], requests: j.requests ?? [] };
}
export const act = (handle: string, action: string, extra: Record<string, string> = {}) =>
  fetch("/api/social/act", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ handle, action, ...extra }) }).then((r) => r.json()).catch(() => null);

/** Selo azul da conta oficial. */
export const Verified = ({ handle }: { handle: string }) => (handle === "voybu" ? <span className="vf" title="Official" aria-label="Official">✓</span> : null);

export function Avatar({ p, size = 44 }: { p: { photo: string | null; name: string }; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return p.photo ? <img className="sc-av" src={p.photo} alt="" style={{ width: size, height: size }} />
    : <span className="sc-av sc-av-i" style={{ width: size, height: size, fontSize: size * 0.42 }}>{(p.name || "?").trim().charAt(0).toUpperCase()}</span>;
}

/** Fotografia quadrada reduzida (≤ ~100 KB) no próprio telemóvel. */
async function squarePhoto(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const s = Math.min(img.width, img.height), out = 360;
  const c = document.createElement("canvas"); c.width = c.height = out;
  c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, out, out);
  let q = 0.85, data = c.toDataURL("image/jpeg", q);
  while (data.length > 130_000 && q > 0.4) { q -= 0.1; data = c.toDataURL("image/jpeg", q); }
  return data;
}

/* ---------- Editar / criar perfil ---------- */
export function ProfileEditor({ t, initial, onClose }: { t: Dict; initial: MyProfile | null; onClose: (changed: boolean) => void }) {
  const [v, setV] = useState({ handle: initial?.handle ?? "", name: initial?.name ?? "", bio: initial?.bio ?? "", photo: initial?.photo ?? null as string | null, isPrivate: initial?.isPrivate ?? true, adult: Boolean(initial) });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [del, setDel] = useState(false);
  const [studio, setStudio] = useState(false);
  const okHandle = /^[a-z0-9._]{3,24}$/.test(v.handle) && !/^[._]|[._]$|\.\./.test(v.handle);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (!okHandle) return setErr(t.scErrHandle);
    if (!v.adult) return setErr(t.scErrAdult);
    setBusy(true);
    const r = await fetch("/api/me/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(v) }).catch(() => null);
    setBusy(false);
    if (r?.ok) return onClose(true);
    const j = await r?.json().catch(() => null);
    setErr(j?.error === "taken" ? t.scErrTaken : j?.error === "handle" ? t.scErrHandle : j?.error === "offensive" ? t.mdOffensive : t.scErr);
  }
  return (
    <Portal><div className="sheet-bg" onClick={() => onClose(false)}>
      <form className="sheet stack sc-edit" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <SheetX onClose={() => onClose(false)} label={t.close} />
        <b style={{ fontSize: 19 }}>{initial ? t.scEdit : t.scCreate}</b>
        <button type="button" className="sc-photo" onClick={() => setStudio(true)}>
          <Avatar p={{ photo: v.photo, name: v.name }} size={84} />
          <span className="link-btn">{t.scPhoto}</span>
        </button>
        {studio && <AvatarStudio t={t} name={v.name || v.handle} onClose={() => setStudio(false)} onDone={(photo) => { setV({ ...v, photo }); setStudio(false); }} />}
        <div className="field"><label htmlFor="scn">{t.scName}</label><input id="scn" required maxLength={60} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="sch">{t.scHandle}</label>
          <div className="sc-handle"><span>@</span><input id="sch" required maxLength={24} value={v.handle} autoCapitalize="none" autoCorrect="off" spellCheck={false}
            onChange={(e) => setV({ ...v, handle: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "") })} /></div>
          <small className="hint">{t.scHandleHint}</small></div>
        <div className="field"><label htmlFor="scb">{t.scBio}</label><textarea id="scb" rows={2} maxLength={160} value={v.bio} onChange={(e) => setV({ ...v, bio: e.target.value })} /></div>
        <label className="sc-switch"><input type="checkbox" checked={v.isPrivate} onChange={(e) => setV({ ...v, isPrivate: e.target.checked })} /><span><b>🔒 {t.scPrivate}</b><small className="hint">{t.scPrivateHint}</small></span></label>
        {!initial && <label className="consent"><input type="checkbox" checked={v.adult} onChange={(e) => setV({ ...v, adult: e.target.checked })} /> <span>{t.scAdult}</span></label>}
        {err && <p className="err">{err}</p>}
        <div className="grid2"><button type="button" className="btn ghost press" onClick={() => onClose(false)}>{t.exCancel}</button><button className="btn press" disabled={busy}>{t.scSave}</button></div>
        {initial && <button type="button" className={`btn ghost press ${del ? "danger" : ""}`} onClick={async () => {
          if (!del) return setDel(true);
          await fetch("/api/me/profile", { method: "DELETE" }).catch(() => null); onClose(true);
        }}>{del ? t.scDeleteSure : t.scDelete}</button>}
      </form>
    </div></Portal>
  );
}

/* ---------- Botão seguir ---------- */
export function FollowBtn({ t, handle, rel, onChange }: { t: Dict; handle: string; rel: Rel; onChange?: (r: Rel) => void }) {
  const [r, setR] = useState(rel);
  const [busy, setBusy] = useState(false);
  const [need, setNeed] = useState(false);
  useEffect(() => setR(rel), [rel]);
  if (r === "self" || r === "blocked") return null;
  async function go() {
    setBusy(true);
    if (r === "none") { const j = await act(handle, "follow"); if (j?.error === "no_profile") setNeed(true); else if (j?.relation) { setR(j.relation); onChange?.(j.relation); } }
    else { await act(handle, "unfollow"); setR("none"); onChange?.("none"); }
    setBusy(false);
  }
  if (need) return <small className="hint" style={{ maxWidth: 160, textAlign: "end" }}>{t.scNeedProfile}</small>;
  return <button className={`sc-follow ${r === "none" ? "on" : ""}`} disabled={busy} onClick={(e) => { e.preventDefault(); void go(); }}>{r === "none" ? t.scFollow : r === "requested" ? t.scRequested : t.scFollowing}</button>;
}

function Row({ t, locale, p, right }: { t: Dict; locale: Locale; p: PublicProfile; right?: React.ReactNode }) {
  return (
    <div className="sc-row">
      <a className="sc-row-l" href={`/${locale}/u/${p.handle}`}><Avatar p={p} /><span className="stack" style={{ gap: 0, minWidth: 0 }}><b className="ad-ellip">{p.name}<Verified handle={p.handle} />{p.isPrivate ? " 🔒" : ""}</b><small className="hint ad-ellip">@{p.handle}</small></span></a>
      {right ?? null}
      {!right && <span className="hint" style={{ fontSize: 12 }}>{t.scView}</span>}
    </div>
  );
}

/* ---------- Pessoas: pesquisa, pedidos, seguidores e a seguir ---------- */
export function PeopleTab({ t, locale, social, cities, onChange, onEdit }: { t: Dict; locale: Locale; social: Social; cities: Record<string, string>; onChange: () => void; onEdit: () => void }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<(PublicProfile & { relation: Rel; shared: number })[] | null>(null);
  const [view, setView] = useState<"find" | "followers" | "following">("find");
  useEffect(() => {
    const id = setTimeout(() => {
      fetch(`/api/social/search?q=${encodeURIComponent(q)}`).then((r) => (r.ok ? r.json() : null)).then((j) => setRes(j?.people ?? [])).catch(() => setRes([]));
    }, q ? 300 : 0);
    return () => clearTimeout(id);
  }, [q]);
  if (!social.profile) return (
    <div className="card gp-empty"><span aria-hidden="true">👥</span><b>{t.scCreateTitle}</b><p className="hint" style={{ margin: 0 }}>{t.scCreateSub}</p><button className="btn press" style={{ width: "auto", marginTop: 8 }} onClick={onEdit}>{t.scCreate}</button></div>
  );
  return (
    <section className="stack" style={{ gap: 12 }}>
      {social.requests.length > 0 && (
        <div className="card stack" style={{ gap: 6, padding: 14 }}>
          <b>🔔 {fmt(t.scRequests, { n: social.requests.length })}</b>
          {social.requests.map((p) => <Row key={p.handle} t={t} locale={locale} p={p} right={<span className="row" style={{ gap: 6 }}>
            <button className="sc-follow on" onClick={async () => { await act(p.handle, "accept"); onChange(); }}>{t.scAccept}</button>
            <button className="sc-follow" onClick={async () => { await act(p.handle, "decline"); onChange(); }}>✕</button></span>} />)}
        </div>
      )}
      <div className="ex-chips">
        {(["find", "followers", "following"] as const).map((k) => <button key={k} className={view === k ? "on" : ""} onClick={() => setView(k)}>
          {k === "find" ? `🔎 ${t.scFind}` : k === "followers" ? `${social.count.followers} ${t.scFollowers}` : `${social.count.following} ${t.scFollowingN}`}</button>)}
      </div>
      {view === "find" && <>
        <div className="sc-search"><span aria-hidden="true">🔎</span><input type="search" placeholder={t.scSearch} value={q} onChange={(e) => setQ(e.target.value)} autoCapitalize="none" /></div>
        {!q && <b className="ex-day">{t.scSuggested}</b>}
        {res === null && <p className="hint">{t.exLoading}</p>}
        {res && res.length === 0 && <p className="hint">{t.scNone}</p>}
        {res?.map((p) => <Row key={p.handle} t={t} locale={locale} p={p} right={<span className="stack" style={{ gap: 2, alignItems: "flex-end" }}>
          <FollowBtn t={t} handle={p.handle} rel={p.relation} onChange={onChange} />{p.shared > 0 && <small className="hint" style={{ fontSize: 11 }}>{fmt(t.scShared, { n: p.shared })}</small>}</span>} />)}
      </>}
      {view === "followers" && (social.followers.length ? social.followers.map((p) => <Row key={p.handle} t={t} locale={locale} p={p} right={<button className="sc-follow" onClick={async () => { await act(p.handle, "remove"); onChange(); }}>{t.scRemove}</button>} />) : <p className="hint">{t.scNone}</p>)}
      {view === "following" && (social.following.length ? social.following.map((p) => <Row key={p.handle} t={t} locale={locale} p={p} right={<FollowBtn t={t} handle={p.handle} rel="following" onChange={onChange} />} />) : <p className="hint">{t.scNone}</p>)}
      {Object.keys(cities).length === 0 && null}
    </section>
  );
}

/* ---------- Definições: aparência e o seu algoritmo ---------- */
export function SettingsSheet({ t, locale, hobbies, social, cities, onHobbies, onClose }: {
  t: Dict; locale: Locale; hobbies: string[]; social: Social | null; cities: Record<string, string>; onHobbies: (h: Hobby[]) => void; onClose: (changed: boolean) => void;
}) {
  const [{ theme, accent }, setTA] = useState(readTheme);
  const [more, setMore] = useState<Hobby[]>(hobbies.filter((h): h is Hobby => (HOBBIES as readonly string[]).includes(h)));
  const [less, setLess] = useState<Hobby[]>(() => { try { return JSON.parse(localStorage.getItem("sgct:less") ?? "[]"); } catch { return []; } });
  const [follow, setFollow] = useState<string[]>(social?.profile?.cities ?? []);
  const [adding, setAdding] = useState<"more" | "less" | null>(null);
  const [cq, setCq] = useState("");
  const [travel, setTravel] = useState<TravelPrefs>(() => { try { return JSON.parse(localStorage.getItem("sgct:travel") ?? "{}"); } catch { return {}; } });
  useEffect(() => { fetch("/api/me/prefs", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j?.travel) setTravel(j.travel); }).catch(() => null); }, []);
  const toggleIn = <K extends "types" | "access">(k: K, v: NonNullable<TravelPrefs[K]>[number]) => setTravel((p) => { const cur = (p[k] ?? []) as string[]; return { ...p, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] }; });
  useEffect(() => { if (social?.profile?.lessOf?.length && !less.length) setLess(social.profile.lessOf as Hobby[]); }, [social]); // eslint-disable-line react-hooks/exhaustive-deps
  const setT = (th: Theme, ac: Accent) => { setTA({ theme: th, accent: ac }); applyTheme(th, ac); };
  const summary = useMemo(() => {
    const parts = [...more.slice(0, 3).map((h) => t.hob[h].toLowerCase()), ...follow.slice(0, 2).map((c) => cities[c])].filter(Boolean);
    return parts.length ? fmt(t.scLately, { x: parts.length > 1 ? `${parts.slice(0, -1).join(", ")} ${t.scAnd} ${parts[parts.length - 1]}` : parts[0] }) : t.scLatelyNone;
  }, [more, follow, t, cities]);
  async function save() {
    try { localStorage.setItem("sgct:hobbies", JSON.stringify(more)); localStorage.setItem("sgct:less", JSON.stringify(less)); localStorage.setItem("sgct:travel", JSON.stringify(travel)); } catch { /* ignorar */ }
    onHobbies(more);
    await Promise.all([
      fetch("/api/me/prefs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hobbies: more, travel }) }).catch(() => null),
      fetch("/api/me/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cities: follow, lessOf: less }) }).catch(() => null)
    ]);
    onClose(true);
  }
  const chip = (h: Hobby, on: boolean, toggle: () => void, minus = false) => <button key={h} className={`sc-chip ${on ? "on" : ""} ${minus ? "less" : ""}`} onClick={toggle}>{on ? "" : "+ "}{HOBBY_ICON[h]} {t.hob[h]}{on ? " ✕" : ""}</button>;
  return (
    <Portal><div className="sheet-bg" onClick={() => onClose(false)}>
      <div className="sheet stack sc-set" style={{ gap: 18 }} onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={() => onClose(false)} label={t.close} />
        <a className="ac-link" href={`/${locale}/wallet/account`}><span aria-hidden="true">👤</span><span className="stack" style={{ gap: 0 }}><b>{t.acTitle}</b><small className="hint">{t.acLinkSub}</small></span><span aria-hidden="true">›</span></a>
        <section className="stack" style={{ gap: 10 }}>
          <b className="sc-h">🎨 {t.scAppearance}</b>
          <div className="sc-seg">{(["auto", "light", "dark"] as Theme[]).map((x) => <button key={x} className={theme === x ? "on" : ""} onClick={() => setT(x, accent)}>{x === "auto" ? `⚙︎ ${t.scAuto}` : x === "light" ? `☀️ ${t.scDay}` : `🌙 ${t.scNight}`}</button>)}</div>
          <div className="sc-acc">{(Object.keys(ACCENT_HEX) as Accent[]).map((a) => <button key={a} aria-label={a} aria-pressed={accent === a} className={accent === a ? "on" : ""} style={{ background: ACCENT_HEX[a] }} onClick={() => setT(theme, a)} />)}</div>
        </section>

        <section className="stack" style={{ gap: 10 }}>
          <b className="sc-h">✨ {t.scAlgo}</b>
          <p className="sc-lately">{summary}</p>
          <b>{t.scMore}</b>
          <div className="sc-chips">
            {more.map((h) => chip(h, true, () => setMore(more.filter((x) => x !== h))))}
            <button className="sc-chip add" onClick={() => setAdding(adding === "more" ? null : "more")}>+ {t.scAdd}</button>
          </div>
          {adding === "more" && <div className="sc-chips">{HOBBIES.filter((h) => !more.includes(h)).map((h) => chip(h, false, () => { setMore([...more, h]); setLess(less.filter((x) => x !== h)); }))}</div>}
          <b>{t.scCities}</b>
          {!social?.profile && <small className="hint">{t.scCitiesNeed}</small>}
          {follow.length > 0 && <div className="sc-chips">{follow.filter((id) => cities[id]).map((id) => <button key={id} disabled={!social?.profile} className="sc-chip on" onClick={() => setFollow(follow.filter((x) => x !== id))}>✓ {cities[id]} ✕</button>)}</div>}
          {social?.profile && <input className="sc-csearch" type="search" value={cq} onChange={(e) => setCq(e.target.value)} placeholder={`🔎 ${t.qsSearch}`} aria-label={t.qsSearch} />}
          {cq.trim().length > 0 && <div className="sc-chips">{Object.entries(cities).filter(([id, n]) => !follow.includes(id) && n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(cq.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))).slice(0, 12).map(([id, n]) => <button key={id} className="sc-chip" onClick={() => { setFollow([...follow, id]); setCq(""); }}>+ {n}</button>)}</div>}
          <b>{t.scLess}</b>
          <div className="sc-chips">
            {less.map((h) => chip(h, true, () => setLess(less.filter((x) => x !== h)), true))}
            <button className="sc-chip add" onClick={() => setAdding(adding === "less" ? null : "less")}>+ {t.scAdd}</button>
          </div>
          {adding === "less" && <div className="sc-chips">{HOBBIES.filter((h) => !less.includes(h)).map((h) => chip(h, false, () => { setLess([...less, h]); setMore(more.filter((x) => x !== h)); }, true))}</div>}
        </section>
        <section className="stack" style={{ gap: 10 }}>
          <b className="sc-h">🧭 {t.trv.title}</b>
          <small className="hint">{t.trv.sub}</small>
          <b>{t.trv.type}</b>
          <div className="sc-chips">{(["layover", "business", "family", "leisure"] as const).map((k) => <button key={k} type="button" aria-pressed={travel.types?.includes(k) ?? false} className={`sc-chip ${travel.types?.includes(k) ? "on" : ""}`} onClick={() => toggleIn("types", k)}>{travel.types?.includes(k) ? "✓ " : ""}{t.trv.types[k]}</button>)}</div>
          <b>{t.trv.pace}</b>
          <div className="sc-seg sc-seg3">{(["calm", "balanced", "intense"] as const).map((k) => <button key={k} type="button" aria-pressed={(travel.pace ?? "balanced") === k} className={(travel.pace ?? "balanced") === k ? "on" : ""} onClick={() => setTravel({ ...travel, pace: k })}>{t.trv.paces[k]}</button>)}</div>
          <b>{t.trv.access}</b>
          <div className="sc-chips">{(["steps", "stroller", "wheelchair"] as const).map((k) => <button key={k} type="button" aria-pressed={travel.access?.includes(k) ?? false} className={`sc-chip ${travel.access?.includes(k) ? "on" : ""}`} onClick={() => toggleIn("access", k)}>{travel.access?.includes(k) ? "✓ " : ""}{t.trv.acc[k]}</button>)}</div>
          {(travel.access?.length ?? 0) > 0 && <small className="hint">♿ {t.trv.accNote}</small>}
        </section>
        <div className="grid2"><button className="btn ghost press" onClick={() => onClose(false)}>{t.close}</button><button className="btn press" onClick={() => void save()}>{t.scSave}</button></div>
        <a className="hint" href={`/${locale}/legal/privacy`} style={{ fontSize: 12 }}>{t.lPrivacy}</a>
      </div>
    </div></Portal>
  );
}
