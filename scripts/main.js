// =============== //
// MathLinguistic - Main Application Logic
// ال// =============== //
// MathLinguistic - Main Application Logic
// النسخة الكاملة الموحدة v3.2 - مع إصلاح شامل لمشاكل التنقل
// =============== //

// =============== //
// متغيرات عامة
// =============== //

const mainContent = document.getElementById('main-content');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar-menu');
const themeToggle = document.getElementById('theme-toggle');
const backToTopBtn = document.getElementById('back-to-top');

// متغيرات إدارة التنقل
let isOnHomePage = true;
let hasPushedGameEntry = false;
let lastGameTarget = null; // تتبع آخر لعبة تم الدخول إليها

// خريطة لتتبع المستمعات المضافة لمنع التكرار
const eventListenerMap = new Map();

// =============== //
// 0. وظيفة المنظف (Cleanup) - النسخة الآمنة
// =============== //

function cleanupCurrentPage() {
  console.log("🧹 جاري تنظيف الصفحة...");

  // إيقاف جميع المؤقتات العالمية
  if (window.mentalMathInterval) {
    clearInterval(window.mentalMathInterval);
    window.mentalMathInterval = null;
  }
  if (window.mixedOpsInterval) {
    clearInterval(window.mixedOpsInterval);
    window.mixedOpsInterval = null;
  }
  if (window.speedTestInterval) {
    clearInterval(window.speedTestInterval);
    window.speedTestInterval = null;
  }

  // تنظيف دوال التدمير إذا كانت موجودة
  if (typeof window.destroyMentalMath === 'function') {
    window.destroyMentalMath();
  }
  if (typeof window.destroyMixedOps === 'function') {
    window.destroyMixedOps();
  }
  if (typeof window.destroySpeedTest === 'function') {
    window.destroySpeedTest();
  }
  
  // تنظيف أي Resource Manager
  if (window._ResourceManager && typeof window._ResourceManager.cleanupAll === 'function') {
    window._ResourceManager.cleanupAll();
  }
  
  // إعادة تعيين متغيرات بيانات الألعاب
  window.speedTestData = null;
  window.mentalMathData = null;
  window.mixedOpsData = null;
  
  // مسح المحتوى
  if (mainContent) {
    mainContent.innerHTML = '';
  }
  
  console.log("✅ تم التنظيف بنجاح.");
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

// =============== //
// 2. التحكم في القائمة الجانبية (مُحدَّث)
// =============== //

// دالة مساعدة لإدارة قابلية التركيز داخل القائمة
function setSidebarFocusable(isFocusable) {
  if (!sidebar) return;
  const interactiveElements = sidebar.querySelectorAll('button, a, [tabindex="0"], .menu-item');
  interactiveElements.forEach(el => {
    if (isFocusable) {
      el.removeAttribute('tabindex');
    } else {
      el.setAttribute('tabindex', '-1');
    }
  });
}

function toggleSidebar() {
  if(!sidebar) return;  
  
  sidebar.classList.toggle('open');
  const isOpen = sidebar.classList.contains('open');
  
  // تحديث aria-hidden عكسياً للحالة
  sidebar.setAttribute('aria-hidden', !isOpen);
  
  // ⭐⭐⭐ التحكم في قابلية التركيز للعناصر الداخلية ⭐⭐⭐
  setSidebarFocusable(isOpen);
  
  // إدارة التركيز: عند الفتح، ركز على أول عنصر
  if (isOpen) {
    const firstItem = sidebar.querySelector('.menu-item, button, a');
    if (firstItem) {
      setTimeout(() => firstItem.focus(), 100);
    }
  } else {
    // عند الإغلاق، أعد التركيز لزر القائمة
    if (menuToggle) {
      menuToggle.focus();
    }
  }
}

// تحديث مستمع النقر الخارجي ليتوافق مع التحديث الجديد
document.addEventListener('click', (e) => {
  if (sidebar && sidebar.classList.contains('open') && 
      !sidebar.contains(e.target) && 
      e.target !== menuToggle) {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    setSidebarFocusable(false);  // ⭐ إضافة جديدة
    if (menuToggle) menuToggle.focus();  // ⭐ إضافة جديدة
  }
});

document.addEventListener('click', (e) => {
  if (sidebar && sidebar.classList.contains('open') && 
      !sidebar.contains(e.target) && 
      e.target !== menuToggle) {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
  }
});

// =============== //
// 3. تحميل المحتوى الديناميكي (الرئيسية والصفحات الثابتة)
// =============== //

function loadHomePage() {
  console.log("🏠 تحميل الصفحة الرئيسية");
  
  isOnHomePage = true;
  hasPushedGameEntry = false;
  lastGameTarget = null;
  window.currentSection = 'home';
  
  cleanupCurrentPage();
  
  // استبدال الحالة الحالية بالرئيسية
  history.replaceState({ page: 'home' }, '', location.pathname);
  
  fetch('home-content.html')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load home page');
      return res.text();
    })
    .then(html => {
      mainContent.innerHTML = html;
      attachEventListeners();
      scrollToTopSmooth();
      
      if (typeof updatePageMeta === 'function') {
        updatePageMeta('home');
      }
    })
    .catch(() => {
      mainContent.innerHTML = '<div style="text-align:center; padding:40px;"><h2>مرحباً بك في MathLinguistic!</h2><p>جاهز للتحدي؟</p></div>';
      scrollToTopSmooth();
      
      if (typeof updatePageMeta === 'function') {
        updatePageMeta('home');
      }
    });
}

