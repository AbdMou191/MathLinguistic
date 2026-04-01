// ==========================================
// المتغيرات العامة
// ==========================================

const mainContent = document.getElementById('main-content');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar-menu');
const themeToggle = document.getElementById('theme-toggle');
const searchToggle = document.getElementById('search-toggle');
const searchOverlay = document.getElementById('search-overlay');
const searchClose = document.getElementById('search-close');
const searchInput = document.getElementById('search-input');
// ✅ متغيرات نتائج البحث (جديدة - كانت ناقصة)
const searchResults = document.getElementById('search-results');
const searchNoResults = document.getElementById('search-no-results');

let currentSection = 'home';
// متغيرات مساعدة لصفحة الرئيسية
let isOnHomePage = false;
let hasPushedGameEntry = false;
let lastGameTarget = null;
let isNavigationLocked = false; // لمنع التنقل المتكرر
// 🔍 متغير تأخير البحث (لتحسين الأداء)
let searchDebounceTimer = null;

// ==========================================
// 📱 متغيرات تثبيت PWA (جديدة)
// ==========================================
let deferredPrompt = null;
let installButton = null;
const INSTALL_DISMISSED_KEY = 'mathlinguistic_install_dismissed';
const INSTALL_SHOW_DELAY = 5000; // إظهار الزر بعد 5 ثواني

// ==========================================
// 🔼 زر العودة للأعلى
// ==========================================

const backToTopBtn = document.getElementById('back-to-top');
let scrollThreshold = 300;

function calculateScrollThreshold() {
  const screenHeight = window.innerHeight;
  scrollThreshold = Math.max(300, Math.floor(screenHeight * 0.5));
}

