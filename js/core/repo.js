// Gorunumlerin konustugu TEK veri arayuzu.
// Kural: views/ altindaki hicbir dosya store.js veya crypto.js'i dogrudan cagirmaz.

import * as store from './store.js';
import { uuid } from './crypto.js';
import { getDEK } from './session.js';

const todayISO = () => new Date().toISOString().slice(0, 10);

// --- dizin -----------------------------------------------------------------
// Liste ekranlari tek bir kucuk kaydi cozerek cizilir; 300 yaziyi acmaya gerek yok.
const EMPTY_INDEX = { posts: [], meals: [], workouts: [], feelings: [], plannerDays: [], pins: [] };

let _index = null;

export async function loadIndex(force = false) {
  if (_index && !force) return _index;
  _index = (await store.getIndex(getDEK())) || { ...EMPTY_INDEX };
  for (const k of Object.keys(EMPTY_INDEX)) if (!_index[k]) _index[k] = [];
  return _index;
}

export function indexNow() { return _index || { ...EMPTY_INDEX }; }

async function saveIndex() { await store.putIndex(getDEK(), _index); }

export function resetCache() { _index = null; }

// --- ayarlar & profil ------------------------------------------------------
export const DEFAULT_SETTINGS = {
  theme: 'sade',
  fontBody: 'Inter',
  fontHeading: 'Newsreader',
  fontScale: 1,
  textColor: '',
  accent: '',
  blogTitle: "havin's corner",
  blogTagline: 'I can write anything here. The happy days and the heavy ones.',
  gentleMode: false,
  autoLockMinutes: 15,
  widgets: ['saat', 'affirmations', 'takvim', 'ruhhali', 'izliyorum', 'playlist', 'sayac'],
  apiKey: '',
  aiEnabled: true,
  lastBackup: null,
  notifyDaily: false,
};

export async function getSettings() {
  const s = await store.getDoc(getDEK(), 'settings');
  return { ...DEFAULT_SETTINGS, ...(s || {}) };
}

export async function saveSettings(patch) {
  const next = { ...(await getSettings()), ...patch };
  await store.putDoc(getDEK(), 'settings', next);
  return next;
}

export const DEFAULT_PROFILE = {
  name: '', photoId: null, now: '', about: '', discovering: '', values: '',
  growth: [],       // {id, title, note}
  currentlyWatching: '', playlistUrl: '', counterLabel: '', counterDate: '',
};

export async function getProfile() {
  const p = await store.getDoc(getDEK(), 'profile');
  return { ...DEFAULT_PROFILE, ...(p || {}) };
}

export async function saveProfile(patch) {
  const next = { ...(await getProfile()), ...patch };
  await store.putDoc(getDEK(), 'profile', next);
  return next;
}

// --- genel amacli belgeler -------------------------------------------------
export async function getDocOr(key, fallback) {
  const d = await store.getDoc(getDEK(), key);
  return d == null ? fallback : d;
}

export async function setDoc(key, value) { return store.putDoc(getDEK(), key, value); }

// --- gunluk yazilari -------------------------------------------------------
export async function listPosts() {
  const ix = await loadIndex();
  return [...ix.posts].sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.created || 0) - (a.created || 0));
}

export async function getPost(id) { return store.getDoc(getDEK(), `post:${id}`); }

function excerptOf(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return (div.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160);
}

export async function savePost(post) {
  const ix = await loadIndex();
  const id = post.id || uuid();
  const full = { ...post, id, created: post.created || Date.now(), updated: Date.now() };
  await store.putDoc(getDEK(), `post:${id}`, full);
  const meta = {
    id, date: full.date || todayISO(), title: full.title || '(untitled)',
    excerpt: excerptOf(full.html), category: full.category || 'personal',
    mood: full.mood || '', tags: full.tags || [], coverBlobId: (full.blobIds || [])[0] || null,
    // Yaziya ilistirilen sarki liste ekraninda da gorunsun diye dizinde tutuluyor.
    song: full.song || null,
    created: full.created,
  };
  const i = ix.posts.findIndex((p) => p.id === id);
  if (i >= 0) ix.posts[i] = meta; else ix.posts.push(meta);
  await saveIndex();
  return full;
}

export async function deletePost(id) {
  const ix = await loadIndex();
  const full = await getPost(id);
  for (const b of (full && full.blobIds) || []) await store.deleteBlob(b);
  ix.posts = ix.posts.filter((p) => p.id !== id);
  await store.deleteDoc(`post:${id}`);
  await saveIndex();
}

// --- fotograflar -----------------------------------------------------------
export async function saveImage(bytes, mime) {
  const id = uuid();
  await store.putBlob(getDEK(), id, bytes, mime);
  return id;
}

export async function loadImage(id) { return store.getBlob(getDEK(), id); }
export async function deleteImage(id) { return store.deleteBlob(id); }

