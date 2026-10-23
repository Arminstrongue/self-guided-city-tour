"use client";
/** Aviso discreto quando o telemóvel perde a rede, com atalho para os Essenciais guardados. */
import { useEffect, useState } from "react";
import { CloudOff } from "lucide-react";

export function OfflineBar({ text, link, href }: { text: string; link: string; href: string }) {
  const [off, setOff] = useState(false);
  useEffect(() => {
    const on = () => setOff(!navigator.onLine);
    on();
    window.addEventListener("online", on); window.addEventListener("offline", on);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", on); };
  }, []);
  if (!off) return null;
  return <p className="off-bar" role="status"><CloudOff size={16} aria-hidden="true" /> {text}<a href={href}>{link}</a></p>;
}