function handleBackToTopScroll() {
  if (!backToTopBtn) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  if (scrollTop > scrollThreshold) {
    backToTopBtn.classList.add('visible');  } else {
    backToTopBtn.classList.remove('visible');
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initBackToTop() {
  if (!backToTopBtn) return;
  calculateScrollThreshold();
  window.addEventListener('scroll', handleBackToTopScroll, { passive: true });
  backToTopBtn.addEventListener('click', scrollToTop);
  window.addEventListener('resize', () => {
    calculateScrollThreshold();
    handleBackToTopScroll();
  }, { passive: true });
  handleBackToTopScroll();
  console.log('✅ زر العودة للأعلى مهيأ');
}

// =======================================
// إغلاق القائمة عند النقر خارجها
// =======================================

document.addEventListener('click', (e) => {
  if (!sidebar || !sidebar.classList.contains('open')) return;
  if (!(e.target instanceof Node)) return;
  
  const isClickInsideSidebar = sidebar.contains(e.target);
  const isClickOnMenuToggle = menuToggle && (
    menuToggle === e.target || menuToggle.contains(e.target)
  );
  
  if (!isClickInsideSidebar && !isClickOnMenuToggle) {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
  }
});

// ==========================================
// 🔄 دالة تحميل المحتوى - النسخة المعدلة
// ==========================================
async function loadContent(target, usePushState = true, targetIndex = null) {
  if (isNavigationLocked) {
    console.log('⏳ الانتظار حتى ينتهي التحميل السابق...');
    return;
  }
  isNavigationLocked = true;  
  console.log(`📄 تحميل: ${target} ${targetIndex !== null ? '(مع عنصر #' + targetIndex + ')' : ''}`);
  cleanupCurrentPage();
  currentSection = target;
  
  if (sidebar?.classList.contains('open')) {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
  }
  
  try {
    let scriptPath = '';
    let dataPath = '';
    
    if (target === 'home') {
      const response = await fetch('home-content.html');
      if (!response.ok) throw new Error('فشل تحميل الرئيسية');
      const html = await response.text();
      if (mainContent) mainContent.innerHTML = html;
      attachEventListeners();
      history.replaceState({ page: 'home' }, '', location.pathname);
      if (typeof updatePageMeta === 'function') updatePageMeta('home');
      isNavigationLocked = false;
      return;
    }
    
    if (target.startsWith('learn-')) {
      const level = target.replace('learn-', '');
      scriptPath = `scripts/lessons/${level}-lesson.js`;
      dataPath = `data/lessons/${level}.json`;
    }
    else if (['beginner', 'intermediate', 'advanced', 'complex'].includes(target)) {
      scriptPath = `scripts/levels/${target}.js`;
      dataPath = `data/levels/${target}.json`;
    }
    else if (['speed-test', 'mental-math', 'mixed-ops', 'loudoukou', 'crossmath', 'calculator', 'sliding_puzzle'].includes(target)) {
      scriptPath = `scripts/levels/${target}.js`;
      dataPath = `data/levels/${target}.json`;
    }
    else if (target === 'achievements') {
      scriptPath = 'scripts/achievements.js';
      dataPath = 'data/achievements.json';
    }
    else if (['about', 'contact', 'terms', 'privacy'].includes(target)) {
      scriptPath = `const-page/${target}.html`;
      const response = await fetch(scriptPath);
      if (!response.ok) throw new Error(`فشل تحميل ${target}`);
      const html = await response.text();
      if (mainContent) mainContent.innerHTML = html;
      history.replaceState({ page: target, type: 'static' }, '', `#${target}`);      isNavigationLocked = false;
      return;
    }
    else {
      throw new Error('صفحة غير معروفة: ' + target);
    }
    
    console.log('⏳ تحميل السكريبت:', scriptPath);
    await loadScript(scriptPath);
    
    let jsonData = null;
    if (dataPath) {
      try {
        const dataResponse = await fetch(dataPath);
        if (dataResponse.ok) jsonData = await dataResponse.json();
      } catch (e) { console.warn('⚠️ لم يتم تحميل البيانات:', dataPath); }
    }
    
    const functionName = getLoadFunctionName(target);
    console.log('🎯 استدعاء:', functionName);
    
    if (typeof window[functionName] === 'function') {
      try {
        if (jsonData && targetIndex !== null && window[functionName].length >= 2) {
          await window[functionName](jsonData, targetIndex);
        } else if (jsonData) {
          await window[functionName](jsonData);
        } else if (targetIndex !== null && window[functionName].length >= 2) {
          await window[functionName](null, targetIndex);
        } else {
          await window[functionName]();
        }
      } catch (callErr) {
        console.warn('⚠️ محاولة استدعاء بديلة:', callErr);
        await window[functionName]();
      }
    } else {
      throw new Error(`الدالة ${functionName} غير موجودة`);
    }
    
    if (usePushState) {
      history.pushState({ page: target, index: targetIndex }, '', `#${target}`);
    } else {
      history.replaceState({ page: target, index: targetIndex }, '', `#${target}`);
    }
    
    isNavigationLocked = false;
    
  } catch (error) {
    console.error('❌ خطأ في loadContent:', error);    if (mainContent) {
      mainContent.innerHTML = `
        <div style="text-align:center; padding:40px;">
          <h2>⚠️ خطأ</h2>
          <p>${error.message}</p>
          <button onclick="loadContent('home')" class="gc-btn gc-btn-primary">🏠 الرئيسية</button>
        </div>`;
    }
    isNavigationLocked = false;
  }
}

// ==========================================
// دالة تحميل السكريبت - نسخة محسّنة تمنع التعارض
// ==========================================
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.remove();
      console.log('🔄 إزالة السكريبت القديم:', src);
    }
    
    const script = document.createElement('script');
    script.src = src + '?v=' + Date.now();
    script.onload = () => {
      console.log('✅ تم تحميل:', src);
      resolve();
    };
    script.onerror = () => {
      console.error('❌ فشل تحميل:', src);
      reject(new Error(`فشل تحميل: ${src}`));
    };
    document.head.appendChild(script);
  });
}

// ==========================================
// دالة تحديد اسم الدالة - تدعم كلا الصيغتين
// ==========================================
function getLoadFunctionName(target) {
  if (target.startsWith('learn-')) {
    const level = target.replace('learn-', '');
    const baseName = 'load' + level.charAt(0).toUpperCase() + level.slice(1) + 'Lesson';
    
    if (typeof window[baseName] === 'function') return baseName;
    if (typeof window[baseName + 'Page'] === 'function') return baseName + 'Page';
    
    throw new Error(`لا توجد دالة تحميل للمستوى: ${target}`);
  }  
  if (target === 'sliding_puzzle') return 'loadSlidingPuzzlePage';
  if (target === 'speed-test') return 'loadSpeedTestPage';
  if (target === 'mental-math') return 'loadMentalMathPage';
  if (target === 'mixed-ops') return 'loadMixedOpsPage';
  
  if (['beginner', 'intermediate', 'advanced', 'complex'].includes(target)) {
    const pageFunc = 'load' + target.charAt(0).toUpperCase() + target.slice(1) + 'Page';
    if (typeof window[pageFunc] === 'function') return pageFunc;
  }
  
  const parts = target.split('-');
  const capitalized = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  return 'load' + capitalized + 'Page';
}

