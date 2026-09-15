// Oturum: kasayi ac/kilitle, DEK'i yalnizca bellekte tut, bosta kalinca kilitle.
//
// "Sifreli" olmasinin pratikte bir anlami olmasi icin otomatik kilit sart:
// en olasi gizlilik ihlali, cihazi acikken birinin eline almasidir.

import {
  deriveKEK, createDEKBytes, importDEK, wrapDEK, unwrapDEK, randomBytes,
  generateRecoveryCode, normalizeRecoveryCode, KDF_ITERATIONS,
} from './crypto.js';
import * as store from './store.js';
import { requestPersistence } from '../lib/idb.js';
import { resetCache } from './repo.js';

const AAD_DEK = 'havin|dek|password';
const AAD_REC = 'havin|dek|recovery';

let _dek = null;                 // CryptoKey — yalnizca bellekte
let _lockTimer = null;
let _autoLockMs = 15 * 60 * 1000;
const listeners = new Set();

export function onLockChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
const emit = (locked) => listeners.forEach((fn) => { try { fn(locked); } catch {} });

export function isUnlocked() { return !!_dek; }

export function getDEK() {
  if (!_dek) throw new Error('Kasa kilitli.');
  return _dek;
}

export async function vaultExists() { return store.vaultExists(); }

export async function getUsername() {
  const m = await store.readMeta();
  return m ? m.username : null;
}

// --- kurulum ---------------------------------------------------------------
export async function createVault(username, password, hint) {
  if (await store.vaultExists()) throw new Error('Bu cihazda zaten bir günlük var.');

  const salt = randomBytes(16);
  const kek = await deriveKEK(password, salt, KDF_ITERATIONS);
  const dekBytes = createDEKBytes();
  const wrapped = await wrapDEK(kek, dekBytes, AAD_DEK);

  // Kurtarma kodu: ayni DEK'in ikinci bir sarmalamasi.
  const recoveryCode = generateRecoveryCode();
  const recSalt = randomBytes(16);
  const recKek = await deriveKEK(normalizeRecoveryCode(recoveryCode), recSalt, KDF_ITERATIONS);
  const recWrapped = await wrapDEK(recKek, dekBytes, AAD_REC);

  await store.writeMeta({
    schemaVersion: store.SCHEMA_VERSION,
    username: username || '',
    hint: hint || '',
    kdf: { name: 'PBKDF2-SHA256', iterations: KDF_ITERATIONS, salt },
    dekWrap: { iv: wrapped.iv, ct: wrapped.ct },
    recovery: { iterations: KDF_ITERATIONS, salt: recSalt, iv: recWrapped.iv, ct: recWrapped.ct },
    createdAt: Date.now(),
  });

  _dek = await importDEK(dekBytes);
  dekBytes.fill(0);
  await store.putIndex(_dek, { posts: [], meals: [], workouts: [], feelings: [], plannerDays: [], pins: [] });
  requestPersistence();
  armAutoLock();
  emit(false);
  return { recoveryCode };
}

// --- acma ------------------------------------------------------------------
export async function unlock(password) {
  const meta = await store.readMeta();
  if (!meta) throw new Error('Bu cihazda günlük bulunamadı.');
  const kek = await deriveKEK(password, meta.kdf.salt, meta.kdf.iterations);
  let dekBytes;
  try {
    dekBytes = await unwrapDEK(kek, meta.dekWrap.iv, meta.dekWrap.ct, AAD_DEK);
  } catch {
    throw new Error('Şifre yanlış.');   // AES-GCM dogrulama hatasi = yanlis sifre
  }
  _dek = await importDEK(dekBytes);
  dekBytes.fill(0);
  resetCache();
  requestPersistence();
  armAutoLock();
  emit(false);
}

export async function unlockWithRecovery(code) {
  const meta = await store.readMeta();
  if (!meta || !meta.recovery) throw new Error('Bu günlükte kurtarma kodu yok.');
  const r = meta.recovery;
  const kek = await deriveKEK(normalizeRecoveryCode(code), r.salt, r.iterations);
  let dekBytes;
  try {
    dekBytes = await unwrapDEK(kek, r.iv, r.ct, AAD_REC);
  } catch {
    throw new Error('Kurtarma kodu yanlış.');
  }
  _dek = await importDEK(dekBytes);
  dekBytes.fill(0);
  resetCache();
  armAutoLock();
  emit(false);
}

/** Sifreyi degistirir. DEK ayni kalir; yalnizca sarmalama yenilenir. */
export async function changePassword(oldPassword, newPassword, hint) {
  const meta = await store.readMeta();
  const oldKek = await deriveKEK(oldPassword, meta.kdf.salt, meta.kdf.iterations);
  let dekBytes;
  try {
    dekBytes = await unwrapDEK(oldKek, meta.dekWrap.iv, meta.dekWrap.ct, AAD_DEK);
  } catch {
    throw new Error('Mevcut şifre yanlış.');
  }
  const salt = randomBytes(16);
  const kek = await deriveKEK(newPassword, salt, KDF_ITERATIONS);
  const wrapped = await wrapDEK(kek, dekBytes, AAD_DEK);
  dekBytes.fill(0);
  meta.kdf = { name: 'PBKDF2-SHA256', iterations: KDF_ITERATIONS, salt };
  meta.dekWrap = { iv: wrapped.iv, ct: wrapped.ct };
  if (hint !== undefined) meta.hint = hint;
  await store.writeMeta(meta);
}

export async function getHint() {
  const m = await store.readMeta();
  return m ? m.hint : '';
}

// --- kilitleme -------------------------------------------------------------
export function lock() {
  _dek = null;               // CryptoKey referansini birak
  resetCache();
  clearTimeout(_lockTimer);
  emit(true);
}

export function setAutoLockMinutes(min) {
  _autoLockMs = Math.max(1, Number(min) || 15) * 60 * 1000;
  armAutoLock();
}

export function armAutoLock() {
  clearTimeout(_lockTimer);
  if (!_dek) return;
  _lockTimer = setTimeout(() => lock(), _autoLockMs);
}

/** Etkinlik dinleyicileri: dokunma/tus geldikce sayaci sifirla. */
export function watchActivity() {
  const bump = () => { if (_dek) armAutoLock(); };
  for (const ev of ['pointerdown', 'keydown', 'focus']) {
    window.addEventListener(ev, bump, { passive: true, capture: true });
  }
  // Sekme arkaya alininca sayaci kisalt: cihaz elden ele gecerse cabuk kilitlensin.
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); }
    else if (hiddenAt && _dek && Date.now() - hiddenAt > _autoLockMs) { lock(); }
    else bump();
  });
}

export async function destroyEverything() {
  lock();
  await store.wipeEverything();
}
