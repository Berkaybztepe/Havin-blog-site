// IndexedDB uzerine ince bir soz (promise) sarmalayicisi.
const DB_NAME = 'havin-blog';
const DB_VERSION = 1;
export const STORES = ['meta', 'index', 'docs', 'blobs'];

let _db = null;

export function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    let req;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      reject(new Error('Tarayici deposu acilamadi: ' + e.message));
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const s of STORES) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
    };
    req.onsuccess = () => {
      _db = req.result;
      _db.onversionchange = () => { _db.close(); _db = null; };
      resolve(_db);
    };
    req.onerror = () => reject(req.error || new Error('Tarayici deposu acilamadi'));
    req.onblocked = () => reject(new Error('Baska bir sekme siteyi kilitliyor. Diger sekmeleri kapat.'));
  });
}

function tx(db, store, mode) {
  return db.transaction(store, mode).objectStore(store);
}

function wrap(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGet(store, key) {
  const db = await openDB();
  return wrap(tx(db, store, 'readonly').get(key));
}

export async function idbPut(store, key, value) {
  const db = await openDB();
  try {
    return await wrap(tx(db, store, 'readwrite').put(value, key));
  } catch (e) {
    if (e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      throw new QuotaError();
    }
    throw e;
  }
}

export async function idbDelete(store, key) {
  const db = await openDB();
  return wrap(tx(db, store, 'readwrite').delete(key));
}

export async function idbKeys(store) {
  const db = await openDB();
  return wrap(tx(db, store, 'readonly').getAllKeys());
}

export async function idbGetAll(store) {
  const db = await openDB();
  return wrap(tx(db, store, 'readonly').getAll());
}

export async function idbClear(store) {
  const db = await openDB();
  return wrap(tx(db, store, 'readwrite').clear());
}

export async function idbClearAll() {
  for (const s of STORES) await idbClear(s);
}

export class QuotaError extends Error {
  constructor() {
    super('Cihazinda yer kalmadi. Ayarlar > Yedekleme bolumunden yedek alip eski fotograflari silebilirsin.');
    this.name = 'QuotaError';
  }
}

/** Depolama kullanimi. Tarayici desteklemiyorsa null doner. */
export async function storageEstimate() {
  if (!navigator.storage || !navigator.storage.estimate) return null;
  try {
    const { usage, quota } = await navigator.storage.estimate();
    return { usage: usage || 0, quota: quota || 0 };
  } catch { return null; }
}

/**
 * Veriyi kalici isaretle. iOS Safari, ana ekrana eklenmemis sitelerin deposunu
 * 7 gun kullanilmazsa silebiliyor; bu cagri o riski azaltir (garanti etmez).
 */
export async function requestPersistence() {
  if (!navigator.storage || !navigator.storage.persist) return null;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch { return null; }
}
