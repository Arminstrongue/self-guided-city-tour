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

test("código de entrada: certo entra, errado ou de outro email não", async () => {
  const { createSignInCode, checkSignInCode, challengeEmail, readAccessToken } = await import("./access-token");
  const { code, challenge } = createSignInCode("Ana@Example.com");
  assert.match(code, /^\d{6}$/);
  assert.equal(challengeEmail(challenge), "ana@example.com");
  assert.equal(checkSignInCode(challenge, code), "ana@example.com");
  assert.equal(checkSignInCode(challenge, `${code.slice(0, 3)} ${code.slice(3)}`), "ana@example.com");
  const wrong = String((Number(code) + 1) % 1_000_000).padStart(6, "0");
  assert.equal(checkSignInCode(challenge, wrong), null);
  assert.equal(checkSignInCode(challenge, "12"), null);
  // O desafio não serve de sessão nem se pode trocar o email.
  assert.equal(readAccessToken(challenge), null);
  const other = createSignInCode("bob@example.com");
  const [, sig] = other.challenge.split(".");
  assert.equal(checkSignInCode(`${challenge.split(".")[0]}.${sig}`, code), null);
});
