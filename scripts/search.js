/**
 * 🔍 نظام البحث الذكي الثابت - MathLinguistic
 * الإصدار: 8.0 (سريع جداً، بدون وميض، متوافق 100% مع main.js)
 */

(function() {
  'use strict';

  // 📚 فهرس ثابت ودقيق لجميع صفحات وأقسام المنصة المقبولة في loadContent
  var staticSearchIndex = [
    { title: "الرئيسية", description: "الصفحة الرئيسية لمنصة MathLinguistic", target: "home", path: "الرئيسية", icon: "fa-home", type: "page" },
    { title: "الإنجازات والأوسمة", description: "عرض إنجازاتك والنقاط التي جمعتها في المنصة", target: "achievements", path: "الرئيسية > الإنجازات", icon: "fa-trophy", type: "achievement" },
    
    // دروس وقواعد الحساب الذهني
    { title: "دروس المستوى المبتدئ", description: "شرح مبسط لقواعد وتطبيقات الحساب الذهني للمبتدئين", target: "learn-beginner", path: "الدروس > دروس ابتدائية", icon: "fa-book-open", type: "lesson" },
    { title: "دروس المستوى المتوسط", description: "تطوير مهارات الحساب السريع والعمليات المتوسطة", target: "learn-intermediate", path: "الدروس > دروس متوسطة", icon: "fa-book-open", type: "lesson" },
    { title: "دروس المستوى المتقدم", description: "تقنيات متقدمة في الحساب الذهني والسوروبان", target: "learn-advanced", path: "الدروس > دروس متقدمة", icon: "fa-book-open", type: "lesson" },
    { title: "دروس المستوى المعقد", description: "تحديات ومسائل حسابية معقدة وشاملة", target: "learn-complex", path: "الدروس > دروس معقدة", icon: "fa-book-open", type: "lesson" },
    
    // التمارين التفاعلية للمستويات
    { title: "المستوى المبتدئ (تمارين)", description: "تدريبات تفاعلية لتثبيت أساسيات الحساب المبتدئ", target: "beginner", path: "التمارين > المستوى المبتدئ", icon: "fa-star", type: "exercise" },
    { title: "المستوى المتوسط (تمارين)", description: "تدريبات متدرجة لسرعة ودقة الحساب المتوسط", target: "intermediate", path: "التمارين > المستوى المتوسط", icon: "fa-chart-line", type: "exercise" },
    { title: "المستوى المتقدم (تمارين)", description: "تمارين متقدمة لتنشيط الذاكرة وسرعة البديهة", target: "advanced", path: "التمارين > المستوى المتقدم", icon: "fa-brain", type: "exercise" },
    { title: "المستوى المعقد (تمارين)", description: "أقوى التحديات والمسائل الرياضية المعقدة", target: "complex", path: "التمارين > المستوى المعقد", icon: "fa-infinity", type: "exercise" },

    // الألعاب والأدوات التعليمية
    { title: "اختبار السرعة (Speed Test)", description: "اختبر سرعتك في حل العمليات الحسابية ضمن وقت محدد", target: "speed-test", path: "الألعاب > اختبار السرعة", icon: "fa-stopwatch", type: "game" },
    { title: "الحساب الذهني (Mental Math)", description: "تدريب تفاعلي لتنشيط العقل بالحساب السريع", target: "mental-math", path: "الألعاب > الحساب الذهني", icon: "fa-calculator", type: "game" },
    { title: "العمليات المختلطة (Mixed Ops)", description: "تحدي العمليات الحسابية المتنوعة معاً", target: "mixed-ops", path: "الألعاب > العمليات المختلطة", icon: "fa-random", type: "game" },
    { title: "لعبة Crossmath", description: "التقاطع الرياضي والألغاز الرقمية الممتعة", target: "crossmath", path: "الألعاب > Crossmath", icon: "fa-puzzle-piece", type: "game" },
    { title: "لعبة Sliding Puzzle", description: "لعبة الأرقام المنزلقة وترتيب الخلايا الذهنية", target: "sliding_puzzle", path: "الألعاب > الألغاز المنزلقة", icon: "fa-sliders", type: "game" },
    { title: "الآلة الحاسبة الذكية", description: "أداة مساعدة لحساب العمليات الرياضية بسرعة", target: "calculator", path: "الأدوات > الآلة الحاسبة", icon: "fa-calculator", type: "tool" }
  ];

  var searchState = {
    isOpen: false,
    elements: null,
    isInitialized: false,
    searchTimer: null
  };

  function initSearch() {
    if (searchState.isInitialized) return;

    var els = {
      toggle: document.getElementById('search-toggle'),
      overlay: document.getElementById('search-overlay'),
      input: document.getElementById('search-input'),
      close: document.getElementById('search-close'),
      results: document.getElementById('search-results'),
      noResults: document.getElementById('search-no-results')
    };

    if (!els.toggle || !els.overlay || !els.input) {
      setTimeout(initSearch, 400);
      return;
    }

    searchState.elements = els;
    searchState.isInitialized = true;

    // ربط الأحداث الأساسية
    els.toggle.addEventListener('click', function(e) {
      e.preventDefault();
      openSearch();
    });

    if (els.close) {
      els.close.addEventListener('click', function(e) {
        e.preventDefault();
        closeSearch();
      });
    }

    els.overlay.addEventListener('click', function(e) {
      if (e.target === els.overlay) closeSearch();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && searchState.isOpen) closeSearch();
    });

    // ⚡ معالجة الإدخال الفوري في الذاكرة (بدون وميض وبدون طلبات شبكة بطيئة)
    els.input.addEventListener('input', function(e) {
      var query = e.target.value.trim().toLowerCase();

      if (searchState.searchTimer) clearTimeout(searchState.searchTimer);

      if (!query) {
        clearResults();
        return;
      }

      searchState.searchTimer = setTimeout(function() {
        executeSearch(query);
      }, 100);
    });
  }

  function openSearch() {
    var els = searchState.elements;
    if (!els) return;

    els.overlay.style.display = 'flex';
    setTimeout(function() {
      els.overlay.classList.add('active');
      els.overlay.setAttribute('aria-hidden', 'false');
    }, 10);

    searchState.isOpen = true;
    setTimeout(function() { if (els.input) els.input.focus(); }, 100);
    document.body.style.overflow = 'hidden';
  }

  function closeSearch() {
    var els = searchState.elements;
    if (!els) return;

    els.overlay.classList.remove('active');
    els.overlay.setAttribute('aria-hidden', 'true');
    setTimeout(function() { els.overlay.style.display = 'none'; }, 250);

    clearResults();
    if (els.input) els.input.value = '';
    document.body.style.overflow = '';
    searchState.isOpen = false;
  }

  function clearResults() {
    var els = searchState.elements;
    if (!els) return;
    if (els.results) els.results.innerHTML = '';
    if (els.noResults) els.noResults.hidden = true;
  }

  function executeSearch(query) {
    var els = searchState.elements;
    if (!els || !els.results) return;

    // فلترة سريعة ومستقرة جداً من الفهرس الثابت المحفوظ في الذاكرة
    var matches = staticSearchIndex.filter(function(item) {
      var title = (item.title || '').toLowerCase();
      var desc = (item.description || '').toLowerCase();
      var path = (item.path || '').toLowerCase();
      return title.indexOf(query) !== -1 || desc.indexOf(query) !== -1 || path.indexOf(query) !== -1;
    });

    if (matches.length === 0) {
      if (els.noResults) {
        els.noResults.hidden = false;
        els.noResults.textContent = '❌ لا توجد نتائج مطابقة لـ "' + query + '"';
      }
      els.results.innerHTML = '';
    } else {
      if (els.noResults) els.noResults.hidden = true;

      var fragment = document.createDocumentFragment();

      matches.forEach(function(item) {
        var div = document.createElement('div');
        div.className = 'search-result-item';
        div.style.cssText = 'padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.06); cursor: pointer; display: flex; align-items: center; gap: 12px; background: var(--card-bg, #ffffff);';

        div.innerHTML = `
          <div style="width: 38px; height: 38px; border-radius: 8px; background: var(--accent-color, #3498db); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="fas ${item.icon}"></i>
          </div>
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: bold; font-size: 0.95rem; color: var(--text-primary, #333);">${escapeHtml(item.title)}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary, #777); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(item.path)}</div>
          </div>
        `;

        // عند النقر، يتم استدعاء loadContent بالـ target الصحيح 100% والمقبول في main.js
        div.addEventListener('click', function(e) {
          e.preventDefault();
          closeSearch();

          console.log('🚀 الانتقال المباشر إلى:', item.target);
          if (typeof window.loadContent === 'function') {
            window.loadContent(item.target);
          }
        });

        fragment.appendChild(div);
      });

      els.results.innerHTML = '';
      els.results.appendChild(fragment);
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
