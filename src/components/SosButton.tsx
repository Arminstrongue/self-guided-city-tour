"use client";
/** Botão SOS leve: os números e conselhos de segurança só carregam quando se abre a folha. */
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SheetX } from "@/components/WinNav";
import { fmt } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { track } from "@/lib/track";
import Portal from "@/components/Portal";

const SafetyPanel = dynamic(() => import("./Safety").then((m) => m.SafetyPanel), { ssr: false, loading: () => <div className="card wl-skel" style={{ height: 220 }} /> });
type Pos = { lat: number; lng: number };

/** Botão SOS flutuante no roteiro: abre a folha de segurança. */
export function SosButton(props: { cityId: string; country?: string; cityName: string; center: Pos; t: Dict; locale: Locale }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", key); };
  }, [open]);
  return (
    <>
      <button className="sos-fab press" onClick={() => { setOpen(true); track("sos_open", { city: props.cityId }); }} aria-label={props.t.safety}>{props.t.sosBtn}</button>
      {open && (
        <Portal><div className="sheet-bg" onClick={() => setOpen(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label={props.t.safety} onClick={(e) => e.stopPropagation()}>
            <SheetX onClose={() => setOpen(false)} label={props.t.close} />
            <div className="row-between" style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 22 }}>{fmt(props.t.safetyTitle, { city: props.cityName })}</h2>
              <button className="lb-x dark" onClick={() => setOpen(false)} aria-label={props.t.close}>✕</button>
            </div>
            <SafetyPanel {...props} compact />
          </div>
        </div></Portal>
      )}
    </>
  );
}
