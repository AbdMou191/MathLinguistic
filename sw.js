// sw.js - MathLinguistic Service Worker (v8.0.0-OFFLINE-FIRST)
// متوافق مع الهيكلية الجديدة - يدعم العمل الكامل بدون إنترنت

const CACHE_NAME = 'mathlinguistic-v8.0.1-OFFLINE';
const CORE_CACHE = 'mathlinguistic-core-v8.0.1';
const DYNAMIC_CACHE = 'mathlinguistic-dynamic-v8';

// ✅ 1. الملفات الأساسية (تُخزّن فوراً عند التثبيت - ضرورية للتشغيل)
const PRECACHE_CORE = [
  '/MathLinguistic/',
  '/MathLinguistic/index.html',
  '/MathLinguistic/home-content.html',
  '/MathLinguistic/offline.html',
  '/MathLinguistic/manifest.json',
  '/MathLinguistic/version.json',
  '/MathLinguistic/robots.txt',
  '/MathLinguistic/sitemap.xml',
];

// ✅ 2. الأنماط والخطوط (ضرورية للعرض الصحيح)
const PRECACHE_STYLES = [
  '/MathLinguistic/styles/main.css',
  '/MathLinguistic/styles/font-awesome/css/all.min.css',
  '/MathLinguistic/styles/font-awesome/webfonts/fa-solid-900.woff2',
  '/MathLinguistic/styles/font-awesome/webfonts/fa-regular-400.woff2',
  '/MathLinguistic/styles/font-awesome/webfonts/fa-brands-400.woff2',
  '/MathLinguistic/styles/font-awesome/webfonts/fa-v4compatibility.woff2',
];

// ✅ 3. ملفات الجافاسكريبت الأساسية (المنطق الرئيسي)
const PRECACHE_SCRIPTS_CORE = [
  '/MathLinguistic/scripts/main.js',
  '/MathLinguistic/scripts/meta-manager.js',
  '/MathLinguistic/scripts/achievements.js',
  '/MathLinguistic/scripts/search.js',
];

// ✅ 4. ملفات المستويات والتمارين (ضرورية للعب بدون نت)
const PRECACHE_LEVELS = [
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
  '/MathLinguistic/scripts/levels/sliding_puzzle.js',];

// ✅ 5. ملفات الدروس (للعرض بدون نت)
const PRECACHE_LESSONS = [
  '/MathLinguistic/scripts/lessons/beginner-lesson.js',
  '/MathLinguistic/scripts/lessons/intermediate-lesson.js',
  '/MathLinguistic/scripts/lessons/advanced-lesson.js',
  '/MathLinguistic/scripts/lessons/complex-lesson.js',
];

// ✅ 6. ملفات البيانات JSON (محتوى التمارين والدروس)
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
  '/MathLinguistic/screenshots/home.webp',
  '/MathLinguistic/screenshots/level.webp',
];

// 🔗 تجميع كل الملفات في مصفوفة واحدة
const PRECACHE_ASSETS = [
  ...PRECACHE_CORE,
  ...PRECACHE_STYLES,
  ...PRECACHE_SCRIPTS_CORE,
  ...PRECACHE_LEVELS,
  ...PRECACHE_LESSONS,
  ...PRECACHE_DATA,
  ...PRECACHE_STATIC,
];
// 🎯 مسارات نريد تجاهلها (لا نحتاج لتخزينها أو معالجتها)
const IGNORE_PATTERNS = [
  /google-analytics\.com/,
  /googletagmanager\.com/,
  /polyfill\.io/,
  /mathjax/,
  /\.map$/,
];

// ============================================
// 📦 1. حدث التثبيت: تخزين إجباري للملفات الأساسية
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
              // نسجل الخطأ لكن لا نوقف العملية (بعض الملفات قد تكون اختيارية)
              console.warn(`⚠️ لم يُخزَّن: ${url}`, err.message);
            })
          )
        );
      })
      .then(() => {
        console.log('✅ اكتمل التخزين المسبق - التطبيق جاهز للأوفلاين');
        return self.skipWaiting(); // التنشيط الفوري
      })
      .catch(err => {
        console.error('❌ خطأ فادح في التثبيت:', err);
      })
  );
});

// ============================================
// 🧹 2. حدث التنشيط: تنظيف الكاش القديم + السيطرة
// ============================================
self.addEventListener('activate', (event) => {
  console.log(`✅ SW ${CACHE_NAME}: نشط وجاهز`);
  
  event.waitUntil(
    // 1. حذف نسخ الكاش القديمة
    caches.keys().then(cacheNames => {
      const oldCaches = cacheNames.filter(name => 
        name !== CACHE_NAME && 
        name !== CORE_CACHE &&         name !== DYNAMIC_CACHE
      );
      
      return Promise.all(oldCaches.map(name => {
        console.log(`🗑️ حذف الكاش القديم: ${name}`);
        return caches.delete(name);
      }));
    })
    .then(() => {
      // 2. السيطرة الفورية على جميع التبويبات
      return self.clients.claim();
    })
    .then(() => {
      // 3. إشعار جميع العملاء بالتحديث
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ 
            type: 'SW_UPDATED', 
            cache: CACHE_NAME,
            message: 'تم تحديث التطبيق - بعض الميزات قد تتطلب إعادة التحميل'
          });
        });
      });
    })
  );
});