// ==========================================
// ⬅️ معالج زر الرجوع
// ==========================================
let lastBackPress = 0;

window.addEventListener('popstate', (event) => {
  console.log('⬅️ حدث رجوع:', event.state);
  
  if (currentSection === 'home' || !currentSection) {
    if (navigator.app && typeof navigator.app.exitApp === 'function') {
      if (Date.now() - lastBackPress < 2000) {
        navigator.app.exitApp();
      } else {
        lastBackPress = Date.now();
        if (typeof GameCore !== 'undefined') {
          GameCore.toast('اضغط مرة أخرى للخروج', 'info', 2000);
        } else {
          const toast = document.createElement('div');
          toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 20px;border-radius:20px;z-index:9999;font-family:Cairo;';
          toast.textContent = 'اضغط مرة أخرى للخروج';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 2000);
        }
        history.pushState({ page: 'home' }, '', location.pathname);
      }
    } else {
      history.pushState({ page: 'home' }, '', location.pathname);
    }
    return;
  }
  
  console.log('🏠 عودة للرئيسية من صفحة داخلية');
  loadContent('home', false);
});
// ==========================================
// 🔍 دوال البحث الذكي
// ==========================================

window.handleSearchInput = function() {
  var query = searchInput ? searchInput.value.trim() : '';
  
  if (!query || query.length < 2) {
    if (searchResults) searchResults.innerHTML = '';
    if (searchNoResults) searchNoResults.hidden = true;
    return;
  }
  
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(function() {
    if (!window.SearchIndexer || !window.SearchIndexer.isBuilt) {
      if (searchResults) {
        searchResults.innerHTML = '<p style="text-align:center;padding:20px;color:var(--text-muted)">جاري بناء الفهرس...</p>';
      }
      return;
    }
    
    var results = window.SearchIndexer.search(query);
    
    if (results.length === 0) {
      if (searchResults) searchResults.innerHTML = '';
      if (searchNoResults) searchNoResults.hidden = false;
    } else {
      if (searchNoResults) searchNoResults.hidden = true;
      if (searchResults) {
        searchResults.innerHTML = results.map(function(item) {
          return '<div class="search-result-item" onclick="window.openSearchResult(\'' + item.id + '\')">' +
            '<div class="search-result-icon"><i class="fas ' + (item.icon || 'fa-circle') + '"></i></div>' +
            '<div class="search-result-content">' +
            '<div class="search-result-title">' + item.title + '</div>' +
            '<div class="search-result-desc">' + item.path + ' • ' + item.category + '</div>' +
            '</div></div>';
        }).join('');
      }
    }
  }, 300);
};

window.openSearchResult = function(itemId) {
  var item = window.SearchIndexer && window.SearchIndexer.index ? 
    window.SearchIndexer.index.find(function(i) { return i.id === itemId; }) : null;
  if (item) {
    window.SearchIndexer.openResult(item);
    window.closeSearch();  }
};

window.refreshSearchUI = function() {
  if (searchInput && searchInput.value.trim().length >= 2) {
    window.handleSearchInput();
  }
};

// ==========================================
// 📱 دوال تثبيت التطبيق (PWA Install)
// ==========================================

function initPWAInstall() {
  console.log('📱 تهيئة نظام تثبيت PWA...');
  
  createInstallButton();
  
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('🎯 حدث beforeinstallprompt تم التقاطه');
    e.preventDefault();
    deferredPrompt = e;
    
    const isDismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
    
    if (!isDismissed && installButton) {
      setTimeout(() => {
        showInstallButton();
      }, INSTALL_SHOW_DELAY);
    }
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('✅ تم تثبيت التطبيق بنجاح!');
    hideInstallButton();
    deferredPrompt = null;
    localStorage.removeItem(INSTALL_DISMISSED_KEY);
    
    if (typeof GameCore !== 'undefined' && GameCore.toast) {
      GameCore.toast('🎉 شكراً لتثبيت MathLinguistic!', 'success', 3000);
    }
  });
  
  checkInstallStatus();
}

