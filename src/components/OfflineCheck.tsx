"use client";
import { useEffect, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { offlineList, type OfflineInfo } from "@/lib/offline-client";
import { canPrefetchTiles } from "@/lib/map-config";
import { VOICE_LANG, pickVoice } from "@/lib/speech";
import Portal from "./Portal";
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
    (async () => {
      const out: Check[] = [];
      const info: OfflineInfo | undefined = offlineList()[city];
      out.push(info ? { k: "route", lvl: "ok", txt: fmt(t.ocRouteOk, { d: d.format(new Date(info.at)) }) } : { k: "route", lvl: "bad", txt: t.ocRouteNo });
      if (info) out.push(info.failed ? { k: "photos", lvl: "warn", txt: fmt(t.ocPhotosSome, { n: info.failed }) } : { k: "photos", lvl: "ok", txt: t.ocPhotosOk });
      const v = await localVoice(audioLang);
      out.push(v === true ? { k: "audio", lvl: "ok", txt: fmt(t.ocAudioOk, { l: langName }) }
        : v === false ? { k: "audio", lvl: "warn", txt: fmt(t.ocAudioNo, { l: langName }) }
          : { k: "audio", lvl: "bad", txt: t.ocAudioNone });
      let nRes = 0; try { nRes = (JSON.parse(localStorage.getItem("sgct:res") ?? "[]") as { startsAt: string }[]).filter((r) => new Date(r.startsAt).getTime() > Date.now() - 3600_000).length; } catch { /* ignorar */ }
      out.push(nRes ? { k: "res", lvl: "ok", txt: fmt(t.ocRes, { n: nRes }) } : { k: "res", lvl: "info", txt: t.ocResNone });
      out.push(canPrefetchTiles() && info ? { k: "map", lvl: "ok", txt: t.ocMapOk } : { k: "map", lvl: "info", txt: t.ocMapSketch });
      let geo: PermissionState | "na" = "na";
      try { geo = (await navigator.permissions.query({ name: "geolocation" as PermissionName })).state; } catch { /* Safari antigo */ }
      out.push(geo === "granted" ? { k: "gps", lvl: "ok", txt: t.ocGpsOk }
        : geo === "denied" ? { k: "gps", lvl: "bad", txt: t.ocGpsDenied }
          : { k: "gps", lvl: "warn", txt: t.ocGpsAsk, fix: { label: t.ocGpsBtn, run: () => navigator.geolocation?.getCurrentPosition(() => setTick((x) => x + 1), () => setTick((x) => x + 1)) } });
      try {
        const b = await (navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean }> }).getBattery?.();
        if (b && !b.charging && b.level < 0.35) out.push({ k: "bat", lvl: "warn", txt: fmt(t.ocBattery, { n: Math.round(b.level * 100) }) });
      } catch { /* sem informação de bateria */ }
      if (!off) setChecks(out);
    })();
    return () => { off = true; };
  }, [open, tick, city, audioLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const bad = checks?.some((c) => c.lvl === "bad"), warn = checks?.some((c) => c.lvl === "warn");
  const icon: Record<Lvl, string> = { ok: "✅", warn: "⚠️", bad: "⛔", info: "ℹ️" };
  return (
    <>
      <button className="link-btn" style={{ alignSelf: "flex-start" }} onClick={() => { setChecks(null); setOpen(true); }}>🧳 {t.ocBtn}</button>
      {open && (
        <Portal><div className="sheet-bg" onClick={() => setOpen(false)}>
          <div className="sheet stack oc" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={t.ocTitle}>
            <SheetX onClose={() => setOpen(false)} label={t.close} />
            <b style={{ fontSize: 18 }}>🧳 {t.ocTitle}</b>
            {!checks ? <p className="hint">…</p> : (
              <>
                <p className={`oc-sum ${bad ? "bad" : warn ? "warn" : "ok"}`}>{bad ? t.ocSumBad : warn ? t.ocSumWarn : t.ocSumOk}</p>
                <ul className="oc-list">
                  {checks.map((c) => (
                    <li key={c.k} className={c.lvl}><span aria-hidden="true">{icon[c.lvl]}</span><span>{c.txt}{c.fix && <> <button className="link-btn" onClick={c.fix.run}>{c.fix.label}</button></>}</span></li>
                  ))}
                </ul>
                <p className="hint">{t.ocLive}</p>
              </>
            )}
          </div>
        </div></Portal>
      )}
    </>
  );
}
