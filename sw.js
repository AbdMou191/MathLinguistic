// sw.js - Service Worker مخصص لمشروع MathLinguistic

const CACHE_NAME = 'mathlinguistic-v2';
const CORE_FILES = [
  '/index.html',
  '/manifest.json',
  '/sw.js',
  '/styles/main.css',
  '/font-awesome/css/all.min.css',
  '/scripts/main.js',
  '/scripts/achievements.js',
  '/scripts/levels/beginner.js',
  '/scripts/levels/intermediate.js',
  '/scripts/levels/advanced.js',
  '/scripts/levels/complex.js',
  '/scripts/levels/speed-test.js',
  '/scripts/levels/mental-math.js',
  '/scripts/levels/mixed-ops.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .catch(err => console.error('Cache failed:', err))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});