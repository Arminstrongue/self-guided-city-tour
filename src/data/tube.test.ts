import { test } from "node:test";
import assert from "node:assert/strict";
import { tubeAdvice } from "./tube";

test("tube: direct Northern via Charing Cross, Northbound", () => {
  const a = tubeAdvice("Kennington", "Euston")!;
  assert.equal(a.legs.length, 1);
  assert.deepEqual([a.legs[0].line, a.legs[0].dir, a.legs[0].via, a.legs[0].stops], ["northern", "N", "cx", 8]);
  assert.ok(!a.legs[0].ends.includes("Mill Hill East"));
});
test("tube: via Bank when the destination is on the Bank branch", () => {
  assert.equal(tubeAdvice("Kennington", "Bank")!.legs[0].via, "bank");
});
test("tube: change at Camden Town between the northern branches", () => {
  const a = tubeAdvice("Edgware", "High Barnet")!;
  assert.equal(a.legs.length, 2); assert.equal(a.legs[0].to, "Camden Town");
});
test("tube: Victoria line and a change at Euston", () => {
  assert.deepEqual(tubeAdvice("Brixton", "Oxford Circus")!.legs.map((l) => [l.line, l.dir, l.stops]), [["victoria", "N", 6]]);
  const c = tubeAdvice("Charing Cross", "Walthamstow Central")!;
  assert.deepEqual(c.legs.map((l) => l.line), ["northern", "victoria"]); assert.equal(c.legs[0].to, "Euston");
});
test("tube: unknown station → null", () => { assert.equal(tubeAdvice("Atlantis", "Bank"), null); });
test("tube: Battersea Power Station only via Charing Cross (from the Bank branch: change at Kennington)", () => {
  const a = tubeAdvice("London Bridge", "Nine Elms")!;
  assert.equal(a.legs.length, 2); assert.equal(a.legs[0].to, "Kennington");
  assert.equal(tubeAdvice("Waterloo", "Nine Elms")!.legs.length, 1);
});