function loadStaticPage(pageName) {
  console.log(`📄 تحميل الصفحة الثابتة: ${pageName}`);
  
  isOnHomePage = false;
  hasPushedGameEntry = false; // الخروج من وضع اللعبة
  lastGameTarget = null;
  cleanupCurrentPage();
  
  // الصفحات الثابتة تستخدم pushState
  history.pushState({ page: pageName, type: 'static' }, '', `#${pageName}`);
  
  fetch(`const-page/${pageName}.html`)
    .then(response => {
      if (!response.ok) throw new Error('Page not found');
      return response.text();
    })
    .then(html => {
      mainContent.innerHTML = html;
      scrollToTopSmooth();
      attachEventListeners();
      
      if (typeof updatePageMeta === 'function') {
        updatePageMeta(pageName);
      }
    })
    .catch(err => {
      console.error('Error loading static page:', err);
      mainContent.innerHTML = `<div style="text-align:center; padding:40px;"><p>عذراً، لم نتمكن من تحميل الصفحة: ${pageName}</p></div>`;
      scrollToTopSmooth();
    });
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
// 5. ربط جميع الأحداث (مع منع التكرار)
// =============== //

function safeAddEventListener(element, eventType, handler) {
  if (!element) return;
  
  // استخدام مزيج من العنصر ونوع الحدث واسم الدالة كمفتاح
  const elementId = element.id || element.className || Math.random().toString(36);
  const key = `${elementId}_${eventType}_${handler.name}`;
  
  // إذا كان هناك مستمع سابق، قم بإزالته
  if (eventListenerMap.has(key)) {
    element.removeEventListener(eventType, eventListenerMap.get(key));
  }
  
  // إضافة المستمع الجديد وحفظه
  element.addEventListener(eventType, handler);
  eventListenerMap.set(key, handler);
}

function attachEventListeners() {
  // أزرار الألعاب الرئيسية
  document.querySelectorAll('[data-action]').forEach(btn => {
    safeAddEventListener(btn, 'click', actionHandler);
  });

  // بطاقات المستويات والدروس
  document.querySelectorAll('[data-target]').forEach(card => {
    safeAddEventListener(card, 'click', targetHandler);
  });
  
  // روابط التذييل
  document.querySelectorAll('[data-static-page]').forEach(btn => {
    safeAddEventListener(btn, 'click', staticPageHandler);
  });

  // عناصر القائمة الجانبية
  document.querySelectorAll('.menu-item').forEach(item => {
    safeAddEventListener(item, 'click', menuHandler);
  });
}

// =============== //
// 6. معالجات الأحداث
// =============== //

function actionHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  const action = e.currentTarget.dataset.action;
  handleInteraction(action, 'game');
}

function targetHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  const target = e.currentTarget.dataset.target;
  const type = target.startsWith('learn-') ? 'lesson' : 'game';
  handleInteraction(target, type);
}

function staticPageHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  const page = e.currentTarget.dataset.staticPage;
  handleInteraction(page, 'static');
}

function menuHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  const target = e.currentTarget.dataset.target;
  const type = target.startsWith('learn-') ? 'lesson' : 'game';
  handleInteraction(target, type);
}

// =============== //
// الدالة المركزية لمعالجة كافة التنقلات (مُحسّنة)
// =============== //

