"use client";
import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { offlineList, type OfflineInfo } from "@/lib/offline-client";
import { canPrefetchTiles } from "@/lib/map-config";
import { VOICE_LANG, pickVoice } from "@/lib/speech";
import { AlertTriangle, BatteryLow, CheckCircle2, ChevronRight, Headphones, Image as ImageIcon, Info, LocateFixed, Map as MapIcon, Radio, Route, ShieldCheck, Ticket, XCircle, Luggage } from "lucide-react";
import Portal from "./Portal";
import { OfflineButton } from "./TravelTools";
import { SheetX } from "./WinNav";

type Lvl = "ok" | "warn" | "bad" | "info";
type Check = { k: string; lvl: Lvl; txt: string; fix?: { label: string; run: () => void } };

/** O telemóvel tem uma voz do idioma que funciona sem internet? (apps nativas usam a voz do sistema.) */
async function localVoice(lang: string): Promise<boolean | null> {
  const cap = (globalThis as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  if (cap?.isNativePlatform?.()) return true;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  let v = window.speechSynthesis.getVoices();
  if (!v.length) v = await new Promise((r) => { const f = () => r(window.speechSynthesis.getVoices()); window.speechSynthesis.addEventListener("voiceschanged", f, { once: true }); setTimeout(f, 1500); });
  return Boolean(pickVoice(v.filter((x) => x.localService), VOICE_LANG[lang] ?? lang));
}

/** O estado de cada recurso sem internet: roteiro, mapa, áudio, fotos, bilhetes e dados ao vivo (+ GPS e bateria em `full`). */
async function runChecks({ t, city, audioLang, langName, d, full, onFix }: { t: Dict; city: string; audioLang: string; langName: string; d: Intl.DateTimeFormat; full: boolean; onFix?: () => void }): Promise<Check[]> {
  const out: Check[] = [];
  const info: OfflineInfo | undefined = offlineList()[city];
  out.push(info ? { k: "route", lvl: "ok", txt: fmt(t.ocRouteOk, { d: d.format(new Date(info.at)) }) } : { k: "route", lvl: "bad", txt: t.ocRouteNo });
  out.push(canPrefetchTiles() && info ? { k: "map", lvl: "ok", txt: t.ocMapOk } : { k: "map", lvl: "info", txt: t.ocMapSketch });
  const v = await localVoice(audioLang);
  out.push(v === true ? { k: "audio", lvl: "ok", txt: fmt(t.ocAudioOk, { l: langName }) }
    : v === false ? { k: "audio", lvl: "warn", txt: fmt(t.ocAudioNo, { l: langName }) }
      : { k: "audio", lvl: "bad", txt: t.ocAudioNone });
  if (info) out.push(info.failed ? { k: "photos", lvl: "warn", txt: fmt(t.ocPhotosSome, { n: info.failed }) } : { k: "photos", lvl: "ok", txt: t.ocPhotosOk });
  let nRes = 0; try { nRes = (JSON.parse(localStorage.getItem("sgct:res") ?? "[]") as { startsAt: string }[]).filter((r) => new Date(r.startsAt).getTime() > Date.now() - 3600_000).length; } catch { /* ignorar */ }
  out.push(nRes ? { k: "res", lvl: "ok", txt: fmt(t.ocRes, { n: nRes }) } : { k: "res", lvl: "info", txt: t.ocResNone });
  out.push({ k: "live", lvl: "info", txt: info ? fmt(t.ocLiveAt, { d: d.format(new Date(info.at)) }) : t.ocLive });
  if (!full) return out;
  let geo: PermissionState | "na" = "na";
  try { geo = (await navigator.permissions.query({ name: "geolocation" as PermissionName })).state; } catch { /* Safari antigo */ }
  out.push(geo === "granted" ? { k: "gps", lvl: "ok", txt: t.ocGpsOk }
    : geo === "denied" ? { k: "gps", lvl: "bad", txt: t.ocGpsDenied }
      : { k: "gps", lvl: "warn", txt: t.ocGpsAsk, fix: { label: t.ocGpsBtn, run: () => navigator.geolocation?.getCurrentPosition(() => onFix?.(), () => onFix?.()) } });
  try {
    const b = await (navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean }> }).getBattery?.();
    if (b && !b.charging && b.level < 0.35) out.push({ k: "bat", lvl: "warn", txt: fmt(t.ocBattery, { n: Math.round(b.level * 100) }) });
  } catch { /* sem informação de bateria */ }
  return out;
}


