import { test } from "node:test";
import assert from "node:assert/strict";
import { MerchantPatch } from "./merchant-portal";

const id = "7d0c0b52-6a2e-4a5e-9a1e-0c3e6b1d2f10";

test("patch accepts the editable fields and cleans social handles", () => {
  const r = MerchantPatch.parse({ id, offer: "10% off", hours: "Mon–Fri 9–19", instagram: "@cafe.praca", paused: true });
  assert.equal(r.instagram, "cafe.praca");
  assert.equal(r.paused, true);
});

test("patch ignores fields that need verification (name, address, category)", () => {
  const r = MerchantPatch.parse({ id, name: "Other", address: "Elsewhere", category: "hotel" } as Record<string, unknown>);
  assert.ok(!("name" in r) && !("address" in r) && !("category" in r));
});

test("patch rejects too many photos and bad ids", () => {
  assert.equal(MerchantPatch.safeParse({ id, photos: ["keep:0", "keep:1", "keep:2", "keep:3", "keep:4"] }).success, false);
  assert.equal(MerchantPatch.safeParse({ id: "x", offer: "abc" }).success, false);
  assert.equal(MerchantPatch.safeParse({ id, offer: "ab" }).success, false);
});
