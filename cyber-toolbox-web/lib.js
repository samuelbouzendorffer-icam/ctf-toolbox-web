// lib.js : fonctions pures de la boîte à outils (testables sous Node, utilisées par app.js).
// Tout est calculé localement dans le navigateur : rien n'est envoyé sur le réseau.

// ---------- Encodages ----------
export function base64Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function decodeUtf8(bytes) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("Les octets décodés ne forment pas un texte UTF-8 valide.");
  }
}

export function base64Decode(b64) {
  let binary;
  try {
    binary = atob(b64.trim());
  } catch {
    throw new Error("Base64 invalide.");
  }
  return decodeUtf8(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

export function hexEncode(text) {
  return [...new TextEncoder().encode(text)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexDecode(hex) {
  const clean = hex.replace(/[\s:]|0x/g, "");
  if (clean.length % 2 !== 0 || /[^0-9a-fA-F]/.test(clean)) throw new Error("Hexadécimal invalide.");
  const bytes = Uint8Array.from(clean.match(/../g) ?? [], (pair) => parseInt(pair, 16));
  return decodeUtf8(bytes);
}

export function urlEncode(text) {
  return encodeURIComponent(text);
}

export function urlDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    throw new Error("Séquence URL invalide.");
  }
}

// ---------- Empreinte ----------
export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- Chiffres classiques ----------
const isAsciiLetter = (c) => /^[A-Za-z]$/.test(c);

function shiftChar(c, k) {
  if (!isAsciiLetter(c)) return c;
  const base = c === c.toUpperCase() ? 65 : 97;
  return String.fromCharCode(((((c.charCodeAt(0) - base + k) % 26) + 26) % 26) + base);
}

export function caesar(text, shift) {
  return [...text].map((c) => shiftChar(c, shift)).join("");
}

export function vigenere(text, key, decrypt = false) {
  const shifts = [...key].filter(isAsciiLetter).map((k) => k.toLowerCase().charCodeAt(0) - 97);
  if (shifts.length === 0) throw new Error("La clé doit contenir au moins une lettre.");
  let i = 0;
  return [...text]
    .map((c) => {
      if (!isAsciiLetter(c)) return c;
      const s = shifts[i++ % shifts.length];
      return shiftChar(c, decrypt ? -s : s);
    })
    .join("");
}

// ---------- Robustesse d'un mot de passe (estimation simple) ----------
const COMMON = new Set([
  "123456", "123456789", "12345678", "1234567890", "111111", "000000", "123123", "password", "password1",
  "motdepasse", "motdepasse1", "azerty", "azerty123", "azertyuiop", "qwerty", "qwerty123", "abc123",
  "iloveyou", "admin", "welcome", "letmein", "soleil", "doudou", "chocolat", "bonjour", "superman",
]);
const KEYBOARD = ["azerty", "qwerty", "qsdfgh", "wxcvbn", "123456", "654321"];
const LEVELS = [[28, "très faible"], [36, "faible"], [60, "moyen"], [80, "fort"]];

export function hasRun(text, n = 4) {
  const t = text.toLowerCase();
  let up = 1;
  let down = 1;
  for (let i = 1; i < t.length; i++) {
    const diff = t.charCodeAt(i) - t.charCodeAt(i - 1);
    up = diff === 1 ? up + 1 : 1;
    down = diff === -1 ? down + 1 : 1;
    if (up >= n || down >= n) return true;
  }
  return false;
}

function charsetSize(pw) {
  let size = 0;
  if (/[a-z]/.test(pw)) size += 26;
  if (/[A-Z]/.test(pw)) size += 26;
  if (/[0-9]/.test(pw)) size += 10;
  if (/[!-\/:-@\[-`{-~]/.test(pw)) size += 32;
  if (/[^\x21-\x7e]/.test(pw)) size += 30; // espaces, accents, autres caractères
  return Math.max(size, 1);
}

export function passwordStrength(pw) {
  if (!pw) return { bits: 0, level: LEVELS[0][1], problems: ["mot de passe vide"] };
  const lower = pw.toLowerCase();
  const common = COMMON.has(lower);
  const pattern = KEYBOARD.some((p) => lower.includes(p)) || hasRun(pw);
  const repeat = /(.)\1{2,}/.test(pw);
  const problems = [];
  if (pw.length < 12) problems.push("trop court (moins de 12 caractères)");
  if (common) problems.push("fait partie des mots de passe les plus courants");
  if (pattern) problems.push("contient une suite prévisible (abcd, 1234, azerty...)");
  if (repeat) problems.push("contient des caractères répétés (aaa)");
  if (/^[A-Za-z]+$/.test(pw) || /^[0-9]+$/.test(pw)) problems.push("un seul type de caractères");

  const effectiveLength = pw.replace(/(.)\1{2,}/g, "$1").length;
  let bits = effectiveLength * Math.log2(charsetSize(pw));
  if (pattern) bits *= 0.6;
  if (common) bits = Math.min(bits, 10);

  let level = "très fort";
  for (const [threshold, label] of LEVELS) {
    if (bits < threshold) {
      level = label;
      break;
    }
  }
  return { bits: Math.round(bits * 10) / 10, level, problems };
}
