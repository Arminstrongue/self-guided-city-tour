"use client";
import { useDict } from "@/i18n/client-dict";
import { SheetX } from "@/components/WinNav";
import { VerifyNote } from "./VerifyNote";
import { safetyText } from "@/data/safety-en";
/** Segurança por cidade: SOS, números, partilhar localização, frase de ajuda, burlas e zonas de atenção. */
import { useEffect, useState } from "react";
import { ALERT_TEXT, safetyFor } from "@/data/safety";
import { fmt } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { ExtLink } from "./ExtLink";
import { Speak } from "./TourExtras";
import { track } from "@/lib/track";

type Pos = { lat: number; lng: number };
const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;

function useOnce() {
  const [pos, setPos] = useState<Pos | null>(null);
  const [st, setSt] = useState<"idle" | "busy" | "fail">("idle");
  function get(): Promise<Pos | null> {
    if (pos) return Promise.resolve(pos);
    if (!("geolocation" in navigator)) { setSt("fail"); return Promise.resolve(null); }
    setSt("busy");
    return new Promise((res) => navigator.geolocation.getCurrentPosition(
      (p) => { const v = { lat: p.coords.latitude, lng: p.coords.longitude }; setPos(v); setSt("idle"); res(v); },
      () => { setSt("fail"); res(null); },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 }
    ));
  }
  return { pos, st, get };
}

export function SafetyPanel({ cityId, country, cityName, center, t: tProp, locale, compact = false }: {
  cityId: string; country?: string; cityName: string; center: Pos; t?: Dict; locale: Locale; compact?: boolean;
}) {
  const t = useDict(tProp);
  const s = safetyFor(cityId, country);
  const geo = useOnce();
  if (!s) return null;
  const sos = s.nums[0];
  const near = (q: string) => {
    const p = geo.pos ?? center;
    return `https://www.google.com/maps/search/${encodeURIComponent(q)}/@${p.lat},${p.lng},15z`;
  };
  async function share(via: "native" | "wa") {
    const p = await geo.get();
    if (!p) return;
    track("share_loc", { city: cityId });
    const text = fmt(t.locText, { u: `https://maps.google.com/?q=${p.lat.toFixed(5)},${p.lng.toFixed(5)}` });
    if (via === "native" && navigator.share) { try { await navigator.share({ text }); return; } catch { return; } }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }
  return (
    <div className="stack safety" style={{ gap: 14 }}>
      <a className="sos-call press" href={tel(sos.n)}>
        <span className="sos-dot" aria-hidden="true">SOS</span>
        <span><small>{t.nK.sos}</small><b className="num">{sos.n}</b></span>
      </a>

      <div className="card rows" style={{ paddingBlock: 6 }}>
        {s.nums.slice(1).map((x) => (
          <div key={x.k}><span>{t.nK[x.k]}</span><a className="num" href={tel(x.n)}><b>{x.n}</b></a></div>
        ))}
        {s.tp && <div><span>{t.touristPolice}</span><span style={{ textAlign: "end" }}>{safetyText(s.tp, locale)}</span></div>}
      </div>

      <div className="safety-acts">
        <button className="btn ghost press" onClick={() => void share("native")} disabled={geo.st === "busy"}>📍 {geo.st === "busy" ? t.locating : t.shareLoc}</button>
        <button className="btn ghost press" onClick={() => void share("wa")} disabled={geo.st === "busy"} aria-label={`${t.shareLoc} · WhatsApp`}>WhatsApp</button>
        <ExtLink className="btn ghost" href={near("hospital")}>🏥 {t.nearHosp}</ExtLink>
        <ExtLink className="btn ghost" href={near("pharmacy")}>✚ {t.nearPharm}</ExtLink>
      </div>
      <p className="hint">{geo.pos ? t.sfNearPos : t.sfNearCenter}</p>
      {geo.st === "fail" && <p className="hint bad-txt">{t.geoFail}</p>}
      <p className="hint">{fmt(t.pharmLook, { w: s.pharmacy })}</p>

      {!s.help.lang.startsWith(locale) && (
        <div className="card stack help-card" style={{ gap: 8, padding: 16 }}>
          <span className="label">{t.helpCard}</span>
          <p lang={s.help.lang} className="help-txt">{s.help.text}</p>
          <div className="links-row"><Speak text={s.help.text} lang={s.help.lang} t={t} /></div>
        </div>
      )}

      <div className="stack" style={{ gap: 10 }}>
        <b>{t.alertsTitle}</b>
        <div className="alerts">
          {s.alerts.map((k) => {
            const [h, p] = ALERT_TEXT[k][locale] ?? ALERT_TEXT[k].en;
            return <details key={k} className="alert" open={!compact && s.alerts.indexOf(k) < 2}><summary>{h}</summary><p>{p}</p></details>;
          })}
        </div>
      </div>

      <div className="grid2 zones">
        <div className="card stack" style={{ gap: 6, padding: 14 }}><span className="label">👜 {t.hotTitle}</span><p>{s.hot.map((x) => safetyText(x, locale)).join(" · ")}</p></div>
        <div className="card stack" style={{ gap: 6, padding: 14 }}><span className="label">🌙 {t.nightTitle}</span><p>{s.night.map((x) => safetyText(x, locale)).join(" · ")}</p></div>
      </div>

      <p className="hint">{t.safetyNote}</p>
      <VerifyNote t={t} locale={locale} city={cityId} />
      <p className="hint">{fmt(t.safetyDisc, { n: sos.n })} · {cityName}</p>
    </div>
  );
}

