import { test } from "node:test";
import assert from "node:assert/strict";
import { getCity } from "../data/cities";
import { _lists, checkEntry, checkLayover } from "./entry";
import { fitRoute, km, returnEstimate, routeOptions } from "./route-cost";
import { parseFlights, validFlightNo, normaliseFlightNo } from "./flight";

const lis = getCity("lis")!, lon = getCity("lon")!, ist = getCity("ist")!;

test("listas sem contradições", () => {
  const both = (a: string[], b: string[]) => a.filter((x) => b.includes(x));
  assert.deepEqual(both(_lists.SCHENGEN_EXEMPT, _lists.SCHENGEN_VISA), []);
  assert.deepEqual(both(_lists.UK_ETA, _lists.UK_VISA), []);
  assert.deepEqual(both(_lists.TR_FREE, [..._lists.TR_EVISA, ..._lists.TR_VISA]), []);
  assert.deepEqual(both([..._lists.EU, ..._lists.EEA_CH], _lists.SCHENGEN_VISA), []);
});

test("regras de entrada por nacionalidade", () => {
  assert.equal(checkEntry(lis, "PT").verdict, "free");
  assert.equal(checkEntry(lis, "BR").verdict, "free-ees");
  assert.equal(checkEntry(lis, "US").verdict, "free-ees");
  assert.equal(checkEntry(lis, "AO").verdict, "visa");
  assert.equal(checkEntry(lis, "AO", true).verdict, "free-ees"); // com visto Schengen
  assert.equal(checkEntry(lis, "NG").transitVisa, true);
  assert.equal(checkEntry(lon, "PT").verdict, "eta");
  assert.equal(checkEntry(lon, "US").verdict, "eta");
  assert.equal(checkEntry(lon, "GB").verdict, "free");
  assert.equal(checkEntry(lon, "IE").verdict, "free");
  assert.equal(checkEntry(lon, "IN").verdict, "visa");
  assert.equal(checkEntry(lis, "QA").verdict, "unknown");
  // Turquia
  assert.equal(checkEntry(ist, "PT").verdict, "free");
  assert.equal(checkEntry(ist, "GB").verdict, "free");
  assert.equal(checkEntry(ist, "CN").verdict, "free");
  assert.equal(checkEntry(ist, "CY").verdict, "visa");
  assert.equal(checkEntry(ist, "IN").verdict, "evisa");
  assert.equal(checkEntry(ist, "AO").verdict, "visa");
  assert.equal(checkEntry(ist, "AO", true).verdict, "free");
  assert.equal(checkEntry(ist, "PT").zone, "tr");
});

test("tempo de escala: roteiro que cabe", () => {
  const a = new Date("2030-05-01T08:00:00Z");
  const long = checkLayover(lis, "PT", a, new Date(a.getTime() + 10 * 3600e3));
  assert.equal(long.route?.key, "ext");
  const mid = checkLayover(lis, "PT", a, new Date(a.getTime() + 6 * 3600e3));
  assert.ok(mid.route && mid.route.key !== "ext");
  assert.ok(mid.route.plan.minutesTotal <= mid.cityMin);
  const short = checkLayover(lis, "PT", a, new Date(a.getTime() + 3.5 * 3600e3));
  assert.equal(short.route, null);
  assert.equal(short.worthIt, false);
  assert.equal(checkLayover(lis, "AO", a, new Date(a.getTime() + 10 * 3600e3)).worthIt, false);
});

test("opções de roteiro crescem e fitRoute escolhe a maior que cabe", () => {
  const opts = routeOptions(lis);
  for (let i = 1; i < opts.length; i++) assert.ok(opts[i].plan.minutesTotal >= opts[i - 1].plan.minutesTotal);
  assert.equal(fitRoute(lis, 10), null);
  const f = fitRoute(lis, opts[2].plan.minutesTotal);
  assert.equal(f?.key, opts[2].key);
});

test("regresso a partir da posição", () => {
  assert.ok(Math.abs(km({ lat: 38.7139, lng: -9.1394 }, { lat: 38.7742, lng: -9.1342 }) - 6.7) < 0.3);
  const fromRossio = returnEstimate(lis, lis.stops[0])!;
  assert.equal(fromRossio, lis.air.min + 10);
  const fromBelem = returnEstimate(lis, lis.stops.find((s) => s.id === "torre-belem")!)!;
  assert.ok(fromBelem > fromRossio);
});

