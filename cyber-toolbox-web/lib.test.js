import assert from "node:assert/strict";
import { test } from "node:test";

import * as lib from "./lib.js";

test("Base64 : aller-retour avec accents et symboles", () => {
  const text = "Café €uro, 你好";
  assert.equal(lib.base64Decode(lib.base64Encode(text)), text);
  assert.equal(lib.base64Encode("Hello"), "SGVsbG8=");
});

test("Base64 : une entrée invalide lève une erreur", () => {
  assert.throws(() => lib.base64Decode("%%%"));
});

test("Hexadécimal", () => {
  assert.equal(lib.hexEncode("Hello"), "48656c6c6f");
  assert.equal(lib.hexDecode("48 65 6c 6c 6f"), "Hello");
  assert.throws(() => lib.hexDecode("zz"));
  assert.throws(() => lib.hexDecode("abc"));
});

test("URL", () => {
  assert.equal(lib.urlEncode("a b&c=d"), "a%20b%26c%3Dd");
  assert.equal(lib.urlDecode("a%20b%26c%3Dd"), "a b&c=d");
  assert.throws(() => lib.urlDecode("%E0%A4%A"));
});

test("SHA-256 : vecteurs de test officiels", async () => {
  assert.equal(await lib.sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.equal(await lib.sha256Hex(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
});

test("César", () => {
  assert.equal(lib.caesar("Hello, World!", 3), "Khoor, Zruog!");
  assert.equal(lib.caesar("Khoor, Zruog!", -3), "Hello, World!");
  assert.equal(lib.caesar("é 42 !", 5), "é 42 !");
});

test("Vigenère", () => {
  assert.equal(lib.vigenere("ATTACKATDAWN", "LEMON"), "LXFOPVEFRNHR");
  assert.equal(lib.vigenere("LXFOPVEFRNHR", "LEMON", true), "ATTACKATDAWN");
  assert.throws(() => lib.vigenere("abc", "123"));
});

test("Robustesse du mot de passe", () => {
  assert.equal(lib.passwordStrength("123456").level, "très faible");
  assert.equal(lib.passwordStrength("aaaaaaaaaaaa").level, "très faible");
  assert.equal(lib.passwordStrength("abcdef1234").level, "faible");
  const strong = lib.passwordStrength("k9#Vm2$qLx7!Rt4Z");
  assert.equal(strong.level, "très fort");
  assert.deepEqual(strong.problems, []);
  assert.equal(lib.passwordStrength("").level, "très faible");
});

test("hasRun", () => {
  assert.ok(lib.hasRun("xxabcdxx"));
  assert.ok(lib.hasRun("4321"));
  assert.ok(!lib.hasRun("Tr0ub4dor"));
});
