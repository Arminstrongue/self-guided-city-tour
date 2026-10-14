import { test } from "node:test";
import assert from "node:assert/strict";
import { createAccessToken, readAccessToken } from "./access-token";

test("token válido devolve o email em minúsculas", () => {
  assert.equal(readAccessToken(createAccessToken("Ana@Exemplo.com")), "ana@exemplo.com");
});
test("token alterado é rejeitado", () => {
  const t = createAccessToken("ana@exemplo.com");
  const forged = Buffer.from(JSON.stringify({ e: "outro@x.com", x: 9999999999 })).toString("base64url") + "." + t.split(".")[1];
  assert.equal(readAccessToken(forged), null);
});
test("token expirado é rejeitado", () => {
  assert.equal(readAccessToken(createAccessToken("ana@exemplo.com", -10)), null);
});
