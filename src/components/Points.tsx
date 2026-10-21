"use client";
/** Pontos, nível, medalhas, ranking (amigos / todos, sempre / este mês) e prémios. */
import { useEffect, useState } from "react";
import { Trophy, Medal, Info, Gift } from "lucide-react";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { SheetX } from "@/components/WinNav";
import { toast } from "@/lib/toast";

type BadgeId = keyof Dict["ptBadgeNames"];
type Score = {
  points: number; level: number; levelAt: number; nextAt: number | null; cities: number; countries: number; stops: number; badges: BadgeId[];
  breakdown: { k: keyof Dict["ptRules"]; n: number; pts: number }[];
  rewards: { at: number; cents: number; got: boolean }[]; newRewards: number[];
  rules: Record<keyof Dict["ptRules"] | "city" | "declaredCity" | "country" | "stop" | "postDay" | "commentDay" | "friendJoined" | "friendPaid", number>;
  allBadges: { id: BadgeId; icon: string }[];
};
type Row = { rank: number; handle: string; name: string; photo: string | null; points: number; cities: number; countries: number; level: number; me: boolean };
const LV_ICON = ["🌱", "🧳", "🧭", "✈️", "🌍", "🏆", "👑"];
const eur = (c: number, l: Locale) => new Intl.NumberFormat(INTL_LOCALE[l], { style: "currency", currency: "EUR" }).format(c / 100);

export function usePoints(enabled: boolean) {
  const [s, setS] = useState<Score | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    const load = () => fetch("/api/me/points", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (live && j) setS(j); }).catch(() => null);
    void load();
    const on = () => void load();
    window.addEventListener("sgct:points", on);
    return () => { live = false; window.removeEventListener("sgct:points", on); };
  }, [enabled]);
  return s;
}

/** Cartão compacto (perfil da carteira). */
export function PointsCard({ t, locale, s, onOpen }: { t: Dict; locale: Locale; s: Score | null; onOpen: () => void }) {
  useEffect(() => { if (s?.newRewards?.length) toast(fmt(t.ptNewReward, { c: eur(s.newRewards.reduce((a, b) => a + b, 0), locale) }), { icon: "🎉", ms: 5000 }); }, [s?.newRewards]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!s) return null;
  const pct = s.nextAt ? Math.round(((s.points - s.levelAt) / (s.nextAt - s.levelAt)) * 100) : 100;
  const owned = new Set(s.badges);
  return (
    <button type="button" className="pt-card press" onClick={onOpen} aria-label={t.ptTitle}>
      <span className="pt-lv" aria-hidden="true">{LV_ICON[s.level]}</span>
      <span className="stack" style={{ gap: 4, flex: 1, minWidth: 0 }}>
        <span className="pt-top"><b>{t.ptLevels[s.level]}</b><b className="num pt-pts">{fmt(t.ptPoints, { n: s.points.toLocaleString(INTL_LOCALE[locale]) })}</b></span>
        <span className="pt-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></span>
        <small className="hint">{s.nextAt ? fmt(t.ptNext, { n: (s.nextAt - s.points).toLocaleString(INTL_LOCALE[locale]), l: t.ptLevels[s.level + 1] }) : t.ptMax}</small>
        <span className="pt-badges" aria-hidden="true">{s.allBadges.filter((b) => owned.has(b.id)).slice(0, 8).map((b) => <i key={b.id}>{b.icon}</i>)}<span className="pt-go"><Trophy size={14} /> {t.ptRanking}</span></span>
      </span>
    </button>
  );
}