// ============================================
// 🌐 3. حدث الجلب: استراتيجية هجينة ذكية
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // ✅ تجاهل الطلبات الخارجية وغير المهمة
  if (IGNORE_PATTERNS.some(pattern => pattern.test(url.href))) {
    return;
  }
  
  // ✅ تجاهل الطلبات غير المتعلقة بموقعنا
  if (!url.href.includes('/MathLinguistic/')) {
    return;
  }
  
  // 🎯 استراتيجية مختلفة حسب نوع الملف:
  
  // --- أ) ملفات HTML: Cache First مع تحديث في الخلفية ---
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      caches.match(request).then(cached => {        if (cached) {
          // نعيد النسخة المخزنة فوراً
          const networkFetch = fetch(request).then(response => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CORE_CACHE).then(cache => cache.put(request, clone));
            }
            return response;
          }).catch(() => {}); // نتجاهل أخطاء الشبكة هنا
          return cached;
        }
        // إذا لم يكن في الكاش، نجلب من الشبكة
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CORE_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => {
          // فallback لصفحة الأوفلاين
          return caches.match('/MathLinguistic/offline.html');
        });
      })
    );
    return;
  }
  
  // --- ب) ملفات JSON (البيانات): Cache First صارم ---
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CORE_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => {
          // نعيد بيانات فارغة آمنة لمنع تحطم التطبيق
          console.warn(`⚠️ JSON غير متاح: ${url.pathname}`);
          return new Response(JSON.stringify({ 
            status: 'offline', 
            message: 'البيانات غير متاحة بدون اتصال',
            cached: true 
          }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
          });        });
      })
    );
    return;
  }
  
  // --- ج) ملفات CSS/JS/Fonts: Cache First مع تحديث ---
  if (/\.(css|js|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          // نحدث في الخلفية فقط
          fetch(request).then(response => {
            if (response.ok) {
              caches.open(CORE_CACHE).then(cache => cache.put(request, response.clone()));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(request).then(response => {
          if (response.ok) {
            caches.open(CORE_CACHE).then(cache => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }
  
  // --- د) الصور والأيقونات: Cache First ---
  if (/\.(webp|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(response => {
          if (response.ok) {
            caches.open(CORE_CACHE).then(cache => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }
  
  // --- هـ) أي طلب آخر: Network First مع fallback للكاش ---
  event.respondWith(
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, response.clone()));      }
      return response;
    }).catch(() => {
      return caches.match(request).then(cached => {
        return cached || new Response('Offline - هذا المحتوى غير متاح', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});

// ============================================
// 🔄 4. تحديث الكاش ديناميكياً عند تغيير النسخة
// ============================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CORE_CACHE).then(() => {
        console.log('🧹 تم مسح الكاش الأساسي بناءً على طلب المستخدم');
        // إعادة التخزين للملفات الأساسية
        return caches.open(CORE_CACHE).then(cache => {
          return Promise.all(PRECACHE_CORE.map(url => cache.add(url).catch(() => {})));
        });
      })
    );
  }
  
  if (event.data && event.data.type === 'UPDATE_VERSION') {
    // يمكن استخدامه لتحديث version.json ديناميكياً
    console.log('🔄 طلب تحديث النسخة:', event.data.version);
  }
});

// ============================================
// 📊 5. أدوات المراقبة والتشخيص (للتطوير)
// ============================================
self.addEventListener('fetch', (event) => {
  // تسجيل إحصائيات بسيطة (يمكن تفعيلها في وضع التطوير)
  // console.log(`🌐 Fetch: ${event.request.url}`);
});

// دالة مساعدة للتحقق من حالة الكاش (للاستخدام في Console)
self.getCacheStats = async function() {
  const stats = {};  const cachesList = await caches.keys();
  
  for (const cacheName of cachesList) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = {
      count: keys.length,
      size: 'غير متاح مباشرة', // يتطلب حساب الحجم يدوياً
      urls: keys.map(k => k.url).slice(0, 10) // أول 10 روابط للعرض
    };
  }
  return stats;
};

// جعل الدالة متاحة للنافذة الرئيسية
self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_CACHE_STATS') {
    self.getCacheStats().then(stats => {
      event.ports[0]?.postMessage(stats);
    });
  }
});

// ============================================
// 🎯 ملخص الاستراتيجية:
// ============================================
// ✅ HTML: Cache First + Background Update
// ✅ JSON: Cache First + Safe Fallback
// ✅ CSS/JS/Fonts: Cache First + Lazy Update  
// ✅ Images: Cache First
// ✅ Other: Network First + Cache Fallback
// ✅ Offline Page: Fallback لكل فشل
// ✅ Auto Cleanup: حذف الكاش القديم تلقائياً
// ✅ Client Notification: إشعار المستخدمين بالتحديثات