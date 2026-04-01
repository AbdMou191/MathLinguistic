// sw.js - MathLinguistic Service Worker (v8.0.0-OFFLINE-FIRST)
// ✅ تم التصحيح بناءً على الهيكلية الفعلية

const CACHE_NAME = 'mathlinguistic-v8.0.1-OFFLINE';
const CORE_CACHE = 'mathlinguistic-core-v8.0.1';
const DYNAMIC_CACHE = 'mathlinguistic-dynamic-v8';

// ✅ 1. الملفات الأساسية
const PRECACHE_CORE = [
  '/MathLinguistic/',
  '/MathLinguistic/index.html',
  '/MathLinguistic/home-content.html',
  '/MathLinguistic/offline.html',
  '/MathLinguistic/manifest.json',
  // ❌ حذفنا version.json لأنه غير موجود
  '/MathLinguistic/robots.txt',
  '/MathLinguistic/sitemap.xml',
];

// ✅ 2. الأنماط والخطوط
const PRECACHE_STYLES = [
  '/MathLinguistic/styles/main.css',
  '/MathLinguistic/styles/levels.css',
  '/MathLinguistic/styles/games/common.css',
  '/MathLinguistic/styles/font-awesome/css/all.min.css',
  // ⚠️ تأكد من أن هذه الملفات موجودة فعلاً بصيغة woff2
  '/MathLinguistic/styles/font-awesome/webfonts/fa-solid-900.woff2',
  '/MathLinguistic/styles/font-awesome/webfonts/fa-regular-400.woff2',
  '/MathLinguistic/styles/font-awesome/webfonts/fa-brands-400.woff2',
];

// ✅ 3. ملفات الجافاسكريبت الأساسية
const PRECACHE_SCRIPTS_CORE = [
  '/MathLinguistic/scripts/main.js',
  '/MathLinguistic/scripts/meta-manager.js',
  '/MathLinguistic/scripts/achievements.js',
  '/MathLinguistic/scripts/search.js',
  // ✅ أضفنا الملفات الجديدة من الهيكلية
  '/MathLinguistic/scripts/common/game-state-manager.js',
  '/MathLinguistic/scripts/core/game-core.js',
];

// ✅ 4. ملفات المستويات والتمارين
const PRECACHE_LEVELS = [
  '/MathLinguistic/scripts/levels/beginner.js',
  '/MathLinguistic/scripts/levels/intermediate.js',
  '/MathLinguistic/scripts/levels/advanced.js',
  '/MathLinguistic/scripts/levels/complex.js',
  '/MathLinguistic/scripts/levels/speed-test.js',
  '/MathLinguistic/scripts/levels/mental-math.js',  '/MathLinguistic/scripts/levels/mixed-ops.js',
  '/MathLinguistic/scripts/levels/calculator.js',
  '/MathLinguistic/scripts/levels/loudoukou.js',
  '/MathLinguistic/scripts/levels/crossmath.js',
  '/MathLinguistic/scripts/levels/sliding_puzzle.js',
];

// ✅ 5. ملفات الدروس
const PRECACHE_LESSONS = [
  '/MathLinguistic/scripts/lessons/beginner-lesson.js',
  '/MathLinguistic/scripts/lessons/intermediate-lesson.js',
  '/MathLinguistic/scripts/lessons/advanced-lesson.js',
  '/MathLinguistic/scripts/lessons/complex-lesson.js',
];

// ✅ 6. ملفات البيانات JSON
const PRECACHE_DATA = [
  '/MathLinguistic/data/levels/beginner.json',
  '/MathLinguistic/data/levels/intermediate.json',
  '/MathLinguistic/data/levels/advanced.json',
  '/MathLinguistic/data/levels/complex.json',
  '/MathLinguistic/data/lessons/beginner.json',
  '/MathLinguistic/data/lessons/intermediate.json',
  '/MathLinguistic/data/lessons/advanced.json',
  '/MathLinguistic/data/lessons/complex.json',
  '/MathLinguistic/data/achievements.json',
];

// ✅ 7. الصفحات الثابتة والأيقونات
const PRECACHE_STATIC = [
  '/MathLinguistic/const-page/about.html',
  '/MathLinguistic/const-page/contact.html',
  '/MathLinguistic/const-page/terms.html',
  '/MathLinguistic/const-page/privacy.html',
  '/MathLinguistic/icons/icon-48.webp',
  '/MathLinguistic/icons/icon-72.webp',
  '/MathLinguistic/icons/icon-96.webp',
  '/MathLinguistic/icons/icon-144.webp',
  '/MathLinguistic/icons/icon-192.webp',
  '/MathLinguistic/icons/icon-512.webp',
  // ✅ تم التصحيح: screenshots بصيغة png وليست webp
  '/MathLinguistic/screenshots/home.png',
  '/MathLinguistic/screenshots/level.png',
];

// 🔗 تجميع كل الملفات
const PRECACHE_ASSETS = [
  ...PRECACHE_CORE,
  ...PRECACHE_STYLES,
  ...PRECACHE_SCRIPTS_CORE,  ...PRECACHE_LEVELS,
  ...PRECACHE_LESSONS,
  ...PRECACHE_DATA,
  ...PRECACHE_STATIC,
];

