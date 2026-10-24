"use client";
/** Reencaminhar o roteiro partilhado (o mesmo link) para outros amigos. */
import { Share2 } from "lucide-react";
import { toast } from "@/lib/toast";

export function ShareAgain({ label, title, text, copied }: { label: string; title: string; text: string; copied: string }) {
  async function go() {
    const url = location.href;
    try {
      if (navigator.share) await navigator.share({ title, text, url });
      else { await navigator.clipboard.writeText(`${text}\n${url}`); toast(copied); }
    } catch { /* cancelado */ }
  }
  return <button type="button" className="btn ghost press" onClick={() => void go()}><Share2 size={18} aria-hidden="true" /> {label}</button>;
}
