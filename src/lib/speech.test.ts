import { test } from "node:test";
import assert from "node:assert/strict";
import { chunkText, cleanForSpeech, pickVoice } from "./speech";
import { bayes, rankEats } from "./places";
import { CITIES } from "../data/cities";
import { biosFor, BIO_LANGS } from "../data/bios";

test("áudio: frases curtas, sem símbolos, voz do idioma certo", () => {
  const long = "Primeira frase. " + "Palavra ".repeat(80) + "fim. Última frase!";
  const parts = chunkText(long, 220);
  assert.ok(parts.every((p) => p.length <= 220), "nenhum bloco passa o limite");
  assert.equal(parts.join(" ").replace(/\s+/g, " "), long.trim().replace(/\s+/g, " "));
  assert.deepEqual(chunkText("一。二。"), ["一。二。"]);
  assert.equal(cleanForSpeech("Rossio · Baixa ★ 🔊 ok"), "Rossio, Baixa ok");
  const v = (lang: string, name: string, localService = true) => ({ lang, name, localService, default: false });
  const voices = [v("en-US", "Samantha"), v("pt-BR", "Luciana"), v("pt-PT", "Joana"), v("pt-PT", "Joana (Enhanced)"), v("ar-SA", "Maged")];
  assert.equal(pickVoice(voices, "pt-PT")?.name, "Joana (Enhanced)");
  assert.equal(pickVoice([v("pt-BR", "Luciana"), v("en-GB", "Daniel")], "pt-PT")?.name, "Luciana"); // mesma língua, outra variante
  assert.equal(pickVoice(voices, "ja-JP"), null); // sem voz japonesa: a app cai para inglês
  assert.equal(pickVoice([v("it_IT", "Alice")], "it-IT")?.name, "Alice");
});

test("restaurantes: melhores avaliações primeiro, baratos à frente, filtra os fracos e caros", () => {
  assert.ok(bayes(4.6, 3000) > bayes(4.9, 12));
  const list = [
    { id: "a", displayName: { text: "Caro" }, rating: 4.8, userRatingCount: 2000, priceLevel: "PRICE_LEVEL_EXPENSIVE" },
    { id: "b", displayName: { text: "Tasca" }, rating: 4.6, userRatingCount: 1500, priceLevel: "PRICE_LEVEL_INEXPENSIVE" },
    { id: "c", displayName: { text: "Novo" }, rating: 5.0, userRatingCount: 8, priceLevel: "PRICE_LEVEL_INEXPENSIVE" },
    { id: "d", displayName: { text: "Médio" }, rating: 4.6, userRatingCount: 1500, priceLevel: "PRICE_LEVEL_MODERATE" },
    { id: "e", displayName: { text: "Fraco" }, rating: 3.9, userRatingCount: 5000, priceLevel: "PRICE_LEVEL_INEXPENSIVE" },
    { id: "f", displayName: { text: "Fechado" }, rating: 4.7, userRatingCount: 900, priceLevel: "PRICE_LEVEL_INEXPENSIVE", currentOpeningHours: { openNow: false } }
  ];
  assert.deepEqual(rankEats(list).map((e) => e.id), ["b", "d"]);
});

test("biografias: todas as paragens têm texto longo em inglês e português", () => {
  assert.ok(BIO_LANGS.includes("en") && BIO_LANGS.includes("pt"));
  for (const c of CITIES) {
    for (const lang of BIO_LANGS) {
      const b = biosFor(c.id, lang);
      for (const s of c.stops) {
        assert.ok(b[s.id]?.text && b[s.id].text.length > (/^(zh|ja)$/.test(lang) ? 150 : 400), `${lang}/${c.id}/${s.id}`);
        assert.equal(b[s.id].lang, lang, `${lang}/${c.id}/${s.id} em falta`);
      }
    }
  }
});

import { stopName } from "../data/stop-names";
import { returnEstimate } from "./route-cost";
test("nomes das paragens no idioma do viajante e GPS longe da cidade", () => {
  for (const c of CITIES) for (const s of c.stops) {
    const en = stopName(s, "en");
    assert.ok(!/ e /.test(en), `${c.id}/${s.id}: ${en}`);
    assert.equal(stopName(s, "pt"), s.n);
  }
  const paris = CITIES.find((c) => c.id === "par")!;
  assert.equal(returnEstimate(paris, { lat: 53.48, lng: -2.24 }), null); // Manchester
  assert.ok((returnEstimate(paris, { lat: 48.86, lng: 2.35 }) ?? 0) > 0);
});
