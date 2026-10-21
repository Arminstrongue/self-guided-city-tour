import { test } from "node:test";
import assert from "node:assert/strict";
import { accessEmail } from "./access-email";
import { LOCALES } from "@/i18n/core";

test("email de acesso na língua do cliente, com botão e escape do nome", () => {
  const at = new Date("2026-10-20T20:04:00Z");
  const en = accessEmail({ locale: "en", name: "Ana <b>Silva</b>", place: "Lisbon", link: "https://x/y", expiresAt: at, tz: "Europe/Lisbon" });
  assert.match(en.html, /Hello Ana,/);
  assert.match(en.html, /Open the route/);
  assert.match(en.html, /href="https:\/\/x\/y"/);
  assert.doesNotMatch(en.html, /<b>Silva/);
  assert.match(en.text, /Lisbon route is ready/);
  for (const l of LOCALES) assert.ok(accessEmail({ locale: l, place: "X", link: "https://x", expiresAt: at }).html.includes(`lang="${l}"`));
  assert.match(accessEmail({ locale: "ar", place: "X", link: "https://x", expiresAt: at }).html, /dir="rtl"/);
});
