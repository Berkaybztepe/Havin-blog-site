// Kenar sutunu widget'lari — eski Blogger/kellycornerblog hissi.

import { el, clear, todayISO, formatDateTR, monthNameTR, TR_DAY_SHORT, mondayIndex } from '../core/dom.js';
import * as repo from '../core/repo.js';
import { dailyAffirmation, dailyRitual, MOODS } from '../data/affirmations.js';
import { parseYouTube, youtubeFrame } from '../views/media.js';

const widgetBox = (title, ...body) =>
  el('section', { class: 'card widget' },
    el('h3', { class: 'widget__head' }, title),
    el('div', { class: 'widget__body' }, ...body));

// --- saat & tarih ---
function wSaat() {
  const time = el('div', { style: { fontFamily: 'var(--font-head)', fontSize: '2.6rem', lineHeight: '1', textAlign: 'center' } });
  const date = el('div', { class: 'muted', style: { textAlign: 'center', marginTop: '4px' } });
  const tick = () => {
    const d = new Date();
    time.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    date.textContent = formatDateTR(todayISO());
  };
  tick();
  const iv = setInterval(tick, 20000);
  const box = widgetBox('şu an', time, date);
  box._stop = () => clearInterval(iv);
  return box;
}

// --- gunun olumlamasi ---
async function wOlumlama() {
  const mood = localStorage.getItem('havin.mood') || '';
  const a = dailyAffirmation(todayISO(), mood);
  return widgetBox('bugünün cümlesi',
    el('p', { style: { fontFamily: 'var(--font-head)', fontSize: '1.35rem', lineHeight: '1.35', margin: '0 0 8px' } }, a.t),
    el('a', { class: 'btn btn--sm btn--ghost', href: '#/olumlama' }, 'devamı →'));
}

// --- kucuk takvim ---
async function wTakvim() {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const offset = mondayIndex(first.getDay());
  const ix = repo.indexNow();
  const written = new Set(ix.posts.map((p) => p.date));

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(el('div', {}));
  for (let d = 1; d <= days; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = iso === todayISO();
    cells.push(el('div', {
      style: {
        textAlign: 'center', padding: '3px 0', fontSize: '.8rem', borderRadius: '6px',
        fontWeight: isToday ? '700' : '400',
        background: isToday ? 'var(--accent)' : 'transparent',
        color: isToday ? 'var(--accent-ink)' : 'inherit',
        outline: written.has(iso) && !isToday ? '1px solid var(--accent)' : 'none',
      },
      title: written.has(iso) ? 'bu gün yazmışsın' : '',
    }, String(d)));
  }

  return widgetBox(`${monthNameTR(month)} ${year}`,
    el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' } },
      TR_DAY_SHORT.map((d) => el('div', { class: 'muted', style: { textAlign: 'center', fontSize: '.68rem', fontWeight: '700' } }, d)),
      cells));
}

// --- ruh hali ---
function wRuhHali() {
  const current = localStorage.getItem('havin.mood') || '';
  const row = el('div', { class: 'mood-row' },
    MOODS.map((m) => el('button', {
      class: 'chip-btn' + (m.id === current ? ' is-on' : ''),
      type: 'button', title: m.label,
      onClick: (e) => {
        localStorage.setItem('havin.mood', m.id);
        for (const b of row.children) b.classList.remove('is-on');
        e.currentTarget.classList.add('is-on');
        // gunun cumlesini ruh haline gore tazele
        renderSidebar(document.getElementById('sidebar'));
      },
    }, m.emoji)));
  return widgetBox('bugün nasılsın', row);
}

// --- su an izliyorum ---
async function wIzliyorum(profile) {
  if (!profile.currentlyWatching) return null;
  return widgetBox('şu an izliyorum',
    el('p', { style: { margin: 0 } }, profile.currentlyWatching));
}

// --- playlist ---
async function wPlaylist(profile) {
  const ref = parseYouTube(profile.playlistUrl);
  if (!ref) return null;
  return widgetBox('çalma listem', youtubeFrame(ref));
}

// --- sayac ---
async function wSayac(profile) {
  if (!profile.counterDate) return null;
  const then = new Date(profile.counterDate);
  const days = Math.floor((Date.now() - then.getTime()) / 86400000);
  return widgetBox(profile.counterLabel || 'sayaç',
    el('div', { style: { textAlign: 'center' } },
      el('div', { style: { fontFamily: 'var(--font-head)', fontSize: '2.8rem', lineHeight: '1' } }, String(Math.abs(days))),
      el('div', { class: 'muted' }, days >= 0 ? 'gün geçti' : 'gün kaldı')));
}

// --- kucuk toren ---
function wToren() {
  return widgetBox('bugün için küçük bir tören',
    el('p', { style: { margin: 0, fontSize: '.95rem' } }, dailyRitual(todayISO())));
}

const REGISTRY = {
  saat: wSaat, olumlama: wOlumlama, takvim: wTakvim, ruhhali: wRuhHali,
  izliyorum: wIzliyorum, playlist: wPlaylist, sayac: wSayac, toren: wToren,
};

export const WIDGET_LABELS = {
  saat: 'saat & tarih', olumlama: 'bugünün cümlesi', takvim: 'mini takvim',
  ruhhali: 'ruh hâli', izliyorum: 'şu an izliyorum', playlist: 'çalma listem',
  sayac: 'sayaç', toren: 'günün töreni',
};

let stoppers = [];

export async function renderSidebar(host) {
  if (!host) return;
  stoppers.forEach((fn) => { try { fn(); } catch {} });
  stoppers = [];

  const [settings, profile] = await Promise.all([repo.getSettings(), repo.getProfile()]);
  await repo.loadIndex();
  clear(host);

  for (const id of settings.widgets || []) {
    const fn = REGISTRY[id];
    if (!fn) continue;
    try {
      const node = await fn(profile, settings);
      if (node) {
        host.append(node);
        if (node._stop) stoppers.push(node._stop);
      }
    } catch (e) {
      console.warn('widget hatasi:', id, e);
    }
  }
}
