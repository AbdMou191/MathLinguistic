// sw.js
const CACHE_NAME = 'mathlinguistic-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/levels.css',
  '/scripts/main.js',
  '/scripts/navigation.js',
  '/scripts/levels/beginner.js',
  '/scripts/levels/intermediate.js',
  '/scripts/levels/advanced.js',
  '/scripts/levels/complex.js',
  '/data/beginner.json',
  '/data/intermediate.json',
  '/data/advanced.json',
  '/data/complex.json',
  '/icons/icon-48.png',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-144.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/screenshots/home.png',
  '/screenshots/level.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});