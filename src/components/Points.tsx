"use client";
/** Pontos, nível, medalhas, ranking (amigos / todos, sempre / este mês) e prémios. */
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { toast } from "@/lib/toast";

export type BadgeId = keyof Dict["ptBadgeNames"];
export type Score = {
  points: number; level: number; levelAt: number; nextAt: number | null; cities: number; countries: number; stops: number; badges: BadgeId[];
  breakdown: { k: keyof Dict["ptRules"]; n: number; pts: number }[];
  rewards: { at: number; cents: number; got: boolean }[]; newRewards: number[];
  rules: Record<keyof Dict["ptRules"] | "city" | "declaredCity" | "country" | "stop" | "postDay" | "commentDay" | "friendJoined" | "friendPaid" | "journey", number>;
  allBadges: { id: BadgeId; icon: string }[];
  progress?: Partial<Record<BadgeId, [number, number]>>;
  km?: number; steps?: number;
};
export type Journey = { id: string; day: string; city: string | null; cityName: string; km: number; steps: number; places: { name: string; lat: number; lng: number }[]; path: [number, number][] };
export type Row = { rank: number; handle: string; name: string; photo: string | null; points: number; cities: number; countries: number; level: number; me: boolean };
export const LV_ICON = ["🌱", "🧳", "🧭", "✈️", "🌍", "🏆", "👑"];
export const eur = (c: number, l: Locale) => new Intl.NumberFormat(INTL_LOCALE[l], { style: "currency", currency: "EUR" }).format(c / 100);

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