function createInstallButton() {
  installButton = document.createElement('div');
  installButton.id = 'pwa-install-banner';
  installButton.className = 'pwa-install-banner';  installButton.innerHTML = `
    <div class="install-banner-content">
      <div class="install-banner-icon">
        <i class="fas fa-download"></i>
      </div>
      <div class="install-banner-text">
        <h3>ثبّت MathLinguistic</h3>
        <p>احصل على تجربة أفضل واعمل بدون إنترنت</p>
      </div>
      <div class="install-banner-actions">
        <button id="install-app-btn" class="install-btn-primary">
          <i class="fas fa-plus-circle"></i> تثبيت
        </button>
        <button id="dismiss-install-btn" class="install-btn-secondary">
          <i class="fas fa-times"></i> لاحقاً
        </button>
      </div>
    </div>
  `;
  
  installButton.style.display = 'none';
  
  addInstallButtonStyles();
  
  document.body.appendChild(installButton);
  
  document.getElementById('install-app-btn')?.addEventListener('click', handleInstallClick);
  document.getElementById('dismiss-install-btn')?.addEventListener('click', handleDismissClick);
}

function addInstallButtonStyles() {
  const style = document.createElement('style');
  style.id = 'pwa-install-styles';
  style.textContent = `
    .pwa-install-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, var(--primary-color, #3498db) 0%, var(--secondary-color, #2ecc71) 100%);
      color: white;
      padding: 15px 20px;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      transform: translateY(100%);
      transition: transform 0.3s ease;
      border-top-left-radius: 15px;
      border-top-right-radius: 15px;
    }
        .pwa-install-banner.show {
      transform: translateY(0);
    }
    
    .install-banner-content {
      max-width: 600px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }
    
    .install-banner-icon {
      width: 50px;
      height: 50px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }
    
    .install-banner-text {
      flex: 1;
      min-width: 150px;
    }
    
    .install-banner-text h3 {
      margin: 0 0 5px 0;
      font-size: 16px;
      font-weight: 700;
    }
    
    .install-banner-text p {
      margin: 0;
      font-size: 13px;
      opacity: 0.9;
    }
    
    .install-banner-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
    }
    
    .install-btn-primary,
    .install-btn-secondary {      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-family: 'Cairo', sans-serif;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .install-btn-primary {
      background: white;
      color: var(--primary-color, #3498db);
    }
    
    .install-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    
    .install-btn-secondary {
      background: rgba(255,255,255,0.2);
      color: white;
    }
    
    .install-btn-secondary:hover {
      background: rgba(255,255,255,0.3);
    }
    
    @media (max-width: 600px) {
      .install-banner-content {
        flex-direction: column;
        text-align: center;
      }
      
      .install-banner-actions {
        width: 100%;
        justify-content: center;
      }
    }
    
    [data-theme="dark"] .pwa-install-banner {
      background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    }
  `;
  
  document.head.appendChild(style);}

function showInstallButton() {
  if (installButton) {
    installButton.style.display = 'block';
    setTimeout(() => {
      installButton.classList.add('show');
    }, 100);
    console.log('📱 تم إظهار زر التثبيت');
  }
}

function hideInstallButton() {
  if (installButton) {
    installButton.classList.remove('show');
    setTimeout(() => {
      installButton.style.display = 'none';
    }, 300);
    console.log('📱 تم إخفاء زر التثبيت');
  }
}

async function handleInstallClick() {
  console.log('🔽 المستخدم ضغط على زر التثبيت');
  
  if (!deferredPrompt) {
    console.warn('⚠️ لا يوجد prompt متاح للتثبيت');
    showManualInstallInstructions();
    return;
  }
  
  deferredPrompt.prompt();
  
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`📊 نتيجة التثبيت: ${outcome}`);
  
  if (outcome === 'accepted') {
    console.log('✅ المستخدم قبل التثبيت');
    hideInstallButton();
  }
  
  deferredPrompt = null;
}

function handleDismissClick() {
  console.log('❌ المستخدم أغلق زر التثبيت');
  hideInstallButton();
  
  localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
    setTimeout(() => {
    localStorage.removeItem(INSTALL_DISMISSED_KEY);
  }, 7 * 24 * 60 * 60 * 1000);
}