export function PointsSheet({ t, locale, s, onClose }: { t: Dict; locale: Locale; s: Score; onClose: () => void }) {
  const [tab, setTab] = useState<"rank" | "badges" | "how">("rank");
  const [scope, setScope] = useState<"friends" | "global">("friends");
  const [period, setPeriod] = useState<"all" | "month">("all");
  const [lb, setLb] = useState<{ top: Row[]; mine: Row | null } | null>(null);
  useEffect(() => {
    if (tab !== "rank") return;
    setLb(null);
    fetch(`/api/leaderboard?scope=${scope}&period=${period}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => setLb(j ?? { top: [], mine: null })).catch(() => setLb({ top: [], mine: null }));
  }, [tab, scope, period]);
  const owned = new Set(s.badges);
  const row = (r: Row) => (
    <a key={`${r.rank}-${r.handle}`} href={`/${locale}/u/${r.handle}`} className={`rk-row ${r.me ? "me" : ""}`}>
      <span className={`rk-rank num ${r.rank <= 3 ? `top${r.rank}` : ""}`}>{r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : r.rank}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {r.photo ? <img className="sc-av" src={r.photo} alt="" style={{ width: 40, height: 40 }} /> : <span className="sc-av sc-av-i" style={{ width: 40, height: 40, fontSize: 17 }}>{r.name.charAt(0).toUpperCase()}</span>}
      <span className="stack" style={{ gap: 0, flex: 1, minWidth: 0 }}><b className="ad-ellip">{r.me ? `${r.name} · ${t.ptYou}` : r.name}</b><small className="hint">{LV_ICON[r.level]} {fmt(t.ptCities, { n: r.cities })} · {r.countries} 🏳️</small></span>
      <b className="num rk-pts">{r.points.toLocaleString(INTL_LOCALE[locale])}</b>
    </a>
  );
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet stack pt-sheet" style={{ gap: 14 }} onClick={(e) => e.stopPropagation()}>
        <SheetX onClose={onClose} label={t.close} />
        <div className="pt-hero">
          <span className="pt-lv big" aria-hidden="true">{LV_ICON[s.level]}</span>
          <b>{t.ptLevels[s.level]}</b>
          <span className="num pt-big">{s.points.toLocaleString(INTL_LOCALE[locale])}</span>
          <small>{fmt(t.ptCities, { n: s.cities })} · {s.countries} 🏳️ · {s.stops} 👣</small>
        </div>
        <div className="seg-3" role="tablist">
          <button role="tab" aria-selected={tab === "rank"} className={tab === "rank" ? "on" : ""} onClick={() => setTab("rank")}><Trophy size={15} aria-hidden="true" />{t.ptRanking}</button>
          <button role="tab" aria-selected={tab === "badges"} className={tab === "badges" ? "on" : ""} onClick={() => setTab("badges")}><Medal size={15} aria-hidden="true" />{t.ptBadges}</button>
          <button role="tab" aria-selected={tab === "how"} className={tab === "how" ? "on" : ""} onClick={() => setTab("how")}><Info size={15} aria-hidden="true" />{t.ptHow}</button>
        </div>
        {tab === "rank" && <>
          <div className="ex-chips">
            <button className={scope === "friends" ? "on" : ""} onClick={() => setScope("friends")}>👥 {t.ptFriends}</button>
            <button className={scope === "global" ? "on" : ""} onClick={() => setScope("global")}>🌍 {t.ptGlobal}</button>
            <button className={period === "all" ? "on" : ""} onClick={() => setPeriod("all")}>∞ {t.ptAll}</button>
            <button className={period === "month" ? "on" : ""} onClick={() => setPeriod("month")}>📅 {t.ptMonth}</button>
          </div>
          {lb === null && <p className="hint">{t.exLoading}</p>}
          {lb && lb.top.length === 0 && <p className="hint">{t.ptEmpty}</p>}
          <div className="rk">{lb?.top.map(row)}{lb?.mine && <><span className="rk-gap">⋯</span>{row(lb.mine)}</>}</div>
        </>}
        {tab === "badges" && <div className="bd-grid">{s.allBadges.map((b) => (
          <div key={b.id} className={`bd ${owned.has(b.id) ? "on" : ""}`}><span aria-hidden="true">{b.icon}</span><b>{t.ptBadgeNames[b.id]}</b><small>{t.ptBadgeDesc[b.id]}</small></div>
        ))}</div>}
        {tab === "how" && <>
          <ul className="pt-rules">{s.breakdown.map((b) => (
            <li key={b.k}><span>{fmt(t.ptRules[b.k], { p: b.k === "cities" ? s.rules.city : b.k === "declared" ? s.rules.declaredCity : b.k === "countries" ? s.rules.country : b.k === "stops" ? s.rules.stop : b.k === "gps" ? s.rules.gps : b.k === "posts" ? s.rules.postDay : b.k === "comments" ? s.rules.commentDay : b.k === "friends" ? s.rules.friendJoined : s.rules.friendPaid })}</span><b className="num">{b.n} · {b.pts.toLocaleString(INTL_LOCALE[locale])}</b></li>
          ))}</ul>
          <b className="row" style={{ gap: 6 }}><Gift size={17} aria-hidden="true" /> {t.ptRewards}</b>
          <ul className="pt-rules">{s.rewards.map((r) => <li key={r.at} className={r.got ? "got" : ""}><span>{fmt(t.ptRewardAt, { p: r.at.toLocaleString(INTL_LOCALE[locale]), c: eur(r.cents, locale) })}</span><b>{r.got ? `✓ ${t.ptRewardGot}` : "🔒"}</b></li>)}</ul>
          <small className="hint">{t.ptRewardNote}</small>
        </>}
      </div>
    </div>
  );
}
