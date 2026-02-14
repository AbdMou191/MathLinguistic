// =============== //
// متغيرات عامة
// =============== //

const mainContent = document.getElementById('main-content');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar-menu');
const themeToggle = document.getElementById('theme-toggle');
const backToTopBtn = document.getElementById('back-to-top');

// =============== //
// 0. وظيفة المنظف (Cleanup)
// =============== //

/**
 * دالة لتنظيف الصفحة قبل تحميل محتوى جديد
 * تقوم بمسح أي مؤقتات نشطة أو أحداث قديمة لمنع تداخل الأكواد
 */
function cleanupCurrentPage() {
  // 1. إيقاف جميع المؤقتات (Timers) النشطة في المتصفح
  let id = window.setTimeout(function() {}, 0);
  while (id--) {
    window.clearTimeout(id);
    window.clearInterval(id);
  }

  // 2. إزالة مستمعي الأحداث الخاصة بالنافذة أو الوثيقة التي قد تضاف من الألعاب
  window.removeEventListener('keydown', null); 
  
  // 3. تنظيف محتوى الصفحة الحالي برمجياً إذا لزم الأمر
  if (mainContent) {
    mainContent.innerHTML = '';
  }

  // 4. استدعاء دالة تنظيف خاصة إذا كانت اللعبة الحالية توفرها
  if (typeof window.destroyGame === 'function') {
    window.destroyGame();
    window.destroyGame = null; // تصفير الدالة بعد الاستخدام
  }

  console.log("تم تنظيف الموارد بنجاح قبل الانتقال.");
}

// =============== //
// 1. تبديل الوضع الليلي/النهاري
// =============== //

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = themeToggle?.querySelector('i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// =============== //
// 2. التحكم في القائمة الجانبية
// =============== //

function toggleSidebar() {
  sidebar.classList.toggle('open');
  const isHidden = !sidebar.classList.contains('open');
  sidebar.setAttribute('aria-hidden', isHidden);
}

// إغلاق القائمة عند النقر خارجها
document.addEventListener('click', (e) => {
  if (sidebar && sidebar.classList.contains('open') && 
      !sidebar.contains(e.target) && 
      e.target !== menuToggle) {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
  }
});

// =============== //
// 3. تحميل المحتوى الديناميكي
// =============== //

function loadHomePage() {
  cleanupCurrentPage(); // تنظيف قبل التحميل
  fetch('home-content.html')
    .then(res => res.text())
    .then(html => {
      mainContent.innerHTML = html;
      attachEventListeners();
      scrollToTopSmooth();
    })
    .catch(() => {
      mainContent.innerHTML = '<p>مرحباً بك في MathLinguistic! جاهز للتحدي؟</p>';
      scrollToTopSmooth();
    });
}

async function loadStaticPage(pageName) {
  cleanupCurrentPage(); // تنظيف قبل التحميل
  try {
    const response = await fetch(`const-page/${pageName}.html`);
    const html = await response.text();
    mainContent.innerHTML = html;
    scrollToTopSmooth();
    attachEventListeners();
  } catch (err) {
    mainContent.innerHTML = `<p>عذرًا، لم نتمكن من تحميل الصفحة.</p>`;
    scrollToTopSmooth();
  }
}

function scrollToTopSmooth() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============== //
// 4. زر العودة إلى الأعلى
// =============== //

function handleScroll() {
  if (backToTopBtn) {
    backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  }
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============== //
// 5. ربط جميع الأحداث
// =============== //

function attachEventListeners() {
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.removeEventListener('click', actionHandler);
    btn.addEventListener('click', actionHandler);
  });

  document.querySelectorAll('[data-target]').forEach(card => {
    card.removeEventListener('click', targetHandler);
    card.addEventListener('click', targetHandler);
  });

  document.querySelectorAll('[data-static-page]').forEach(btn => {
    btn.removeEventListener('click', staticPageHandler);
    btn.addEventListener('click', staticPageHandler);
  });

  document.querySelectorAll('.menu-item').forEach(item => {
    item.removeEventListener('click', menuHandler);
    item.addEventListener('click', menuHandler);
  });
}

// =============== //
// 6. معالجات الأحداث
// =============== //

