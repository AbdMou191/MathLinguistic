/**
 * 🔍 نظام البحث الذكي المتطور - MathLinguistic
 * الإصدار: 6.2 (مصحح ومستقر للبحث والتوجيه)
 */

(function() {
  'use strict';
  
  var searchState = {
    isOpen: false,
    currentResults: [],
    selectedIndex: -1,
    searchTimer: null,
    elements: null,
    isInitialized: false,
    searchIndex: [],
    isIndexing: false,
    lastSearchQuery: '',
    jsonDataCache: {},
    isLoadingJson: false,
    jsonFilesList: [
      { path: '/MathLinguistic/data/lessons/beginner.json', category: 'درس', type: 'lesson', level: 'مبتدئ', name: 'دروس المبتدئين', target: 'learn-beginner' },
      { path: '/MathLinguistic/data/lessons/intermediate.json', category: 'درس', type: 'lesson', level: 'متوسط', name: 'دروس المتوسط', target: 'learn-intermediate' },
      { path: '/MathLinguistic/data/lessons/advanced.json', category: 'درس', type: 'lesson', level: 'متقدم', name: 'دروس المتقدم', target: 'learn-advanced' },
      { path: '/MathLinguistic/data/lessons/complex.json', category: 'درس', type: 'lesson', level: 'معقد', name: 'دروس المعقد', target: 'learn-complex' },
      { path: '/MathLinguistic/data/levels/beginner.json', category: 'مستوى', type: 'level', level: 'مبتدئ', name: 'مستوى المبتدئين', target: 'beginner' },
      { path: '/MathLinguistic/data/levels/intermediate.json', category: 'مستوى', type: 'level', level: 'متوسط', name: 'مستوى المتوسط', target: 'intermediate' },
      { path: '/MathLinguistic/data/levels/advanced.json', category: 'مستوى', type: 'level', level: 'متقدم', name: 'مستوى المتقدم', target: 'advanced' },
      { path: '/MathLinguistic/data/levels/complex.json', category: 'مستوى', type: 'level', level: 'معقد', name: 'مستوى المعقد', target: 'complex' },
      { path: '/MathLinguistic/data/achievements.json', category: 'إنجاز', type: 'achievement', level: 'عام', name: 'الإنجازات', target: 'achievements' }
    ]
  };
  
  async function loadJsonFiles() {
    if (searchState.isLoadingJson) return;
    searchState.isLoadingJson = true;
    
    for (const file of searchState.jsonFilesList) {
      try {
        const response = await fetch(file.path);
        if (!response.ok) continue;
        const data = await response.json();
        searchState.jsonDataCache[file.path] = {
          data: data,
          category: file.category,
          type: file.type,
          level: file.level,
          name: file.name,
          target: file.target
        };
      } catch (e) {
        // تجاهل أخطاء الشبكة المؤقتة بصمت
      }
    }
    searchState.isLoadingJson = false;
    buildSearchIndex();
  }
  
  function buildSearchIndex() {
    var index = [];
    var idCounter = 1;
    
    // 1. فهرسة ملفات JSON المحملة
    for (var filePath in searchState.jsonDataCache) {
      var fileData = searchState.jsonDataCache[filePath];
      var jsonData = fileData.data;
      var target = fileData.target;
      var fileName = fileData.name;
      
      if (jsonData.title) {
        index.push({
          id: 'json-' + idCounter++,
          title: jsonData.title,
          description: jsonData.description || `محتوى ${fileName}`,
          type: fileData.type,
          category: fileData.category,
          loadTarget: target,
          path: `📁 ${fileName} > ${jsonData.title}`,
          icon: 'fa-book'
        });
      }
      
      // فهرسة الدروس أو التمارين الداخلية إن وجدت
      const itemsList = jsonData.lessons || jsonData.problems || jsonData.exercises || jsonData.challenges;
      if (Array.isArray(itemsList)) {
        itemsList.forEach((item, idx) => {
          const itemTitle = item.title || item.question || `عنصر ${idx + 1}`;
          index.push({
            id: 'sub-' + idCounter++,
            title: itemTitle,
            description: item.hint || item.explanation || fileName,
            type: fileData.type,
            category: fileData.category,
            loadTarget: target,
            path: `📁 ${fileName} > ${itemTitle}`,
            icon: 'fa-star'
          });
        });
      }
    }
    
    // 2. فهرسة المسائل من النافذة (Window)
    if (window.beginnerProblems && window.beginnerProblems.length) {
      window.beginnerProblems.forEach((p, idx) => {
        index.push({
          id: 'beg-prob-' + idx,
          title: p.question || 'مسألة مبتدئة',
          description: p.hint || '',
          type: 'exercise',
          category: 'تمرين',
          loadTarget: 'beginner',
          path: 'الرئيسية > المستوى المبتدئ',
          icon: 'fa-pen'
        });
      });
    }

    searchState.searchIndex = index;
  }
  
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
    
    buildSearchIndex();
    loadJsonFiles();
    bindEvents();
  }
  
  function bindEvents() {
    var els = searchState.elements;
    
    els.toggle.addEventListener('click', (e) => { e.preventDefault(); openSearch(); });
    if (els.close) els.close.addEventListener('click', (e) => { e.preventDefault(); closeSearch(); });
    els.overlay.addEventListener('click', (e) => { if (e.target === els.overlay) closeSearch(); });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchState.isOpen) closeSearch();
    });
    
    if (els.input) {
      els.input.addEventListener('input', (e) => {
        var query = e.target.value.trim();
        searchState.lastSearchQuery = query;
        
        if (searchState.searchTimer) clearTimeout(searchState.searchTimer);
        
        if (!query) {
          clearResults();
          return;
        }
        
        // مؤقت مستقر لمنع الوميض والاختفاء المفاجئ
        searchState.searchTimer = setTimeout(() => {
          performSearch(query);
        }, 200);
      });
    }
  }
  
  function openSearch() {
    var els = searchState.elements;
    if (!els) return;
    els.overlay.style.display = 'flex';
    setTimeout(() => {
      els.overlay.classList.add('active');
      els.overlay.setAttribute('aria-hidden', 'false');
    }, 10);
    searchState.isOpen = true;
    setTimeout(() => { if (els.input) els.input.focus(); }, 100);
    document.body.style.overflow = 'hidden';
  }
  
  function closeSearch() {
    var els = searchState.elements;
    if (!els) return;
    els.overlay.classList.remove('active');
    els.overlay.setAttribute('aria-hidden', 'true');
    setTimeout(() => { els.overlay.style.display = 'none'; }, 300);
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
    searchState.currentResults = [];
  }
  
  function performSearch(query) {
    var index = searchState.searchIndex;
    if (!query || index.length === 0) {
      clearResults();
      return;
    }
    
    var q = query.toLowerCase();
    
    // مطابقة مرنة تدعم البحث بالحرف الأول والثاني وما بعده دون اختفاء
    var matched = index.filter(item => {
      var title = (item.title || '').toLowerCase();
      var desc = (item.description || '').toLowerCase();
      return title.includes(q) || desc.includes(q);
    }).slice(0, 25);
    
    searchState.currentResults = matched;
    var els = searchState.elements;
    if (!els || !els.results) return;
    
    if (matched.length === 0) {
      if (els.noResults) {
        els.noResults.hidden = false;
        els.noResults.textContent = '❌ لا توجد نتائج مطابقة لـ "' + query + '"';
      }
      els.results.innerHTML = '';
    } else {
      if (els.noResults) els.noResults.hidden = true;
      
      var fragment = document.createDocumentFragment();
      matched.forEach(item => {
        var div = document.createElement('div');
        div.className = 'search-result-item';
        div.style.cssText = 'padding: 12px; border-bottom: 1px solid rgba(0,0,0,0.05); cursor: pointer; display: flex; align-items: center; gap: 10px; background: var(--card-bg, #fff);';
        div.innerHTML = `
          <div style="width: 38px; height: 38px; border-radius: 10px; background: var(--accent-color, #3498db); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="fas ${item.icon || 'fa-search'}"></i>
          </div>
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: bold; font-size: 0.95rem; color: var(--text-primary);">${escapeHtml(item.title)}</div>
            <div style="font-size: 0.75rem; opacity: 0.7; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(item.path)}</div>
          </div>
        `;
        
                div.addEventListener('click', (e) => {
          e.preventDefault();
          closeSearch();
          
          if (typeof window.loadContent === 'function' && item.loadTarget) {
            let finalTarget = item.loadTarget;
            
            // تصحيح جذري لأي target خاطئ قد يسبب خطأ "صفحة غير معروفة"
            if (finalTarget === 'lesson' || finalTarget === 'lessons') {
              finalTarget = 'learn-beginner'; // أو المستوى الافتراضي المناسب
            }
            
            console.log('🚀 الانتقال إلى الهدف الصحيح:', finalTarget);
            window.loadContent(finalTarget);
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