test("estado do voo (AeroDataBox)", () => {
  assert.equal(normaliseFlightNo("tp 1234"), "TP1234");
  assert.ok(validFlightNo("TP1234") && validFlightNo("U22345") && validFlightNo("FR1"));
  assert.ok(!validFlightNo("1234") && !validFlightNo("TPX"));
  const s = parseFlights([
    { number: "TP 1234", status: "Expected", departure: { airport: { iata: "OPO" }, scheduledTime: { utc: "2030-05-01 06:00Z" } } },
    { number: "TP 1234", status: "Delayed", departure: { airport: { iata: "LIS" }, scheduledTime: { utc: "2030-05-01 18:05Z" }, revisedTime: { utc: "2030-05-01 18:50Z" }, terminal: "1", gate: "14" }, arrival: { airport: { iata: "GRU" } } }
  ], "TP1234", "LIS")!;
  assert.equal(s.from, "LIS"); assert.equal(s.to, "GRU");
  assert.equal(s.delayMin, 45); assert.equal(s.gate, "14");
  assert.equal(s.estimated, "2030-05-01T18:50:00.000Z");
  assert.equal(parseFlights([], "X"), null);
});

test("Médio Oriente: regras de entrada por país", () => {
  const c = (id: string) => getCity(id)!;
  assert.equal(checkEntry(c("dxb"), "PT").verdict, "free-pass");
  assert.equal(checkEntry(c("dxb"), "AE").verdict, "free");
  assert.equal(checkEntry(c("dxb"), "IN").verdict, "visa");
  assert.equal(checkEntry(c("dxb"), "IN").hint, "ae-permit");
  assert.equal(checkEntry(c("doh"), "GB").verdict, "free-pass");
  assert.equal(checkEntry(c("ruh"), "FR").verdict, "evisa-me");
  assert.equal(checkEntry(c("ruh"), "FR").hint, "sa-stopover");
  assert.equal(checkEntry(c("jed"), "AE").verdict, "free-pass");
  assert.equal(checkEntry(c("ruh"), "AO").hint, "sa-visa");
  assert.equal(checkEntry(c("cai"), "DE").verdict, "voa");
  assert.equal(checkEntry(c("cai"), "DE").fee, "25 USD");
  assert.equal(checkEntry(c("amm"), "US").verdict, "voa");
  assert.equal(checkEntry(c("amm"), "NG").verdict, "visa");
  assert.equal(checkEntry(c("amm"), "SA").verdict, "free-pass");
  assert.equal(checkEntry(c("mct"), "BR").verdict, "free-pass");
  assert.equal(checkEntry(c("mct"), "AO").verdict, "unknown");
  assert.equal(checkEntry(c("mct"), "AO", true).verdict, "free");
});

test("entrada: Singapura (zona própria, SG Arrival Card) e novas cidades Schengen", () => {
  const c = (id: string) => getCity(id)!;
  const sg = checkEntry(c("sin"), "PT");
  assert.equal(sg.zone, "sg");
  assert.equal(sg.verdict, "free-pass");
  assert.equal(sg.hint, "sg-arrival");
  assert.equal(checkEntry(c("sin"), "IN").verdict, "visa");
  assert.equal(checkEntry(c("sin"), "SG").verdict, "free");
  assert.equal(checkEntry(c("sin"), "SG").hint, undefined);
  assert.equal(checkEntry(c("sin"), "AO").verdict, "unknown");
  for (const id of ["fra", "ber", "muc", "vie", "prg"]) assert.equal(checkEntry(c(id), "DE").zone, "schengen", id);
  assert.equal(checkEntry(c("prg"), "US").verdict === "free-ees" || checkEntry(c("prg"), "US").verdict === "etias", true);
});

