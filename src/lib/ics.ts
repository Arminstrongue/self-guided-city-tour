/**
 * Ficheiro de calendário (.ics, RFC 5545) para guardar planos e reservas no calendário do telemóvel
 * (iPhone, Google, Outlook). Os lembretes (VALARM) ficam no próprio calendário e tocam mesmo com a app fechada.
 */
export type IcsEvent = {
  uid: string; title: string;
  start: Date; end?: Date;      // com hora
  allDay?: string;              // ou um dia inteiro "AAAA-MM-DD"
  location?: string; description?: string; url?: string;
  alarms?: number[];            // minutos antes do início
};

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
/** Linhas com mais de 75 octetos dobram-se (continuação começa com um espaço), sem partir carateres. */
function fold(line: string) {
  const out: string[] = []; let cur = ""; let bytes = 0;
  for (const ch of line) {
    const b = new TextEncoder().encode(ch).length;
    if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ""; bytes = 0; }
    cur += ch; bytes += b;
  }
  out.push(cur);
  return out.join("\r\n ");
}
const nextDay = (d: string) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + 1); return x.toISOString().slice(0, 10).replace(/-/g, ""); };

export function icsFile(events: IcsEvent[], name = "VOYBU"): string {
  const now = utc(new Date());
  const L: string[] = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//VOYBU//Trip//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${esc(name)}`];
  for (const e of events) {
    L.push("BEGIN:VEVENT", `UID:${e.uid}@voybu.com`, `DTSTAMP:${now}`);
    if (e.allDay) L.push(`DTSTART;VALUE=DATE:${e.allDay.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${nextDay(e.allDay)}`);
    else { L.push(`DTSTART:${utc(e.start)}`); L.push(`DTEND:${utc(e.end && e.end > e.start ? e.end : new Date(e.start.getTime() + 60 * 60_000))}`); }
    L.push(`SUMMARY:${esc(e.title)}`);
    if (e.location) L.push(`LOCATION:${esc(e.location)}`);
    if (e.description) L.push(`DESCRIPTION:${esc(e.description)}`);
    if (e.url) L.push(`URL:${e.url}`);
    for (const m of e.alarms ?? []) L.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(e.title)}`, `TRIGGER:-PT${Math.max(0, Math.round(m))}M`, "END:VALARM");
    L.push("END:VEVENT");
  }
  L.push("END:VCALENDAR");
  return L.map(fold).join("\r\n") + "\r\n";
}
