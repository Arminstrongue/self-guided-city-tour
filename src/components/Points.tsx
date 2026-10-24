"use client";
/** Pontos, nível, medalhas, ranking (amigos / todos, sempre / este mês) e prémios. */
import { useEffect, useState } from "react";
import { Trophy, Medal, Info, Gift, Check, Lock, X, Route, Trash2 } from "lucide-react";
import { EVENT, askMotion, autoOn, finishToday, loadState, setAutoOn, summary } from "@/lib/auto-track-client";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { toast } from "@/lib/toast";
import Portal from "@/components/Portal";

type BadgeId = keyof Dict["ptBadgeNames"];
type Score = {
  points: number; level: number; levelAt: number; nextAt: number | null; cities: number; countries: number; stops: number; badges: BadgeId[];
  breakdown: { k: keyof Dict["ptRules"]; n: number; pts: number }[];
  rewards: { at: number; cents: number; got: boolean }[]; newRewards: number[];
  rules: Record<keyof Dict["ptRules"] | "city" | "declaredCity" | "country" | "stop" | "postDay" | "commentDay" | "friendJoined" | "friendPaid" | "journey", number>;
  allBadges: { id: BadgeId; icon: string }[];
  progress?: Partial<Record<BadgeId, [number, number]>>;
  km?: number; steps?: number;
};
type Journey = { id: string; day: string; city: string | null; cityName: string; km: number; steps: number; places: { name: string; lat: number; lng: number }[]; path: [number, number][] };
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
  const [tab, setTab] = useState<"rank" | "badges" | "how" | "routes">("rank");
  const a = t.at;
  // Registo automático: interruptor, resumo de hoje e percursos guardados.
  const [auto, setAuto] = useState(false);
  const [today, setToday] = useState({ km: 0, steps: 0, places: 0 });
  const [routes, setRoutes] = useState<Journey[] | null>(null);
  useEffect(() => {
    const sync = () => { setAuto(autoOn()); setToday(summary(loadState())); };
    sync(); window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  useEffect(() => {
    if (tab !== "routes" || routes) return;
    fetch("/api/me/journeys", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => setRoutes(j?.list ?? [])).catch(() => setRoutes([]));
  }, [tab, routes]);
  async function toggleAuto() {
    if (!auto) { await askMotion(); navigator.geolocation?.getCurrentPosition(() => undefined, () => toast(a.denied, { tone: "err" })); }
    setAutoOn(!auto);
  }
  const mapOf = (j: Journey) => {
    const pts = j.path.length ? j.path : j.places.map((p) => [p.lat, p.lng] as [number, number]);
    if (!pts.length) return null;
    const ll = (p: [number, number]) => `${p[0]},${p[1]}`;
    const mid = pts.length > 2 ? pts.filter((_, i) => i > 0 && i < pts.length - 1 && i % Math.ceil(pts.length / 9) === 0).slice(0, 8) : [];
    return `https://www.google.com/maps/dir/?api=1&origin=${ll(pts[0])}&destination=${ll(pts[pts.length - 1])}&travelmode=walking${mid.length ? `&waypoints=${encodeURIComponent(mid.map(ll).join("|"))}` : ""}`;
  };
  const [scope, setScope] = useState<"friends" | "global">("friends");
  const [period, setPeriod] = useState<"all" | "month">("all");
  const [lb, setLb] = useState<{ top: Row[]; mine: Row | null } | null>(null);
  useEffect(() => {
    if (tab !== "rank") return;
    setLb(null);
    fetch(`/api/leaderboard?scope=${scope}&period=${period}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => setLb(j ?? { top: [], mine: null })).catch(() => setLb({ top: [], mine: null }));
  }, [tab, scope, period]);
  const owned = new Set(s.badges);
  const nf = (n: number) => n.toLocaleString(INTL_LOCALE[locale]);
  const pct = s.nextAt ? Math.max(0, Math.min(1, (s.points - s.levelAt) / (s.nextAt - s.levelAt))) : 1;
  const R = 54, C = 2 * Math.PI * R;
  const row = (r: Row) => (
    <a key={`${r.rank}-${r.handle}`} href={`/${locale}/u/${r.handle}`} className={`pt2-rk ${r.me ? "me" : ""}`}>
      <span className={`pt2-pos num ${r.rank <= 3 ? `p${r.rank}` : ""}`}>{r.rank}</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {r.photo ? <img className="pt2-av" src={r.photo} alt="" /> : <span className="pt2-av">{r.name.charAt(0).toUpperCase()}</span>}
      <span className="pt2-rt"><b>{r.me ? `${r.name} · ${t.ptYou}` : r.name}</b><small>{t.ptLevels[r.level]} · {fmt(t.ptCities, { n: r.cities })} · {r.countries} 🏳️</small></span>
      <b className="num pt2-rp">{nf(r.points)}</b>
    </a>
  );
  const sorted = [...s.allBadges].sort((a, b) => Number(owned.has(b.id)) - Number(owned.has(a.id)));
  return (
    <Portal><div className="mu2-bg" onClick={onClose}>
      <div className="pt2" role="dialog" aria-modal="true" aria-label={t.ptTitle} onClick={(e) => e.stopPropagation()}>
        <span className="mu2-grab" aria-hidden="true" />
        <button type="button" className="mu2-x pt2-x" onClick={onClose} aria-label={t.close}><X size={18} aria-hidden="true" /></button>
        <section className="pt2-hero">
          <div className="pt2-ring">
            <svg viewBox="0 0 128 128" aria-hidden="true">
              <defs><linearGradient id="pt2g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe29a" /><stop offset=".5" stopColor="#ffb547" /><stop offset="1" stopColor="#ff7a59" /></linearGradient></defs>
              <circle cx="64" cy="64" r={R} className="pt2-track" />
              <circle cx="64" cy="64" r={R} className="pt2-prog" stroke="url(#pt2g)" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
            </svg>
            <span className="pt2-lv" aria-hidden="true">{LV_ICON[s.level]}</span>
          </div>
          <small className="pt2-eyebrow">{t.ptLevels[s.level]}</small>
          <span className="pt2-big num">{nf(s.points)}<small> {t.cs.pts}</small></span>
          <small className="pt2-next">{s.nextAt ? `${t.cs.next}: ${t.ptLevels[s.level + 1]} · ${fmt(t.cs.toGo, { n: nf(s.nextAt - s.points) })}` : t.ptMax}</small>
          <div className="pt2-stats">
            <span><b className="num">{s.cities}</b><small>{fmt(t.ptCities, { n: s.cities }).replace(/^\S+\s*/, "")}</small></span>
            <span><b className="num">{s.countries}</b><small>🏳️</small></span>
            <span><b className="num">{nf(s.km ?? 0)}</b><small>{a.km}</small></span>
            <span><b className="num">{nf(s.steps ?? 0)}</b><small>👣</small></span>
            <span><b className="num">{s.badges.length}</b><small>🏅</small></span>
          </div>
        </section>
        <section className="pt2-auto">
          <label className="pt2-auto-h">
            <span><b>📍 {a.title}</b><small>{a.sub}</small></span>
            <input type="checkbox" role="switch" checked={auto} onChange={() => void toggleAuto()} aria-label={a.title} />
          </label>
          {auto && <>
            <small className="pt2-auto-now">{fmt(a.today, { km: nf(today.km), s: nf(today.steps), n: today.places })}</small>
            {(today.km > 0 || today.places > 0) && <button type="button" className="pt2-auto-end press" onClick={() => { finishToday(); onClose(); }}>{a.end}</button>}
            <small className="pt2-auto-note">{a.privacy} {a.bgNote}</small>
          </>}
        </section>
        <div className="mu2-seg pt2-seg" role="tablist">
          <button role="tab" aria-selected={tab === "rank"} className={tab === "rank" ? "on" : ""} onClick={() => setTab("rank")}><Trophy size={15} aria-hidden="true" /> {t.ptRanking}</button>
          <button role="tab" aria-selected={tab === "badges"} className={tab === "badges" ? "on" : ""} onClick={() => setTab("badges")}><Medal size={15} aria-hidden="true" /> {t.ptBadges}</button>
          <button role="tab" aria-selected={tab === "routes"} className={tab === "routes" ? "on" : ""} onClick={() => setTab("routes")}><Route size={15} aria-hidden="true" /> {a.tab}</button>
          <button role="tab" aria-selected={tab === "how"} className={tab === "how" ? "on" : ""} onClick={() => setTab("how")}><Info size={15} aria-hidden="true" /> {t.ptHow}</button>
        </div>

        {tab === "rank" && <>
          <div className="mu2-chips pt2-chips">
            <button className={scope === "friends" ? "on" : ""} onClick={() => setScope("friends")}>{t.ptFriends}</button>
            <button className={scope === "global" ? "on" : ""} onClick={() => setScope("global")}>{t.ptGlobal}</button>
            <span className="pt2-sep" aria-hidden="true" />
            <button className={period === "all" ? "on" : ""} onClick={() => setPeriod("all")}>{t.ptAll}</button>
            <button className={period === "month" ? "on" : ""} onClick={() => setPeriod("month")}>{t.ptMonth}</button>
          </div>
          {lb === null && <p className="pt2-hint">{t.exLoading}</p>}
          {lb && lb.top.length === 0 && <p className="pt2-hint">{t.ptEmpty}</p>}
          <div className="pt2-list">{lb?.top.map(row)}{lb?.mine && <><span className="pt2-gap">· · ·</span>{row(lb.mine)}</>}</div>
        </>}

        {tab === "badges" && <>
          <p className="pt2-hint">{fmt(t.cs.earned, { a: s.badges.length, b: s.allBadges.length })}</p>
          <div className="pt2-badges">{sorted.map((b) => {
            const on = owned.has(b.id);
            const [cur, goal] = s.progress?.[b.id] ?? [on ? 1 : 0, 1];
            const p = Math.max(0, Math.min(1, cur / goal));
            return (
              <div key={b.id} className={`pt2-bd ${on ? "on" : ""}`}>
                <span className="pt2-medal" style={{ "--p": p } as React.CSSProperties}><i aria-hidden="true">{b.icon}</i></span>
                <b>{t.ptBadgeNames[b.id]}</b>
                <small>{t.ptBadgeDesc[b.id]}</small>
                <span className="pt2-state num">{on ? <><Check size={12} aria-hidden="true" /> {t.cs.done}</> : `${Math.min(cur, goal)}/${goal}`}</span>
              </div>
            );
          })}</div>
        </>}

        {tab === "routes" && <>
          {routes === null && <p className="pt2-hint">{t.exLoading}</p>}
          {routes?.length === 0 && <p className="pt2-hint">{a.none}</p>}
          <div className="pt2-list">{routes?.map((j) => {
            const m = mapOf(j);
            return (
              <div key={j.id} className="pt2-route">
                <span className="pt2-rt"><b>{new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${j.day}T12:00:00`))}{j.cityName ? ` · ${j.cityName}` : ""}</b>
                  <small>{fmt(a.journeySub, { km: nf(Math.round(j.km * 10) / 10), s: nf(j.steps), n: j.places.length })}</small>
                  {j.places.length > 0 && <small className="pt2-route-pl">{j.places.slice(0, 4).map((p) => p.name).join(" · ")}{j.places.length > 4 ? ` +${j.places.length - 4}` : ""}</small>}
                </span>
                <span className="pt2-route-acts">
                  {m && <a className="mu2-x" href={m} target="_blank" rel="noopener noreferrer" aria-label={a.map} title={a.map}><Route size={16} aria-hidden="true" /></a>}
                  <button type="button" className="mu2-x" aria-label={a.del} title={a.del} onClick={async () => { await fetch(`/api/me/journeys?id=${j.id}`, { method: "DELETE" }).catch(() => null); setRoutes((r) => (r ?? []).filter((x) => x.id !== j.id)); window.dispatchEvent(new Event("sgct:points")); }}><Trash2 size={16} aria-hidden="true" /></button>
                </span>
              </div>
            );
          })}</div>
        </>}

        {tab === "how" && <>
          <ul className="pt2-rules">{s.breakdown.map((b) => (
            <li key={b.k}><span>{fmt(t.ptRules[b.k], { p: b.k === "cities" ? s.rules.city : b.k === "declared" ? s.rules.declaredCity : b.k === "countries" ? s.rules.country : b.k === "stops" ? s.rules.stop : b.k === "gps" ? s.rules.gps : b.k === "posts" ? s.rules.postDay : b.k === "comments" ? s.rules.commentDay : b.k === "friends" ? s.rules.friendJoined : b.k === "journeys" ? s.rules.journey : b.k === "km" ? s.rules.km : s.rules.friendPaid })}</span><b className="num">{b.n} · {nf(b.pts)}</b></li>
          ))}</ul>
          <b className="pt2-h"><Gift size={16} aria-hidden="true" /> {t.ptRewards}</b>
          <ul className="pt2-rules">{s.rewards.map((r) => <li key={r.at} className={r.got ? "got" : ""}><span>{fmt(t.ptRewardAt, { p: nf(r.at), c: eur(r.cents, locale) })}</span><b>{r.got ? <><Check size={14} aria-hidden="true" /> {t.ptRewardGot}</> : <Lock size={14} aria-hidden="true" />}</b></li>)}</ul>
          <p className="pt2-hint">{t.ptRewardNote}</p>
        </>}
      </div>
    </div></Portal>
  );
}
