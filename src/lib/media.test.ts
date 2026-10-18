import { test } from "node:test";
import assert from "node:assert/strict";
import { isPhotoFile, photoScore, plain, searchNames } from "./media";

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

test("postais, gravuras e docas antigas não entram nas galerias", () => {
  assert.equal(isPhotoFile("File:Princes Street Gardens postcard 1905.jpg"), false);
  assert.equal(isPhotoFile("File:Canning Dock plan.jpg"), false);
  assert.equal(isPhotoFile("File:Glasgow City Chambers 1890 engraving.jpg"), false);
  assert.equal(isPhotoFile("File:Royal Liver Building 2019.jpg"), true);
});

test("fotos antigas ficam de fora; destacadas da Commons primeiro", () => {
  assert.equal(photoScore({ DateTimeOriginal: { value: "1903" } }, 1600, 1000), null);
  const featured = photoScore({ Categories: { value: "Featured pictures on Wikimedia Commons|Quality images" }, DateTimeOriginal: { value: "2018-05-01" } }, 1600, 1000)!;
  const plainPic = photoScore({ DateTimeOriginal: { value: "2018-05-01" } }, 1600, 1000)!;
  assert.ok(featured > plainPic);
});
