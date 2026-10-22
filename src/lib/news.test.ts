import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRss, isSafety, titleNames } from "./news";
import { getCity } from "@/data/cities";

const now = Date.parse("2026-10-20T12:00:00Z");
const item = (title: string, src: string, date: string, link = "https://news.google.com/rss/articles/abc") =>
  `<item><title>${title} - ${src}</title><link>${link}</link><pubDate>${date}</pubDate><source url="https://x">${src}</source></item>`;

test("parseRss keeps recent safety headlines, strips source, ranks trusted first", () => {
  const xml = `<rss><channel>${[
    item("Strike at Manchester Airport cancels flights", "Some Blog", "Tue, 20 Oct 2026 10:00:00 GMT", "https://news.google.com/a1"),
    item("Police warn of pickpockets in city centre", "BBC", "Tue, 20 Oct 2026 08:00:00 GMT", "https://news.google.com/a2"),
    item("New restaurant opens", "BBC", "Tue, 20 Oct 2026 09:00:00 GMT", "https://news.google.com/a3"),
    item("Storm warning issued", "Reuters", "Thu, 15 Oct 2026 09:00:00 GMT", "https://news.google.com/a4"),
    item("Tom &amp; Jerry protest &#39;big&#39;", "Local", "Tue, 20 Oct 2026 07:00:00 GMT", "https://news.google.com/a5")
  ].join("")}</channel></rss>`;
  const r = parseRss(xml, "en", now);
  assert.deepEqual(r.map((x) => x.title), ["Police warn of pickpockets in city centre", "Strike at Manchester Airport cancels flights", "Tom & Jerry protest 'big'"]);
  assert.equal(r[0].trusted, true);
  assert.equal(r[0].source, "BBC");
});

test("isSafety works per language", () => {
  assert.ok(isSafety("Greve no metro de Lisboa", "pt"));
  assert.ok(isSafety("Grève SNCF ce jeudi", "fr"));
  assert.ok(isSafety("羽田空港で欠航", "ja"));
  assert.ok(!isSafety("Novo restaurante abre", "pt"));
});

test("só notícias cujo título nomeia a cidade", () => {
  const lis = getCity("lis")!;
  assert.equal(titleNames("Greve no metro de Lisboa amanhã", lis), true);
  assert.equal(titleNames("Lisbon airport delays after storm", lis), true);
  assert.equal(titleNames("Incêndio no Funchal obriga a evacuar hotel", lis), false);
});
