import { test } from "node:test";
import assert from "node:assert/strict";
import { icsFile } from "./ics";

test("icsFile: evento com hora, lembretes, texto escapado e linhas dobradas", () => {
  const s = icsFile([{ uid: "a1", title: "Manchester Piccadilly → London Euston", start: new Date("2026-10-31T06:07:00Z"), end: new Date("2026-10-31T09:24:00Z"),
    location: "Manchester Piccadilly, Platform 5", description: "06:07 Manchester Piccadilly\n07:01 Crewe; change", alarms: [60, 15] }]);
  assert.match(s, /^BEGIN:VCALENDAR\r\n/);
  assert.match(s, /DTSTART:20261031T060700Z\r\n/);
  assert.match(s, /DTEND:20261031T092400Z\r\n/);
  assert.match(s, /LOCATION:Manchester Piccadilly\\, Platform 5/);
  assert.match(s, /DESCRIPTION:06:07 Manchester Piccadilly\\n07:01 Crewe\\; change/);
  assert.equal((s.match(/BEGIN:VALARM/g) ?? []).length, 2);
  assert.match(s, /TRIGGER:-PT60M/);
  for (const line of s.split("\r\n")) assert.ok(new TextEncoder().encode(line).length <= 75, line);
  assert.ok(s.endsWith("END:VCALENDAR\r\n"));
});

test("icsFile: dia inteiro e fim por omissão de 1 h", () => {
  const s = icsFile([{ uid: "d", title: "Dia 1", start: new Date(), allDay: "2026-12-31" }, { uid: "e", title: "X", start: new Date("2026-01-01T10:00:00Z") }]);
  assert.match(s, /DTSTART;VALUE=DATE:20261231\r\nDTEND;VALUE=DATE:20270101/);
  assert.match(s, /DTSTART:20260101T100000Z\r\nDTEND:20260101T110000Z/);
});
