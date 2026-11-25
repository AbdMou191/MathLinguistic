
(function () {
  'use strict';

  /* ================= 🧰 أدوات مساعدة ================= */

  // تطبيع النص العربي: إزالة التشكيل وتوحيد الألف والياء/التاء المربوطة
  function normalizeText(s) {
    if (!s) return '';
    return String(s)
      .toLowerCase()
      .replace(/[ً-ْٰـ]/g, '')                    // التشكيل والتطويل
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // إزالة وسوم HTML من نصوص JSON للعرض الآمن في النتائج
  function stripHtml(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.innerHTML = String(s);
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }



// استخراج جميع النصوص من عناصر JSON
function collectSearchableText(value, key) {
  if (value === null || value === undefined) return '';

  // تجاهل البيانات التقنية غير المفيدة للبحث
  if (['icon', 'image', 'image_url', 'url', 'audio', 'video', 'id'].includes(key)) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map(function(item) {
      return collectSearchableText(item, '');
    }).join(' ');
  }

  if (typeof value === 'object') {
    return Object.keys(value).map(function(k) {
      return collectSearchableText(value[k], k);
    }).join(' ');
  }

  return String(value);
}


  /* ================= 📂 الأقسام الثابتة (العناوين الرئيسية) ================= */

  var STATIC_ENTRIES = [
    { title: 'الرئيسية', keywords: 'الرئيسية home 🏠', desc: 'الصفحة الرئيسية لمنصة MathLinguistic', target: 'home', path: 'الرئيسية', icon: 'fa-home' },
    { title: 'الإنجازات والأوسمة', keywords: 'الإنجازات الأوسمة النقاط achievements 🏆', desc: 'عرض إنجازاتك والنقاط التي جمعتها', target: 'achievements', path: 'الرئيسية > الإنجازات', icon: 'fa-trophy' },

    { title: 'دروس المستوى المبتدئ', keywords: 'دروس ابتدائية مبتدئ beginner lessons', desc: 'شرح مبسط لقواعد وتطبيقات الحساب الذهني للمبتدئين', target: 'learn-beginner', path: 'الدروس > دروس ابتدائية', icon: 'fa-book-open' },
    { title: 'دروس المستوى المتوسط', keywords: 'دروس متوسطة intermediate lessons', desc: 'تطوير مهارات الحساب السريع والعمليات المتوسطة', target: 'learn-intermediate', path: 'الدروس > دروس متوسطة', icon: 'fa-book-open' },
    { title: 'دروس المستوى المتقدم', keywords: 'دروس متقدمة advanced lessons تكامل لوبيتال مصفوفات', desc: 'تقنيات متقدمة في الحساب الذهني والتكاملات والمعادلات', target: 'learn-advanced', path: 'الدروس > دروس متقدمة', icon: 'fa-book-open' },
    { title: 'دروس المستوى المعقد', keywords: 'دروس معقدة complex lessons', desc: 'تحديات ومسائل حسابية معقدة وشاملة', target: 'learn-complex', path: 'الدروس > دروس معقدة', icon: 'fa-book-open' },

    { title: 'المستوى المبتدئ (تمارين)', keywords: 'تمارين مبتدئ beginner exercises', desc: 'تدريبات تفاعلية لتثبيت أساسيات الحساب المبتدئ', target: 'beginner', path: 'التمارين > المستوى المبتدئ', icon: 'fa-star' },
    { title: 'المستوى المتوسط (تمارين)', keywords: 'تمارين متوسط intermediate exercises', desc: 'تدريبات متدرجة لسرعة ودقة الحساب المتوسط', target: 'intermediate', path: 'التمارين > المستوى المتوسط', icon: 'fa-chart-line' },
    { title: 'المستوى المتقدم (تمارين)', keywords: 'تمارين متقدم advanced exercises', desc: 'تمارين متقدمة لتنشيط الذاكرة وسرعة البديهة', target: 'advanced', path: 'التمارين > المستوى المتقدم', icon: 'fa-brain' },
    { title: 'المستوى المعقد (تمارين)', keywords: 'تمارين معقد complex exercises', desc: 'أقوى التحديات والمسائل الرياضية المعقدة', target: 'complex', path: 'التمارين > المستوى المعقد', icon: 'fa-infinity' },

    { title: 'اختبار السرعة (Speed Test)', keywords: 'اختبار السرعة speed test game', desc: 'اختبر سرعتك في حل العمليات الحسابية ضمن وقت محدد', target: 'speed-test', path: 'الألعاب > اختبار السرعة', icon: 'fa-stopwatch' },
    { title: 'الحساب الذهني (Mental Math)', keywords: 'حساب ذهني mental math', desc: 'تدريب تفاعلي لتنشيط العقل بالحساب السريع', target: 'mental-math', path: 'الألعاب > الحساب الذهني', icon: 'fa-calculator' },
    { title: 'العمليات المختلطة (Mixed Ops)', keywords: 'عمليات مختلطة mixed ops', desc: 'تحدي العمليات الحسابية المتنوعة معاً', target: 'mixed-ops', path: 'الألعاب > العمليات المختلطة', icon: 'fa-random' },
    { title: 'لعبة Crossmath', keywords: 'crossmath التقاطع الرياضي ألعاب', desc: 'التقاطع الرياضي والألغاز الرقمية الممتعة', target: 'crossmath', path: 'الألعاب > Crossmath', icon: 'fa-puzzle-piece' },
    { title: 'لعبة Sliding Puzzle', keywords: 'sliding puzzle ألغاز منزلقة أرقام', desc: 'لعبة الأرقام المنزلقة وترتيب الخلايا الذهنية', target: 'sliding_puzzle', path: 'الألعاب > الألغاز المنزلقة', icon: 'fa-sliders' },
    { title: 'الآلة الحاسبة الذكية', keywords: 'حاسبة calculator أداة', desc: 'أداة مساعدة لحساب العمليات الرياضية بسرعة', target: 'calculator', path: 'الأدوات > الآلة الحاسبة', icon: 'fa-calculator' },

    { title: 'من نحن', keywords: 'من نحن about', desc: 'تعرف على منصة MathLinguistic ورؤيتها', target: 'about', path: 'الصفحات > من نحن', icon: 'fa-info-circle' },
    { title: 'اتصل بنا', keywords: 'اتصل بنا contact تواصل', desc: 'تواصل معنا عبر قنوات الاتصال المختلفة', target: 'contact', path: 'الصفحات > اتصل بنا', icon: 'fa-envelope' },
    { title: 'شروط الاستخدام', keywords: 'شروط الاستخدام terms', desc: 'شروط وأحكام استخدام المنصة', target: 'terms', path: 'الصفحات > شروط الاستخدام', icon: 'fa-file-contract' },
    { title: 'سياسة الخصوصية', keywords: 'سياسة الخصوصية privacy', desc: 'سياسة حماية البيانات والخصوصية', target: 'privacy', path: 'الصفحات > سياسة الخصوصية', icon: 'fa-shield-alt' }
  ];

  /* ================= 🗂️ مصادر البيانات العميقة ================= */

  var LEVELS = ['beginner', 'intermediate', 'advanced', 'complex'];
  var LEVEL_META = {
    beginner:     { name: 'المبتدئ', icon: 'fa-star' },
    intermediate: { name: 'المتوسط', icon: 'fa-chart-line' },
    advanced:     { name: 'المتقدم', icon: 'fa-brain' },
    complex:      { name: 'المعقد',  icon: 'fa-infinity' }
  };

  var DATA_SOURCES = [];
  LEVELS.forEach(function (level) {
    DATA_SOURCES.push({
      type: 'lesson', level: level, meta: LEVEL_META[level],
      url: 'data/lessons/' + level + '.json',
      target: 'learn-' + level
    });
    DATA_SOURCES.push({
      type: 'exercise', level: level, meta: LEVEL_META[level],
      url: 'data/levels/' + level + '.json',
      target: level
    });
  });

  /* ================= 🔧 مساعدات التنقل للصفحة/العنصر ================= */

  // النقر على زر رقم الصفحة المطابق داخل المحتوى (يعمل لكل المستويات)
  function clickPageButton(page) {
    var btns = document.querySelectorAll('#main-content button');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].textContent.replace(/\s+/g, '').trim() === String(page)) {
        btns[i].click();
        return true;
      }
    }
    return false;
  }

  // التمرير وتمييز العنصر المستهدف بعد فتح صفحته
  function scrollToItem(itemIndex) {
    setTimeout(function () {
      var el = document.querySelector('#main-content [data-idx="' + itemIndex + '"]') ||
               document.getElementById('problem-' + itemIndex) ||
               document.getElementById('int-lesson-card-' + itemIndex);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.transition = 'all .4s ease';
      el.style.boxShadow = '0 0 0 3px var(--accent-color)';
      setTimeout(function () { el.style.boxShadow = ''; }, 2500);
    }, 450);
  }

  // الانتظار حتى تُعرض البطاقات ثم الانتقال للصفحة الصحيحة
  function waitForRendered(item) {
    var sel = item.type === 'lesson' ? '.lesson-card' : '[data-idx]';
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      var cards = document.querySelectorAll('#main-content ' + sel);
      if (cards.length > 0 || tries > 50) { // 50 × 120ms = 6 ثوانٍ كحد أقصى
        clearInterval(iv);
        if (cards.length === 0) return;

        // حساب رقم الصفحة انطلاقاً من عدد العناصر المعروضة فعلياً
        var page = Math.floor(item.itemIndex / cards.length) + 1;

        // إذا لم نكن على الصفحة المطلوبة: انقر زرها (يدعم كل المستويات)
        var activeBtn = document.querySelector('#main-content .pagination__btn.active') ||
                        document.querySelector('#main-content button.active');
        var onRightPage = activeBtn && activeBtn.textContent.trim() === String(page);
        if (!onRightPage && clickPageButton(page)) {
          scrollToItem(item.itemIndex);
        }
      }
    }, 120);
  }

  /* ================= 🚀 المفهرس الرئيسي ================= */

  var SearchIndexer = {
    isBuilt: false,
    isBuilding: false,
    index: [],

    /* بناء الفهرس: يجلب ملفات الدروس والتمارين ويفهرس عناصرها */
    build: function () {
      var self = this;
      if (self.isBuilt || self.isBuilding) return;
      self.isBuilding = true;
      console.log('🔍 بدء بناء فهرس البحث العميق...');

      var jobs = DATA_SOURCES.map(function (src) {
        return fetch(src.url)
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; })
          .then(function (data) { if (data) self._indexSource(src, data); });
      });

      Promise.all(jobs).then(function () {
        self.isBuilt = true;
        console.log('📊 إحصائيات الفهرس:', {
  total: self.index.length,
  lessons: self.index.filter(x => x.type === 'lesson').length,
  exercises: self.index.filter(x => x.type === 'exercise').length
});
        self.isBuilding = false;
        console.log('✅ اكتمل فهرس البحث: ' + self.index.length + ' عنصراً');
        // إعادة تشغيل البحث الحالي إن وُجد (main.js يعرضها أثناء البناء)
        if (typeof window.refreshSearchUI === 'function') window.refreshSearchUI();
      });
    },

    