test("Américas e África: ESTA, eTA, e-visa, isenções e vistos", async () => {
  const { checkEntry } = await import("./entry");
  const city = (cur: string) => ({ cur } as never);
  assert.equal(checkEntry(city("USD"), "PT").verdict, "auth");
  assert.equal(checkEntry(city("USD"), "PT").hint, "us");
  assert.equal(checkEntry(city("USD"), "CA").verdict, "free-pass");
  assert.equal(checkEntry(city("USD"), "BR").verdict, "visa");
  assert.equal(checkEntry(city("CAD"), "US").verdict, "free-pass");
  assert.equal(checkEntry(city("CAD"), "FR").verdict, "auth");
  assert.equal(checkEntry(city("BRL"), "US").verdict, "auth");
  assert.equal(checkEntry(city("BRL"), "PT").verdict, "free-pass");
  assert.equal(checkEntry(city("MXN"), "BR").verdict, "visa");
  assert.equal(checkEntry(city("MXN"), "BR", true).verdict, "free");
  assert.equal(checkEntry(city("AOA"), "PT").verdict, "free-pass");
  assert.equal(checkEntry(city("AOA"), "AO").verdict, "free");
  assert.equal(checkEntry(city("KES"), "NG").verdict, "free-pass");
  assert.equal(checkEntry(city("KES"), "DE").verdict, "auth");
  assert.equal(checkEntry(city("KES"), "SO").verdict, "auth");
  assert.equal(checkEntry(city("ETB"), "GB").verdict, "evisa-me");
  assert.equal(checkEntry(city("RWF"), "US").verdict, "voa");
  assert.equal(checkEntry(city("RWF"), "GB").verdict, "free-pass");
  assert.equal(checkEntry(city("GHS"), "NG").verdict, "free-pass");
  assert.equal(checkEntry(city("GHS"), "US").verdict, "visa");
  assert.equal(checkEntry(city("TZS"), "PT").verdict, "evisa-me");
  assert.equal(checkEntry(city("MAD"), "PT").verdict, "free-pass");
  assert.equal(checkEntry(city("XOF"), "US").verdict, "free-pass");
  assert.equal(checkEntry(city("ZAR"), "IN").verdict, "visa");
});

test("EUA: nacionalidades com vistos suspensos (2026) e Gana sem visto para africanos", () => {
  const nyc = getCity("nyc")!, acc = getCity("acc")!;
  const ao = checkEntry(nyc, "AO");
  assert.equal(ao.verdict, "visa");
  assert.equal(ao.hint, "usban");
  assert.equal(checkEntry(nyc, "PT").verdict, "auth");
  assert.notEqual(checkEntry(nyc, "BR").hint, "usban");
  assert.equal(checkEntry(acc, "EG").verdict, "free-pass");
  assert.equal(checkEntry(acc, "PT").verdict, "visa");
});

test("novas cidades: Suíça, Grécia e Madeira são Schengen; Dublin (EUR) tem zona própria", async () => {
  const { zoneOf } = await import("../data/city-meta");
  const city = (id: string, cur: string) => ({ id, cur } as never);
  for (const [id, cur] of [["zrh", "CHF"], ["brn", "CHF"], ["ath", "EUR"], ["fnc", "EUR"]]) {
    assert.equal(zoneOf(city(id, cur)), "schengen", id);
    assert.equal(checkEntry(city(id, cur), "CH").verdict, "free", id);
    assert.equal(checkEntry(city(id, cur), "AO").verdict, "visa", id);
  }
  assert.equal(checkEntry(city("zrh", "CHF"), "US").verdict === "free-ees" || checkEntry(city("zrh", "CHF"), "US").verdict === "etias", true);
  assert.equal(zoneOf(city("dub", "EUR")), "ie");
  assert.equal(zoneOf({ cur: "EUR" }), "schengen"); // sem id: continua pela moeda
  for (const id of ["lis", "par", "rom", "ams", "vie"]) assert.equal(zoneOf(getCity(id)!), "schengen", id);
  assert.equal(zoneOf(city("hkg", "HKD")), "hk");
  assert.equal(zoneOf(city("bkk", "THB")), "th");
  assert.equal(zoneOf(city("dps", "IDR")), "id");
  assert.equal(zoneOf(city("dar", "TZS")), "tz");
});