/* Linhas estilo iOS: ícone num quadrado colorido, título curto, explicação e estado à direita. */
const ROW: Record<string, { I: typeof Route; c: string }> = {
  route: { I: Route, c: "#007aff" }, map: { I: MapIcon, c: "#34c759" }, audio: { I: Headphones, c: "#af52de" }, photos: { I: ImageIcon, c: "#ff9500" },
  res: { I: Ticket, c: "#ff2d55" }, live: { I: Radio, c: "#5ac8fa" }, gps: { I: LocateFixed, c: "#5856d6" }, bat: { I: BatteryLow, c: "#ff3b30" }
};
function State({ l }: { l: Lvl }) {
  if (l === "ok") return <CheckCircle2 size={20} color="#34c759" aria-hidden="true" />;
  if (l === "warn") return <AlertTriangle size={20} color="#ff9500" aria-hidden="true" />;
  if (l === "bad") return <XCircle size={20} color="#ff3b30" aria-hidden="true" />;
  return <Info size={20} style={{ opacity: .35 }} aria-hidden="true" />;
}
function Rows({ checks, t }: { checks: Check[]; t: Dict }) {
  return (
    <ul className="ios-group">
      {checks.map((c) => {
        const r = ROW[c.k] ?? ROW.live;
        return (
          <li key={c.k} className="ios-li">
            <span className="ios-ic" style={{ background: r.c }}><r.I size={17} color="#fff" aria-hidden="true" /></span>
            <span className="ios-tx"><b>{(t.ocRows as Record<string, string>)[c.k] ?? c.k}</b><small>{c.txt}</small>
              {c.fix && <button type="button" className="ios-link" onClick={c.fix.run}>{c.fix.label}</button>}</span>
            <State l={c.lvl} />
          </li>
        );
      })}
    </ul>
  );
}

/** Depois de descarregar: o que funciona sem internet, recurso a recurso (sempre visível no roteiro). */
export function OfflineStatus({ t, locale, city, audioLang }: { t: Dict; locale: Locale; city: string; audioLang: string }) {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [has, setHas] = useState(false);
  useEffect(() => {
    const d = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    const langName = new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "language" }).of(audioLang) ?? audioLang;
    let off = false;
    const run = () => { const h = Boolean(offlineList()[city]); setHas(h); if (h) void runChecks({ t, city, audioLang, langName, d, full: false }).then((o) => { if (!off) setChecks(o); }); };
    run(); window.addEventListener("sgct:offline", run);
    return () => { off = true; window.removeEventListener("sgct:offline", run); };
  }, [city, audioLang, locale]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!has || !checks) return null;
  return (
    <div className="of-status">
      <b className="of-status-h">{t.ofWhat}</b>
      <Rows checks={checks} t={t} />
    </div>
  );
}

/**
 * "Pronto para sair?": verifica, antes de sair do hotel ou do aeroporto, tudo o que tem de funcionar sem internet —
 * percurso e fotos guardados, voz do áudio-guia no telemóvel, mapa, localização e bateria.
 */
export function OfflineCheck({ t, locale, city, audioLang }: { t: Dict; locale: Locale; city: string; audioLang: string }) {
  const [open, setOpen] = useState(false);
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [tick, setTick] = useState(0);
  const d = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const langName = new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "language" }).of(audioLang) ?? audioLang;

  useEffect(() => {
    if (!open) return;
    let off = false;
    void runChecks({ t, city, audioLang, langName, d, full: true, onFix: () => setTick((x) => x + 1) }).then((out) => { if (!off) setChecks(out); });
    return () => { off = true; };
  }, [open, tick, city, audioLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const bad = checks?.some((c) => c.lvl === "bad"), warn = checks?.some((c) => c.lvl === "warn");
  const needDl = checks?.some((c) => c.k === "route" && c.lvl === "bad");
  const tone = bad ? "bad" : warn ? "warn" : "ok";
  return (
    <>
      <button type="button" className="ios-row press" onClick={() => { setChecks(null); setOpen(true); }}>
        <span className="ios-ic" style={{ background: "#34c759" }}><Luggage size={17} color="#fff" aria-hidden="true" /></span>
        <span className="ios-tx"><b>{t.ocTitle}</b></span><ChevronRight size={18} className="ios-chev" aria-hidden="true" />
      </button>
      {open && (
        <Portal><div className="sheet-bg" onClick={() => setOpen(false)}>
          <div className="sheet stack oc" style={{ gap: 16 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={t.ocTitle}>
            <SheetX onClose={() => setOpen(false)} label={t.close} />
            {!checks ? <p className="hint">…</p> : (
              <>
                <div className={`ios-hero ${tone}`}>
                  <span className="ios-hero-ic">{tone === "ok" ? <ShieldCheck size={30} aria-hidden="true" /> : tone === "warn" ? <AlertTriangle size={30} aria-hidden="true" /> : <XCircle size={30} aria-hidden="true" />}</span>
                  <b>{t.ocTitle}</b>
                  <span>{bad ? t.ocSumBad : warn ? t.ocSumWarn : t.ocSumOk}</span>
                </div>
                {needDl && <OfflineButton t={t} locale={locale} city={city} compact />}
                <Rows checks={checks} t={t} />
              </>
            )}
          </div>
        </div></Portal>
      )}
    </>
  );
}
