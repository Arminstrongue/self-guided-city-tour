import { test } from "node:test";
import assert from "node:assert/strict";
import { departures } from "./rail-live";

test("rail-live: parses the Live Departure Board answer and sends the key only in the header", async () => {
  process.env.RDM_LDB_KEY = "k-test";
  process.env.RDM_LDB_URL = "https://example.test/LDBWS/api/20220120/GetDepBoardWithDetails/";
  let url = "", key = "";
  const orig = globalThis.fetch;
  globalThis.fetch = (async (u: string, init: RequestInit) => {
    url = u; key = (init.headers as Record<string, string>)["x-apikey"];
    return new Response(JSON.stringify({
      generatedAt: "2026-10-31T06:05:00", locationName: "Manchester Piccadilly",
      nrccMessages: [{ Value: "Disruption between <a href='x'>Stockport</a> and Crewe &amp; Wilmslow." }],
      trainServices: [{ std: "06:07", etd: "06:15", platform: "7", operator: "Northern", isCancelled: false, delayReason: "This train has been delayed by a fault",
        destination: [{ locationName: "Crewe", crs: "CRE" }],
        subsequentCallingPoints: [{ callingPoint: [{ locationName: "Stockport", crs: "SPT", st: "06:16", et: "06:24" }, { locationName: "Crewe", crs: "CRE", st: "07:01", et: "07:09" }] }] }]
    }), { status: 200 });
  }) as typeof fetch;
  try {
    const { board, http } = await departures("MAN", "CRE");
    assert.equal(http, 200);
    assert.match(url, /^https:\/\/example\.test\/LDBWS\/api\/20220120\/GetDepBoardWithDetails\/MAN\?/);
    assert.match(url, /filterCrs=CRE/);
    assert.ok(!url.includes("k-test"));
    assert.equal(key, "k-test");
    assert.equal(board?.messages[0], "Disruption between Stockport and Crewe & Wilmslow.");
    const s = board!.services[0];
    assert.equal(s.etd, "06:15"); assert.equal(s.platform, "7"); assert.equal(s.calls[1].et, "07:09"); assert.equal(s.to, "Crewe");
  } finally { globalThis.fetch = orig; delete process.env.RDM_LDB_KEY; }
});
