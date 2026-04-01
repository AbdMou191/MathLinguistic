// ==========================================
// 🔢 Loudoukou Game - نسخة محسنة v6.4
// MathLinguistic - إصلاح الحدود والتهيئة
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
    1: { emptyMin: 15, emptyMax: 20, name: "سهل جداً" },
    2: { emptyMin: 20, emptyMax: 25, name: "سهل" },
    3: { emptyMin: 25, emptyMax: 30, name: "متوسط" },
    4: { emptyMin: 30, emptyMax: 35, name: "متوسط+" },
    5: { emptyMin: 35, emptyMax: 40, name: "صعب" },
    6: { emptyMin: 40, emptyMax: 45, name: "صعب+" },
    7: { emptyMin: 45, emptyMax: 50, name: "محترف" },
    8: { emptyMin: 50, emptyMax: 55, name: "محترف+" },
    9: { emptyMin: 55, emptyMax: 60, name: "أسطورة" },
    10: { emptyMin: 60, emptyMax: 65, name: "إعصار ذهني" }
  };

  function louClearAllTimeouts() {
    for (var i = 0; i < louTimeouts.length; i++) {
      clearTimeout(louTimeouts[i]);
    }
    louTimeouts = [];
  }

  function louSetTimeout(callback, delay) {    var tid = setTimeout(callback, delay);
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
        for (var n = 1; n <= 9; n++) {
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
    for (var i = 0; i < 9; i += 3) {
      var nums = [1,2,3,4,5,6,7,8,9].sort(function() { return Math.random() - 0.5; });
      for (var j = 0; j < 3; j++) {
        for (var k = 0; k < 3; k++) {
          board[(i + j) * 9 + (i + k)] = nums[j * 3 + k];
        }
      }
    }
    louSolve(board);
    return board;
  }

  function louRemoveCellsSmart(board, emptyCount) {
    var result = board.slice();
    var removed = 0;
    var attempts = 0;
    var maxAttempts = 500;
    
    var regionMin = {};
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        regionMin[r + '-' + c] = 3;
      }
    }
    
    while (removed < emptyCount && attempts < maxAttempts) {
      attempts++;
      var idx = Math.floor(Math.random() * 81);
      if (result[idx] === 0) continue;
      
      var row = Math.floor(idx / 9);
      var col = idx % 9;
      var regionKey = Math.floor(row / 3) + '-' + Math.floor(col / 3);
      
      var rowCount = 0, colCount = 0, regionCount = 0;
      for (var i = 0; i < 9; i++) {
        if (result[row * 9 + i] !== 0) rowCount++;
        if (result[i * 9 + col] !== 0) colCount++;      }
      var br = Math.floor(row / 3) * 3;
      var bc = Math.floor(col / 3) * 3;
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          if (result[(br + i) * 9 + (bc + j)] !== 0) regionCount++;
        }
      }
      
      if (rowCount > 4 && colCount > 4 && regionCount > regionMin[regionKey]) {
        result[idx] = 0;
        removed++;
        regionMin[regionKey] = Math.max(0, regionMin[regionKey] - 1);
      }
    }
    return result;
  }

  function louGeneratePuzzle(stage) {
    var config = LOU_DIFFICULTY[Math.min(stage, 10)] || LOU_DIFFICULTY[10];
    var emptyTarget = Math.floor(Math.random() * (config.emptyMax - config.emptyMin + 1)) + config.emptyMin;
    
    louSolution = louGenerateSolution();
    louInitialBoard = louRemoveCellsSmart(louSolution, emptyTarget);
    
    // ✅ تهيئة صحيحة
    louCurrentBoard = [];
    for (var i = 0; i < 81; i++) {
      louCurrentBoard[i] = louInitialBoard[i] || 0;
    }
  }

  function louRenderUI() {
    var main = document.getElementById('main-content');
    if (!main) return;
    
    var points = window.GameCore ? window.GameCore.getPoints() : 0;
    var stage = louStats.stage;
    var config = LOU_DIFFICULTY[Math.min(stage, 10)] || LOU_DIFFICULTY[10];
    
    var html = '<div class="lou-wrapper">';
    html += '<div class="gc-header">';
    html += '<h2>🔢 لودوكو <small style="font-size:0.9rem;color:var(--ml-text-light)">(' + config.name + ')</small></h2>';
    html += '<button class="gc-btn gc-btn-secondary" onclick="window.louHandleExit()">🏠 الرئيسية</button>';
    html += '</div>';
    
    html += '<div class="gc-stats-bar">';
    html += '<span>🏆 <span class="gc-points-display">' + points + '</span></span>';
    html += '<span>📊 مرحلة <span id="' + LOU_PREFIX + 'stage">' + stage + '</span></span>';
    html += '<span>❤️ <span id="' + LOU_PREFIX + 'lives">' + '❤️'.repeat(louStats.lives) + '</span></span>';    html += '<span>↩️ <span id="' + LOU_PREFIX + 'undo">' + louStats.undoCount + '</span></span>';
    html += '</div>';
    
    html += '<div id="' + LOU_PREFIX + 'grid" class="lou-grid"></div>';
    
    html += '<div class="lou-numpad">';
    for (var n = 1; n <= 9; n++) {
      html += '<button class="gc-btn gc-btn-primary" style="height:50px;font-size:1.2rem;" onclick="window.louInput(' + n + ')">' + n + '</button>';
    }
    html += '<button class="gc-btn gc-btn-warning" style="height:50px;" onclick="window.louHint()">💡</button>';
    html += '<button class="gc-btn gc-btn-secondary" style="height:50px;background:#6c757d" onclick="window.louUndo()">↩️</button>';
    html += '</div>';
    
    html += '<div class="st-footer">';
    html += '<button class="gc-btn gc-btn-danger" onclick="window.louConfirmReset()">🔄 من البداية</button>';
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
      
      var row = Math.floor(i / 9);
      
      // ✅ إضافة فئة للصفوف 3 و 6
      if (row === 2 || row === 5) {
        cell.classList.add('border-bottom-thick');
      }
      
      var val = louCurrentBoard[i];
      if (val !== 0 && val !== undefined) {
        cell.textContent = String(val);
        cell.classList.add('fixed');
        if (louInitialBoard[i] !== 0) {
          cell.classList.add('given');
        } else {
          cell.classList.add('user-filled');
        }
      } else {
        cell.setAttribute('data-idx', String(i));
        (function(cellIndex) {
          cell.onclick = function() { 
            louSelect(cellIndex, cell); 
          };
        })(i);
        cell.id = LOU_PREFIX + 'c-' + String(i);
      }
      
      grid.appendChild(cell);
    }
}

  function louSelect(idx, el) {
    if (louSelectedCellIndex !== -1) {
      var prev = document.getElementById(LOU_PREFIX + 'c-' + louSelectedCellIndex);
      if (prev) {
        prev.classList.remove('selected');
        louClearHighlights();
      }
    }
    
    louSelectedCellIndex = idx;
    el.classList.add('selected');
    louHighlightRelated(idx);
  }

  function louHighlightRelated(idx) {
    var row = Math.floor(idx / 9);
    var col = idx % 9;
    var br = Math.floor(row / 3) * 3;
    var bc = Math.floor(col / 3) * 3;
    
    for (var colIdx = 0; colIdx < 9; colIdx++) {
      var cellId1 = LOU_PREFIX + 'c-' + (row * 9 + colIdx);
      var cell1 = document.getElementById(cellId1);
      if (cell1 && !cell1.classList.contains('fixed')) {
        cell1.classList.add('highlight-row');
      }
    }
        for (var rowIdx = 0; rowIdx < 9; rowIdx++) {
      var cellId2 = LOU_PREFIX + 'c-' + (rowIdx * 9 + col);
      var cell2 = document.getElementById(cellId2);
      if (cell2 && !cell2.classList.contains('fixed')) {
        cell2.classList.add('highlight-col');
      }
    }
    
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var cellIdx = (br + i) * 9 + (bc + j);
        var cellId3 = LOU_PREFIX + 'c-' + cellIdx;
        var cell3 = document.getElementById(cellId3);
        if (cell3 && !cell3.classList.contains('fixed')) {
          cell3.classList.add('highlight-box');
        }
      }
    }
    
    var selectedVal = louCurrentBoard[idx];
    if (selectedVal !== 0 && selectedVal !== undefined) {
      var allCells = document.querySelectorAll('.l-cell:not(.fixed)');
      for (var k = 0; k < allCells.length; k++) {
        var c = allCells[k];
        var cIdx = parseInt(c.getAttribute('data-idx'));
        if (louCurrentBoard[cIdx] === selectedVal) {
          c.classList.add('highlight-same');
        }
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
    if (!cell || cell.classList.contains('fixed')) return;
    
    louSaveHistory(louSelectedCellIndex, louCurrentBoard[louSelectedCellIndex]);
    
    if (val === louSolution[louSelectedCellIndex]) {      cell.textContent = String(val);
      cell.classList.add('fixed', 'user-filled', 'success');
      cell.classList.remove('selected', 'error');
      cell.style.animation = 'lou-pop 0.3s';
      
      louCurrentBoard[louSelectedCellIndex] = val;
      window.GameCore.addPoints(5, 'إجابة صحيحة', LOU_GAME_ID);
      louCheckWin();
    } else {
      cell.classList.add('error');
      cell.style.animation = 'lou-shake 0.3s';
      
      louSetTimeout(function() {
        if (cell) {
          cell.classList.remove('error');
          cell.textContent = '';
          louCurrentBoard[louSelectedCellIndex] = 0;
        }
      }, 400);
      
      louStats.lives--;
      if (louStats.lives <= 0) {
        window.GameCore.toast('💔 انتهت الأرواح! إعادة المرحلة', 'error');
        louSetTimeout(function() {
          louStartNewRound();
        }, 1500);
        return;
      }
    }
    
    louClearHighlights();
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
    if (cell && !cell.classList.contains('fixed')) {
      if (last.oldValue === 0 || last.oldValue === undefined) {
        cell.textContent = '';
        louCurrentBoard[last.idx] = 0;
      } else {
        cell.textContent = String(last.oldValue);
        louCurrentBoard[last.idx] = last.oldValue;
      }
      cell.classList.remove('user-filled', 'success', 'error');
    }
    
    louStats.undoCount--;
    window.GameCore.toast('↩️ تم التراجع', 'info');
    louUpdateStats();
  };

  window['louHint'] = function() {
    if (!window.GameCore) return;
    
    var isFree = louStats.stage <= 3;
    
    var empties = [];
    for (var i = 0; i < 81; i++) {
      if (louCurrentBoard[i] === 0 || louCurrentBoard[i] === undefined) empties.push(i);
    }
    
    if (!empties.length) {
      window.GameCore.toast('✅ اللغز مكتمل!', 'success');
      return;
    }
    
    var logicalCell = louFindLogicalCell(empties);
    var targetIdx = logicalCell !== null ? logicalCell : empties[Math.floor(Math.random() * empties.length)];
    
    var cell = document.getElementById(LOU_PREFIX + 'c-' + targetIdx);
    if (cell) {
      louSaveHistory(targetIdx, louCurrentBoard[targetIdx]);
      cell.textContent = String(louSolution[targetIdx]);
      cell.classList.add('fixed', 'user-filled', 'success');
      louCurrentBoard[targetIdx] = louSolution[targetIdx];
      
      if (!isFree) {
        window.GameCore.addPoints(-5, 'استخدام تلميح', LOU_GAME_ID);
        window.GameCore.toast('💡 تلميح (-5 نقاط)', 'info');
      } else {
        window.GameCore.toast('💡 تلميح مجاني!', 'success');
      }
            louCheckWin();
    }
  };

  function louFindLogicalCell(empties) {
    for (var i = 0; i < empties.length; i++) {
      var idx = empties[i];
      var possible = [];
      for (var n = 1; n <= 9; n++) {
        if (louIsValid(louCurrentBoard, idx, n)) possible.push(n);
      }
      if (possible.length === 1) return idx;
    }
    return null;
  }

  function louCheckWin() {
    if (!window.GameCore) return;
    
    var full = true;
    var correct = true;
    
    for (var i = 0; i < 81; i++) {
      if (louCurrentBoard[i] === 0 || louCurrentBoard[i] === undefined) full = false;
      if (louCurrentBoard[i] !== louSolution[i]) correct = false;
    }
    
    if (full && correct) {
      louStats.blocksSolved++;
      
      var bonus = 50 + (louStats.stage * 10);
      window.GameCore.addPoints(bonus, 'إكمال المرحلة', LOU_GAME_ID);
      
      louSaveProgress();
      
      window.GameCore.toast('🎉 أحسنت! +' + bonus + ' نقطة', 'success');
      
      louSetTimeout(function() {
        louStats.stage++;
        louStats.undoCount = 3;
        louStartNewRound();
      }, 2000);
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
    
    var filled = louInitialBoard.filter(function(x) { return x !== 0 && x !== undefined; }).length;
    var percentage = Math.round((filled / 81) * 100);
    
    if (window.GameCore) {
      window.GameCore.toast('المرحلة ' + louStats.stage + ': ' + percentage + '% مملوءة', 'info');
    }
  }

  function louSaveProgress() {
    if (!window.GameCore) return;
    
    window.GameCore.saveProgress(LOU_GAME_ID, {
      stage: louStats.stage,
      blocksSolved: louStats.blocksSolved,
      lastPlayed: Date.now(),
      gameType: 'loudoukou',
      currentBoard: louCurrentBoard.slice(),
      initialBoard: louInitialBoard.slice(),
      solution: louSolution.slice()
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
        p[i].textContent = String(points);      }
    }
    if (s) s.textContent = String(louStats.stage);
    if (l) {
      l.textContent = '❤️'.repeat(Math.max(0, louStats.lives));
      l.style.animation = louStats.lives === 1 ? 'lou-shake 0.5s infinite' : 'none';
    }
    if (u) u.textContent = String(louStats.undoCount);
  }

  window['louHandleExit'] = function() {
    console.log('🚪 Loudoukou: خروج فوري...');
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
    }
    
    louStats.lives = 3;
    louStats.undoCount = 3;
    louStats.history = [];
    louStats.points = window.GameCore ? window.GameCore.getPoints() : 0;
    
    // ✅ تأكد من التهيئة BEFORE الرسم
    if (!louCurrentBoard || louCurrentBoard.length !== 81) {
      console.log('🎲 إنشاء لغز جديد...');
      louGeneratePuzzle(louStats.stage);
    }
    
    // ✅ render أولاً ثم draw
    louRenderUI();
    louDrawGrid();
    
    console.log('✅ اللعبة جاهزة!');
};

  if (!window._louBeforeUnloadAttached) {
    window.addEventListener('beforeunload', louCleanup);
    window._louBeforeUnloadAttached = true;
  }

})();