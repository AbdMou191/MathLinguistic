// sw.js - MathLinguistic Service Worker (v8.0.5-AUTO-UPDATE)

const CACHE_NAME = 'mathlinguistic-v8.0.5';
const CORE_CACHE = 'mathlinguistic-core-v8.0.6';
const DYNAMIC_CACHE = 'mathlinguistic-dynamic-v8.0.6';

const PRECACHE_ASSETS = [
  '/MathLinguistic/',
  '/MathLinguistic/index.html',
  '/MathLinguistic/home-content.html',
  '/MathLinguistic/offline.html',
  '/MathLinguistic/manifest.json',
  '/MathLinguistic/robots.txt',
  '/MathLinguistic/sitemap.xml',

  // الأنماط والخطوط
  '/MathLinguistic/styles/main.css',
  '/MathLinguistic/styles/levels.css',
  '/MathLinguistic/styles/games/common.css',
  '/MathLinguistic/styles/font-awesome/css/all.min.css',
  '/MathLinguistic/styles/font-awesome/webfonts/fa-solid-900.woff2',
  '/MathLinguistic/styles/font-awesome/webfonts/fa-regular-400.woff2',
  '/MathLinguistic/styles/font-awesome/webfonts/fa-brands-400.woff2',

  // السكربتات
  '/MathLinguistic/scripts/main.js',
  '/MathLinguistic/scripts/meta-manager.js',
  '/MathLinguistic/scripts/achievements.js',
  '/MathLinguistic/scripts/search.js',
  '/MathLinguistic/scripts/common/game-state-manager.js',
  '/MathLinguistic/scripts/core/game-core.js',

  // المستويات والدروس
  '/MathLinguistic/scripts/levels/beginner.js',
  '/MathLinguistic/scripts/levels/intermediate.js',
  '/MathLinguistic/scripts/levels/advanced.js',
  '/MathLinguistic/scripts/levels/complex.js',
  '/MathLinguistic/scripts/levels/speed-test.js',
  '/MathLinguistic/scripts/levels/mental-math.js',
  '/MathLinguistic/scripts/levels/mixed-ops.js',
  '/MathLinguistic/scripts/levels/calculator.js',
  '/MathLinguistic/scripts/levels/loudoukou.js',
  '/MathLinguistic/scripts/levels/crossmath.js',
  '/MathLinguistic/scripts/levels/sliding_puzzle.js',
  '/MathLinguistic/scripts/lessons/beginner-lesson.js',
  '/MathLinguistic/scripts/lessons/intermediate-lesson.js',
  '/MathLinguistic/scripts/lessons/advanced-lesson.js',
  '/MathLinguistic/scripts/lessons/complex-lesson.js',

  // البيانات
  '/MathLinguistic/data/levels/beginner.json',
  '/MathLinguistic/data/levels/intermediate.json',
  '/MathLinguistic/data/levels/advanced.json',
  '/MathLinguistic/data/levels/complex.json',
  '/MathLinguistic/data/lessons/beginner.json',
  '/MathLinguistic/data/lessons/intermediate.json',
  '/MathLinguistic/data/lessons/advanced.json',
  '/MathLinguistic/data/lessons/complex.json',
  '/MathLinguistic/data/achievements.json',

  // الصفحات
  '/MathLinguistic/const-page/about.html',
  '/MathLinguistic/const-page/contact.html',
  '/MathLinguistic/const-page/terms.html',
  '/MathLinguistic/const-page/privacy.html',
  '/MathLinguistic/icons/icon-192.webp',
  '/MathLinguistic/icons/icon-512.webp'
];

// 📦 التثبيت الفوري
self.addEventListener('install', (event) => {
  self.skipWaiting(); // ✅ إجبار الـ Service Worker الجديد على التنشيط فوراً بدون انتظار
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map(url => 
          fetch(url)
            .then(res => {
              if (res.ok) return cache.put(url, res);
            })
            .catch(() => {})
        )
      );
    })
  );
});

// 🧹 التنشيط وحذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CORE_CACHE && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // ✅ التكفل بجميع التبويبات المفتوحة فوراً
  );
});

// 🌐 معالجة طلبات الجلب (Fetch)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (!url.href.includes('/MathLinguistic/')) return;

  // 1. طلبات الصفحات (HTML Navigation)
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CORE_CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          // إذا فشلت الشبكة، ابحث في الكاش أولاً عن الصفحة المطلوبة ثم offline.html
          return caches.match(request, { ignoreSearch: true })
            .then(cached => cached || caches.match('/MathLinguistic/offline.html', { ignoreSearch: true }));
        })
    );
    return;
  }

  // 2. الموارد الأخرى (JS, CSS, JSON, Images, Fonts) - Stale-While-Revalidate
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          const copy = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, copy));
        }
        return networkResponse;
      }).catch(() => {});

      return cachedResponse || fetchPromise;
    })
  );
});