test("Irlanda: fora de Schengen, Área Comum de Viagem, visto de trânsito", () => {
  const dub = { id: "dub", cur: "EUR" } as never;
  assert.equal(checkEntry(dub, "IE").verdict, "free");
  assert.equal(checkEntry(dub, "PT").verdict, "free");   // UE: passaporte ou cartão de cidadão
  assert.equal(checkEntry(dub, "CH").verdict, "free");
  assert.equal(checkEntry(dub, "GB").verdict, "free");   // Área Comum de Viagem
  assert.equal(checkEntry(dub, "US").verdict, "free-pass");
  assert.equal(checkEntry(dub, "BR").verdict, "free-pass");
  assert.equal(checkEntry(dub, "UA").verdict, "free-pass");
  assert.equal(checkEntry(dub, "LC").verdict, "visa");    // visto exigido desde 15/06/2026 (S.I. 242/2026)
  assert.equal(checkEntry(dub, "IN").verdict, "visa");
  assert.equal(checkEntry(dub, "IN").hint, "ie-uk");
  assert.equal(checkEntry(dub, "IN").transitVisa, false);
  assert.equal(checkEntry(dub, "NG").transitVisa, true);
  assert.equal(checkEntry(dub, "NG", true).verdict, "free");
  assert.equal(checkEntry(dub, "NG", true).transitVisa, false);
  assert.equal(checkEntry(dub, "US").hint, undefined);
  assert.equal(checkEntry(dub, "US").transitVisa, false);
});

test("Hong Kong: sem visto (7 a 180 dias), PAR para a Índia, vistos e trânsito", () => {
  const hkg = { id: "hkg", cur: "HKD" } as never;
  assert.equal(checkEntry(hkg, "HK").verdict, "free");
  assert.equal(checkEntry(hkg, "PT").verdict, "free-pass");
  assert.equal(checkEntry(hkg, "GB").verdict, "free-pass");
  assert.equal(checkEntry(hkg, "BR").verdict, "free-pass");
  assert.equal(checkEntry(hkg, "MZ").verdict, "free-pass"); // 14 dias
  assert.equal(checkEntry(hkg, "BJ").verdict, "free-pass");
  assert.equal(checkEntry(hkg, "IN").verdict, "auth");
  assert.equal(checkEntry(hkg, "IN").hint, "hk-par");
  assert.equal(checkEntry(hkg, "IN").site, "immd.gov.hk");
  assert.equal(checkEntry(hkg, "AO").verdict, "visa");
  assert.equal(checkEntry(hkg, "AO").transitVisa, true);
  assert.equal(checkEntry(hkg, "VN").verdict, "visa");
  assert.equal(checkEntry(hkg, "VN").transitVisa, false);
  assert.equal(checkEntry(hkg, "NG").transitVisa, true);
  assert.equal(checkEntry(hkg, "CN").verdict, "unknown"); // residentes do continente: autorização própria
  assert.equal(checkEntry(hkg, "PT").hint, undefined);
});

test("Tailândia (regras de 15/09/2026): 30 dias, acordos bilaterais, visto à chegada, TDAC", () => {
  const bkk = { id: "bkk", cur: "THB" } as never;
  assert.equal(checkEntry(bkk, "TH").verdict, "free");
  assert.equal(checkEntry(bkk, "TH").hint, undefined);
  const pt = checkEntry(bkk, "PT");
  assert.equal(pt.verdict, "free-pass");
  assert.equal(pt.hint, "th-tdac");
  assert.equal(checkEntry(bkk, "BR").verdict, "free-pass"); // acordo bilateral
  assert.equal(checkEntry(bkk, "CN").verdict, "free-pass");
  assert.equal(checkEntry(bkk, "MU").verdict, "free-pass"); // 15 dias
  assert.equal(checkEntry(bkk, "RS").verdict, "voa");
  assert.equal(checkEntry(bkk, "RS").fee, "2000 THB");
  assert.equal(checkEntry(bkk, "MX").verdict, "visa");     // perdeu a isenção de 60 dias
  assert.equal(checkEntry(bkk, "AO").verdict, "visa");
  assert.equal(checkEntry(bkk, "AO", true).verdict, "free");
});