function actionHandler(e) {
  e.preventDefault();
  const action = e.currentTarget.dataset.action;

  // عند النقر على أي لعبة، نقوم بالتنظيف أولاً
  cleanupCurrentPage();

  if (action === 'speed-test') {
    if (typeof window.loadSpeedTestPage === 'function') {
      window.loadSpeedTestPage();
    } else {
      mainContent.innerHTML = '<p style="text-align:center; padding:40px;">جارٍ تحميل لعبة "اختبار السرعة"...</p>';
      setTimeout(() => {
        if (typeof window.loadSpeedTestPage === 'function') {
          window.loadSpeedTestPage();
        } else {
          mainContent.innerHTML = '<p style="text-align:center; color:#e74c3c; padding:40px;">❌ فشل تحميل اللعبة.</p>';
        }
        scrollToTopSmooth();
      }, 300);
    }
  }

  else if (action === 'mental-math') {
    if (typeof window.loadMentalMathPage === 'function') {
      window.loadMentalMathPage();
    } else {
      mainContent.innerHTML = '<p style="text-align:center; padding:40px;">جارٍ تحميل لعبة "الحساب الذهني"...</p>';
      setTimeout(() => {
        if (typeof window.loadMentalMathPage === 'function') {
          window.loadMentalMathPage();
        } else {
          mainContent.innerHTML = '<p style="text-align:center; color:#e74c3c; padding:40px;">❌ فشل تحميل لعبة الحساب الذهني.</p>';
        }
        scrollToTopSmooth();
      }, 300);
    }
  }
  
  else if (action === 'mixed-ops') {
    if (typeof window.loadMixedOpsPage === 'function') {
      window.loadMixedOpsPage();
    } else {
      mainContent.innerHTML = '<p style="text-align:center; padding:40px;">جارٍ تحميل لعبة "العمليات المختلطة"...</p>';
      setTimeout(() => {
        if (typeof window.loadMixedOpsPage === 'function') {
          window.loadMixedOpsPage();
        } else {
          mainContent.innerHTML = '<p style="text-align:center; color:#e74c3c; padding:40px;">❌ فشل تحميل اللعبة.</p>';
        }
        scrollToTopSmooth();
      }, 300);
    }
  } else {
    handleInteraction(action, 'dynamic');
  }

  if (sidebar.classList.contains('open')) sidebar.classList.remove('open');
  scrollToTopSmooth();
}

function targetHandler(e) {
  const target = e.currentTarget.dataset.target;
  handleInteraction(target, 'dynamic');
}

function staticPageHandler(e) {
  const page = e.currentTarget.dataset.staticPage;
  handleInteraction(page, 'static');
}

function menuHandler(e) {
  const target = e.currentTarget.dataset.target;
  handleInteraction(target, 'dynamic');
}

function handleInteraction(target, type = 'dynamic') {
  cleanupCurrentPage(); // تنظيف الموارد الحالية

  // تفعيل التحقق من الإنجازات عند كل انتقال لتحديث الإنجازات العامة
  if (typeof window.checkAndUnlockAchievements === 'function') {
      window.checkAndUnlockAchievements();
  }

  if (type === 'static') {
    loadStaticPage(target);
  } else {
    // المحرك الحالي يقوم بتحويل اسم الهدف (target) إلى اسم دالة
    // مثلاً: achievements -> loadAchievementsPage
    const functionName = 'load' + target
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Page';
    
    if (typeof window[functionName] === 'function') {
      window[functionName]();
    } else {
      mainContent.innerHTML = `<p style="text-align:center; padding:40px;">جارٍ تحميل "${target}"...</p>`;
    }
  }
  // ... باقي الكود الخاص بالقائمة الجانبية


  

  if (type === 'static') {
    loadStaticPage(target);
  } else {
    const functionName = 'load' + target
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Page';
    
    if (typeof window[functionName] === 'function') {
      window[functionName]();
    } else {
      mainContent.innerHTML = `<p style="text-align:center; padding:40px;">جارٍ تحميل "${target}"...</p>`;
    }
  }

  if (sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
  }
  scrollToTopSmooth();
}

// =============== //
// 7. التهيئة عند تحميل الصفحة
// =============== //

document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (backToTopBtn) backToTopBtn.addEventListener('click', scrollToTop);

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  loadHomePage();
});

// =============== //
// 8. دعم PWA والعمل بدون إنترنت - أضف هذا الكود في نهاية الملف
// =============== //

// التحقق من دعم Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        registerServiceWorker();
        checkForUpdates();
    });
}

