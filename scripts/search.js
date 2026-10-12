/**
 * 🔍 نظام البحث الذكي - MathLinguistic
 * الإصدار: 7.0 (مستقر بدون وميض ومعالجة كاملة للتوجيه)
 */

(function() {
  'use strict';

  var searchState = {
    isOpen: false,
    elements: null,
    isInitialized: false,
    searchIndex: [],
    isIndexing: false,
    searchTimer: null,
    jsonFilesList: [
      { path: '/MathLinguistic/data/lessons/beginner.json', category: 'درس', type: 'lesson', level: 'beginner', name: 'دروس المبتدئين' },
      { path: '/MathLinguistic/data/lessons/intermediate.json', category: 'درس', type: 'lesson', level: 'intermediate', name: 'دروس المتوسط' },
      { path: '/MathLinguistic/data/lessons/advanced.json', category: 'درس', type: 'lesson', level: 'mischief', name: 'دروس المتقدم' },
      { path: '/MathLinguistic/data/lessons/complex.json', category: 'درس', type: 'lesson', level: 'complex', name: 'دروس المعقد' },
      { path: '/MathLinguistic/data/levels/beginner.json', category: 'مستوى', type: 'level', level: 'beginner', name: 'مستوى المبتدئين' },
      { path: '/MathLinguistic/data/levels/intermediate.json', category: 'مستوى', type: 'level', level: 'intermediate', name: 'مستوى المتوسط' },
      { path: '/MathLinguistic/data/levels/advanced.json', category: 'مستوى', type: 'level', level: 'advanced', name: 'مستوى المتقدم' },
      { path: '/MathLinguistic/data/levels/complex.json', category: 'مستوى', type: 'level', level: 'complex', name: 'مستوى المعقد' },
      { path: '/MathLinguistic/data/achievements.json', category: 'إنجاز', type: 'achievement', level: 'all', name: 'الإنجازات' }
    ]
  };

  // ✅ 1. خريطة تحويل الأهداف المباشرة لمنع خطأ "صفحة غير معروفة"
  function resolveCorrectTarget(rawTarget, type, level) {
    if (!rawTarget || rawTarget === 'lesson' || rawTarget === 'lessons') {
      if (level && level !== 'all') {
        return 'learn-' + level; // تحويل lesson + beginner إلى learn-beginner
      }
      return 'learn-beginner';
    }
    if (rawTarget === 'level' || rawTarget === 'levels') {
      return level || 'beginner';
    }
    return rawTarget;
  }

  // ✅ 2. جلب الملفات وبناء الفهرس مرة واحدة فقط في البداية
  async function initIndexOnce() {
    if (searchState.isIndexing || searchState.searchIndex.length > 0) return;
    searchState.isIndexing = true;

    var tempIndex = [];
    var idCounter = 1;

    // فهرسة الملفات المباشرة من DOM والـ Window
    if (window.beginnerProblems && Array.isArray(window.beginnerProblems)) {
      window.beginnerProblems.forEach(function(p, idx) {
        tempIndex.push({
          id: 'beg-' + idx,
          title: p.question || 'مسألة مبتدئة',
          description: p.hint || p.explanation || '',
          target: 'beginner',
          path: 'الرئيسية > المستوى المبتدئ',
          icon: 'fa-pen'
        });
      });
    }

    // جلب ملفات JSON
    for (var i = 0; i < searchState.jsonFilesList.length; i++) {
      var file = searchState.jsonFilesList[i];
      try {
        var res = await fetch(file.path);
        if (!res.ok) continue;
        var data = await res.json();

        var correctTarget = resolveCorrectTarget(file.type, file.type, file.level);

        if (data.title) {
          tempIndex.push({
            id: 'json-' + idCounter++,
            title: data.title,
            description: data.description || file.name,
            target: correctTarget,
            path: '📁 ' + file.name + ' > ' + data.title,
            icon: file.type === 'lesson' ? 'fa-book' : 'fa-layer-group'
          });
        }

        var subItems = data.lessons || data.problems || data.exercises || data.challenges;
        if (Array.isArray(subItems)) {
          subItems.forEach(function(item) {
            var itemTitle = item.title || item.question || '';
            if (itemTitle) {
              tempIndex.push({
                id: 'sub-' + idCounter++,
                title: itemTitle,
                description: item.hint || item.explanation || item.description || file.name,
                target: correctTarget,
                path: '📁 ' + file.name + ' > ' + itemTitle,
                icon: 'fa-star'
              });
            }
          });
        }
      } catch (e) {
        console.warn('⚠️ فشل جلب:', file.path);
      }
    }

    searchState.searchIndex = tempIndex;
    searchState.isIndexing = false;
    console.log('✅ تم بناء الفهرس بنجاح بدون تكرار:', tempIndex.length, 'عنصر');
  }

  // ✅ 3. التهيئة وربط الأحداث
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

    // بدء الفهرسة في الخلفية مرة واحدة فقط عند فتح الصفحة
    initIndexOnce();

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

    // ⚡ معالجة الإدخال بشكل ثابت ومستقر منعاً للوميض
    els.input.addEventListener('input', function(e) {
      var query = e.target.value.trim().toLowerCase();

      if (searchState.searchTimer) clearTimeout(searchState.searchTimer);

      if (!query) {
        clearResults();
        return;
      }

      // البحث المحلي السريع جداً دون إعادة مسح الفهرس
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

    // التاكد من وجود الفهرس عند الفتح
    if (searchState.searchIndex.length === 0) {
      initIndexOnce();
    }
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

  // ✅ 4. تنفيذ البحث في الذاكرة دون الوميض
  function executeSearch(query) {
    var els = searchState.elements;
    if (!els || !els.results) return;

    var index = searchState.searchIndex;
    if (!index || index.length === 0) return;

    var matches = index.filter(function(item) {
      var title = (item.title || '').toLowerCase();
      var desc = (item.description || '').toLowerCase();
      return title.indexOf(query) !== -1 || desc.indexOf(query) !== -1;
    }).slice(0, 20);

    if (matches.length === 0) {
      if (els.noResults) {
        els.noResults.hidden = false;
        els.noResults.textContent = '❌ لا توجد نتائج لـ "' + query + '"';
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

        div.addEventListener('click', function(e) {
          e.preventDefault();
          closeSearch();

          var target = item.target;
          console.log('🚀 الانتقال الآمن إلى الصفحة:', target);

          if (typeof window.loadContent === 'function') {
            window.loadContent(target);
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