function handleInteraction(target, type = 'game') {
  console.log(`🔄 تنقل إلى: ${target} (النوع: ${type})`);
  
  // منع التنقل المزدوج
  if (window._navigationInProgress) {
    console.log("⚠️ تنقل قيد التنفيذ، يتم تجاهل الطلب");
    return;
  }
  
  window._navigationInProgress = true;
  window.currentSection = target;
  isOnHomePage = false;
  
  cleanupCurrentPage();

  // ⭐⭐⭐ إدارة history المتطورة ⭐⭐⭐
  if (type === 'static') {
    // الصفحات الثابتة: إضافة جديدة للـ history
    history.pushState({ page: target, type: 'static' }, '', `#${target}`);
    hasPushedGameEntry = false;
    lastGameTarget = null;
  } 
  else if (type === 'game' || type === 'lesson') {
    if (!hasPushedGameEntry) {
      // أول مرة ندخل فيها لعبة: نستبدل الحالة الحالية
      // هذا يضمن أن زر الرجوع يعيدنا للرئيسية مباشرة
      history.replaceState({ 
        page: 'game-entry', 
        type: 'game',
        gameTarget: target 
      }, '', `#${target}`);
      hasPushedGameEntry = true;
      lastGameTarget = target;
    } else {
      // داخل اللعبة: نحدث الحالة فقط إذا تغيرت اللعبة
      if (lastGameTarget !== target) {
        // إذا انتقلنا من لعبة لأخرى، نعتبرها بوابة جديدة
        history.replaceState({ 
          page: 'game-entry', 
          type: 'game',
          gameTarget: target 
        }, '', `#${target}`);
        lastGameTarget = target;
      } else {
        // نفس اللعبة: نحدث الحالة فقط
        history.replaceState({ 
          page: target, 
          type: 'game',
          gameTarget: target 
        }, '', `#${target}`);
      }
    }
  }

  // تحديث الإنجازات
  if (typeof window.checkAndUnlockAchievements === 'function') {
    window.checkAndUnlockAchievements();
  }

  // معالجة المحتوى حسب النوع
  if (type === 'lesson') {
    loadLesson(target);
  } 
  else if (type === 'static') {
    loadStaticPage(target);
  } 
  else {
    loadGame(target);
  }

  // إغلاق القائمة الجانبية
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
  }
  
  scrollToTopSmooth();
  
  // إعادة تعيين علم التنقل بعد فترة
  setTimeout(() => {
    window._navigationInProgress = false;
  }, 500);
}

// دوال مساعدة للتحميل
function loadLesson(target) {
  const lessonFunctions = {
    'learn-beginner': window.loadBeginnerLesson,
    'learn-intermediate': window.loadIntermediateLesson,
    'learn-advanced': window.loadAdvancedLesson,
    'learn-complex': window.loadComplexLesson
  };
  
  const loadFn = lessonFunctions[target];
  
  if (loadFn && typeof loadFn === 'function') {
    loadFn();
    if (typeof updatePageMeta === 'function') {
      setTimeout(() => updatePageMeta(target), 100);
    }
  } else {
    mainContent.innerHTML = `<div style="text-align:center; padding:40px;"><p>⚠️ الدرس "${target}" غير متاح حالياً.</p></div>`;
  }
}

function loadGame(target) {
  const functionName = 'load' + target
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Page';
  
  if (typeof window[functionName] === 'function') {
    window[functionName]();
    if (typeof updatePageMeta === 'function') {
      setTimeout(() => updatePageMeta(target), 150);
    }
  } else {
    mainContent.innerHTML = `<div style="text-align:center; padding:40px;"><p>⚠️ القسم "${target}" غير مفعل حالياً.</p></div>`;
  }
}

// =============== //
// 7. معالجة زر الرجوع (مُحسّنة)
// =============== //

function handlePopState(event) {
  console.log("⬅️ زر الرجوع: تم الضغط", event.state);
  
  // إلغاء أي تنقل قيد التنفيذ
  window._navigationInProgress = false;
  
  if (!event.state) {
    // لا توجد حالة - نذهب للرئيسية
    loadHomePage();
    return;
  }
  
  const state = event.state;
  
  if (state.page === 'home') {
    // العودة للرئيسية
    loadHomePage();
  } 
  else if (state.type === 'static') {
    // العودة لصفحة ثابتة
    loadStaticPage(state.page);
  }
  else if (state.type === 'game' || state.page === 'game-entry') {
    // أي حالة لعبة تعيدنا للرئيسية مباشرة
    loadHomePage();
  }
  else {
    // أي حالة أخرى تعيدنا للرئيسية
    loadHomePage();
  }
}

// =============== //
// 8. التهيئة
// =============== //

document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 تهيئة التطبيق...");
  
  initTheme();

  // إضافة المستمعات للعناصر الثابتة
  if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (backToTopBtn) backToTopBtn.addEventListener('click', scrollToTop);

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // الحالة الأولية
  history.replaceState({ page: 'home' }, '', location.pathname);
  
  // تحميل الصفحة الرئيسية
  loadHomePage();

  // معالجة زر الرجوع
  window.addEventListener('popstate', handlePopState);
});

