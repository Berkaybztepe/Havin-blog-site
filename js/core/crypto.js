// Sifreleme katmani. WebCrypto disinda hicbir sey kullanilmaz.
//
// Tasarim:
//   sifre --PBKDF2--> KEK  --sarar--> DEK (rastgele 256-bit)  --sifreler--> tum veri
// DEK'i sarmalamak sayesinde sifre degistirmek 60 baytlik bir islem; tum kasayi
// yeniden sifrelemek gerekmez. Ayni DEK ikinci kez kurtarma koduyla da sarilir.

const ITERATIONS = 600000;      // OWASP 2023 tabani (PBKDF2-HMAC-SHA256)
const enc = new TextEncoder();
const dec = new TextDecoder();

export const KDF_ITERATIONS = ITERATIONS;

export function randomBytes(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}

// --- anahtar turetme -------------------------------------------------------
// PBKDF2 ana is parcacigini ~0.5 sn kilitler; bu yuzden worker'da calisir.
function deriveBitsInWorker(password, salt, iterations) {
  return new Promise((resolve, reject) => {
    const w = new Worker(new URL('../workers/kdf-worker.js', import.meta.url), { type: 'module' });
    const done = (fn) => (e) => { w.terminate(); fn(e); };
    w.onmessage = done((e) => e.data.ok ? resolve(new Uint8Array(e.data.bits)) : reject(new Error(e.data.error)));
    w.onerror = done((e) => reject(new Error(e.message || 'Anahtar turetilemedi')));
    w.postMessage({ password, salt, iterations });
  });
}

async function deriveBitsInline(password, salt, iterations) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, base, 256);
  return new Uint8Array(bits);
}

/** Sifreden KEK uretir (ana anahtar sarmalayicisi). */
export async function deriveKEK(password, salt, iterations = ITERATIONS) {
  let bits;
  try {
    bits = await deriveBitsInWorker(password, salt, iterations);
  } catch {
    bits = await deriveBitsInline(password, salt, iterations); // worker yoksa geri dusus
  }
  return crypto.subtle.importKey('raw', bits, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

// --- muhurleme -------------------------------------------------------------
// IV yalnizca burada uretilir. AES-GCM'de IV tekrari felakettir; disaridan IV
// kabul eden bir fonksiyon bilerek yoktur.
//
// aad (additionalData) kaydi yerine baglar: bir kaydin sifreli metni baska bir
// kaydin yerine kopyalanamaz.

export async function seal(key, plainBytes, aad) {
  const iv = randomBytes(12);
  const params = { name: 'AES-GCM', iv };
  if (aad) params.additionalData = enc.encode(aad);
  const ct = new Uint8Array(await crypto.subtle.encrypt(params, key, plainBytes));
  return { iv, ct };
}

export async function unseal(key, iv, ct, aad) {
  const params = { name: 'AES-GCM', iv };
  if (aad) params.additionalData = enc.encode(aad);
  const pt = await crypto.subtle.decrypt(params, key, ct);
  return new Uint8Array(pt);
}

export async function sealJSON(key, value, aad) {
  return seal(key, enc.encode(JSON.stringify(value)), aad);
}

export async function unsealJSON(key, iv, ct, aad) {
  return JSON.parse(dec.decode(await unseal(key, iv, ct, aad)));
}

// --- DEK sarmalama ---------------------------------------------------------
export function createDEKBytes() { return randomBytes(32); }

export async function importDEK(rawBytes) {
  return crypto.subtle.importKey('raw', rawBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function wrapDEK(kek, dekBytes, aad) { return seal(kek, dekBytes, aad); }

export async function unwrapDEK(kek, iv, ct, aad) { return unseal(kek, iv, ct, aad); }

// --- kurtarma kodu ---------------------------------------------------------
// Karisik harfler (I/1, O/0) disarida; elle yazarken hata yapmayi zorlastirir.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRecoveryCode() {
  const bytes = randomBytes(20);
  let out = '';
  for (let i = 0; i < 20; i++) {
    if (i > 0 && i % 5 === 0) out += '-';
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out; // ornek: K7QMD-3XPLR-9WTNB-ZF4HS
}

export function normalizeRecoveryCode(s) {
  return (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// --- sifre gucu ------------------------------------------------------------
// Kabaca tahmin entropisi. Amac kesin olcum degil, kullaniciya durust geri bildirim.
export function passwordStrength(pw) {
  if (!pw) return { bits: 0, label: 'bos', level: 0 };
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 30;
  let bits = pw.length * Math.log2(pool || 1);
  // tekrar eden karakterler ve duz dizilimler icin indirim
  const uniq = new Set(pw).size;
  if (uniq < pw.length) bits *= (uniq / pw.length) * 0.5 + 0.5;
  if (/^[0-9]+$/.test(pw)) bits *= 0.5;
  const level = bits < 40 ? 1 : bits < 60 ? 2 : bits < 80 ? 3 : 4;
  const label = ['bos', 'cok zayif', 'zayif', 'iyi', 'guclu'][level];
  return { bits: Math.round(bits), label, level };
}

// --- yardimcilar -----------------------------------------------------------
export const toB64 = (bytes) => {
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  return btoa(s);
};

export const fromB64 = (b64) => {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
};

export const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
  : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }));
