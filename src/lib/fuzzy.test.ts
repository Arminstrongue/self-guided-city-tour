import { test } from "node:test";
import assert from "node:assert/strict";
import { fuzzyFilter, matchScore } from "./fuzzy";

const list = [
  { label: "Piccadilly", sub: "Station Approach, Manchester M60 7RA" },
  { label: "Manchester Oxford Road", sub: "Oxford Rd, Manchester" },
  { label: "Victoria", sub: "Todd St, Manchester" },
  { label: "London Euston", sub: "Euston Rd, London NW1 2RT" },
  { label: "São Bento", sub: "Porto" }
];
const find = (q: string) => fuzzyFilter(list, q, (h) => `${h.label} ${h.sub}`).map((h) => h.label);

test("procura de lugares: palavras parciais, ordem livre, sem acentos e um erro de letra", () => {
  assert.equal(find("Manchester Piccadil")[0], "Piccadilly");
  assert.equal(find("piccadily manch")[0], "Piccadilly");
  assert.equal(find("picc")[0], "Piccadilly");
  assert.equal(find("Manchester Piccadilly station")[0], "Piccadilly");
  assert.equal(find("oxford")[0], "Manchester Oxford Road");
  assert.equal(find("sao bento")[0], "São Bento");
  assert.equal(find("eustn")[0], "London Euston");
  assert.deepEqual(find("glasgow"), []);
  assert.equal(matchScore("", "x"), 1);
  assert.ok(matchScore("victoria", "Victoria Todd St") > matchScore("vict", "Victoria Todd St"));
});
