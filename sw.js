// Servis calisani: cevrimdisi calissin ve iOS'ta "ana ekrana ekle" mumkun olsun.
// Onbellek oncelikli; veri IndexedDB'de oldugu icin burada yalnizca uygulama
// kabugu (HTML/CSS/JS/font) tutuluyor.

const CACHE = 'havin-v1';

const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './css/tokens.css', './css/base.css', './css/layout.css', './css/components.css', './css/views.css',
  './assets/fonts/fonts.css',
  './js/main.js',
  './js/core/crypto.js', './js/core/store.js', './js/core/repo.js', './js/core/session.js',
  './js/core/router.js', './js/core/dom.js', './js/core/backup.js', './js/core/look.js', './js/views/media.js',
  './js/lib/idb.js', './js/lib/sanitize.js', './js/lib/image.js',
  './js/workers/kdf-worker.js',
  './js/data/affirmations.js', './js/data/improve.js', './js/data/support.js',
  './js/data/workouts.js', './js/data/planner.js', './js/data/stickers.js', './js/data/foods.js',
  './js/ai/client.js', './js/ai/features.js',
  './js/views/lock.js', './js/views/diary.js', './js/views/profile.js',
  './js/views/affirmations.js', './js/views/board.js', './js/views/planner.js',
  './js/views/body.js', './js/views/settings.js',
  './js/widgets/sidebar.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // Tek bir dosya hata verirse kurulum comeyecek sekilde tek tek ekliyoruz.
    await Promise.all(SHELL.map((u) => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;      // API ve YouTube'a karisma

  e.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) {
      // arka planda tazele
      fetch(req).then((r) => {
        if (r && r.ok) caches.open(CACHE).then((c) => c.put(req, r.clone()));
      }).catch(() => {});
      return cached;
    }
    try {
      const res = await fetch(req);
      if (res && res.ok) {
        const c = await caches.open(CACHE);
        c.put(req, res.clone());
      }
      return res;
    } catch {
      const shell = await caches.match('./index.html');
      if (shell && req.mode === 'navigate') return shell;
      return new Response('Çevrimdışısın ve bu dosya önbellekte yok.', { status: 503 });
    }
  })());
});