// --- planlayici ------------------------------------------------------------
export async function getDay(dateISO) {
  return (await store.getDoc(getDEK(), `day:${dateISO}`)) || { date: dateISO, tasks: [], note: '' };
}

export async function saveDay(day) {
  const ix = await loadIndex();
  await store.putDoc(getDEK(), `day:${day.date}`, day);
  if (!ix.plannerDays.includes(day.date)) { ix.plannerDays.push(day.date); await saveIndex(); }
  return day;
}

// --- mutfak (ogunler) ------------------------------------------------------
export async function listMeals(dateISO) {
  const ix = await loadIndex();
  const all = dateISO ? ix.meals.filter((m) => m.date === dateISO) : ix.meals;
  return [...all].sort((a, b) => (b.created || 0) - (a.created || 0));
}

export async function getMeal(id) { return store.getDoc(getDEK(), `meal:${id}`); }

export async function saveMeal(meal) {
  const ix = await loadIndex();
  const id = meal.id || uuid();
  const full = { ...meal, id, created: meal.created || Date.now() };
  await store.putDoc(getDEK(), `meal:${id}`, full);
  const meta = {
    id, date: full.date || todayISO(), name: full.name || 'meal', slot: full.slot || '',
    kcal: Number(full.kcal) || 0, protein: Number(full.protein) || 0,
    carbs: Number(full.carbs) || 0, fat: Number(full.fat) || 0,
    blobId: full.blobId || null, feeling: full.feeling || '', created: full.created,
  };
  const i = ix.meals.findIndex((m) => m.id === id);
  if (i >= 0) ix.meals[i] = meta; else ix.meals.push(meta);
  await saveIndex();
  return full;
}

export async function deleteMeal(id) {
  const ix = await loadIndex();
  const m = ix.meals.find((x) => x.id === id);
  if (m && m.blobId) await store.deleteBlob(m.blobId);
  ix.meals = ix.meals.filter((x) => x.id !== id);
  await store.deleteDoc(`meal:${id}`);
  await saveIndex();
}

// --- hareket (antrenman) ---------------------------------------------------
export async function listWorkouts() {
  const ix = await loadIndex();
  return [...ix.workouts].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export async function getWorkout(id) { return store.getDoc(getDEK(), `workout:${id}`); }

export async function saveWorkout(w) {
  const ix = await loadIndex();
  const id = w.id || uuid();
  const full = { ...w, id, created: w.created || Date.now() };
  await store.putDoc(getDEK(), `workout:${id}`, full);
  const meta = {
    id, date: full.date || todayISO(), name: full.name || 'session',
    exercises: (full.exercises || []).length, minutes: Number(full.minutes) || 0, created: full.created,
  };
  const i = ix.workouts.findIndex((x) => x.id === id);
  if (i >= 0) ix.workouts[i] = meta; else ix.workouts.push(meta);
  await saveIndex();
  return full;
}

export async function deleteWorkout(id) {
  const ix = await loadIndex();
  ix.workouts = ix.workouts.filter((x) => x.id !== id);
  await store.deleteDoc(`workout:${id}`);
  await saveIndex();
}

// --- duygu & destek --------------------------------------------------------
export async function listFeelings() {
  const ix = await loadIndex();
  return [...ix.feelings].sort((a, b) => (b.created || 0) - (a.created || 0));
}

export async function getFeeling(id) { return store.getDoc(getDEK(), `feeling:${id}`); }

export async function saveFeeling(f) {
  const ix = await loadIndex();
  const id = f.id || uuid();
  const full = { ...f, id, created: f.created || Date.now() };
  await store.putDoc(getDEK(), `feeling:${id}`, full);
  const meta = {
    id, date: full.date || todayISO(), kind: full.kind || 'his',
    excerpt: (full.text || '').slice(0, 120), created: full.created,
  };
  const i = ix.feelings.findIndex((x) => x.id === id);
  if (i >= 0) ix.feelings[i] = meta; else ix.feelings.push(meta);
  await saveIndex();
  return full;
}

export async function deleteFeeling(id) {
  const ix = await loadIndex();
  ix.feelings = ix.feelings.filter((x) => x.id !== id);
  await store.deleteDoc(`feeling:${id}`);
  await saveIndex();
}

// --- pinlenen oneriler -----------------------------------------------------
export async function listPins() { return (await loadIndex()).pins; }

export async function savePin(pin) {
  const ix = await loadIndex();
  const id = pin.id || uuid();
  const rec = { status: 'yapacagim', note: '', created: Date.now(), ...pin, id };
  const i = ix.pins.findIndex((p) => p.id === id);
  if (i >= 0) ix.pins[i] = rec; else ix.pins.unshift(rec);
  await saveIndex();
  return rec;
}

export async function deletePin(id) {
  const ix = await loadIndex();
  ix.pins = ix.pins.filter((p) => p.id !== id);
  await saveIndex();
}

export { store };