// 🎯 مسارات نريد تجاهلها
const IGNORE_PATTERNS = [
  /google-analytics\.com/,
  /googletagmanager\.com/,
  /polyfill\.io/,
  /mathjax/,
  /\.map$/,
];

// ============================================
// 📦 1. حدث التثبيت
// ============================================
self.addEventListener('install', (event) => {
  console.log(`🚀 SW ${CACHE_NAME}: بدء التثبيت...`);
  
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then((cache) => {
        console.log(`📦 جاري تخزين ${PRECACHE_ASSETS.length} ملف أساسي...`);
        return Promise.all(
          PRECACHE_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`⚠️ لم يُخزَّن: ${url}`, err.message);
              // ✅ لا نتوقف عند الخطأ - بعض الملفات اختيارية
            })
          )
        );
      })
      .then(() => {
        console.log('✅ اكتمل التخزين المسبق');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('❌ خطأ في التثبيت:', err);
      })
  );
});

// ============================================
// 🧹 2. حدث التنشيط
// ============================================
self.addEventListener('activate', (event) => {
  console.log(`✅ SW ${CACHE_NAME}: نشط وجاهز`);
    event.waitUntil(
    caches.keys().then(cacheNames => {
      const oldCaches = cacheNames.filter(name => 
        name !== CACHE_NAME && 
        name !== CORE_CACHE &&         
        name !== DYNAMIC_CACHE
      );
      
      return Promise.all(oldCaches.map(name => {
        console.log(`🗑️ حذف الكاش القديم: ${name}`);
        return caches.delete(name);
      }));
    })
    .then(() => self.clients.claim())
    .then(() => self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ 
          type: 'SW_UPDATED', 
          cache: CACHE_NAME,
          message: 'تم تحديث التطبيق'
        });
      });
    }))
  );
});

// ============================================
// 🌐 3. حدث الجلب - استراتيجية هجينة
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // تجاهل الطلبات الخارجية
  if (IGNORE_PATTERNS.some(pattern => pattern.test(url.href))) {
    return;
  }
  
  // تجاهل ما ليس من موقعنا
  if (!url.href.includes('/MathLinguistic/')) {
    return;
  }
  
  // 🎯 HTML: Cache First + Background Update
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          fetch(request).then(response => {
            if (response.ok) {              caches.open(CORE_CACHE).then(cache => 
                cache.put(request, response.clone())
              );
            }
          }).catch(() => {});
          return cached;
        }
        
        return fetch(request).then(response => {
          if (response.ok) {
            caches.open(CORE_CACHE).then(cache => 
              cache.put(request, response.clone())
            );
          }
          return response;
        }).catch(() => {
          return caches.match('/MathLinguistic/offline.html');
        });
      })
    );
    return;
  }
  
  // 🎯 JSON: Cache First + Safe Fallback
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        
        return fetch(request).then(response => {
          if (response.ok) {
            caches.open(CORE_CACHE).then(cache => 
              cache.put(request, response.clone())
            );
          }
          return response;
        }).catch(() => {
          console.warn(`⚠️ JSON غير متاح: ${url.pathname}`);
          return new Response(JSON.stringify({ 
            status: 'offline', 
            message: 'البيانات غير متاحة'
          }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
          });
        });
      })
    );
    return;
  }  
  // 🎯 CSS/JS/Fonts: Cache First
  if (/\.(css|js|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          fetch(request).then(response => {
            if (response.ok) {
              caches.open(CORE_CACHE).then(cache => 
                cache.put(request, response.clone())
              );
            }
          }).catch(() => {});
          return cached;
        }
        
        return fetch(request).then(response => {
          if (response.ok) {
            caches.open(CORE_CACHE).then(cache => 
              cache.put(request, response.clone())
            );
          }
          return response;
        });
      })
    );
    return;
  }
  
  // 🎯 Images: Cache First
  if (/\.(webp|png|jpg|jpeg|svg|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(response => {
          if (response.ok) {
            caches.open(CORE_CACHE).then(cache => 
              cache.put(request, response.clone())
            );
          }
          return response;
        });
      })
    );
    return;
  }
  
  // 🎯 باقي الطلبات: Network First
  event.respondWith(
    fetch(request).then(response => {
      if (response.ok) {        caches.open(DYNAMIC_CACHE).then(cache => 
          cache.put(request, response.clone())
        );
      }
      return response;
    }).catch(() => {
      return caches.match(request);
    })
  );
});

// ============================================
// 🔄 4. معالجة الرسائل
// ============================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CORE_CACHE).then(() => {
        console.log('🧹 تم مسح الكاش');
        return caches.open(CORE_CACHE).then(cache => {
          return Promise.all(
            PRECACHE_CORE.map(url => cache.add(url).catch(() => {}))
          );
        });
      })
    );
  }
});

console.log('✅ Service Worker محمل وجاهز للعمل!');