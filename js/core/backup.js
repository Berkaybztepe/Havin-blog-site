// Sifreli yedek: disari aktar / geri yukle.
// Veri yalnizca bu cihazda durdugu icin yedek, baska bir cihaza tasimanin ve
// veri kaybina karsi tek gercek korumanin yoludur.

import { idbGet, idbGetAll, idbKeys, idbPut, idbClearAll } from '../lib/idb.js';
import { toB64, fromB64 } from './crypto.js';
import { STORES } from '../lib/idb.js';

const FILE_VERSION = 1;

const encRec = (r) => {
  if (!r) return r;
  const out = { ...r };
  if (r.iv) out.iv = toB64(r.iv instanceof Uint8Array ? r.iv : new Uint8Array(r.iv));
  if (r.ct) out.ct = toB64(r.ct instanceof Uint8Array ? r.ct : new Uint8Array(r.ct));
  if (r.salt) out.salt = toB64(r.salt instanceof Uint8Array ? r.salt : new Uint8Array(r.salt));
  if (r.kdf) out.kdf = { ...r.kdf, salt: toB64(new Uint8Array(r.kdf.salt)) };
  if (r.dekWrap) out.dekWrap = { iv: toB64(new Uint8Array(r.dekWrap.iv)), ct: toB64(new Uint8Array(r.dekWrap.ct)) };
  if (r.recovery) out.recovery = {
    iterations: r.recovery.iterations,
    salt: toB64(new Uint8Array(r.recovery.salt)),
    iv: toB64(new Uint8Array(r.recovery.iv)),
    ct: toB64(new Uint8Array(r.recovery.ct)),
  };
  return out;
};

const decRec = (r) => {
  if (!r) return r;
  const out = { ...r };
  if (typeof r.iv === 'string') out.iv = fromB64(r.iv);
  if (typeof r.ct === 'string') out.ct = fromB64(r.ct);
  if (r.kdf) out.kdf = { ...r.kdf, salt: fromB64(r.kdf.salt) };
  if (r.dekWrap) out.dekWrap = { iv: fromB64(r.dekWrap.iv), ct: fromB64(r.dekWrap.ct) };
  if (r.recovery) out.recovery = {
    iterations: r.recovery.iterations,
    salt: fromB64(r.recovery.salt),
    iv: fromB64(r.recovery.iv),
    ct: fromB64(r.recovery.ct),
  };
  return out;
};

/** Tum kasayi (sifreli haliyle) tek bir JSON nesnesine cikarir. */
export async function exportVault() {
  const dump = { magic: 'havin-blog-backup', fileVersion: FILE_VERSION, exportedAt: new Date().toISOString(), stores: {} };
  for (const s of STORES) {
    const keys = await idbKeys(s);
    const vals = await idbGetAll(s);
    dump.stores[s] = keys.map((k, i) => ({ k, v: encRec(vals[i]) }));
  }
  return dump;
}

export async function exportToFile() {
  const dump = await exportVault();
  const text = JSON.stringify(dump);
  const blob = new Blob([text], { type: 'application/json' });
  const stamp = new Date().toISOString().slice(0, 10);
  const name = `gunlugum-yedek-${stamp}.havin.json`;

  // APK icinde: WebView blob: indirmelerini desteklemiyor, bu yuzden dosyayi
  // Android tarafina verip oraya kaydettiriyoruz (kullanici konumu seciyor).
  if (window.AndroidBridge && typeof window.AndroidBridge.saveFile === 'function') {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    window.AndroidBridge.saveFile(name, toB64(bytes));
    return { name, bytes: blob.size, via: 'android' };
  }

  // Not: showSaveFilePicker (konum secme penceresi) bilerek kullanilmiyor.
  // Android Chrome ve WebView'de yok, bazi ortamlarda ise hic sonuclanmadan
  // asili kaliyor ve yedek sessizce alinmamis oluyor. Indirme baglantisi
  // her yerde calisiyor; iOS/Android'de dosya Indirilenler'e dusuyor.
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return { name, bytes: blob.size };
}

/**
 * Yedegi geri yukler. Mevcut her seyin UZERINE yazar; cagirmadan once
 * kullaniciya sormak cagiranin isi.
 */
export async function importFromFile(file) {
  let dump;
  try {
    dump = JSON.parse(await file.text());
  } catch {
    throw new Error('Bu dosya okunamadı. Yedek dosyası bozulmuş olabilir.');
  }
  if (!dump || dump.magic !== 'havin-blog-backup') {
    throw new Error('Bu bir günlük yedeği değil.');
  }
  if (dump.fileVersion > FILE_VERSION) {
    throw new Error('Bu yedek, uygulamanın daha yeni bir sürümünden. Önce uygulamayı güncelle.');
  }
  await idbClearAll();
  for (const [store, rows] of Object.entries(dump.stores || {})) {
    if (!STORES.includes(store)) continue;
    for (const { k, v } of rows) await idbPut(store, k, decRec(v));
  }
  return { stores: Object.keys(dump.stores || {}).length, exportedAt: dump.exportedAt };
}

export async function vaultSummary() {
  const meta = await idbGet('meta', 'vault');
  const docs = (await idbKeys('docs')).length;
  const blobs = (await idbKeys('blobs')).length;
  return { hasVault: !!meta, docs, blobs, createdAt: meta && meta.createdAt };
}