function showManualInstallInstructions() {
  const instructions = `
    <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
                background:white;color:#333;padding:30px;border-radius:15px;
                box-shadow:0 10px 40px rgba(0,0,0,0.3);z-index:10001;
                max-width:90%;width:400px;text-align:center;font-family:'Cairo',sans-serif;">
      <h3 style="margin:0 0 15px 0;color:#3498db;">📱 تثبيت التطبيق</h3>
      <p style="margin:0 0 20px 0;line-height:1.6;">
        لتثبيت التطبيق:<br>
        1. اضغط على قائمة المتصفح (⋮ أو 📤)<br>
        2. اختر "إضافة إلى الشاشة الرئيسية"<br>
        3. اضغط "إضافة"
      </p>
      <button onclick="this.closest('div').remove()" 
              style="padding:10px 30px;background:#3498db;color:white;border:none;
                     border-radius:8px;cursor:pointer;font-family:'Cairo',sans-serif;">
        فهمت
      </button>
    </div>
    <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);
                z-index:10000;" onclick="this.remove()"></div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', instructions);
}

function checkInstallStatus() {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('✅ التطبيق يعمل كـ Standalone (مثبت)');
    return true;
  }
  
  if (navigator.standalone === true) {
    console.log('✅ التطبيق مثبت (iOS)');
    return true;
  }
  
  console.log('⚠️ التطبيق غير مثبت - يعمل في المتصفح');
  return false;
}

window.isAppInstalled = checkInstallStatus;

// ==========================================
// التهيئة الرئيسية// ==========================================

(function init() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
  
  function onReady() {
    console.log('🚀 بدء التطبيق...');
    
    initTheme();
    initBackToTop();
    initPWAInstall(); // ✅ استدعاء دالة تثبيت PWA
    
    // ✅ تسجيل Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/MathLinguistic/sw.js')
        .then(reg => {
          console.log('✅ SW مسجل:', reg.scope);
          reg.addEventListener('updatefound', () => {
            console.log('🔄 تحديث جديد متوفر!');
            if (typeof GameCore !== 'undefined' && GameCore.toast) {
              GameCore.toast('🔄 يوجد تحديث جديد للتطبيق', 'info', 3000);
            }
          });
        })
        .catch(err => console.error('❌ خطأ في تسجيل SW:', err));
    }
    
    menuToggle?.addEventListener('click', toggleSidebar);
    themeToggle?.addEventListener('click', toggleTheme);
    searchToggle?.addEventListener('click', openSearch);
    searchClose?.addEventListener('click', closeSearch);
    
    if (searchOverlay) {
      searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) closeSearch();
      });
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSearch();
    });
    
    if (searchInput) {
      searchInput.addEventListener('input', window.handleSearchInput);
      searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {          e.preventDefault();
          window.closeSearch();
        }
      });
    }
    
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const target = item.dataset.target;
        if (target) loadContent(target, true);
      });
    });
    
    document.querySelectorAll('[data-static-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.staticPage;
        if (page) loadContent(page, true);
      });
    });
    
    history.replaceState({ page: 'home' }, '', location.pathname);
    
    loadContent('home', false);
    
    function initDeepLinkHandler() {
      const hash = location.hash;
      const params = new URLSearchParams(location.search);
      
      if (hash && hash !== '#home') {
        const target = hash.replace('#', '').split('?')[0];
        const sectionId = params.get('section');
        const paragraphId = location.hash.split('#')[2];
        const lessonParam = params.get('lesson');
        
        setTimeout(() => {
          if (lessonParam && target.startsWith('learn-')) {
            const lessonIdx = parseInt(lessonParam);
            if (!isNaN(lessonIdx)) {
              loadContent(target, false, lessonIdx);
              return;
            }
          }
          
          if (sectionId && document.getElementById(sectionId)) {
            document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth', block: 'center' });
            const el = document.getElementById(sectionId);
            el.style.animation = 'highlight 1.5s ease';
          }
          if (paragraphId && document.getElementById(paragraphId)) {
            document.getElementById(paragraphId).scrollIntoView({ behavior: 'smooth', block: 'center' });            const el = document.getElementById(paragraphId);
            el.style.animation = 'highlight 1.5s ease';
          }
        }, 600);
      }
    }
    
    initDeepLinkHandler();
  }
})();

// ==========================================
// دوال مساعدة
// ==========================================

function toggleSidebar() {
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  const isOpen = sidebar.classList.contains('open');
  sidebar.setAttribute('aria-hidden', String(!isOpen));
}

function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.body.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icon = themeToggle?.querySelector('i');
  if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function openSearch() {
  if (searchOverlay) {
    searchOverlay.classList.add('active');
    searchOverlay.setAttribute('aria-hidden', 'false');
  }
  searchInput?.focus();
}

function closeSearch() {  if (searchOverlay) {
    searchOverlay.classList.remove('active');
    searchOverlay.setAttribute('aria-hidden', 'true');
  }
  if (searchInput) searchInput.value = '';
}

function attachEventListeners() {
  document.querySelectorAll('[data-target]').forEach(el => {
    el.onclick = () => {
      const target = el.dataset.target;
      if (target) loadContent(target, true);
    };
  });
  
  document.querySelectorAll('[data-static-page]').forEach(btn => {
    btn.onclick = () => {
      const page = btn.dataset.staticPage;
      if (page) loadContent(page, true);
    };
  });
}

// ==========================================
// ⚡ تخزين المحتوى الرئيسي
// ==========================================
var HOME_CONTENT_CACHED = null;

(function preloadHomeContent() {
  console.log('⚡ تحميل مسبق للرئيسية...');
  fetch('home-content.html')
    .then(function(response) {
      if (response.ok) return response.text();
      throw new Error('فشل التحميل');
    })
    .then(function(html) {
      HOME_CONTENT_CACHED = html;
      console.log('✅ الرئيسية مخزنة (' + html.length + ' bytes)');
    })
    .catch(function(error) {
      console.error('❌ فشل الكاش:', error);
    });
})();

// ==========================================
// 🏠 دالة العودة للرئيسية
// ==========================================
window.loadHomePage = function() {
  console.log("🏠 العودة للرئيسية (مباشرة)");
  currentSection = 'home';  cleanupCurrentPage();
  history.replaceState({ page: 'home' }, '', location.pathname);
  
  fetch('home-content.html')
    .then(res => {
      if (!res.ok) throw new Error('Network error');
      return res.text();
    })
    .then(html => {
      if (mainContent) {
        mainContent.innerHTML = html;
        attachEventListeners();
        window.scrollTo({top: 0, behavior: 'smooth'});
        if (typeof updatePageMeta === 'function') updatePageMeta('home');
      }
    })
    .catch(err => {
      console.error('❌ Error loading home:', err);
      if(mainContent) {
        mainContent.innerHTML = `
          <div style="text-align:center;padding:40px">
            <h3>⚠️ خطأ في التحميل</h3>
            <button onclick="location.reload()" class="gc-btn gc-btn-primary" style="margin-top:15px">🔄 إعادة المحاولة</button>
          </div>`;
      }
    });
};

// ==========================================
// 🎮 دالة تحميل الألعاب
// ==========================================
window.loadGame = function(gameId) {
  console.log('🎮 loadGame:', gameId);
  if (window.GameCore && typeof window.GameCore.cleanupAll === 'function') {
    window.GameCore.cleanupAll();
  }
  cleanupCurrentPage();
  if (sidebar) {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
  }
  closeSearch();
  loadContent(gameId, true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ==========================================
// 🧹 دالة التنظيف الشاملة
// ==========================================
function cleanupCurrentPage() {  console.log("🧹 جاري تنظيف الصفحة...");
  
  ['mentalMathInterval', 'mixedOpsInterval', 'speedTestInterval'].forEach(key => {
    if (window[key]) {
      clearInterval(window[key]);
      window[key] = null;
    }
  });
  
  ['destroyMentalMath', 'destroyMixedOps', 'destroySpeedTest'].forEach(fnName => {
    if (typeof window[fnName] === 'function') {
      try {
        window[fnName]();
        console.log(`✅ تم استدعاء ${fnName}`);
      } catch (e) {
        console.warn(`⚠️ خطأ في ${fnName}:`, e);
      }
    }
  });
  
  if (window._ResourceManager && typeof window._ResourceManager.cleanupAll === 'function') {
    try {
      window._ResourceManager.cleanupAll();
      console.log('✅ تم تنظيف _ResourceManager');
    } catch (e) {
      console.warn('⚠️ خطأ في تنظيف _ResourceManager:', e);
    }
  }
  
  ['speedTestData', 'mentalMathData', 'mixedOpsData'].forEach(key => {
    window[key] = null;
  });
  
  if (mainContent) {
    mainContent.innerHTML = '';
    console.log('✅ تم مسح main-content');
  }
  
  console.log("✅ اكتمل التنظيف بنجاح");
}

// ==========================================
// 🔄 توليد أرقام صفحات ذكية
// ==========================================
function generateSmartPagination(current, total, maxVisible = 4) {
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 4) {      pages.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 3) {
      pages.push(1, '...', total-3, total-2, total-1, total);
    } else {
      pages.push(1, '...', current-1, current, current+1, '...', total);
    }
  }
  return pages;
}

// ==========================================
// تصدير الدوال
// ==========================================
window.loadContent = loadContent;
window.cleanupCurrentPage = cleanupCurrentPage;
window.toggleTheme = toggleTheme;
window.toggleSidebar = toggleSidebar;