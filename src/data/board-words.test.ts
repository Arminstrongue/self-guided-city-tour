import { test } from "node:test";
import assert from "node:assert/strict";
import { boardNames, sameStation } from "./board-words";

test("board names: abbreviations seen on UK departure boards", () => {
  assert.ok(boardNames("Manchester Piccadilly").includes("Manchester Picc"));
  assert.ok(boardNames("Milton Keynes Central").includes("Milton Keynes Ctl"));
  assert.ok(boardNames("Liverpool South Parkway").includes("Liverpool South PW"));
  assert.ok(boardNames("Birmingham New Street").includes("Birmingham N St"));
  assert.ok(boardNames("Liverpool Lime Street").includes("Liverpool Lime St"));
  assert.ok(boardNames("London Euston").includes("Euston"));
  assert.ok(sameStation("Warrington Bk Quay", "Warrington Bank Quay"));
  assert.ok(!sameStation("Crewe", "Stockport"));
});
