"use client";
/** Calendário · WhatsApp · PDF · Lembrar-me — a mesma fila de botões nas reservas e nos planos. */
import { useState } from "react";
import { CalendarPlus, MessageCircle, FileDown, BellRing } from "lucide-react";
import type { Dict } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";
import type { IcsEvent } from "@/lib/ics";
import { docText, saveCalendar, savePdf, scheduleReminders, shareWhatsApp, type Reminder, type TripDoc } from "@/lib/trip-export";

export function ExportBar({ t, name, doc, events, reminders }: { t: Dict; name: string; doc: () => TripDoc; events: () => IcsEvent[] | null; reminders: () => Reminder[] }) {
  const [busy, setBusy] = useState<"" | "pdf" | "cal" | "rem">("");
  const [msg, setMsg] = useState("");
  async function cal() {
    const ev = events(); if (!ev) { setMsg(t.xo.needDate); return; }
    setBusy("cal"); try { await saveCalendar(ev, name); } finally { setBusy(""); }
  }
  async function pdf() {
    setBusy("pdf"); setMsg(""); try { await savePdf(doc()); } catch { setMsg(t.xo.pdfErr); } finally { setBusy(""); }
  }
  async function remind() {
    setBusy("rem"); setMsg("");
    try {
      const list = reminders();
      const r = await scheduleReminders(list);
      if (r === "ok") setMsg(fmt(t.xo.reminded, { n: list.filter((x) => x.at.getTime() > Date.now()).length }));
      else if (r === "denied") setMsg(t.notifyDenied ?? t.xo.denied);
      else if (r === "none") setMsg(t.xo.none);
      else { const ev = events(); if (!ev) setMsg(t.xo.needDate); else { await saveCalendar(ev, name); setMsg(t.xo.remindCal); } }
    } finally { setBusy(""); }
  }
  return (
    <div className="xo">
      <span className="xo-h">{t.xo.title}</span>
      <div className="xo-row">
        <button type="button" className="press" onClick={() => void cal()} disabled={!!busy}><CalendarPlus size={20} aria-hidden="true" /><small>{busy === "cal" ? "…" : t.xo.cal}</small></button>
        <button type="button" className="press" onClick={() => shareWhatsApp(docText(doc()))}><MessageCircle size={20} aria-hidden="true" /><small>{t.xo.wa}</small></button>
        <button type="button" className="press" onClick={() => void pdf()} disabled={!!busy}><FileDown size={20} aria-hidden="true" /><small>{busy === "pdf" ? t.xo.making : t.xo.pdf}</small></button>
        <button type="button" className="press" onClick={() => void remind()} disabled={!!busy}><BellRing size={20} aria-hidden="true" /><small>{busy === "rem" ? "…" : t.xo.remind}</small></button>
      </div>
      {msg && <p className="xo-msg" role="status">{msg}</p>}
    </div>
  );
}
