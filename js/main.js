// Uygulama girisi: servis calisanini kaydet, kilidi goster, acilinca kabugu kur.

import { el, $, clear, toast } from './core/dom.js';
import * as session from './core/session.js';
import * as repo from './core/repo.js';
import { defineRoute, setHost, setNavigateHook, startRouter, navigate, unmountCurrent } from './core/router.js';
import { mountLock } from './views/lock.js';
import { renderSidebar } from './widgets/sidebar.js';
import { applyLook, readStoredLook, lookFromSettings } from './core/look.js';

import diary from './views/diary.js';
import profile from './views/profile.js';
import affirmations from './views/affirmations.js';
import board from './views/board.js';
import planner from './views/planner.js';
import body from './views/body.js';
import settings from './views/settings.js';

// --- gezinme ---------------------------------------------------------------
const NAV = [
  { id: 'gunluk',   label: 'günlük' },
  { id: 'profil',   label: 'profilim' },
  { id: 'olumlama', label: 'olumlama' },
  { id: 'pano',     label: 'pano' },
  { id: 'plan',     label: 'planlayıcı' },
  { id: 'beden',    label: 'beden & mutfak' },
  { id: 'ayarlar',  label: 'ayarlar' },
];

function buildNav() {
  const host = clear($('#nav-links'));
  for (const item of NAV) {
    host.append(el('a', {
      class: 'nav__link', href: `#/${item.id}`, dataset: { route: item.id },
    }, item.label));
  }
}

function markActive(name) {
  for (const a of document.querySelectorAll('.nav__link')) {
    a.classList.toggle('is-active', a.dataset.route === name);
  }
}

// --- kabuk -----------------------------------------------------------------
async function enterApp() {
  const s = await repo.getSettings();
  applyLook(lookFromSettings(s));
  session.setAutoLockMinutes(s.autoLockMinutes);

  $('#blog-title').textContent = s.blogTitle || 'içimden';
  $('#blog-tagline').textContent = s.blogTagline || '';
  document.title = (s.blogTitle || 'içimden');

  $('#lock-screen').classList.add('hidden');
  $('#app').classList.remove('hidden');

  buildNav();
  setHost($('#view'));
  setNavigateHook((name) => { markActive(name); });

  await renderSidebar($('#sidebar'));

  if (!location.hash) navigate('gunluk', true);
  startRouter();
}

async function showLock() {
  await unmountCurrent();
  $('#app').classList.add('hidden');
  const screen = $('#lock-screen');
  screen.classList.remove('hidden');
  mountLock($('#lock-card'), { onUnlocked: enterApp });
}

// --- baslangic -------------------------------------------------------------
async function boot() {
  applyLook(readStoredLook());

  // Servis calisani: cevrimdisi calismak ve "ana ekrana ekle" icin.
  // APK icinde gerekmiyor — varliklar zaten uygulamanin icinde — ve WebView'in
  // servis calisani katmani bizim varlik yakalayicimizdan gecmedigi icin zarar verir.
  const inApp = !!(window.AndroidBridge && window.AndroidBridge.isAndroidApp);
  if (!inApp && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  if (!window.isSecureContext) {
    $('#lock-card').replaceChildren(el('div', { class: 'note note--danger' },
      el('p', {}, el('strong', {}, 'Bu sayfa güvenli bağlantıda açılmamış.')),
      el('p', {}, 'Şifreleme çalışmıyor. Siteyi GitHub Pages adresinden ya da uygulama olarak aç; ' +
        'dosyaya çift tıklayarak açmak bu yüzden desteklenmiyor.')));
    return;
  }

  session.watchActivity();
  session.onLockChange((locked) => { if (locked) { showLock(); toast('Günlük kilitlendi.'); } });

  $('#lock-now').addEventListener('click', () => session.lock());

  await showLock();
}

// Sekme kapanirken bellegi temizle
window.addEventListener('pagehide', () => { try { session.lock(); } catch {} });

boot().catch((e) => {
  console.error(e);
  const card = $('#lock-card');
  if (card) card.replaceChildren(el('div', { class: 'note note--danger' },
    'Uygulama açılamadı: ' + (e && e.message || e)));
});

// Gorunumleri kaydet
defineRoute('gunluk', diary);
defineRoute('profil', profile);
defineRoute('olumlama', affirmations);
defineRoute('pano', board);
defineRoute('plan', planner);
defineRoute('beden', body);
defineRoute('ayarlar', settings);
