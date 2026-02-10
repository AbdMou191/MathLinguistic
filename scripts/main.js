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
