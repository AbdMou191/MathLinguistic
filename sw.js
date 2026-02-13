// sw.js - Service Worker محسن لمشروع MathLinguistic

const CACHE_NAME = 'mathlinguistic-v3'; // غير الإصدار
const CORE_FILES = [
  '/',
  '/index.html',
  '/offline.html', // أضفنا صفحة عدم الاتصال
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
  '/scripts/levels/mixed-ops.js',
  '/icons/icon-192.png', // أيقونات مهمة
  '/icons/icon-512.png'
];

// مرحلة التثبيت
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker: جاري التثبيت...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: تخزين الملفات الأساسية');
        return cache.addAll(CORE_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: تم التثبيت بنجاح');
        return self.skipWaiting(); // تفعيل الـ SW فوراً
      })
      .catch(err => {
        console.error('❌ Service Worker: فشل التخزين:', err);
      })
  );
});

// مرحلة التنشيط
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: جاري التنشيط...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // حذف الكاش القديم
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: تم التنشيط والتحكم بالصفحة');
      return self.clients.claim(); // السيطرة على جميع الصفحات المفتوحة
    })
  );
});

// استراتيجية متقدمة للـ Fetch
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات التحليلات والإحصائيات
  if (event.request.url.includes('google-analytics') || 
      event.request.url.includes('analytics')) {
    return;
  }

  // استراتيجية مختلفة للطلبات المختلفة
  if (event.request.mode === 'navigate') {
    // للصفحات - استراتيجية Network First مع Fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // حفظ نسخة من الصفحة في الكاش
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // إذا فشل التحميل، أعد الصفحة المخزنة أو صفحة offline
          return caches.match(event.request).then(cached => {
            return cached || caches.match('/offline.html');
          });
        })
    );
  } else {
    // للملفات الثابتة - استراتيجية Cache First
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response; // من الكاش
          }
          
          // إذا لم يكن في الكاش، حمله من الإنترنت
          return fetch(event.request)
            .then(response => {
              // احفظ الملفات المهمة في الكاش
              if (response && response.status === 200 && 
                  event.request.url.includes('/scripts/levels/')) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            })
            .catch(error => {
              console.log('⚠️ فشل تحميل:', event.request.url, error);
              
              // للملفات المهمة، أعد صفحة خطأ بسيطة
              if (event.request.url.includes('.js')) {
                return new Response(
                  '// الملف غير متاح حالياً - وضع عدم الاتصال',
                  { headers: { 'Content-Type': 'application/javascript' } }
                );
              }
              return new Response('غير متاح حالياً', { status: 404 });
            });
        })
    );
  }
});

// مزامنة البيانات في الخلفية (لحفظ الإنجازات)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-achievements') {
    event.waitUntil(syncAchievements());
  }
});

async function syncAchievements() {
  try {
    // الحصول على جميع الصفحات المفتوحة
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_ACHIEVEMENTS',
        message: 'جاري مزامنة الإنجازات'
      });
    });
    
    // هنا يمكن إضافة منطق مزامنة الإنجازات مع الخادم
    console.log('🔄 مزامنة الإنجازات في الخلفية');
    
  } catch (error) {
    console.error('❌ فشل مزامنة الإنجازات:', error);
  }
}

// استقبال رسائل من الصفحة
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'SAVE_ACHIEVEMENT') {
    // حفظ الإنجاز في IndexedDB (يمكن إضافته)
    console.log('🏆 حفظ إنجاز:', event.data.achievement);
  }
});

// إشعارات للمستخدم
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});  const cacheWhitelist = [CACHE_NAME];
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
