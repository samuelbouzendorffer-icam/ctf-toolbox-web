// app.js : relie l'interface aux fonctions de lib.js.
// Sécurité : les résultats sont affichés avec textContent (jamais innerHTML),
// pour qu'un texte saisi ne puisse jamais être interprété comme du code HTML (XSS).
import * as lib from "./lib.js";

const $ = (id) => document.getElementById(id);

function show(element, text, isError = false) {
  element.textContent = text;
  element.classList.toggle("error", isError);
}

async function run(output, task) {
  try {
    show(output, await task());
  } catch (err) {
    show(output, "Erreur : " + (err && err.message ? err.message : "entrée invalide."), true);
  }
}

// ----- Encodages -----
const CODECS = {
  base64: { encode: lib.base64Encode, decode: lib.base64Decode },
  hex: { encode: lib.hexEncode, decode: lib.hexDecode },
  url: { encode: lib.urlEncode, decode: lib.urlDecode },
};
$("enc-encode").addEventListener("click", () =>
  run($("enc-output"), () => CODECS[$("enc-type").value].encode($("enc-input").value)));
$("enc-decode").addEventListener("click", () =>
  run($("enc-output"), () => CODECS[$("enc-type").value].decode($("enc-input").value)));

// ----- SHA-256 -----
$("hash-run").addEventListener("click", () =>
  run($("hash-output"), () => lib.sha256Hex($("hash-input").value)));

// ----- César / Vigenère -----
function applyCipher(decrypt) {
  const text = $("cipher-input").value;
  const key = $("cipher-key").value;
  if ($("cipher-type").value === "caesar") {
    const shift = Number.parseInt(key, 10);
    if (Number.isNaN(shift)) throw new Error("Le décalage doit être un nombre entier.");
    return lib.caesar(text, decrypt ? -shift : shift);
  }
  return lib.vigenere(text, key, decrypt);
}
$("cipher-encrypt").addEventListener("click", () => run($("cipher-output"), () => applyCipher(false)));
$("cipher-decrypt").addEventListener("click", () => run($("cipher-output"), () => applyCipher(true)));
$("cipher-type").addEventListener("change", () => {
  $("cipher-key").value = $("cipher-type").value === "caesar" ? "3" : "CLE";
});

// ----- Robustesse d'un mot de passe -----
$("pw-input").addEventListener("input", () => {
  const value = $("pw-input").value;
  if (!value) {
    show($("pw-output"), "");
    return;
  }
  const { bits, level, problems } = lib.passwordStrength(value);
  const lines = [`Niveau : ${level} (≈ ${bits} bits, estimation indicative)`];
  if (problems.length) lines.push("Points faibles :", ...problems.map((p) => "  - " + p));
  show($("pw-output"), lines.join("\n"));
});
