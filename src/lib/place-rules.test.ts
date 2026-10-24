import { test } from "node:test";
import assert from "node:assert/strict";
import { placeRules, placeType } from "./place-rules";

test("place types from names and icons", () => {
  assert.equal(placeType("Manchester Museum"), "museum");
  assert.equal(placeType("The Whitworth", "🎭"), "museum");
  assert.equal(placeType("Mayfield Park", "🌳"), "park");
  assert.equal(placeType("Live music at Band on the Wall", "🎵"), "music");
  assert.equal(placeType("Manchester Cathedral"), "religious");
  assert.equal(placeType("Old Trafford"), "stadium");
  assert.equal(placeType("Reflective Passage", "🌅"), "view");
  assert.equal(placeType("Some café"), "other");
});

test("warnings come first", () => {
  assert.deepEqual(placeRules("Live music at Band on the Wall").slice(0, 2), ["bagsSmall", "security"]);
  assert.equal(placeRules("Manchester Museum")[0], "bagsCloak");
  assert.deepEqual(placeRules("Mayfield Park", "🌳"), ["dusk", "dogs", "weather"]);
});