test("Indonésia (Bali): ASEAN sem visto, e-VoA para 97 países, taxa turística de Bali", () => {
  const dps = { id: "dps", cur: "IDR" } as never;
  assert.equal(checkEntry(dps, "ID").verdict, "free");
  assert.equal(checkEntry(dps, "SG").verdict, "free-pass");
  const pt = checkEntry(dps, "PT");
  assert.equal(pt.verdict, "voa");
  assert.equal(pt.fee, "500 000 IDR");
  assert.equal(pt.site, "evisa.imigrasi.go.id");
  assert.equal(pt.hint, "bali");
  assert.equal(checkEntry(dps, "TL").verdict, "voa");
  assert.equal(checkEntry(dps, "AO").verdict, "unknown");
  assert.equal(checkEntry({ id: "jkt", cur: "IDR" } as never, "PT").hint, undefined); // a taxa é só de Bali
});

test("Tanzânia: a dica de Zanzibar não aparece em Dar es Salaam", () => {
  assert.equal(checkEntry({ id: "zan", cur: "TZS" } as never, "PT").hint, "zan");
  assert.equal(checkEntry({ id: "dar", cur: "TZS" } as never, "PT").hint, undefined);
  assert.equal(checkEntry({ id: "dar", cur: "TZS" } as never, "PT").verdict, "evisa-me");
});

test("novas listas sem contradições", () => {
  const both = (a: string[], b: string[]) => a.filter((x) => b.includes(x));
  assert.deepEqual(both(_lists.IE_FREE, _lists.IE_VISA), []);
  assert.deepEqual(both(_lists.IE_ATV, _lists.IE_VISA), _lists.IE_ATV);
  assert.deepEqual(both(_lists.HK_FREE, _lists.HK_VISA), []);
  assert.deepEqual(both(_lists.HK_ATV, _lists.HK_VISA), _lists.HK_ATV);
  assert.deepEqual(both(_lists.TH_FREE, _lists.TH_VOA), []);
  assert.deepEqual(both(_lists.ID_FREE, _lists.ID_VOA), []);
  assert.equal(_lists.ID_FREE.length + _lists.ID_VOA.length, 97);
});

test("novas cidades: Cabo Verde (CVE), Namíbia (NAD) e Japão (JPY) têm zona própria", async () => {
  const { zoneOf } = await import("../data/city-meta");
  const city = (id: string, cur: string) => ({ id, cur } as never);
  for (const id of ["rai", "vxe", "sid"]) assert.equal(zoneOf(city(id, "CVE")), "cv", id);
  for (const id of ["wdh", "swp"]) assert.equal(zoneOf(city(id, "NAD")), "na", id);
  for (const id of ["tyo", "kyo", "osa", "hij"]) assert.equal(zoneOf(city(id, "JPY")), "jp", id);
  assert.equal(zoneOf({ cur: "ZAR" }), "za"); // o rand continua a ser a África do Sul
});

test("Cabo Verde: UE e CEDEAO sem visto, EASE/TSA para todos, visto prévio (também em trânsito) para 89 nacionalidades", () => {
  const rai = { id: "rai", cur: "CVE" } as never;
  assert.equal(checkEntry(rai, "CV").verdict, "free");
  assert.equal(checkEntry(rai, "CV").hint, undefined);
  const pt = checkEntry(rai, "PT");
  assert.equal(pt.verdict, "free-pass");
  assert.equal(pt.hint, "cv-ease");
  assert.equal(pt.site, "ease.gov.cv");
  assert.equal(checkEntry(rai, "GB").verdict, "free-pass");
  assert.equal(checkEntry(rai, "SN").verdict, "free-pass"); // CEDEAO
  assert.equal(checkEntry(rai, "ML").verdict, "unknown");   // saiu da CEDEAO em 2025
  assert.equal(checkEntry(rai, "US").verdict, "unknown");   // isenção só em notícias, sem fonte oficial
  const mx = checkEntry(rai, "MX");
  assert.equal(mx.verdict, "visa");
  assert.equal(mx.transitVisa, true);
  assert.equal(mx.hint, "cv-ease");
  assert.equal(checkEntry(rai, "MX", true).verdict, "free"); // residência da UE, EUA, Brasil, Canadá…
  assert.equal(checkEntry(rai, "MX", true).transitVisa, false);
  assert.equal(checkEntry(rai, "TR").verdict, "unknown");   // saiu da lista em janeiro de 2026
  assert.equal(checkEntry(rai, "IN").verdict, "unknown");
  assert.equal(checkEntry({ id: "sid", cur: "CVE" } as never, "FR").hint, "cv-ease");
});

