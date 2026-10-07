// ==========================================
// 🔢 Loudoukou Game - نسخة محسنة ومصححة v6.7
// MathLinguistic - إصلاح كامل للشبكة والأزرار
// ==========================================

(function() {
  'use strict';

  var LOU_GAME_ID = 'loudoukou';
  var LOU_PREFIX = 'lou-';
  
  var louSolution = [];
  var louInitialBoard = [];
  var louCurrentBoard = [];
  var louSelectedCellIndex = -1;
  var louGameVersion = 0;
  var louTimeouts = [];
  var louCleanupExecuted = 0;
  var louCleanupLock = false;
  
  var louStats = {
    stage: 1,
    points: 0,
    blocksSolved: 0,
    lives: 3,
    undoCount: 3,
    history: []
  };

  var LOU_DIFFICULTY = {
    1: { emptyMin: 25, emptyMax: 30, name: "سهل جداً" },
    2: { emptyMin: 30, emptyMax: 35, name: "سهل" },
    3: { emptyMin: 35, emptyMax: 40, name: "متوسط" },
    4: { emptyMin: 40, emptyMax: 45, name: "متوسط+" },
    5: { emptyMin: 45, emptyMax: 50, name: "صعب" },
    6: { emptyMin: 50, emptyMax: 53, name: "صعب+" },
    7: { emptyMin: 53, emptyMax: 56, name: "محترف" },
    8: { emptyMin: 56, emptyMax: 58, name: "محترف+" },
    9: { emptyMin: 58, emptyMax: 60, name: "أسطورة" },
    10: { emptyMin: 60, emptyMax: 64, name: "إعصار ذهني" }
  };

  // ✅ حقن ستايل متناسق ونظيف بدون تداخل الحدود الزائدة
  function louInjectStyles() {
    var existing = document.getElementById('lou-custom-styles');
    if (existing) existing.remove();
    
    var style = document.createElement('style');
    style.id = 'lou-custom-styles';
    style.textContent = `
      .lou-wrapper {
        max-width: 400px;
        margin: 0 auto;
        padding: 4px 8px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      
      /* الشبكة الرئيسية: إطار نظيف وخلفية لخطوط الفواصل */
      .lou-grid {
        display: grid !important;
        grid-template-columns: repeat(9, 1fr) !important;
        grid-template-rows: repeat(9, 1fr) !important;
        gap: 1px !important;
        background-color: #3f4a5a !important;
        width: 100% !important;
        max-width: 350px !important;
        aspect-ratio: 1 / 1 !important;
        border: 2px solid #cbd5e0 !important;
        border-radius: 8px !important;
        overflow: hidden !important;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
        margin: 4px auto !important;
        box-sizing: border-box !important;
      }
      
      /* الخلايا الفردية بدون borders عشوائية */
      .l-cell {
        background-color: #2d3748 !important;
        color: #e2e8f0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: clamp(0.85rem, 3.8vw, 1.2rem) !important;
        font-weight: bold !important;
        border: none !important;
        cursor: pointer !important;
        user-select: none !important;
        box-sizing: border-box !important;
        transition: background-color 0.15s, color 0.15s !important;
        min-width: 0 !important;
        min-height: 0 !important;
        position: relative !important;
      }

      /* حالات الخلايا والتظليل */
      .l-cell.given { background-color: #1a202c !important; color: #ffffff !important; font-weight: 900 !important; }
      .l-cell.user-filled { color: #48bb78 !important; font-weight: bold !important; }
      .l-cell.selected { background-color: #3182ce !important; color: #fff !important; }
      .l-cell.highlight-row, .l-cell.highlight-col, .l-cell.highlight-box { background-color: rgba(66, 153, 225, 0.2) !important; }
      .l-cell.highlight-same { background-color: rgba(236, 201, 75, 0.3) !important; }
      .l-cell.error { background-color: #e53e3e !important; color: #fff !important; }

      /* أزرار التحكم السفلية مصممة للظهور كاملاً دون سحب الشاشة */
      .lou-numpad {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 5px;
        margin-top: 4px;
      }
      
      .lou-numpad button {
        height: 38px !important;
        font-size: 1rem !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      .st-footer {
        margin-top: 6px !important;
      }
    `;
    document.head.appendChild(style);
  }

  function louClearAllTimeouts() {
    for (var i = 0; i < louTimeouts.length; i++) {
      clearTimeout(louTimeouts[i]);
    }
    louTimeouts = [];
  }

  function louSetTimeout(callback, delay) {
    var tid = setTimeout(callback, delay);
    louTimeouts.push(tid);
    return tid;
  }

  function louCleanup() {
    if (louCleanupLock) return;
    var now = Date.now();
    if (louCleanupExecuted && (now - louCleanupExecuted) < 200) return;
    louCleanupLock = true;
    
    louGameVersion++;
    louClearAllTimeouts();
    louSelectedCellIndex = -1;
    
    if (window.GameCore && typeof window.GameCore.cleanupGame === 'function') {
      window.GameCore.cleanupGame(LOU_GAME_ID);
    }
    if (window._ResourceManager && typeof window._ResourceManager.cleanup === 'function') {
      window._ResourceManager.cleanup(LOU_GAME_ID);
    }
    
    louCleanupExecuted = Date.now();
    setTimeout(function() { louCleanupLock = false; }, 100);
  }

  function louSolve(board) {
    for (var i = 0; i < 81; i++) {
      if (board[i] === 0) {
        var nums = [1,2,3,4,5,6,7,8,9].sort(function() { return Math.random() - 0.5; });
        for (var k = 0; k < 9; k++) {
          var n = nums[k];
          if (louIsValid(board, i, n)) {
            board[i] = n;
            if (louSolve(board)) return true;
            board[i] = 0;
          }
        }
        return false;
      }
    }
    return true;
  }

  function louIsValid(board, idx, num) {
    var row = Math.floor(idx / 9);
    var col = idx % 9;
    
    for (var i = 0; i < 9; i++) {
      if (board[row * 9 + i] === num || board[i * 9 + col] === num) return false;
    }
    var br = Math.floor(row / 3) * 3;
    var bc = Math.floor(col / 3) * 3;
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        if (board[(br + i) * 9 + (bc + j)] === num) return false;
      }
    }
    return true;
  }

  function louGenerateSolution() {
    var board = new Array(81).fill(0);
    louSolve(board);
    return board;
  }

  function louRemoveCellsSmart(board, emptyCount) {
    var result = board.slice();
    var removed = 0;
    var attempts = 0;
    var maxAttempts = 400;
    
    while (removed < emptyCount && attempts < maxAttempts) {
      attempts++;
      var idx = Math.floor(Math.random() * 81);
      if (result[idx] === 0) continue;
      
      result[idx] = 0;
      removed++;
    }
    return result;
  }

  function louGeneratePuzzle(stage) {
    var config = LOU_DIFFICULTY[Math.min(stage, 10)] || LOU_DIFFICULTY[10];
    var emptyTarget = Math.floor(Math.random() * (config.emptyMax - config.emptyMin + 1)) + config.emptyMin;
    
    louSolution = louGenerateSolution();
    louInitialBoard = louRemoveCellsSmart(louSolution, emptyTarget);
    
    louCurrentBoard = [];
    for (var i = 0; i < 81; i++) {
      louCurrentBoard[i] = louInitialBoard[i] || 0;
    }
    louSaveProgress();
  }

  function louRenderUI() {
    var main = document.getElementById('main-content');
    if (!main) return;
    
    var points = window.GameCore ? window.GameCore.getPoints() : 0;
    var stage = louStats.stage;
    var config = LOU_DIFFICULTY[Math.min(stage, 10)] || LOU_DIFFICULTY[10];
    
    var html = '<div class="lou-wrapper">';
    html += '<div class="gc-header" style="margin-bottom: 4px;">';
    html += '<h2>🔢 لودوكو <small style="font-size:0.8rem;color:var(--ml-text-light)">(' + config.name + ')</small></h2>';
    html += '<button class="gc-btn gc-btn-secondary" onclick="window.louHandleExit()">🏠 الرئيسية</button>';
    html += '</div>';
    
    html += '<div class="gc-stats-bar" style="margin-bottom: 4px;">';
    html += '<span>🏆 <span class="gc-points-display">' + points + '</span></span>';
    html += '<span>📊 مرحلة <span id="' + LOU_PREFIX + 'stage">' + stage + '</span></span>';
    html += '<span>❤️ <span id="' + LOU_PREFIX + 'lives">' + '❤️'.repeat(louStats.lives) + '</span></span>';
    html += '<span>↩️ <span id="' + LOU_PREFIX + 'undo">' + louStats.undoCount + '</span></span>';
    html += '</div>';
    
    html += '<div id="' + LOU_PREFIX + 'grid" class="lou-grid"></div>';
    
    html += '<div class="lou-numpad">';
    for (var n = 1; n <= 9; n++) {
      html += '<button class="gc-btn gc-btn-primary" onclick="window.louInput(' + n + ')">' + n + '</button>';
    }
    html += '<button class="gc-btn gc-btn-warning" onclick="window.louHint()">💡</button>';
    html += '<button class="gc-btn gc-btn-secondary" style="background:#6c757d" onclick="window.louUndo()">↩️</button>';
    html += '</div>';
    
    html += '<div class="st-footer">';
    html += '<button class="gc-btn gc-btn-danger" style="width:100%; height:36px;" onclick="window.louConfirmReset()">🔄 من البداية</button>';
    html += '</div>';
    html += '</div>';
    
    main.innerHTML = html;
    louUpdateStats();
  }

  function louDrawGrid() {
    var grid = document.getElementById(LOU_PREFIX + 'grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (!louCurrentBoard || louCurrentBoard.length !== 81) {
      console.error('louCurrentBoard غير مهيأ!');
      return;
    }
    
    for (var i = 0; i < 81; i++) {
      var cell = document.createElement('div');
      cell.className = 'l-cell';
      cell.setAttribute('data-idx', String(i));
      cell.id = LOU_PREFIX + 'c-' + String(i);
      
      var row = Math.floor(i / 9);
      var col = i % 9;
      
      if (col === 2 || col === 5) cell.classList.add('border-right-thick');
      if (row === 2 || row === 5) cell.classList.add('border-bottom-thick');
      
      var val = louCurrentBoard[i];
      if (val !== 0 && val !== undefined) {
        cell.textContent = String(val);
        if (louInitialBoard[i] !== 0) {
          cell.classList.add('fixed', 'given');
        } else {
          cell.classList.add('fixed', 'user-filled');
        }
      }
      
      (function(cellIndex, cellEl) {
        cellEl.onclick = function() { 
          louSelect(cellIndex, cellEl); 
        };
      })(i, cell);
      
      grid.appendChild(cell);
    }
  }

  function louSelect(idx, el) {
    louClearHighlights();
    louSelectedCellIndex = idx;
    el.classList.add('selected');
    louHighlightRelated(idx);
  }

  function louHighlightRelated(idx) {
    var row = Math.floor(idx / 9);
    var col = idx % 9;
    var br = Math.floor(row / 3) * 3;
    var bc = Math.floor(col / 3) * 3;
    
    for (var i = 0; i < 81; i++) {
      var r = Math.floor(i / 9);
      var c = i % 9;
      var cell = document.getElementById(LOU_PREFIX + 'c-' + i);
      if (!cell) continue;
      
      if (r === row) cell.classList.add('highlight-row');
      if (c === col) cell.classList.add('highlight-col');
      if (r >= br && r < br + 3 && c >= bc && c < bc + 3) cell.classList.add('highlight-box');
      
      if (louCurrentBoard[idx] !== 0 && louCurrentBoard[i] === louCurrentBoard[idx]) {
        cell.classList.add('highlight-same');
      }
    }
  }

  function louClearHighlights() {
    var cells = document.querySelectorAll('.l-cell');
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.remove('highlight-row', 'highlight-col', 'highlight-box', 'highlight-same', 'selected');
    }
  }

  window['louInput'] = function(val) {
    if (!window.GameCore) return;
    if (!window.GameCore.canExecuteGame(LOU_GAME_ID)) return;
    if (louSelectedCellIndex === -1) return;
    
    var cell = document.getElementById(LOU_PREFIX + 'c-' + louSelectedCellIndex);
    if (!cell || louInitialBoard[louSelectedCellIndex] !== 0) return;
    
    louSaveHistory(louSelectedCellIndex, louCurrentBoard[louSelectedCellIndex]);
    
    if (val === louSolution[louSelectedCellIndex]) {
      cell.textContent = String(val);
      cell.classList.add('fixed', 'user-filled');
      cell.classList.remove('selected', 'error');
      
      louCurrentBoard[louSelectedCellIndex] = val;
      window.GameCore.addPoints(5, 'إجابة صحيحة', LOU_GAME_ID);
      
      louSaveProgress();
      louCheckWin();
    } else {
      cell.classList.add('error');
      cell.textContent = String(val);
      
      louSetTimeout(function() {
        if (cell) {
          cell.classList.remove('error');
          cell.textContent = louCurrentBoard[louSelectedCellIndex] ? String(louCurrentBoard[louSelectedCellIndex]) : '';
        }
      }, 500);
      
      louStats.lives--;
      if (louStats.lives <= 0) {
        window.GameCore.toast('💔 انتهت الأرواح! إعادة المرحلة', 'error');
        louSetTimeout(function() {
          louStartNewRound();
        }, 1200);
        return;
      }
    }
    
    louHighlightRelated(louSelectedCellIndex);
    louUpdateStats();
  };

  function louSaveHistory(idx, oldValue) {
    louStats.history.push({ idx: idx, oldValue: oldValue, newValue: louCurrentBoard[idx] });
    if (louStats.history.length > 20) louStats.history.shift();
  }

  window['louUndo'] = function() {
    if (!window.GameCore) return;
    if (louStats.undoCount <= 0) {
      window.GameCore.toast('⚠️ نفدت محاولات التراجع!', 'warning');
      return;
    }
    if (louStats.history.length === 0) {
      window.GameCore.toast('⚠️ لا توجد خطوات للتراجع', 'info');
      return;
    }
    
    var last = louStats.history.pop();
    var cell = document.getElementById(LOU_PREFIX + 'c-' + last.idx);
    if (cell && louInitialBoard[last.idx] === 0) {
      if (last.oldValue === 0 || last.oldValue === undefined) {
        cell.textContent = '';
        cell.classList.remove('fixed', 'user-filled');
        louCurrentBoard[last.idx] = 0;
      } else {
        cell.textContent = String(last.oldValue);
        louCurrentBoard[last.idx] = last.oldValue;
      }
    }
    
    louStats.undoCount--;
    louSaveProgress();
    window.GameCore.toast('↩️ تم التراجع', 'info');
    louUpdateStats();
  };

  window['louHint'] = function() {
    if (!window.GameCore) return;
    
    var isFree = louStats.stage <= 3;
    var empties = [];
    for (var i = 0; i < 81; i++) {
      if (louCurrentBoard[i] === 0) empties.push(i);
    }
    
    if (!empties.length) {
      window.GameCore.toast('✅ اللغز مكتمل!', 'success');
      return;
    }
    
    var targetIdx = empties[Math.floor(Math.random() * empties.length)];
    var cell = document.getElementById(LOU_PREFIX + 'c-' + targetIdx);
    
    if (cell) {
      louSaveHistory(targetIdx, louCurrentBoard[targetIdx]);
      cell.textContent = String(louSolution[targetIdx]);
      cell.classList.add('fixed', 'user-filled');
      louCurrentBoard[targetIdx] = louSolution[targetIdx];
      
      if (!isFree) {
        window.GameCore.addPoints(-5, 'استخدام تلميح', LOU_GAME_ID);
        window.GameCore.toast('💡 تلميح (-5 نقاط)', 'info');
      } else {
        window.GameCore.toast('💡 تلميح مجاني!', 'success');
      }
      
      louSaveProgress();
      louCheckWin();
    }
  };

  function louCheckWin() {
    if (!window.GameCore) return;
    
    var full = true;
    var correct = true;
    
    for (var i = 0; i < 81; i++) {
      if (louCurrentBoard[i] === 0) full = false;
      if (louCurrentBoard[i] !== louSolution[i]) correct = false;
    }
    
    if (full && correct) {
      louStats.blocksSolved++;
      var bonus = 50 + (louStats.stage * 10);
      window.GameCore.addPoints(bonus, 'إكمال المرحلة', LOU_GAME_ID);
      
      window.GameCore.toast('🎉 أحسنت! +' + bonus + ' نقطة', 'success');
      
      if (typeof window.checkAndUnlockAchievements === 'function') {
        window.checkAndUnlockAchievements();
      }
      
      louSetTimeout(function() {
        louStats.stage++;
        louStats.undoCount = 3;
        louStartNewRound();
      }, 1500);
    }
  }

  function louStartNewRound() {
    louSelectedCellIndex = -1;
    louStats.lives = 3;
    louStats.undoCount = 3;
    louStats.history = [];
    
    louGeneratePuzzle(louStats.stage);
    louRenderUI();
    louDrawGrid();
  }

  function louSaveProgress() {
    if (!window.GameCore) return;
    
    window.GameCore.saveProgress(LOU_GAME_ID, {
      stage: louStats.stage,
      blocksSolved: louStats.blocksSolved,
      lastPlayed: Date.now(),
      gameType: 'loudoukou',
      currentBoard: louCurrentBoard,
      initialBoard: louInitialBoard,
      solution: louSolution
    });
  }

  function louLoadSavedProgress() {
    var saved = window.GameCore ? window.GameCore.loadProgress(LOU_GAME_ID) : null;
    if (saved && saved.currentBoard && saved.currentBoard.length === 81) {
      louStats.stage = saved.stage || 1;
      louStats.blocksSolved = saved.blocksSolved || 0;
      louCurrentBoard = saved.currentBoard.slice();
      louInitialBoard = saved.initialBoard.slice();
      louSolution = saved.solution.slice();
      return true;
    }
    return false;
  }

  function louUpdateStats() {
    var p = document.querySelectorAll('.gc-points-display');
    var s = document.getElementById(LOU_PREFIX + 'stage');
    var l = document.getElementById(LOU_PREFIX + 'lives');
    var u = document.getElementById(LOU_PREFIX + 'undo');
    
    if (window.GameCore) {
      var points = window.GameCore.getPoints();
      for (var i = 0; i < p.length; i++) {
        p[i].textContent = String(points);
      }
    }
    if (s) s.textContent = String(louStats.stage);
    if (l) {
      l.textContent = '❤️'.repeat(Math.max(0, louStats.lives));
    }
    if (u) u.textContent = String(louStats.undoCount);
  }

  window['louHandleExit'] = function() {
    louClearAllTimeouts();
    louSelectedCellIndex = -1;
    louGameVersion++;
    
    var main = document.getElementById('main-content');
    if (main) {
      main.innerHTML = '<div style="text-align:center; padding:60px; direction:rtl;"><div style="font-size:2.5rem; margin-bottom:15px;">🏠</div><p style="color:var(--text-secondary);">جاري العودة للرئيسية...</p></div>';
    }
    
    louSetTimeout(function() {
      if (typeof window.loadHomePage === 'function') {
        window.loadHomePage();
      }
    }, 30);
  };

  window['louConfirmReset'] = function() {
    if (!window.GameCore) return;
    
    window.GameCore.confirmAction(
      'إعادة من البداية',
      'هل أنت متأكد؟ سيتم فقدان تقدم هذه المرحلة!',
      function() {
        window.GameCore.resetProgress(LOU_GAME_ID);
        louStats.stage = 1;
        louStats.blocksSolved = 0;
        louStartNewRound();
        window.GameCore.toast('🔄 تم البدء من البداية', 'info');
      },
      function() {
        window.GameCore.toast('تم الإلغاء', 'info');
      }
    );
  };

  window['loadLoudoukouPage'] = function() {
    console.log('🎮 Loudoukou: تحميل اللعبة...');
    louInjectStyles();
    louCleanupExecuted = 0;
    louCleanupLock = false;
    louCleanup();
    louGameVersion++;
    
    if (window.GameCore) {
      window.GameCore.registerGame(LOU_GAME_ID, louCleanup);
    }
    
    var hasProgress = louLoadSavedProgress();
    
    if (!hasProgress) {
      louStats.stage = 1;
      louStats.blocksSolved = 0;
      louGeneratePuzzle(louStats.stage);
    }
    
    louStats.lives = 3;
    louStats.undoCount = 3;
    louStats.history = [];
    louStats.points = window.GameCore ? window.GameCore.getPoints() : 0;
    
    louRenderUI();
    louDrawGrid();
  };

  if (!window._louBeforeUnloadAttached) {
    window.addEventListener('beforeunload', louCleanup);
    window._louBeforeUnloadAttached = true;
  }

})();
