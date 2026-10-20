import { test } from "node:test";
import assert from "node:assert/strict";
import { isHateful, maskProfanity, moderate } from "./moderation";

test("moderação: bloqueia ódio, esconde palavrões, sem falsos positivos comuns", () => {
  assert.equal(isHateful("you f@ggot"), true);
  assert.equal(isHateful("N1GGER"), true);
  assert.equal(isHateful("Scunthorpe and the bicha at the airport, en retard"), false);
  assert.equal(maskProfanity("this is fucking great"), "this is f•••••• great");
  assert.equal(maskProfanity("Shit happens"), "S••• happens");
  assert.equal(maskProfanity("Classic Lisbon"), "Classic Lisbon");
  assert.deepEqual(moderate("que merda de chuva"), { ok: true, text: "que m•••• de chuva" });
  assert.deepEqual(moderate("go home paki"), { ok: false });
});