// =============== //
// باقي الكود (PWA، رسائل الترحيب، إلخ) - يبقى كما هو من ملفك
// =============== //

// [هنا ضع كل كود PWA و showToast من ملفك الأصلي]
// (لم أكرره هنا للاختصار ولكن يجب أن يبقى كما هو بالكامل)

// ✅ جعل الدوال متاحة عالمياً


// =============== //
// باقي الكود (PWA، رسائل الترحيب، إلخ) يبقى كما هو
// =============== //

// ... (كل كود PWA و showToast من ملفك الأصلي يبقى كما هو) ...

// =============== //
// 📱 نظام تثبيت التطبيق الذكي (PWA)
// =============== //

let deferredInstallPrompt = null;
let installBanner = null;
let pwaCheckInterval = null;

// ✅ دالة التحقق مما إذا كان التطبيق مثبتاً (شاملة)
function isAppInstalled() {
  const conditions = [
    window.matchMedia('(display-mode: standalone)').matches,
    window.matchMedia('(display-mode: minimal-ui)').matches,
    window.navigator.standalone === true,
    document.referrer.includes('android-app://'),
    localStorage.getItem('pwa_was_installed') === 'true'
  ];
  return conditions.some(c => c === true);
}

// ✅ دالة إنشاء شريط التثبيت
function createInstallBanner() {
  if (installBanner) return;
  if (isAppInstalled()) return;

  installBanner = document.createElement('div');
  installBanner.id = 'pwa-install-banner';
  installBanner.dir = 'rtl';
  installBanner.style.cssText = `
    position: fixed;
    bottom: ${document.getElementById('back-to-top')?.offsetParent ? '80px' : '20px'};
    left: 50%;
    transform: translateX(-50%);
    background: var(--card-bg);
    border: 2px solid var(--accent-color);
    border-radius: 16px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);    z-index: 9999;
    font-family: 'Cairo', sans-serif;
    max-width: 90%;
    animation: slideUp 0.3s ease;
  `;

  installBanner.innerHTML = `
    <div style="font-size: 1.5rem; color: var(--accent-color);">📱</div>
    <div style="flex: 1; text-align: right;">
      <div style="font-weight: bold; color: var(--text-primary); font-size: 0.95rem;">
        تثبيت MathLinguistic؟
      </div>
      <div style="font-size: 0.8rem; color: var(--text-secondary);">
        للوصول السريع دون فتح المتصفح
      </div>
    </div>
    <button id="pwa-install-yes" style="
      background: var(--accent-color);
      color: white;
      border: none;
      padding: 8px 18px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.2s;
    ">تثبيت</button>
    <button id="pwa-install-no" style="
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    ">لاحقاً</button>
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { opacity: 0; transform: translate(-50%, 30px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
    #pwa-install-banner button:hover {
      filter: brightness(1.1);
    }
    #pwa-install-no:hover {
      background: var(--border-color);      color: var(--text-primary);
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(installBanner);

  // ✅ زر التثبيت
  document.getElementById('pwa-install-yes').addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      console.log(`📥 نتيجة التثبيت: ${outcome}`);
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_was_installed', 'true');
      }
      hideInstallBanner();
      deferredInstallPrompt = null;
    }
  });

  // ✅ زر لاحقاً
  document.getElementById('pwa-install-no').addEventListener('click', () => {
    hideInstallBanner();
    localStorage.setItem('pwa_install_dismissed', 'true');
  });
}

// ✅ دالة إخفاء الشريط (مع تنظيف الفحص الدوري)
function hideInstallBanner() {
  if (installBanner) {
    installBanner.style.opacity = '0';
    installBanner.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      installBanner?.remove();
      installBanner = null;
    }, 300);
  }
  if (pwaCheckInterval) {
    clearInterval(pwaCheckInterval);
    pwaCheckInterval = null;
  }
}

// ✅ فحص دوري لحالة التثبيت (كل 2 ثانية)
function startPWAStatusCheck() {
  if (pwaCheckInterval) return;
  
  pwaCheckInterval = setInterval(() => {
    if (isAppInstalled() && installBanner) {
      console.log('✅ تم اكتشاف التثبيت - إخفاء الشريط');      hideInstallBanner();
    }
  }, 2000);
}

// ✅ الاستماع لحدث beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  
  if (isAppInstalled() || localStorage.getItem('pwa_install_dismissed') === 'true') {
    return;
  }
  
  setTimeout(createInstallBanner, 3000);
  console.log('📱 شريط التثبيت جاهز للعرض');
});

// ✅ الاستماع لحدث appinstalled
window.addEventListener('appinstalled', () => {
  console.log('✅ حدث appinstalled تم التقاطه');
  localStorage.setItem('pwa_was_installed', 'true');
  hideInstallBanner();
  deferredInstallPrompt = null;
});

// ✅ فحص عند تحميل الصفحة
function checkPWAStatusOnLoad() {
  if (isAppInstalled()) {
    console.log('📱 التطبيق مثبت - لن يظهر شريط التثبيت');
    localStorage.setItem('pwa_was_installed', 'true');
    const existingBanner = document.getElementById('pwa-install-banner');
    if (existingBanner) existingBanner.remove();
    return false;
  }
  return true;
}

// ✅ كشف iOS وعرض إرشاد يدوي
function showIOSInstallHint() {
  if (!checkPWAStatusOnLoad()) return;
  
  if (/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) {
    const iosHint = document.createElement('div');
    iosHint.id = 'ios-install-hint';
    iosHint.dir = 'rtl';
    iosHint.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;      transform: translateX(-50%);
      background: var(--card-bg);
      border: 2px solid var(--accent-color);
      border-radius: 16px;
      padding: 15px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      z-index: 9999;
      font-family: 'Cairo', sans-serif;
      max-width: 90%;
      animation: slideUp 0.3s ease;
    `;
    
    iosHint.innerHTML = `
      <div style="font-size: 1.5rem;">🍎</div>
      <div style="flex: 1; text-align: right;">
        <div style="font-weight: bold; color: var(--text-primary);">
          تثبيت على آيفون؟
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">
          اضغط <i class="fas fa-share-square" style="color:var(--accent-color)"></i> ثم "إضافة للشاشة الرئيسية"
        </div>
      </div>
      <button id="ios-hint-close" style="
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        padding: 6px 14px;
        border-radius: 16px;
        cursor: pointer;
        font-size: 0.85rem;
      ">✕</button>
    `;
    
    document.body.appendChild(iosHint);
    
    document.getElementById('ios-hint-close').addEventListener('click', () => {
      iosHint.remove();
      localStorage.setItem('pwa_install_dismissed', 'true');
    });
  }
}

