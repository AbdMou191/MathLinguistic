/**
 * 🔍 محرك البحث الذكي المعماري - MathLinguistic v9.0
 * تصميم هندسي نقي: بدون وميض، بدون أخطاء، أداء فوري في الذاكرة.
 */

(function() {
  'use strict';

  // 📂 قاعدة بيانات البحث المحلية الثابتة (تحتوي على كل مسارات وأقسام المنصة الحقيقية)
  var appMasterIndex = [
    // الصفحات العامة والأساسية
    { title: "الرئيسية", keywords: "الرئيسية home 🏠", desc: "الصفحة الرئيسية لمنصة MathLinguistic", target: "home", path: "الرئيسية", icon: "fa-home" },
    { title: "الإنجازات والأوسمة", keywords: "الإنجازات الأوسمة النقاط achievements 🏆", desc: "عرض إنجازاتك والنقاط التي جمعتها", target: "achievements", path: "الرئيسية > الإنجازات", icon: "fa-trophy" },
    
    // دروس وقواعد الحساب الذهني
    { title: "دروس المستوى المبتدئ", keywords: "دروس ابتدائية مبتدئ beginner lessons", desc: "شرح مبسط لقواعد وتطبيقات الحساب الذهني للمبتدئين", target: "learn-beginner", path: "الدروس > دروس ابتدائية", icon: "fa-book-open" },
    { title: "دروس المستوى المتوسط", keywords: "دروس متوسطة intermediate lessons", desc: "تطوير مهارات الحساب السريع والعمليات المتوسطة", target: "learn-intermediate", path: "الدروس > دروس متوسطة", icon: "fa-book-open" },
    { title: "دروس المستوى المتقدم", keywords: "دروس متقدمة advanced lessons تكامل لوبيتال مصفوفات", desc: "تقنيات متقدمة في الحساب الذهني والتكاملات والمعادلات", target: "learn-advanced", path: "الدروس > دروس متقدمة", icon: "fa-book-open" },
    { title: "دروس المستوى المعقد", keywords: "دروس معقدة complex lessons", desc: "تحديات ومسائل حسابية معقدة وشاملة", target: "learn-complex", path: "الدروس > دروس معقدة", icon: "fa-book-open" },
    
    // التمارين التفاعلية
    { title: "المستوى المبتدئ (تمارين)", keywords: "تمارين مبتدئ beginner exercises", desc: "تدريبات تفاعلية لتثبيت أساسيات الحساب المبتدئ", target: "beginner", path: "التمارين > المستوى المبتدئ", icon: "fa-star" },
    { title: "المستوى المتوسط (تمارين)", keywords: "تمارين متوسط intermediate exercises", desc: "تدريبات متدرجة لسرعة ودقة الحساب المتوسط", target: "intermediate", path: "التمارين > المستوى المتوسط", icon: "fa-chart-line" },
    { title: "المستوى المتقدم (تمارين)", keywords: "تمارين متقدم advanced exercises", desc: "تمارين متقدمة لتنشيط الذاكرة وسرعة البديهة", target: "advanced", path: "التمارين > المستوى المتقدم", icon: "fa-brain" },
    { title: "المستوى المعقد (تمارين)", keywords: "تمارين معقد complex exercises", desc: "أقوى التحديات والمسائل الرياضية المعقدة", target: "complex", path: "التمارين > المستوى المعقد", icon: "fa-infinity" },

    // الألعاب والأدوات
    { title: "اختبار السرعة (Speed Test)", keywords: "اختبار السرعة speed test game", desc: "اختبر سرعتك في حل العمليات الحسابية ضمن وقت محدد", target: "speed-test", path: "الألعاب > اختبار السرعة", icon: "fa-stopwatch" },
    { title: "الحساب الذهني (Mental Math)", keywords: "حساب ذهني mental math", desc: "تدريب تفاعلي لتنشيط العقل بالحساب السريع", target: "mental-math", path: "الألعاب > الحساب الذهني", icon: "fa-calculator" },
    { title: "العمليات المختلطة (Mixed Ops)", keywords: "عمليات مختلطة mixed ops", desc: "تحدي العمليات الحسابية المتنوعة معاً", target: "mixed-ops", path: "الألعاب > العمليات المختلطة", icon: "fa-random" },
    { title: "لعبة Crossmath", keywords: "crossmath التقاطع الرياضي ألعاب", desc: "التقاطع الرياضي والألغاز الرقمية الممتعة", target: "crossmath", path: "الألعاب > Crossmath", icon: "fa-puzzle-piece" },
    { title: "لعبة Sliding Puzzle", keywords: "sliding puzzle ألغاز منزلقة أرقام", desc: "لعبة الأرقام المنزلقة وترتيب الخلايا الذهنية", target: "sliding_puzzle", path: "الألعاب > الألغاز المنزلقة", icon: "fa-sliders" },
    { title: "الآلة الحاسبة الذكية", keywords: "حاسبة calculator أداة", desc: "أداة مساعدة لحساب العمليات الرياضية بسرعة", target: "calculator", path: "الأدوات > الآلة الحاسبة", icon: "fa-calculator" },

    // الصفحات الثابتة
    { title: "من نحن", keywords: "من نحن about", desc: "تعرف على منصة MathLinguistic ورؤيتها", target: "about", path: "الصفحات > من نحن", icon: "fa-info-circle" },
    { title: "اتصل بنا", keywords: "اتصل بنا contact تواصل", desc: "تواصل معنا عبر قنوات الاتصال المختلفة", target: "contact", path: "الصفحات > اتصل بنا", icon: "fa-envelope" },
    { title: "شروط الاستخدام", keywords: "شروط الاستخدام terms", desc: "شروط وأحكام استخدام المنصة", target: "terms", path: "الصفحات > شروط الاستخدام", icon: "fa-file-contract" },
    { title: "سياسة الخصوصية", keywords: "سياسة الخصوصية privacy", desc: "سياسة حماية البيانات والخصوصية", target: "privacy", path: "الصفحات > سياسة الخصوصية", icon: "fa-shield-alt" }
  ];

  var state = {
    isOpen: false,
    timer: null,
    elements: null
  };

  function init() {
    state.elements = {
      toggle: document.getElementById('search-toggle'),
      overlay: document.getElementById('search-overlay'),
      input: document.getElementById('search-input'),
      close: document.getElementById('search-close'),
      results: document.getElementById('search-results'),
      noResults: document.getElementById('search-no-results')
    };

    if (!state.elements.toggle || !state.elements.overlay || !state.elements.input) {
      setTimeout(init, 300);
      return;
    }

    bindEvents();
    console.log('🚀 محرك البحث المعماري جاهز ومستقر.');
  }

  function bindEvents() {
    var el = state.elements;

    el.toggle.addEventListener('click', function(e) {
      e.preventDefault();
      openSearch();
    });

    if (el.close) {
      el.close.addEventListener('click', function(e) {
        e.preventDefault();
        closeSearch();
      });
    }

    el.overlay.addEventListener('click', function(e) {
      if (e.target === el.overlay) closeSearch();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && state.isOpen) closeSearch();
    });

    // ⚡ معالجة الإدخال المباشر بدون وميض وبدون مسح الـ DOM المتكرر
    el.input.addEventListener('input', function(e) {
      var query = e.target.value.trim().toLowerCase();

      if (state.timer) clearTimeout(state.timer);

      if (!query) {
        clearUI();
        return;
      }

      state.timer = setTimeout(function() {
        runQuery(query);
      }, 50); // استجابة فورية خلال 50 ميلي ثانية فقط
    });
  }

  function openSearch() {
    var el = state.elements;
    if (!el) return;

    el.overlay.style.display = 'flex';
    setTimeout(function() {
      el.overlay.classList.add('active');
      el.overlay.setAttribute('aria-hidden', 'false');
    }, 10);

    state.isOpen = true;
    setTimeout(function() { if (el.input) el.input.focus(); }, 50);
    document.body.style.overflow = 'hidden';
  }

  function closeSearch() {
    var el = state.elements;
    if (!el) return;

    el.overlay.classList.remove('active');
    el.overlay.setAttribute('aria-hidden', 'true');
    setTimeout(function() { el.overlay.style.display = 'none'; }, 200);

    clearUI();
    if (el.input) el.input.value = '';
    document.body.style.overflow = '';
    state.isOpen = false;
  }

  function clearUI() {
    var el = state.elements;
    if (!el) return;
    if (el.results) el.results.innerHTML = '';
    if (el.noResults) el.noResults.hidden = true;
  }

  function runQuery(q) {
    var el = state.elements;
    if (!el || !el.results) return;

    // تطبيع نص البحث وإزالة المسافات الزائدة
    var cleanQ = q.replace(/\s+/g, ' ');

    var matches = appMasterIndex.filter(function(item) {
      var title = (item.title || '').toLowerCase();
      var desc = (item.desc || '').toLowerCase();
      var keys = (item.keywords || '').toLowerCase();
      return title.indexOf(cleanQ) !== -1 || desc.indexOf(cleanQ) !== -1 || keys.indexOf(cleanQ) !== -1;
    });

    if (matches.length === 0) {
      if (el.noResults) {
        el.noResults.hidden = false;
        el.noResults.textContent = '❌ لا توجد نتائج مطابقة لـ "' + q + '"';
      }
      el.results.innerHTML = '';
    } else {
      if (el.noResults) el.noResults.hidden = true;

      var fragment = document.createDocumentFragment();

      matches.forEach(function(item) {
        var div = document.createElement('div');
        div.className = 'search-result-item';
        div.style.cssText = 'padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.06); cursor: pointer; display: flex; align-items: center; gap: 12px; background: var(--card-bg, #ffffff); transition: background 0.2s;';

        div.innerHTML = `
          <div style="width: 38px; height: 38px; border-radius: 8px; background: var(--accent-color, #3498db); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="fas ${item.icon}"></i>
          </div>
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: bold; font-size: 0.95rem; color: var(--text-primary, #333);">${escapeHtml(item.title)}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary, #777); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(item.path)}</div>
          </div>
        `;

        // حدث التنقل الآمن والمباشر بدون أي أخطاء محتملة
        div.addEventListener('click', function(e) {
          e.preventDefault();
          closeSearch();

          console.log('🎯 توجيه مباشر دقيق إلى:', item.target);
          if (typeof window.loadContent === 'function') {
            window.loadContent(item.target);
          }
        });

        fragment.appendChild(div);
      });

      el.results.innerHTML = '';
      el.results.appendChild(fragment);
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
