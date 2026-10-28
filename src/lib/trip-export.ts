"use client";
/**
 * Levar o plano ou a reserva para fora da app: calendário (.ics com lembretes), WhatsApp, PDF e lembretes no telemóvel.
 * O PDF desenha-se a partir de um documento simples (estilos próprios, sem o CSS da app), por isso funciona em qualquer língua.
 */
import { icsFile, type IcsEvent } from "./ics";

const isNative = () => Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());
const safeName = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "voybu";

/** Guarda um ficheiro: na app (ou onde se pode) abre "Partilhar/Guardar"; no navegador descarrega. */
export async function saveFile(blob: Blob, filename: string, title: string) {
  const file = new File([blob], filename, { type: blob.type });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if ((isNative() || /iPhone|iPad|Android/i.test(navigator.userAgent)) && nav.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function saveCalendar(events: IcsEvent[], name: string) {
  await saveFile(new Blob([icsFile(events, name)], { type: "text/calendar;charset=utf-8" }), `${safeName(name)}.ics`, name);
}

/** WhatsApp com o texto já escrito (o viajante escolhe a quem enviar). */
export function shareWhatsApp(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

export type DocRow = { time?: string; text: string; sub?: string };
export type DocSection = { heading: string; rows: DocRow[] };
export type TripDoc = { title: string; subtitle?: string; sections: DocSection[]; footer?: string };

/** Texto simples do mesmo documento (WhatsApp, copiar). */
export function docText(d: TripDoc) {
  return [`*${d.title}*`, d.subtitle ?? "", ...d.sections.flatMap((s) => ["", `*${s.heading}*`, ...s.rows.map((r) => `${r.time ? `${r.time} · ` : "• "}${r.text}${r.sub ? ` — ${r.sub}` : ""}`)]), "", d.footer ?? ""]
    .filter((x, i, a) => !(x === "" && a[i - 1] === "")).join("\n").trim();
}

/** PDF (A4) do documento: desenhado como página simples e convertido em imagem, página a página. */
export async function savePdf(d: TripDoc) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, { position: "fixed", left: "-10000px", top: "0", width: "794px", background: "#ffffff", color: "#102a43", padding: "48px 56px", boxSizing: "border-box",
    font: "15px/1.5 -apple-system, 'Segoe UI', Roboto, 'Noto Sans', Arial, sans-serif" });
  const el = (tag: string, css: Partial<CSSStyleDeclaration>, text?: string) => { const e = document.createElement(tag); Object.assign(e.style, css); if (text !== undefined) e.textContent = text; return e; };
  const head = el("div", { display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "3px solid #5565ea", paddingBottom: "12px", marginBottom: "18px" });
  head.append(el("div", { fontSize: "26px", fontWeight: "800" }, d.title), el("div", { fontSize: "14px", fontWeight: "800", color: "#5565ea", letterSpacing: "2px" }, "VOYBU"));
  host.append(head);
  if (d.subtitle) host.append(el("div", { fontSize: "15px", color: "#486581", marginBottom: "16px" }, d.subtitle));
  for (const s of d.sections) {
    host.append(el("div", { fontSize: "17px", fontWeight: "800", margin: "18px 0 8px" }, s.heading));
    for (const r of s.rows) {
      const row = el("div", { display: "flex", gap: "14px", padding: "8px 0", borderBottom: "1px solid #e4e7eb" });
      row.append(el("div", { width: "64px", flex: "none", fontWeight: "700", color: "#2996fe" }, r.time ?? "•"));
      const body = el("div", { flex: "1" }); body.append(el("div", { fontWeight: "600" }, r.text)); if (r.sub) body.append(el("div", { fontSize: "13px", color: "#627d98" }, r.sub));
      row.append(body); host.append(row);
    }
  }
  if (d.footer) host.append(el("div", { marginTop: "24px", fontSize: "12px", color: "#829ab1" }, d.footer));
  document.body.appendChild(host);
  try {
    const canvas = await html2canvas(host, { scale: 2, backgroundColor: "#ffffff", logging: false });
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
    const pageCanvasH = Math.floor((canvas.width * ph) / pw);
    for (let y = 0, i = 0; y < canvas.height; y += pageCanvasH, i++) {
      const slice = document.createElement("canvas"); slice.width = canvas.width; slice.height = Math.min(pageCanvasH, canvas.height - y);
      slice.getContext("2d")!.drawImage(canvas, 0, y, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
      if (i) pdf.addPage();
      pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pw, (slice.height * pw) / canvas.width);
    }
    await saveFile(pdf.output("blob"), `${safeName(d.title)}.pdf`, d.title);
  } finally { host.remove(); }
}

export type Reminder = { id: number; at: Date; title: string; body: string };
/**
 * Lembretes no telemóvel (app instalada): notificações agendadas no sistema, tocam com a app fechada.
 * No navegador não há forma fiável de avisar com a página fechada: devolve "calendar" para guardar no calendário (com alarmes).
 */
export async function scheduleReminders(list: Reminder[]): Promise<"ok" | "denied" | "calendar" | "none"> {
  const future = list.filter((r) => r.at.getTime() > Date.now() + 30_000);
  if (!future.length) return "none";
  if (!isNative()) return "calendar";
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== "granted") return "denied";
  await LocalNotifications.schedule({ notifications: future.map((r) => ({ id: r.id, title: r.title, body: r.body, schedule: { at: r.at, allowWhileIdle: true } })) });
  return "ok";
}
/** Número estável (32 bits) para identificar uma notificação a partir de um texto (ex.: id da reserva + índice). */
export const notifId = (s: string) => { let h = 0; for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0; return Math.abs(h) % 2_000_000_000 + 10; };
