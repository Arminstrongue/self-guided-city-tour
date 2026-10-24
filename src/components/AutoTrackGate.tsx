"use client";
/** Só carrega o registo automático para quem o ligou (ou tem perguntas por responder). */
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AutoTrack = dynamic(() => import("./AutoTrack").then((m) => m.AutoTrack), { ssr: false });

export function AutoTrackGate({ locale }: { locale: string }) {
  const [need, setNeed] = useState(false);
  useEffect(() => {
    const check = () => { try { setNeed(localStorage.getItem("sgct:auto:on") === "1" || /"pending":\[\{/.test(localStorage.getItem("sgct:auto:v1") ?? "")); } catch { /* ignorar */ } };
    check();
    window.addEventListener("sgct:auto", check);
    return () => window.removeEventListener("sgct:auto", check);
  }, []);
  return need ? <AutoTrack locale={locale} /> : null;
}
