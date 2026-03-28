/* Dungeon Mania — cache básico para uso offline após 1ª visita */
const CACHE = 'dm-mania-v1';
const ASSETS = [
  './',
  './index.html',
  './js/db.js',
  './manifest.webmanifest',
  './cenario-epico-floresta.png',
  './heroi-azul-parado.png',
  './primeiro-inimigo.png',
  './plataforma-azul.png',
  './plataforma-vermelha.png',
  './segundo-mundo.png',
  './terceiro-mundo.png',
  './arqueiro.png',
  './cavaleiro.png',
  './tank.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(ASSETS.map((url) => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => cached);
    })
  );
});
