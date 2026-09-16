// Uygulama girisi: servis calisanini kaydet, kilidi goster, acilinca kabugu kur.

import { el, $, clear, toast } from './core/dom.js';
import * as session from './core/session.js';
import * as repo from './core/repo.js';
import { defineRoute, setHost, setNavigateHook, startRouter, navigate, unmountCurrent, render, parseHash } from './core/router.js';
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
  { id: 'diary',   label: 'diary' },
  { id: 'profile',   label: 'my profile' },
  { id: 'affirmations', label: 'affirmations' },
  { id: 'board',     label: 'board' },
  { id: 'planner',     label: 'planner' },
  { id: 'body',    label: 'body & kitchen' },
  { id: 'settings',  label: 'settings' },
];

function buildNav() {
  const host = clear($('#nav-links'));
  for (const item of NAV) {
    host.append(el('a', {
      class: 'nav__link', href: `#/${item.id}`, dataset: { route: item.id },
      onClick: (e) => {
        // Bir bolumun icinde derine inildiyse (ornegin bir yaziyi okurken)
        // adres zaten #/diary oldugu icin tarayici hashchange uretmiyor ve
        // menuye basmak hicbir sey yapmiyordu. Ayni rotaysa elle yeniliyoruz.
        if (parseHash().name === item.id) {
          e.preventDefault();
          render();
        }
      },
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

  $('#blog-title').textContent = s.blogTitle || 'from within';
  $('#blog-tagline').textContent = s.blogTagline || '';
  document.title = (s.blogTitle || 'from within');

  $('#lock-screen').classList.add('hidden');
  $('#app').classList.remove('hidden');

  buildNav();
  setHost($('#view'));
  setNavigateHook((name) => { markActive(name); });

  await renderSidebar($('#sidebar'));

  if (!location.hash) navigate('diary', true);
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
      el('p', {}, el('strong', {}, 'This page was not opened over a secure connection.')),
      el('p', {}, 'Encryption does not work here. Open the site from its GitHub Pages address or as the app; ' +
        'that is why double-clicking the file is not supported.')));
    return;
  }

  // APK icinde: gercek dis baglantilar (YouTube arama kisayollari gibi) sistem
  // tarayicisinda acilsin. Gomulu oynaticiya dokunmuyoruz — o WebView'in icinde
  // kalmali, yoksa yaziya ilistirilen sarki uygulamada hic calmaz.
  if (inApp) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!/^https?:\/\//i.test(href)) return;       // ic baglantilar (#/...) dokunulmaz
      e.preventDefault();
      try { window.AndroidBridge.openExternal(a.href); } catch {}
    });
  }

  session.watchActivity();
  session.onLockChange((locked) => { if (locked) { showLock(); toast('Diary locked.'); } });

  $('#lock-now').addEventListener('click', () => session.lock());

  await showLock();
}

// Sekme kapanirken bellegi temizle
window.addEventListener('pagehide', () => { try { session.lock(); } catch {} });

boot().catch((e) => {
  console.error(e);
  const card = $('#lock-card');
  if (card) card.replaceChildren(el('div', { class: 'note note--danger' },
    'The app could not start: ' + (e && e.message || e)));
});

// Gorunumleri kaydet
defineRoute('diary', diary);
defineRoute('profile', profile);
defineRoute('affirmations', affirmations);
defineRoute('board', board);
defineRoute('planner', planner);
defineRoute('body', body);
defineRoute('settings', settings);