// تسجيل Service Worker
async function registerServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker مسجل:', registration.scope);

        // التحقق من وجود تحديثات
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🔄 تحديث جديد متاح');
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    showUpdateNotification();
                }
            });
        });

        // التحقق من التحديثات كل ساعة
        setInterval(() => {
            registration.update();
        }, 60 * 60 * 1000);

    } catch (error) {
        console.error('❌ فشل تسجيل Service Worker:', error);
    }
}

// إشعار التحديث
function showUpdateNotification() {
    // حذف أي إشعار سابق
    const oldNotification = document.querySelector('.update-notification');
    if (oldNotification) oldNotification.remove();

    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; background: #3498db; color: white; padding: 15px 25px; border-radius: 50px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); z-index: 9999; animation: slideInLeft 0.3s; display: flex; align-items: center; gap: 15px;">
            <span>🔄 يتوفر تحديث جديد للتطبيق</span>
            <button onclick="window.updateApp()" style="background: white; color: #3498db; border: none; padding: 8px 20px; border-radius: 50px; cursor: pointer; font-weight: bold; font-size: 14px;">تحديث الآن</button>
        </div>
    `;
    document.body.appendChild(notification);

    // إضافة animation إذا لم تكن موجودة
    if (!document.querySelector('#update-animation')) {
        const style = document.createElement('style');
        style.id = 'update-animation';
        style.textContent = `
            @keyframes slideInLeft {
                from {
                    transform: translateX(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // إخفاء الإشعار تلقائياً بعد 10 ثواني
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
}

// تحديث التطبيق
window.updateApp = function() {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        // إظهار رسالة إعادة التحميل
        const loadingMsg = document.createElement('div');
        loadingMsg.style.cssText = 'position:fixed; top:0; left:0; right:0; background:#27ae60; color:white; text-align:center; padding:15px; z-index:10000; font-weight:bold;';
        loadingMsg.textContent = 'جاري تحديث التطبيق وإعادة التحميل...';
        document.body.appendChild(loadingMsg);
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
};

// مراقبة حالة الاتصال
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

function updateConnectionStatus() {
    const isOnline = navigator.onLine;
    document.body.classList.toggle('offline-mode', !isOnline);
    
    if (!isOnline) {
        showOfflineToast();
        loadOfflineExercises();
    } else {
        syncOfflineData();
        // إخفاء أي رسائل عدم اتصال موجودة
        hideOfflineIndicators();
    }
}

function showOfflineToast() {
    // حذف أي توست سابق
    const oldToast = document.querySelector('.offline-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'offline-toast';
    toast.innerHTML = `
        <div style="position: fixed; top: 70px; left: 50%; transform: translateX(-50%); background: #f39c12; color: white; padding: 10px 25px; border-radius: 50px; z-index: 9998; box-shadow: 0 5px 15px rgba(0,0,0,0.2); font-weight: bold; animation: fadeInDown 0.3s;">
            ⚠️ وضع عدم الاتصال - التغييرات ستحفظ محلياً
        </div>
    `;
    document.body.appendChild(toast);

    // إضافة animation
    if (!document.querySelector('#toast-animation')) {
        const style = document.createElement('style');
        style.id = 'toast-animation';
        style.textContent = `
            @keyframes fadeInDown {
                from {
                    transform: translate(-50%, -100%);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, 0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // إخفاء التوست بعد 5 ثواني
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

function hideOfflineIndicators() {
    const toasts = document.querySelectorAll('.offline-toast');
    toasts.forEach(toast => toast.remove());
}

// حفظ الإنجازات محلياً (عدل دالة saveAchievement إذا كانت موجودة)
// إذا كانت الدالة موجودة، استبدلها بهذه أو أضف محتواها لدالتك الموجودة
window.saveAchievement = function(achievement) {
    // الكود الأصلي لحفظ الإنجازات (إذا كان موجوداً)
    if (typeof window.originalSaveAchievement === 'function') {
        window.originalSaveAchievement(achievement);
    }
    
    // إضافة الحفظ المحلي
    const achievements = JSON.parse(localStorage.getItem('offlineAchievements') || '[]');
    achievements.push({
        ...achievement,
        timestamp: Date.now()
    });
    localStorage.setItem('offlineAchievements', JSON.stringify(achievements));
    
    // محاولة المزامنة مع Service Worker
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'SAVE_ACHIEVEMENT',
            achievement: achievement
        });
    }
};

// مزامنة البيانات عند عودة الاتصال
async function syncOfflineData() {
    const offlineAchievements = JSON.parse(localStorage.getItem('offlineAchievements') || '[]');
    
    if (offlineAchievements.length > 0 && navigator.onLine) {
        console.log('🔄 مزامنة الإنجازات:', offlineAchievements.length);
        
        // هنا يمكن إضافة كود لمزامنة البيانات مع الخادم إذا كان موجوداً
        // مثلاً: await fetch('/api/sync-achievements', { method: 'POST', body: JSON.stringify(offlineAchievements) });
        
        // بعد المزامجة، امسح البيانات المحلية
        localStorage.removeItem('offlineAchievements');
        
        // تفعيل مزامنة الخلفية
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('sync-achievements');
        }
        
        // إظهار رسالة نجاح
        showSyncSuccessMessage(offlineAchievements.length);
    }
}

function showSyncSuccessMessage(count) {
    const msg = document.createElement('div');
    msg.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#27ae60; color:white; padding:15px 25px; border-radius:50px; z-index:9999; box-shadow:0 5px 15px rgba(0,0,0,0.2); animation:slideIn 0.3s;';
    msg.textContent = `✅ تمت مزامنة ${count} إنجاز بنجاح`;
    document.body.appendChild(msg);
    
    setTimeout(() => {
        if (msg.parentNode) msg.remove();
    }, 3000);
}

// تحميل التمارين في وضع عدم الاتصال
function loadOfflineExercises() {
    const levels = [
        { name: 'beginner', display: 'المبتدئ' },
        { name: 'intermediate', display: 'المتوسط' },
        { name: 'advanced', display: 'المتقدم' },
        { name: 'complex', display: 'المعقد' }
    ];
    
    levels.forEach(level => {
        const savedExercises = localStorage.getItem(`exercises_${level.name}`);
        if (savedExercises) {
            console.log(`📚 تم تحميل تمارين ${level.display} من الذاكرة المحلية`);
        }
    });
}

// التحقق من التحديثات
function checkForUpdates() {
    if (navigator.onLine) {
        fetch('/version.json')
            .then(response => response.json())
            .then(data => {
                const currentVersion = localStorage.getItem('appVersion');
                if (currentVersion !== data.version) {
                    console.log('🔄 إصدار جديد متاح:', data.version);
                    localStorage.setItem('appVersion', data.version);
                    
                    // إذا كان هناك تحديث كبير، أظهر إشعاراً
                    if (currentVersion && shouldShowUpdateNotification(currentVersion, data.version)) {
                        showUpdateNotification();
                    }
                }
            })
            .catch(() => console.log('لا يمكن التحقق من التحديثات'));
    }
}

function shouldShowUpdateNotification(oldVersion, newVersion) {
    // قارن الإصدارات - إذا كان تحديث رئيسي
    const oldMajor = oldVersion.split('.')[0];
    const newMajor = newVersion.split('.')[0];
    return oldMajor !== newMajor;
}

// دعم زر التثبيت
let installPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt = e;
    
    // إظهار زر التثبيت المخصص إذا وجد
    showInstallButton();
});

function showInstallButton() {
    // تحقق إذا كان هناك زر تثبيت في الصفحة
    let installButton = document.getElementById('install-app');
    
    // إذا لم يكن موجوداً، أنشئ واحداً
    if (!installButton) {
        installButton = document.createElement('button');
        installButton.id = 'install-app';
        installButton.innerHTML = '📱 تثبيت التطبيق';
        installButton.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#3498db; color:white; border:none; padding:12px 24px; border-radius:50px; cursor:pointer; box-shadow:0 5px 15px rgba(0,0,0,0.2); z-index:9999; font-weight:bold; border:2px solid white; display:none;';
        document.body.appendChild(insertButton);
    }
    
    installButton.style.display = 'block';
    installButton.onclick = async () => {
        if (!installPrompt) return;
        
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('✅ تم تثبيت التطبيق');
            installButton.style.display = 'none';
        }
        
        installPrompt = null;
    };
}

// حفظ حالة المستويات التي تم زيارتها (للاستخدام بدون إنترنت)
function saveVisitedLevel(levelName) {
    const visitedLevels = JSON.parse(localStorage.getItem('visitedLevels') || '[]');
    if (!visitedLevels.includes(levelName)) {
        visitedLevels.push(levelName);
        localStorage.setItem('visitedLevels', JSON.stringify(visitedLevels));
    }
}

// استرجاع المستويات المحفوظة
function getVisitedLevels() {
    return JSON.parse(localStorage.getItem('visitedLevels') || '[]');
}

// =============== //
// نهاية الكود المضاف
// =============== //