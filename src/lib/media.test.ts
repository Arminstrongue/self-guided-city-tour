import { test } from "node:test";
import assert from "node:assert/strict";
import { isPhotoFile, plain, searchNames } from "./media";

test("só fotografias: exclui mapas, logótipos, brasões e SVG", () => {
  assert.equal(isPhotoFile("File:Belem Tower 2019.jpg"), true);
  assert.equal(isPhotoFile("File:Torre de Belém.JPEG"), true);
  assert.equal(isPhotoFile("File:Lisbon location map.jpg"), false);
  assert.equal(isPhotoFile("File:Coat of arms of Lisbon.jpg"), false);
  assert.equal(isPhotoFile("File:Logo.png"), false);
  assert.equal(isPhotoFile("File:Plan.svg"), false);
});

test("créditos da Commons sem HTML", () => {
  assert.equal(plain('<a href="//commons.wikimedia.org/wiki/User:X">Ana &amp; Rui</a>'), "Ana & Rui");
  assert.equal(plain(undefined), "");
});

test("nomes compostos pesquisam cada parte", () => {
  assert.deepEqual(searchNames("Jerónimos & Pastéis de Belém"), ["Jerónimos", "Pastéis de Belém"]);
  assert.deepEqual(searchNames("Belém Tower"), ["Belém Tower"]);
});
