"use client";
/** Convite discreto para instalar a app (Android/desktop: botão do sistema; iPhone: instruções "Partilhar → Ecrã principal"). */
import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import type { Dict } from "@/i18n/dictionaries";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const KEY = "sgct:install-dismissed";

export function InstallApp({ t }: { t: Dict }) {
  const [evt, setEvt] = useState<BIP | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    const native = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
    let dismissed = false; try { dismissed = Number(localStorage.getItem(KEY) ?? 0) > Date.now() - 30 * 86400_000; } catch { /* */ }
    if (standalone || native || dismissed) return;
    const onBip = (e: Event) => { e.preventDefault(); setEvt(e as BIP); setShow(true); };
    window.addEventListener("beforeinstallprompt", onBip);
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);
    if (isIos) { setIos(true); setShow(true); }
    window.addEventListener("appinstalled", () => setShow(false));
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);
  if (!show) return null;
  const dismiss = () => { setShow(false); try { localStorage.setItem(KEY, String(Date.now())); } catch { /* */ } };
  return (
    <div className="ia card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" width={44} height={44} />
      <span className="stack" style={{ gap: 0, flex: 1, minWidth: 0 }}>
        <b>{t.iaTitle}</b>
        <small className="hint">{help ? <>{t.iaIos1} <Share size={13} aria-label="Share" /> {t.iaIos2}</> : t.iaSub}</small>
      </span>
      {!help && <button className="sc-follow on" onClick={async () => {
        if (evt) { await evt.prompt(); const c = await evt.userChoice.catch(() => null); if (c?.outcome === "accepted") setShow(false); else dismiss(); }
        else if (ios) setHelp(true);
      }}><Download size={15} aria-hidden="true" /> {t.iaInstall}</button>}
      <button className="ia-x" onClick={dismiss} aria-label={t.close}><X size={16} aria-hidden="true" /></button>
    </div>
  );
}