// ✅ التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // ✅ تسجيل Service Worker (مع المسار الصحيح لـ GitHub Pages)
  if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
    navigator.serviceWorker.register('/MathLinguistic/sw.js')      .then(reg => console.log('✅ SW registered:', reg.scope))
      .catch(err => console.error('❌ SW registration failed:', err));
  }
  
  // ✅ بدء الفحص الدوري
  startPWAStatusCheck();
  
  // ✅ فحص iOS
  setTimeout(showIOSInstallHint, 4000);
});

// ✅ فحص إضافي عند رؤية الصفحة
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isAppInstalled() && installBanner) {
    hideInstallBanner();
  }
});

// =============== //
// 🎉 رسالة ترحيب ذكية (تظهر مرة واحدة فقط)
// =============== //

function showWelcomeMessage() {
  const hasSeenWelcome = localStorage.getItem('mathlinguistic_welcome_seen');
  if (!hasSeenWelcome && !isAppInstalled()) {
    setTimeout(() => {
      if (typeof showToast === 'function') {
        showToast('🎉 أهلاً بك! استخدم زر 📥 في الأسفل لتثبيت التطبيق والوصول السريع', 'info', 5000);
      }
      localStorage.setItem('mathlinguistic_welcome_seen', 'true');
    }, 2000);
  }
}

// ✅ تفعيل رسالة الترحيب
document.addEventListener('DOMContentLoaded', () => {
  showWelcomeMessage();
});

// ✅ دالة Toast بسيطة (إذا لم تكن موجودة في مكان آخر)
function showToast(message, type = 'info', duration = 3000) {
  // إزالة أي Toast سابق
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close">&times;</button>  `;
  
  // تنسيقات مدمجة
  toast.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#2ecc71' : '#3498db'};
    color: white; padding: 12px 20px; border-radius: 8px;
    z-index: 10000; font-family: Cairo, sans-serif; font-size: 0.9rem;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideDown 0.3s ease;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown { from { top: -50px; opacity: 0; } to { top: 20px; opacity: 1; } }
    .toast-close { background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; margin-right: 5px; }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(toast);
  
  // إغلاق يدوي
  toast.querySelector('.toast-close')?.addEventListener('click', () => toast.remove());
  
  // إخفاء تلقائي
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ✅ جعل الدوال متاحة عالمياً
window.loadHomePage = loadHomePage;
window.loadStaticPage = loadStaticPage;
window.cleanupCurrentPage = cleanupCurrentPage;
window.showToast = showToast;
