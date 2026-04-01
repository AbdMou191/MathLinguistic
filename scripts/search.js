/**
 * 🔍 نظام البحث الذكي المتطور - MathLinguistic
 * الإصدار: 6.0 (دعم كامل لملفات المشروع)
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
    jsonFilesList: [
      { path: 'data/lessons/beginner.json', category: 'درس', type: 'lesson', level: 'مبتدئ', name: 'دروس المبتدئين' },
      { path: 'data/lessons/intermediate.json', category: 'درس', type: 'lesson', level: 'متوسط', name: 'دروس المتوسط' },
      { path: 'data/lessons/advanced.json', category: 'درس', type: 'lesson', level: 'متقدم', name: 'دروس المتقدم' },
      { path: 'data/lessons/complex.json', category: 'درس', type: 'lesson', level: 'معقد', name: 'دروس المعقد' },
      { path: 'data/levels/beginner.json', category: 'مستوى', type: 'level', level: 'مبتدئ', name: 'مستوى المبتدئين' },
      { path: 'data/levels/intermediate.json', category: 'مستوى', type: 'level', level: 'متوسط', name: 'مستوى المتوسط' },
      { path: 'data/levels/advanced.json', category: 'مستوى', type: 'level', level: 'متقدم', name: 'مستوى المتقدم' },
      { path: 'data/levels/complex.json', category: 'مستوى', type: 'level', level: 'معقد', name: 'مستوى المعقد' },
      { path: 'data/achievements.json', category: 'إنجاز', type: 'achievement', level: 'عام', name: 'الإنجازات' }
    ]
  };
  
  // ========== تحميل ملفات JSON ==========
  async function loadJsonFiles() {
    if (searchState.isLoadingJson) {
      console.log('⏳ جاري تحميل ملفات JSON بالفعل...');
      return;
    }
    
    searchState.isLoadingJson = true;
    console.log('📁 بدء تحميل ملفات JSON...');
    console.log('📋 قائمة الملفات:', searchState.jsonFilesList.map(f => f.path));
    
    const loadPromises = searchState.jsonFilesList.map(async (file) => {
      try {
        console.log(`📥 تحميل: ${file.path}`);
        const response = await fetch(file.path);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        
        searchState.jsonDataCache[file.path] = {
          data: data,
          category: file.category,
          type: file.type,
          level: file.level,
          name: file.name,
          path: file.path
        };
        
        console.log(`✅ تم تحميل: ${file.path} (${file.name})`);
        return { success: true, path: file.path, data: data };
      } catch (error) {
        console.warn(`⚠️ فشل تحميل ${file.path}:`, error.message);
        return { success: false, path: file.path, error: error.message };
      }
    });
    
    await Promise.all(loadPromises);
    searchState.isLoadingJson = false;
    
    const loadedCount = Object.keys(searchState.jsonDataCache).length;
    console.log(`📊 تم تحميل ${loadedCount} من ${searchState.jsonFilesList.length} ملفات JSON`);
    
    if (loadedCount > 0) {
      console.log('✅ الملفات المحملة بنجاح:');
      Object.keys(searchState.jsonDataCache).forEach(path => {
        console.log(`   - ${path}`);
      });
    }
    
    buildSearchIndex();
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
      
      console.log(`📑 فهرسة: ${filePath} (${fileName})`);
      
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
            loadTarget: 'lesson',
            scrollTo: null,
            icon: 'fa-book-open',
            path: `📁 ${fileName} > ${jsonData.title}`,
            source: 'json',
            filePath: filePath,
            fileName: fileName,
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
              loadTarget: 'lesson',
              scrollTo: lesson.id || `lesson-${lessonIdx}`,
              icon: 'fa-book',
              path: `📁 ${fileName} > ${jsonData.title} > ${lesson.title}`,
              source: 'json',
              filePath: filePath,
              data: lesson,
              parentTitle: jsonData.title
            });
          });
        }
        
        if (jsonData.exercises && Array.isArray(jsonData.exercises)) {
          jsonData.exercises.forEach(function(exercise, exIdx) {
            index.push({
              id: 'lesson-exercise-' + idCounter++,
              title: exercise.question || exercise.title || `تمرين ${exIdx + 1}`,
              description: exercise.hint || exercise.explanation || '',
              fullContent: (exercise.question || '') + ' ' + (exercise.solution || '') + ' ' + (exercise.explanation || '') + ' ' + (exercise.hint || ''),
              type: 'exercise',
              category: 'تمرين',
              level: level,
              loadTarget: 'lesson',
              scrollTo: exercise.id || `exercise-${exIdx}`,
              icon: 'fa-pen-to-square',
              path: `📁 ${fileName} > ${jsonData.title} > تمرين ${exIdx + 1}`,
              source: 'json',
              filePath: filePath,
              data: exercise
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
            loadTarget: 'level',
            scrollTo: null,
            icon: 'fa-layer-group',
            path: `📁 ${fileName} > ${jsonData.title}`,
            source: 'json',
            filePath: filePath,
            fileName: fileName,
            data: jsonData,
            sectionId: jsonData.id || `level-${level}`
          });
        }
        
        if (jsonData.lessons && Array.isArray(jsonData.lessons)) {
          jsonData.lessons.forEach(function(lesson, lessonIdx) {
            index.push({
              id: 'level-lesson-' + idCounter++,
              title: lesson.title || `درس ${lessonIdx + 1}`,
              description: lesson.description || '',
              fullContent: lesson.content || lesson.description || '',
              type: 'lesson',
              category: 'درس',
              level: level,
              loadTarget: 'level',
              scrollTo: lesson.id || `lesson-${lessonIdx}`,
              icon: 'fa-book',
              path: `📁 ${fileName} > ${jsonData.title} > ${lesson.title}`,
              source: 'json',
              filePath: filePath,
              data: lesson,
              parentTitle: jsonData.title
            });
          });
        }
        
        if (jsonData.challenges && Array.isArray(jsonData.challenges)) {
          jsonData.challenges.forEach(function(challenge, chIdx) {
            index.push({
              id: 'level-challenge-' + idCounter++,
              title: challenge.title || `تحدي ${chIdx + 1}`,
              description: challenge.description || '',
              fullContent: (challenge.question || '') + ' ' + (challenge.solution || '') + ' ' + (challenge.description || ''),
              type: 'game',
              category: 'تحدي',
              level: level,
              loadTarget: 'level',
              scrollTo: challenge.id || `challenge-${chIdx}`,
              icon: 'fa-gamepad',
              path: `📁 ${fileName} > ${jsonData.title} > ${challenge.title}`,
              source: 'json',
              filePath: filePath,
              data: challenge
            });
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
        } else if (jsonData.title) {
          index.push({
            id: 'achievement-file-' + idCounter++,
            title: jsonData.title || 'الإنجازات',
            description: jsonData.description || 'قائمة الإنجازات',
            fullContent: JSON.stringify(jsonData).toLowerCase(),
            type: 'achievement',
            category: 'إنجازات',
            level: 'عام',
            loadTarget: 'achievements',
            scrollTo: null,
            icon: 'fa-trophy',
            path: `📁 ${fileName}`,
            source: 'json',
            filePath: filePath,
            data: jsonData
          });
        }
      }
    }
    
    return index;
  }
  
  // ========== إنشاء الفهرس المتقدم ==========
  function buildSearchIndex() {
    if (searchState.isIndexing) {
      console.log('⏳ الفهرسة جارية بالفعل...');
      return;
    }
    
    searchState.isIndexing = true;
    console.log('📚 بدء بناء الفهرس المتقدم...');
    
    var index = [];
    var idCounter = 1;
    
    var jsonIndex = indexJsonContent();
    index = index.concat(jsonIndex);
    
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
          data: problem,
          sectionId: 'beginner-section',
          problemIndex: idx,
          source: 'window'
        });
      });
    }    
    
    if (window.advancedProblems && window.advancedProblems.length) {
      window.advancedProblems.forEach(function(problem, idx) {
        index.push({
          id: 'adv-' + (problem.id || idCounter++),
          title: problem.question || 'مسألة متقدمة',
          description: problem.explanation || problem.hint || '',
          fullContent: problem.question + ' ' + (problem.explanation || '') + ' ' + (problem.hint || '') + ' ' + (problem.solution || ''),
          type: 'exercise',
          category: 'متقدم',
          level: 'متقدم',
          loadTarget: 'advanced',
          scrollTo: null,
          icon: 'fa-brain',
          path: 'الرئيسية > المستوى المتقدم',
          data: problem,
          sectionId: 'advanced-section',
          problemIndex: idx,
          source: 'window'
        });
      });
    }
    
    var contentSections = document.querySelectorAll('section, .content-section, .lesson-content, .exercise-card, .problem-card, .achievement-card');
    contentSections.forEach(function(section, idx) {
      var title = '';
      var titleElement = section.querySelector('h1, h2, h3, h4, h5, h6, .section-title, .card-title');
      if (titleElement) {
        title = titleElement.textContent.trim();
      }
      
      var content = section.textContent.trim();
      var description = content.substring(0, 200);
      
      if (title || content) {
        index.push({
          id: 'section-' + idCounter++,
          title: title || 'محتوى الصفحة',
          description: description,
          fullContent: content,
          type: 'content',
          category: 'محتوى',
          level: 'عام',
          loadTarget: null,
          scrollTo: section.id || 'section-' + idx,
          icon: 'fa-file-alt',
          path: 'المحتوى > ' + (title || 'قسم'),
          element: section,
          sectionId: section.id || 'section-' + idx,
          source: 'dom'
        });
      }
    });
    
    var clickableElements = document.querySelectorAll('[data-target], [data-action], .nav-link, .menu-item, .level-btn, .lesson-btn');
    clickableElements.forEach(function(el) {
      var target = el.getAttribute('data-target') || el.getAttribute('data-action');
      if (!target && el.classList) {
        if (el.classList.contains('nav-link')) {
          target = el.getAttribute('href') || el.getAttribute('data-page');
        }
        if (el.classList.contains('level-btn')) {
          target = el.getAttribute('data-level') || 'level';
        }
      }
      if (!target) return;
      
      var title = el.textContent.trim();
      if (!title) {
        var heading = el.querySelector('h1, h2, h3, h4, h5, h6, .title, .card-title');
        if (heading) {
          title = heading.textContent.trim();
        }
      }
      
      if (!title) return;
      
      var type = 'page';
      var icon = 'fa-file';
      if (target.indexOf('game') !== -1 || target.indexOf('learn') !== -1) {
        type = target.indexOf('game') !== -1 ? 'game' : 'lesson';
        icon = type === 'game' ? 'fa-gamepad' : 'fa-book-open';
      } else if (target.indexOf('achievement') !== -1) {
        type = 'achievement';
        icon = 'fa-trophy';
      } else if (target.indexOf('level') !== -1) {
        type = 'level';
        icon = 'fa-layer-group';
      }
      
      var exists = index.some(function(item) {
        return item.loadTarget === target;
      });
      
      if (!exists) {
        index.push({
          id: 'dom-' + idCounter++,
          title: title,
          description: el.getAttribute('data-description') || 'انتقل إلى ' + title,
          fullContent: title + ' ' + (el.getAttribute('data-description') || ''),
          type: type,
          category: 'عام',
          level: 'عام',
          loadTarget: target,
          scrollTo: null,
          icon: icon,
          path: 'الرئيسية > ' + target,
          element: el,
          source: 'dom'
        });
      }
    });
    
    searchState.searchIndex = index;
    searchState.isIndexing = false;
    
    console.log('✅ تم بناء الفهرس المتقدم: ' + index.length + ' عنصر');
    console.log('📊 تفاصيل الفهرس:');
    console.log('   - من ملفات JSON: ' + jsonIndex.length);
    console.log('   - من window: ' + (index.filter(i => i.source === 'window').length));
    console.log('   - من DOM: ' + (index.filter(i => i.source === 'dom').length));
    
    var stats = {};
    index.forEach(function(item) {
      if (!stats[item.type]) stats[item.type] = 0;
      stats[item.type]++;
    });
    console.log('📈 إحصائيات حسب النوع:', stats);
    
    window.SearchIndex = index;
    
    return index;
  }
  
  // ========== التهيئة ==========
  function initSearch() {
    if (searchState.isInitialized) {
      console.log('⚠️ البحث مُهيأ بالفعل');
      return;
    }
    
    console.log('🔍 تهيئة نظام البحث الذكي المتطور...');
    console.log('📁 سيتم البحث في الملفات التالية:');
    searchState.jsonFilesList.forEach(function(file) {
      console.log(`   - ${file.path} (${file.name})`);
    });
    
    var els = {
      toggle: document.getElementById('search-toggle'),
      overlay: document.getElementById('search-overlay'),
      input: document.getElementById('search-input'),
      close: document.getElementById('search-close'),
      results: document.getElementById('search-results'),
      noResults: document.getElementById('search-no-results')
    };
    
    if (!els.toggle || !els.overlay || !els.input) {
      console.warn('⚠️ عناصر البحث ناقصة، إعادة المحاولة...');
      setTimeout(initSearch, 500);
      return;
    }
    
    searchState.elements = els;
    searchState.isInitialized = true;
    
    loadJsonFiles().then(function() {
      buildSearchIndex();
    }).catch(function(error) {
      console.error('❌ خطأ في تحميل الملفات:', error);
      buildSearchIndex();
    });
    
    bindEvents();
    window.openSearch = openSearch;
    window.closeSearch = closeSearch;
    window.toggleSearch = toggleSearch;
    window.rebuildSearchIndex = buildSearchIndex;
    window.reloadJsonFiles = loadJsonFiles;
    window.getSearchStats = function() {
      return {
        totalIndexed: searchState.searchIndex.length,
        jsonFilesLoaded: Object.keys(searchState.jsonDataCache).length,
        lastQuery: searchState.lastSearchQuery
      };
    };
    
    console.log('✅ نظام البحث المتطور جاهز');
    console.log('💡 يمكنك استخدام window.getSearchStats() لعرض الإحصائيات');
  }
  
  // ========== ربط الأحداث ==========
  function bindEvents() {
    var els = searchState.elements;
    if (!els || !els.toggle) return;
    
    console.log('🔗 ربط الأحداث...');
    
    els.toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔘 فتح البحث');
      openSearch();
    }, { passive: false });
    
    els.toggle.style.cursor = 'pointer';
    els.toggle.style.touchAction = 'manipulation';
    
    if (els.close) {
      els.close.addEventListener('click', function(e) {
        e.preventDefault();
        closeSearch();
      }, { passive: false });
    }
    
    els.overlay.addEventListener('click', function(e) {
      if (e.target === els.overlay) {
        closeSearch();
      }
    }, { passive: true });
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && searchState.isOpen) {
        closeSearch();
      }
    }, { passive: true });
    
    if (els.input) {
      els.input.addEventListener('input', handleSearchInput, { passive: true });
      els.input.addEventListener('keydown', handleKeyboard, { passive: false });
    }
    
    function handleSearchInput(e) {
      var query = e.target.value.trim();
      searchState.lastSearchQuery = query;
      
      if (searchState.searchTimer) {
        clearTimeout(searchState.searchTimer);
      }
      
      if (!query) {
        clearResults();
        return;
      }
      
      searchState.searchTimer = setTimeout(function() {
        performAdvancedSearch(query);
      }, 300);
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
      
      if (!searchState.searchIndex.length && !searchState.isIndexing) {
        if (Object.keys(searchState.jsonDataCache).length === 0) {
          loadJsonFiles().then(function() {
            buildSearchIndex();
          });
        } else {
          buildSearchIndex();
        }
      }
      
      els.overlay.style.display = 'flex';
      setTimeout(function() {
        els.overlay.style.opacity = '1';
        els.overlay.classList.add('active');
        els.overlay.setAttribute('aria-hidden', 'false');
      }, 10);
      
      searchState.isOpen = true;
      
      setTimeout(function() {
        if (els.input) {
          els.input.focus();
          if (searchState.lastSearchQuery) {
            els.input.value = searchState.lastSearchQuery;
            performAdvancedSearch(searchState.lastSearchQuery);
          }
        }
      }, 100);
      
      document.body.style.overflow = 'hidden';
    }
    
    function closeSearch() {
      var els = searchState.elements;
      if (!els || !searchState.isOpen) return;
      
      els.overlay.style.opacity = '0';
      els.overlay.classList.remove('active');
      els.overlay.setAttribute('aria-hidden', 'true');
      
      setTimeout(function() {
        els.overlay.style.display = 'none';
      }, 300);
      
      clearResults();
      if (els.input) els.input.value = '';
      document.body.style.overflow = '';
      searchState.isOpen = false;
      searchState.selectedIndex = -1;
      clearHighlights();
    }
    
    function toggleSearch() {
      if (searchState.isOpen) {
        closeSearch();
      } else {
        openSearch();
      }
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
        item.setAttribute('aria-selected', String(isActive));
        if (isActive) {
          item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      });
    }
    
    function performAdvancedSearch(query) {
      var index = searchState.searchIndex;
      
      if (!query || index.length === 0) {
        clearResults();
        return;
      }
      
      var normalizedQuery = normalizeArabic(query.toLowerCase());
      var queryWords = normalizedQuery.split(/\s+/).filter(function(w) { return w.length > 0; });
      
      var scoredResults = index
        .map(function(item) {
          var score = calculateAdvancedScore(item, normalizedQuery, queryWords);
          return {
            id: item.id,
            title: item.title,
            description: item.description,
            type: item.type,
            loadTarget: item.loadTarget,
            scrollTo: item.scrollTo,
            icon: item.icon,
            path: item.path,
            category: item.category,
            level: item.level,
            score: score,
            element: item.element,
            data: item.data,
            sectionId: item.sectionId,
            problemIndex: item.problemIndex,
            fullContent: item.fullContent,
            source: item.source,
            filePath: item.filePath
          };
        })
        .filter(function(item) {
          return item.score > 0;
        })
        .sort(function(a, b) {
          return b.score - a.score;
        })
        .slice(0, 50);
      
      searchState.currentResults = scoredResults;
      searchState.selectedIndex = -1;
      
      var els = searchState.elements;
      if (!els || !els.results) return;
      
      if (scoredResults.length === 0) {
        if (els.noResults) {
          els.noResults.hidden = false;
          els.noResults.textContent = '❌ لم يتم العثور على نتائج لـ "' + query + '"';
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
      var nContent = normalizeArabic((item.fullContent || item.description || '').toLowerCase());
      
      if (nTitle === normalizedQuery) score += 100;
      else if (nTitle.indexOf(normalizedQuery) === 0) score += 80;
      else if (nTitle.indexOf(normalizedQuery) !== -1) score += 60;
      
      if (nDesc.indexOf(normalizedQuery) !== -1) score += 40;
      
      if (nContent.indexOf(normalizedQuery) !== -1) score += 30;
      
      if (queryWords.length > 1) {
        var matchCount = 0;
        queryWords.forEach(function(word) {
          if (nTitle.indexOf(word) !== -1) matchCount++;
          else if (nDesc.indexOf(word) !== -1) matchCount += 0.5;
          else if (nContent.indexOf(word) !== -1) matchCount += 0.3;
        });
        score += (matchCount / queryWords.length) * 50;
      }
      
      return Math.floor(score);
    }
    
    function normalizeArabic(text) {
      if (!text) return '';
      return text
        .toString()
        .replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/[\u0622\u0623\u0624\u0625\u0626\u0621\u0649\u0649]/g, 'ا')
        .replace(/[\u0649]/g, 'ي')
        .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    function renderAdvancedResults(results, query) {
      var els = searchState.elements;
      if (!els || !els.results) return;
      
      var fragment = document.createDocumentFragment();
      
      results.forEach(function(item, idx) {
        var el = createAdvancedResultElement(item, idx, query);
        fragment.appendChild(el);
      });
      
      els.results.innerHTML = '';
      els.results.appendChild(fragment);
    }
    
    function createAdvancedResultElement(item, idx, query) {
      var div = document.createElement('div');
      div.className = 'search-result-item';
      div.setAttribute('data-idx', idx);
      div.setAttribute('role', 'option');
      div.setAttribute('aria-selected', 'false');
      div.style.cursor = 'pointer';
      
      var categoryLabels = {
        'lesson': '📚 درس',
        'exercise': '✏️ تمرين',
        'game': '🎮 لعبة',
        'achievement': '🏆 إنجاز',
        'page': '📄 صفحة',
        'content': '📖 محتوى',
        'level': '⭐ مستوى'
      };
      
      var category = categoryLabels[item.type] || item.category || '📌 عام';
      var scorePercentage = item.score;
      var scoreColor = scorePercentage > 80 ? '#4caf50' : (scorePercentage > 50 ? '#ff9800' : '#f44336');
      var sourceIcon = item.source === 'json' ? '📁' : (item.source === 'window' ? '💾' : '🌐');
      
      var highlightedTitle = highlightSearchTerm(item.title, query);
      var highlightedDesc = item.description ? highlightSearchTerm(item.description.substring(0, 150), query) : '';
      
      var html = '<div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid rgba(0,0,0,0.05);">' +
        '<div style="width:45px;height:45px;border-radius:12px;background:linear-gradient(135deg, var(--accent-color, #8a2387), #e94057);display:flex;align-items:center;justify-content:center;color:white;">' +
          '<i class="fas ' + (item.icon || 'fa-search') + '"></i>' +
        '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-weight:bold;margin-bottom:6px;font-size:1rem;">' + highlightedTitle + '</div>' +
          (highlightedDesc ? '<div style="font-size:0.85rem;opacity:0.8;margin-bottom:4px;">' + highlightedDesc + '...</div>' : '') +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
            '<span style="font-size:0.7rem;opacity:0.6;">' + sourceIcon + ' ' + escapeHtml(item.path) + '</span>' +
            (item.level ? '<span style="font-size:0.7rem;opacity:0.6;">📊 ' + escapeHtml(item.level) + '</span>' : '') +
            '<span style="padding:2px 8px;background:' + scoreColor + '20;border-radius:12px;font-size:0.7rem;color:' + scoreColor + ';">' +
              '📊 ' + scorePercentage + '% تطابق' +
            '</span>' +
          '</div>' +
        '</div>' +
        '<span style="padding:4px 12px;background:linear-gradient(135deg, var(--accent-color, #8a2387), #e94057);border-radius:20px;font-size:0.75rem;color:white;">' + category + '</span>' +
      '</div>';
      
      div.innerHTML = html;
      
      div.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎯 نقر على:', item.title);
        navigateToResult(item);
      }, { passive: false });
      
      return div;
    }
    
    function highlightSearchTerm(text, query) {
      if (!text || !query) return escapeHtml(text);
      
      var escapedText = escapeHtml(text);
      var escapedQuery = escapeHtml(query);
      
      var regex = new RegExp('(' + escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      return escapedText.replace(regex, '<mark style="background: #ffeb3b; color: #000; padding: 0 2px; border-radius: 3px;">$1</mark>');
    }
    
    function escapeHtml(text) {
      if (!text) return '';
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    function navigateToResult(item) {
      console.log('🎯 الانتقال إلى:', item.title);
      console.log('📍 loadTarget:', item.loadTarget);
      console.log('🔍 كلمة البحث:', searchState.lastSearchQuery);
      console.log('📁 المصدر:', item.source);
      
      closeSearch();
      
      window.pendingSearchTarget = {
        id: item.id,
        loadTarget: item.loadTarget,
        scrollTo: item.scrollTo,
        title: item.title,
        timestamp: Date.now(),
        searchQuery: searchState.lastSearchQuery,
        sectionId: item.sectionId,
        problemIndex: item.problemIndex,
        source: item.source,
        filePath: item.filePath,
        data: item.data
      };
      
      setTimeout(function() {
        var success = false;
        
        if (typeof window.loadContent === 'function') {
          console.log('✅ استخدام loadContent');
          window.loadContent(item.loadTarget);
          success = true;
        } else if (item.element && typeof item.element.click === 'function') {
          console.log('✅ النقر على العنصر المخزن');
          item.element.click();
          success = true;
        } else if (item.loadTarget) {
          var btn = document.querySelector('[data-target="' + item.loadTarget + '"]');
          if (btn && typeof btn.click === 'function') {
            console.log('✅ العثور على زر والنقر عليه');
            btn.click();
            success = true;
          }
        }
        
        if (!success && item.sectionId) {
          console.log('✅ التمرير إلى القسم:', item.sectionId);
          var section = document.getElementById(item.sectionId);
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            success = true;
          }
        }
        
        if (!success && item.source === 'json') {
          console.log('📄 عرض بيانات JSON:', item.filePath);
          if (typeof window.showJsonContent === 'function') {
            window.showJsonContent(item.data, item.title);
          } else {
            console.log('بيانات JSON:', item.data);
            if (typeof window.showToast === 'function') {
              window.showToast(`📁 تم العثور على: ${item.title} (من ملفات JSON)`, 'info');
            }
          }
          success = true;
        }
        
        if (!success) {
          console.warn('⚠️ لم يتم العثور على طريقة للانتقال إلى:', item.loadTarget);
          
          var funcName = 'load' + (item.loadTarget || '')
            .split('-')
            .map(function(word) {
              return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join('') + 'Page';
          
          if (typeof window[funcName] === 'function') {
            console.log('✅ استخدام الدالة المباشرة:', funcName);
            window[funcName]();
          } else {
            if (typeof window.showToast === 'function') {
              window.showToast('عذراً، لم نتمكن من فتح: ' + item.title, 'error');
            } else {
              alert('عذراً، لم نتمكن من فتح: ' + item.title);
            }
          }
        }
        
        setTimeout(function() {
          var target = window.pendingSearchTarget;
          if (target && target.searchQuery) {
            highlightTextInPage(target.searchQuery, target.sectionId);
          }
          window.pendingSearchTarget = null;
        }, 800);
      }, 200);
    }
    
    function highlightTextInPage(searchText, sectionId) {
      if (!searchText) return;
      
      clearHighlights();
      
      var searchQuery = searchText.trim();
      if (!searchQuery) return;
      
      var container = sectionId ? document.getElementById(sectionId) : document.body;
      if (!container) container = document.body;
      
      var walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            if (node.parentElement && 
                (node.parentElement.tagName === 'SCRIPT' || 
                 node.parentElement.tagName === 'STYLE' ||
                 node.parentElement.classList.contains('search-highlight'))) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      
      var textNodes = [];
      while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
      }
      
      var regex = new RegExp('(' + searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      var highlightedCount = 0;
      
      textNodes.forEach(function(node) {
        var text = node.textContent;
        if (regex.test(text)) {
          regex.lastIndex = 0;
          var span = document.createElement('span');
          var matches = text.match(regex);
          
          if (matches && matches.length > 0) {
            var parts = text.split(regex);
            parts.forEach(function(part) {
              if (regex.test(part)) {
                var mark = document.createElement('mark');
                mark.className = 'search-highlight';
                mark.style.backgroundColor = '#ffeb3b';
                mark.style.color = '#000';
                mark.style.padding = '0 2px';
                mark.style.borderRadius = '3px';
                mark.style.transition = 'all 0.3s';
                mark.textContent = part;
                span.appendChild(mark);
                highlightedCount++;
              } else if (part) {
                span.appendChild(document.createTextNode(part));
              }
            });
            node.parentNode.replaceChild(span, node);
          }
        }
      });
      
      if (highlightedCount > 0) {
        console.log('✅ تم تمييز ' + highlightedCount + ' نتيجة لـ "' + searchQuery + '"');
        
        var firstHighlight = document.querySelector('.search-highlight');
        if (firstHighlight) {
          firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstHighlight.style.animation = 'pulse 0.5s ease-in-out 3';
        }
        
        if (typeof window.showToast === 'function') {
          window.showToast('🔍 تم العثور على ' + highlightedCount + ' نتيجة لـ "' + searchQuery + '"', 'success');
        }
      } else {
        console.log('⚠️ لم يتم العثور على نص مطابق لـ "' + searchQuery + '" في الصفحة');
        if (typeof window.showToast === 'function') {
          window.showToast('⚠️ لم يتم العثور على "' + searchQuery + '" في هذه الصفحة', 'warning');
        }
      }
    }
    
    function clearHighlights() {
      var highlights = document.querySelectorAll('.search-highlight');
      highlights.forEach(function(mark) {
        var parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      });
      console.log('🗑️ تم إزالة التمييز');
    }
  }
  
  // ========== التهيئة النهائية ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
  
  window.addEventListener('load', function() {
    if (!searchState.isInitialized) {
      initSearch();
    }
  });
  
  var style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); background-color: #ffeb3b; }
      50% { transform: scale(1.05); background-color: #ffc107; }
    }
    .search-highlight {
      animation: pulse 0.5s ease-in-out;
    }
    .search-result-item:hover {
      background: rgba(138, 35, 135, 0.05);
      transition: all 0.3s ease;
      transform: translateX(-5px);
    }
    .search-result-item.active {
      background: rgba(138, 35, 135, 0.1);
      border-right: 3px solid var(--accent-color, #8a2387);
    }
  `;
  document.head.appendChild(style);
  
  console.log('🔍 نظام البحث الذكي المتطور جاهز للتهيئة');
  console.log('📁 سيتم البحث في الملفات التالية:');
  console.log('   - data/lessons/beginner.json, intermediate.json, advanced.json, complex.json');
  console.log('   - data/levels/beginner.json, intermediate.json, advanced.json, complex.json');
  console.log('   - data/achievements.json');
  
})();