test("Namíbia (regras de 01/04/2025): isentos, visto à chegada, e-visa para os outros", () => {
  const wdh = { id: "wdh", cur: "NAD" } as never;
  assert.equal(checkEntry(wdh, "NA").verdict, "free");
  assert.equal(checkEntry(wdh, "ZA").verdict, "free-pass");
  assert.equal(checkEntry(wdh, "AO").verdict, "free-pass");
  assert.equal(checkEntry(wdh, "BR").verdict, "free-pass");
  assert.equal(checkEntry(wdh, "ZA").hint, undefined);
  const pt = checkEntry(wdh, "PT");
  assert.equal(pt.verdict, "voa");
  assert.equal(pt.fee, "1200–1600 NAD");
  assert.equal(pt.hint, "na-voa");
  assert.equal(checkEntry(wdh, "US").verdict, "voa");
  assert.equal(checkEntry(wdh, "GH").verdict, "voa");
  const cn = checkEntry(wdh, "CN");
  assert.equal(cn.verdict, "evisa-me");
  assert.equal(cn.site, "eservices.mhaiss.gov.na");
  assert.equal(cn.hint, "na-voa");
  assert.equal(checkEntry(wdh, "SG").verdict, "unknown"); // nas duas listas oficiais
  assert.equal(checkEntry(wdh, "MT").verdict, "unknown");
  assert.equal(checkEntry(wdh, "CN", true).verdict, "free");
  assert.equal(checkEntry({ id: "swp", cur: "NAD" } as never, "DE").verdict, "voa");
});

test("Japão: 74 países e regiões sem visto, Visit Japan Web, visto para os outros", () => {
  const tyo = { id: "tyo", cur: "JPY" } as never;
  assert.equal(checkEntry(tyo, "JP").verdict, "free");
  assert.equal(checkEntry(tyo, "JP").hint, undefined);
  const pt = checkEntry(tyo, "PT");
  assert.equal(pt.verdict, "free-pass");
  assert.equal(pt.hint, "jp-vjw");
  for (const n of ["US", "GB", "BR", "TW", "HK", "MX", "TH", "AE", "RS"]) assert.equal(checkEntry(tyo, n).verdict, "free-pass", n);
  assert.equal(checkEntry(tyo, "CN").verdict, "visa");
  assert.equal(checkEntry(tyo, "IN").verdict, "visa");
  assert.equal(checkEntry(tyo, "AO").verdict, "visa");
  assert.equal(checkEntry(tyo, "AO").transitVisa, false);
  assert.equal(checkEntry(tyo, "AO", true).verdict, "free");
  assert.equal(checkEntry(tyo, "ID").verdict, "unknown"); // passaporte eletrónico registado
  assert.equal(checkEntry(tyo, "QA").verdict, "unknown");
  assert.equal(checkEntry(tyo, "CO").verdict, "unknown");
  assert.equal(checkEntry({ id: "hij", cur: "JPY" } as never, "FR").verdict, "free-pass");
});

test("listas de Cabo Verde, Namíbia e Japão sem contradições", () => {
  const both = (a: string[], b: string[]) => a.filter((x) => b.includes(x));
  assert.deepEqual(both(_lists.CV_FREE, _lists.CV_VISA), []);
  assert.equal(_lists.CV_VISA.length, 89); // 91 do despacho sem Porto Rico e Toquelau
  assert.equal(new Set(_lists.CV_VISA).size, _lists.CV_VISA.length);
  assert.deepEqual(both(_lists.NA_FREE, _lists.NA_VOA), []);
  assert.deepEqual(both(_lists.NA_UNKNOWN, [..._lists.NA_FREE, ..._lists.NA_VOA]), []);
  assert.equal(new Set(_lists.NA_VOA).size, _lists.NA_VOA.length);
  assert.deepEqual(both(_lists.JP_FREE, _lists.JP_UNKNOWN), []);
  assert.equal(new Set(_lists.JP_FREE).size, _lists.JP_FREE.length);
  assert.equal(_lists.JP_FREE.length + 2, 74); // + Indonésia e Catar
});
