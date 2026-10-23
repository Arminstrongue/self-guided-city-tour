"use client";
/** Perfil de outro viajante: foto, nome, seguidores, seguir, cidades visitadas (se puder ver), bloquear e denunciar. */
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { flag } from "@/data/countries";
import { Avatar, FollowBtn, Verified, act, type PublicProfile } from "./Social";
import { ProfilePosts, ProfileStories } from "./Feed";

type View = { profile: PublicProfile; relation: "self" | "none" | "requested" | "following" | "blocked"; followers: number; following: number; canSee: boolean; visited: { name: string; country: string }[]; cities: string[]; canMessage?: boolean };

export function UserView({ t, locale, handle, cities }: { t: Dict; locale: Locale; handle: string; cities: Record<string, string> }) {
  const [v, setV] = useState<View | null | "none">(null);
  const [menu, setMenu] = useState(false);
  const [reported, setReported] = useState(false);
  const load = () => fetch(`/api/social/u/${encodeURIComponent(handle)}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : "none")).then(setV).catch(() => setV("none"));
  useEffect(() => { void load(); }, [handle]); // eslint-disable-line react-hooks/exhaustive-deps
  if (v === null) return <p className="hint" style={{ marginTop: 24 }}>{t.exLoading}</p>;
  if (v === "none") return <div className="card gp-empty" style={{ marginTop: 16 }}><span aria-hidden="true">🙈</span><b>{t.scNotFound}</b><a className="btn press" href={`/${locale}/wallet`} style={{ width: "auto" }}>{t.scBack}</a></div>;
  const p = v.profile;
  return (
    <div className="stack" style={{ gap: 16, marginTop: 8 }}>
      <section className="card stack sc-prof" style={{ gap: 12 }}>
        <div className="row-between" style={{ alignItems: "flex-start" }}>
          <div className="row" style={{ gap: 14, flexWrap: "nowrap", minWidth: 0 }}>
            {v.canSee ? <ProfileStories t={t} locale={locale} handle={p.handle} author={p} /> : <Avatar p={p} size={84} />}
            <div className="stack" style={{ gap: 2, minWidth: 0 }}>
              <b style={{ fontSize: 20 }} className="ad-ellip">{p.name}<Verified handle={p.handle} /></b>
              <span className="hint">@{p.handle}{p.isPrivate ? " 🔒" : ""}</span>
              <span className="wl-me-c" style={{ color: "var(--ink)" }}><span><b className="num">{v.followers}</b> {v.followers === 1 ? t.scFollower : t.scFollowers}</span><span><b className="num">{v.following}</b> {t.scFollowingN}</span></span>
            </div>
          </div>
          {v.relation === "self"
            ? <a className="wl-ic" href={`/${locale}/wallet/account`} aria-label={t.st.title} title={t.st.title} style={{ color: "var(--ink)", background: "var(--surface-2)" }}><Menu size={20} aria-hidden="true" /></a>
            : <button className="wl-ic" aria-label="⋯" onClick={() => setMenu(!menu)} style={{ color: "var(--ink)", background: "var(--surface-2)" }}>⋯</button>}
        </div>
        {p.bio && <p style={{ margin: 0 }}>{p.bio}</p>}
        {v.relation === "self" ? <a className="btn ghost press" href={`/${locale}/wallet`}>{t.scEdit}</a> : (
          <div className={v.canMessage ? "grid2" : ""}><FollowBtn t={t} handle={p.handle} rel={v.relation} onChange={() => void load()} />
            {v.canMessage && <a className="sc-follow uv-msg" href={`/${locale}/wallet#chat:${p.handle}`}>💬 {t.chMessage}</a>}</div>
        )}
        {menu && (
          <div className="stack sc-menu" style={{ gap: 6 }}>
            <button onClick={async () => { await act(p.handle, "block"); setMenu(false); setV("none"); }}>🚫 {t.scBlock}</button>
            {reported ? <p className="note">✓ {t.scReportDone}</p> : (
              <div className="stack" style={{ gap: 6 }}>
                <b>⚑ {t.scReport}</b>
                <div className="ex-chips">{(Object.keys(t.scReasons) as (keyof typeof t.scReasons)[]).map((r) => <button key={r} onClick={async () => { await act(p.handle, "report", { reason: r }); setReported(true); }}>{t.scReasons[r]}</button>)}</div>
              </div>
            )}
          </div>
        )}
      </section>
      {!v.canSee ? (
        <div className="card gp-empty"><span aria-hidden="true">🔒</span><b>{t.scPrivateAcc}</b><p className="hint" style={{ margin: 0 }}>{t.scPrivateAccSub}</p></div>
      ) : (
        <>
        <ProfilePosts t={t} locale={locale} handle={p.handle} cities={cities} author={p} />
        <section className="stack" style={{ gap: 10 }}>
          <h2 className="gp-h2">🌍 {t.scVisited} <small className="hint num">· {v.visited.length}</small></h2>
          {v.visited.length ? <div className="vs-grid">{v.visited.map((x) => <span key={`${x.name}-${x.country}`} className="vs-chip"><span aria-hidden="true">{flag(x.country)}</span><b>{x.name}</b></span>)}</div> : <p className="hint">{t.scNone}</p>}
        </section>
        </>
      )}
    </div>
  );
}
