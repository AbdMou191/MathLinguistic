/**
 * 🔍 نظام البحث الذكي المتطور - MathLinguistic
 * الإصدار: 6.1 (مصحح ومستقر بالكامل)
 */

(function() {
  'use strict';
  
  // ========== المتغيرات العامة ==========
  var searchState = {
    isOpen: false,
    currentResults: [],
    selectedIndex: -1,
    searchTimer: null,
    elements: null,
    isInitialized: false,
    searchIndex: [],
    isIndexing: false,
    currentHighlightedElements: [],
    lastSearchQuery: '',
    jsonDataCache: {},
    isLoadingJson: false,
    // ✅ تصحيح المسارات لتتوافق مع GitHub Pages
    jsonFilesList: [
      { path: '/MathLinguistic/data/lessons/beginner.json', category: 'درس', type: 'lesson', level: 'مبتدئ', name: 'دروس المبتدئين' },
      { path: '/MathLinguistic/data/lessons/intermediate.json', category: 'درس', type: 'lesson', level: 'متوسط', name: 'دروس المتوسط' },
      { path: '/MathLinguistic/data/lessons/advanced.json', category: 'درس', type: 'lesson', level: 'متقدم', name: 'دروس المتقدم' },
      { path: '/MathLinguistic/data/lessons/complex.json', category: 'درس', type: 'lesson', level: 'معقد', name: 'دروس المعقد' },
      { path: '/MathLinguistic/data/levels/beginner.json', category: 'مستوى', type: 'level', level: 'مبتدئ', name: 'مستوى المبتدئين' },
      { path: '/MathLinguistic/data/levels/intermediate.json', category: 'مستوى', type: 'level', level: 'متوسط', name: 'مستوى المتوسط' },
      { path: '/MathLinguistic/data/levels/advanced.json', category: 'مستوى', type: 'level', level: 'متقدم', name: 'مستوى المتقدم' },
      { path: '/MathLinguistic/data/levels/complex.json', category: 'مستوى', type: 'level', level: 'معقد', name: 'مستوى المعقد' },
      { path: '/MathLinguistic/data/achievements.json', category: 'إنجاز', type: 'achievement', level: 'عام', name: 'الإنجازات' }
    ]
  };
  
  // ========== تحميل ملفات JSON ==========
  async function loadJsonFiles() {
    if (searchState.isLoadingJson) return;
    searchState.isLoadingJson = true;
    
    const loadPromises = searchState.jsonFilesList.map(async (file) => {
      try {
        const response = await fetch(file.path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        searchState.jsonDataCache[file.path] = {
          data: data,
          category: file.category,
          type: file.type,
          level: file.level,
          name: file.name,
          path: file.path
        };
        return { success: true, path: file.path };
      } catch (error) {
        return { success: false, path: file.path, error: error.message };
      }
    });
    
    await Promise.all(loadPromises);
    searchState.isLoadingJson = false;
    buildSearchIndex(); // إعادة بناء الفهرس بعد تحميل JSON
  }
  
  // ========== فهرسة محتوى JSON ==========
  function indexJsonContent() {
    var index = [];
    var idCounter = 1;
    
    for (var filePath in searchState.jsonDataCache) {
      var fileData = searchState.jsonDataCache[filePath];
      var jsonData = fileData.data;
      var category = fileData.category;
      var type = fileData.type;
      var level = fileData.level;
      var fileName = fileData.name;
      
      if (type === 'lesson') {
        if (jsonData.title) {
          index.push({
            id: 'lesson-json-' + idCounter++,
            title: jsonData.title,
            description: jsonData.description || jsonData.subtitle || `دروس المستوى ${level}`,
            fullContent: JSON.stringify(jsonData).toLowerCase(),
            type: 'lesson',
            category: category,
            level: level,
            loadTarget: 'learn-' + level,
            scrollTo: null,
            icon: 'fa-book-open',
            path: `📁 ${fileName} > ${jsonData.title}`,
            source: 'json',
            filePath: filePath,
            data: jsonData,
            sectionId: jsonData.id || `lesson-${level}`
          });
        }
        
        if (jsonData.lessons && Array.isArray(jsonData.lessons)) {
          jsonData.lessons.forEach(function(lesson, lessonIdx) {
            index.push({
              id: 'sub-lesson-' + idCounter++,
              title: lesson.title || `درس ${lessonIdx + 1}`,
              description: lesson.description || lesson.explanation || '',
              fullContent: (lesson.content || lesson.explanation || '') + ' ' + (lesson.description || ''),
              type: 'lesson',
              category: 'درس فرعي',
              level: level,
              loadTarget: 'learn-' + level,
              scrollTo: lesson.id || `lesson-${lessonIdx}`,
              icon: 'fa-book',
              path: `📁 ${fileName} > ${jsonData.title} > ${lesson.title}`,
              source: 'json',
              filePath: filePath,
              data: lesson
            });
          });
        }
      } 
      else if (type === 'level') {
        if (jsonData.title) {
          index.push({
            id: 'level-json-' + idCounter++,
            title: jsonData.title,
            description: jsonData.description || `محتوى المستوى ${level}`,
            fullContent: JSON.stringify(jsonData).toLowerCase(),
            type: 'level',
            category: category,
            level: level,
            loadTarget: level,
            scrollTo: null,
            icon: 'fa-layer-group',
            path: `📁 ${fileName} > ${jsonData.title}`,
            source: 'json',
            filePath: filePath,
            data: jsonData
          });
        }
      }
      else if (type === 'achievement') {
        if (jsonData.achievements && Array.isArray(jsonData.achievements)) {
          jsonData.achievements.forEach(function(achievement, achIdx) {
            index.push({
              id: 'achievement-' + idCounter++,
              title: achievement.title || `إنجاز ${achIdx + 1}`,
              description: achievement.description || '',
              fullContent: (achievement.title || '') + ' ' + (achievement.description || '') + ' ' + (achievement.requirement || ''),
              type: 'achievement',
              category: 'إنجاز',
              level: achievement.level || 'عام',
              loadTarget: 'achievements',
              scrollTo: achievement.id || `achievement-${achIdx}`,
              icon: 'fa-trophy',
              path: `📁 ${fileName} > ${achievement.title}`,
              source: 'json',
              filePath: filePath,
              data: achievement
            });
          });
        }
      }
    }
    return index;
  }
  
  // ========== إنشاء الفهرس المتقدم ==========
  function buildSearchIndex() {
    if (searchState.isIndexing) return;
    searchState.isIndexing = true;
    
    var index = [];
    var idCounter = 1;
    
    var jsonIndex = indexJsonContent();
    index = index.concat(jsonIndex);
    
    // فهرسة مسائل النافذة
    if (window.beginnerProblems && window.beginnerProblems.length) {
      window.beginnerProblems.forEach(function(problem, idx) {
        index.push({
          id: 'beg-' + (problem.id || idCounter++),
          title: problem.question || 'مسألة مبتدئة',
          description: problem.hint || problem.explanation || '',
          fullContent: problem.question + ' ' + (problem.hint || '') + ' ' + (problem.explanation || '') + ' ' + (problem.solution || ''),
          type: 'exercise',
          category: 'مبتدئ',
          level: 'مبتدئ',
          loadTarget: 'beginner',
          scrollTo: null,
          icon: 'fa-pen-to-square',
          path: 'الرئيسية > المستوى المبتدئ',
          problemIndex: idx,
          source: 'window'
        });
      });
    }
    
    searchState.searchIndex = index;
    searchState.isIndexing = false;
    window.SearchIndex = index;
    console.log('✅ تم تحديث الفهرس بنجاح: ' + index.length + ' عنصر');
  }
  
  // ========== التهيئة ==========
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
      setTimeout(initSearch, 500);
      return;
    }
    
    searchState.elements = els;
    searchState.isInitialized = true;
    
    // بناء الفهرس فوراً من البيانات المتاحة، وتحميل JSON في الخلفية
    buildSearchIndex();
    loadJsonFiles();
    
    bindEvents();
    window.openSearch = openSearch;
    window.closeSearch = closeSearch;
    window.toggleSearch = toggleSearch;
  }
  
  // ========== ربط الأحداث ==========
  function bindEvents() {
    var els = searchState.elements;
    if (!els || !els.toggle) return;
    
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
    
    if (els.input) {
      els.input.addEventListener('input', handleSearchInput);
      els.input.addEventListener('keydown', handleKeyboard);
    }
    
    function handleSearchInput(e) {
      var query = e.target.value.trim();
      searchState.lastSearchQuery = query;
      
      if (searchState.searchTimer) clearTimeout(searchState.searchTimer);
      
      if (!query) {
        clearResults();
        return;
      }
      
      // تقليل وقت الانتظار إلى 150ms لمنع أي وميض أو تأخير مزعج
      searchState.searchTimer = setTimeout(function() {
        performAdvancedSearch(query);
      }, 150);
    }
    
    function handleKeyboard(e) {
      var results = searchState.currentResults;
      if (!results || results.length === 0) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          searchState.selectedIndex = Math.min(searchState.selectedIndex + 1, results.length - 1);
          updateSelection();
          break;
        case 'ArrowUp':
          e.preventDefault();
          searchState.selectedIndex = Math.max(searchState.selectedIndex - 1, -1);
          updateSelection();
          break;
        case 'Enter':
          e.preventDefault();
          if (searchState.selectedIndex >= 0 && results[searchState.selectedIndex]) {
            navigateToResult(results[searchState.selectedIndex]);
          }
          break;
      }
    }
    
    function openSearch() {
      var els = searchState.elements;
      if (!els || searchState.isOpen) return;
      
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
      if (!els || !searchState.isOpen) return;
      
      els.overlay.classList.remove('active');
      els.overlay.setAttribute('aria-hidden', 'true');
      setTimeout(function() { els.overlay.style.display = 'none'; }, 300);
      
      clearResults();
      if (els.input) els.input.value = '';
      document.body.style.overflow = '';
      searchState.isOpen = false;
      searchState.selectedIndex = -1;
    }
    
    function toggleSearch() {
      if (searchState.isOpen) closeSearch();
      else openSearch();
    }
    
    function clearResults() {
      var els = searchState.elements;
      if (!els) return;
      if (els.results) els.results.innerHTML = '';
      if (els.noResults) els.noResults.hidden = true;
      searchState.currentResults = [];
      searchState.selectedIndex = -1;
    }
    
    function updateSelection() {
      var els = searchState.elements;
      if (!els || !els.results) return;
      
      var items = els.results.querySelectorAll('.search-result-item');
      items.forEach(function(item, idx) {
        var isActive = (idx === searchState.selectedIndex);
        item.classList.toggle('active', isActive);
        if (isActive) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    }
    
    function performAdvancedSearch(query) {
      var index = searchState.searchIndex;
      if (!query || index.length === 0) {
        clearResults();
        return;
      }
      
      var normalizedQuery = normalizeArabic(query.toLowerCase());
      var queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
      
      var scoredResults = index
        .map(function(item) {
          var score = calculateAdvancedScore(item, normalizedQuery, queryWords);
          return Object.assign({}, item, { score: score });
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 30);
      
      searchState.currentResults = scoredResults;
      
      var els = searchState.elements;
      if (!els || !els.results) return;
      
      if (scoredResults.length === 0) {
        if (els.noResults) {
          els.noResults.hidden = false;
          els.noResults.textContent = '❌ لا توجد نتائج مطابقة لـ "' + query + '"';
        }
        els.results.innerHTML = '';
      } else {
        if (els.noResults) els.noResults.hidden = true;
        renderAdvancedResults(scoredResults, query);
      }
    }
    
    function calculateAdvancedScore(item, normalizedQuery, queryWords) {
      var score = 0;
      var nTitle = normalizeArabic((item.title || '').toLowerCase());
      var nDesc = normalizeArabic((item.description || '').toLowerCase());
      
      if (nTitle === normalizedQuery) score += 100;
      else if (nTitle.indexOf(normalizedQuery) === 0) score += 80;
      else if (nTitle.indexOf(normalizedQuery) !== -1) score += 60;
      
      if (nDesc.indexOf(normalizedQuery) !== -1) score += 40;
      
      queryWords.forEach(word => {
        if (nTitle.indexOf(word) !== -1) score += 20;
        else if (nDesc.indexOf(word) !== -1) score += 10;
      });
      
      return score;
    }
    
    function normalizeArabic(text) {
      if (!text) return '';
      return text.toString()
        .replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/[\u0622\u0623\u0624\u0625\u0621]/g, 'ا')
        .replace(/[\u0649]/g, 'ي')
        .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ').trim();
    }
    
    function renderAdvancedResults(results, query) {
      var els = searchState.elements;
      if (!els || !els.results) return;
      
      var fragment = document.createDocumentFragment();
      results.forEach(function(item, idx) {
        var div = document.createElement('div');
        div.className = 'search-result-item';
        div.style.cssText = 'padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.05); cursor: pointer; display: flex; align-items: center; gap: 10px;';
        div.innerHTML = `
          <div style="width: 40px; height: 40px; border-radius: 10px; background: var(--accent-color, #3498db); color: #fff; display: flex; align-items: center; justify-content: center;">
            <i class="fas ${item.icon || 'fa-search'}"></i>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: bold; font-size: 0.95rem;">${escapeHtml(item.title)}</div>
            <div style="font-size: 0.8rem; opacity: 0.7;">${escapeHtml(item.path)}</div>
          </div>
        `;
        
        div.addEventListener('click', function(e) {
          e.preventDefault();
          navigateToResult(item);
        });
        
        fragment.appendChild(div);
      });
      
      els.results.innerHTML = '';
      els.results.appendChild(fragment);
    }
    
    function escapeHtml(text) {
      if (!text) return '';
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    function navigateToResult(item) {
      closeSearch();
      if (typeof window.loadContent === 'function' && item.loadTarget) {
        window.loadContent(item.loadTarget);
      }
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
