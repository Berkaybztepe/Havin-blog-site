// Sifreli depo. Gorunumler buraya degil, repo.js'e konusur.
//
// Neden dort ayri depo:
//   meta   : tek kayit, DUZ METIN basliktir (tuz, tur sayisi, sarilmis DEK).
//   index  : tek sifreli kayit; liste ekranlari icin hafif ustveri.
//   docs   : her yazi/ogun/gun ayri sifreli kayit -> kaydetme maliyeti sabit kalir.
//   blobs  : her fotograf ayri sifreli IKILI kayit (data URL degil).
//
// Her seyi tek bir dev JSON'da tutsaydik, 100 fotograftan sonra her kaydetme
// islemi saniyelerce arayuzu dondururdu.

import { idbGet, idbPut, idbDelete, idbKeys, idbClearAll, storageEstimate } from '../lib/idb.js';
import { seal, unseal, sealJSON, unsealJSON } from './crypto.js';

export const SCHEMA_VERSION = 1;
const META_KEY = 'vault';

// --- meta (duz metin baslik) ----------------------------------------------
export async function readMeta() { return idbGet('meta', META_KEY); }
export async function writeMeta(meta) { return idbPut('meta', META_KEY, meta); }
export async function vaultExists() { return !!(await readMeta()); }

// --- sifreli JSON kayitlari ------------------------------------------------
// aad, sifreli metni kendi deposuna ve anahtarina baglar: bir kaydin icerigi
// baska bir kaydin yerine kopyalanamaz.
const aadFor = (store, key) => `havin|v${SCHEMA_VERSION}|${store}|${key}`;

export async function putDoc(dek, key, value) {
  const { iv, ct } = await sealJSON(dek, value, aadFor('docs', key));
  await idbPut('docs', key, { iv, ct });
}

export async function getDoc(dek, key) {
  const rec = await idbGet('docs', key);
  if (!rec) return null;
  return unsealJSON(dek, rec.iv, rec.ct, aadFor('docs', key));
}

export async function deleteDoc(key) { return idbDelete('docs', key); }
export async function docKeys() { return idbKeys('docs'); }

export async function putIndex(dek, value) {
  const { iv, ct } = await sealJSON(dek, value, aadFor('index', 'main'));
  await idbPut('index', 'main', { iv, ct });
}

export async function getIndex(dek) {
  const rec = await idbGet('index', 'main');
  if (!rec) return null;
  return unsealJSON(dek, rec.iv, rec.ct, aadFor('index', 'main'));
}

// --- ikili kayitlar (fotograflar) -----------------------------------------
export async function putBlob(dek, id, bytes, mime) {
  const { iv, ct } = await seal(dek, bytes, aadFor('blobs', id));
  await idbPut('blobs', id, { iv, ct, mime });
}

export async function getBlob(dek, id) {
  const rec = await idbGet('blobs', id);
  if (!rec) return null;
  const bytes = await unseal(dek, rec.iv, rec.ct, aadFor('blobs', id));
  return new Blob([bytes], { type: rec.mime || 'image/jpeg' });
}

export async function deleteBlob(id) { return idbDelete('blobs', id); }
export async function blobKeys() { return idbKeys('blobs'); }

export async function wipeEverything() { return idbClearAll(); }
export { storageEstimate };