_indexSource: function (src, data) {
  var items = (data && (data.lessons || data.problems)) ||
              (Array.isArray(data) ? data : []);

  for (var i = 0; i < items.length; i++) {
    var it = items[i] || {};
    var num = it.id || (i + 1);
    var entry;

    var fullText = normalizeText(
      collectSearchableText(it, '')
    );

    if (src.type === 'lesson') {
      var title = stripHtml(it.title) || ('درس ' + num);

      entry = {
        id: 'lesson-' + src.level + '-' + i,
        type: 'lesson',
        target: src.target,
        itemIndex: i,
        icon: it.icon || src.meta.icon,
        title: title,
        path: 'الدروس > ' + src.meta.name + ' > الدرس ' + num,
        category: 'درس • رقم ' + num,
        searchText: normalizeText(
          fullText + ' درس ' + num
        )
      };

    } else {
      var q = stripHtml(it.question || it.problem || '');

      entry = {
        id: 'ex-' + src.level + '-' + i,
        type: 'exercise',
        target: src.target,
        itemIndex: i,
        icon: src.meta.icon,
        title: 'تمرين ' + num + (q ? ' — ' + q.slice(0, 35) : ''),
        path: 'التمارين > ' + src.meta.name + ' > تمرين ' + num,
        category: 'تمرين • رقم ' + num,
        searchText: normalizeText(
          fullText + ' تمرين مسألة ' + num
        )
      };
    }

    this.index.push(entry);
  }
},


    /* البحث: تطابق جزئي أولاً ثم تطابق كل الكلمات كاحتياط */
    search: function (query) {
      var q = normalizeText(query);
      if (!q) return [];
      var tokens = q.split(' ');
      var results = [];
      var all = this.index;

      for (var i = 0; i < all.length; i++) {
        var text = all[i].searchText;
        if (text.indexOf(q) !== -1) { results.push(all[i]); continue; }
        var allTokens = true;
        for (var t = 0; t < tokens.length; t++) {
          if (tokens[t] && text.indexOf(tokens[t]) === -1) { allTokens = false; break; }
        }
        if (allTokens) results.push(all[i]);
      }
      return results.slice(0, 40);
    },

    /* فتح النتيجة: العناوين الرئيسية مباشرة، والدروس/التمارين إلى صفحتها */
    openResult: function (item) {
      if (!item) return;

      if (item.type === 'static') {
        if (typeof window.loadContent === 'function') window.loadContent(item.target);
        return;
      }

      var targetIndex = (item.type === 'lesson') ? item.itemIndex : null;
      var pending = null;
      try {
        // بعض دروس (متوسط) تدعم targetIndex وتتكفل بالتمرير والتمييز ذاتياً
        pending = window.loadContent(item.target, true, targetIndex);
      } catch (e) {
        pending = null;
      }

      // ضمان الوصول للصفحة الصحيحة حتى مع الملفات التي لا تدعم targetIndex
      if (pending && typeof pending.then === 'function') {
        pending.then(function () { waitForRendered(item); });
        pending.catch(function () { waitForRendered(item); });
      } else {
        waitForRendered(item);
      }
    }
  };

  /* ================= ⚡ التهيئة ================= */

  function init() {
    // 1) إدخال العناوين الرئيسية فوراً (يبقى البحث فيها يعمل حتى قبل اكتمال البناء)
    for (var i = 0; i < STATIC_ENTRIES.length; i++) {
      var e = STATIC_ENTRIES[i];
      SearchIndexer.index.push({
        id: 'static-' + i,
        type: 'static',
        target: e.target,
        icon: e.icon,
        title: e.title,
        path: e.path,
        category: 'قسم رئيسي',
        searchText: normalizeText(e.title + ' ' + e.keywords + ' ' + e.desc)
      });
    }

    // 2) تسجيل المفهرس عالمياً — main.js يستخدمه في handleSearchInput / openSearchResult
    window.SearchIndexer = SearchIndexer;

    // 3) بدء البناء الكسول: عند فتح البحث أو أول كتابة، أو تلقائياً بعد 6 ثوانٍ
    var toggle = document.getElementById('search-toggle');
    var input = document.getElementById('search-input');
    var start = function () { SearchIndexer.build(); };

    if (toggle) toggle.addEventListener('click', function () { setTimeout(start, 30); });
    if (input) {
      input.addEventListener('focus', start);
      input.addEventListener('input', start);
    }
    setTimeout(start, 6000);

    console.log('🚀 محرك البحث الشامل v10.0 جاهز (' + SearchIndexer.index.length + ' عنصر ثابت)');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();