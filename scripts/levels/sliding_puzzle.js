// ==========================================
// 🧩 Sliding Puzzle Game - نسخة مستقلة v5.3
// MathLinguistic - تصميم متجاوب
// ==========================================

(function() {
  'use strict';

  var SP_GAME_ID = 'sliding-puzzle';
  var SP_PREFIX = 'sp-';
  
  var spSize = 3;
  var spTiles = [];
  var spSolution = [];
  var spMoves = 0;
  var spSeconds = 0;
  var spTimerInterval = null;
  var spGameVersion = 0;
  var spIsComplete = false;

  var spStats = {
    points: 0,
    lives: 3,
    maxGridSolved: 3
  };

  // ✅ متغيرات الحماية من التكرار (أضفها في أعلى الملف مع المتغيرات الأخرى)
var spCleanupExecuted = 0;
var spCleanupLock = false;

// ✅ الدالة المحسّنة
function spCleanup() {
  // 🚫 منع التكرار: إذا كانت قيد التنفيذ، اخرج فوراً
  if (spCleanupLock) {
    console.log('🧩 Sliding Puzzle: تنظيف قيد التنفيذ - تخطي');
    return;
  }
  
  // 🚫 منع التكرار: إذا نُفّذت خلال آخر 300 مللي، اخرج
  var now = Date.now();
  if (spCleanupExecuted && (now - spCleanupExecuted) < 300) {
    console.log('🧩 Sliding Puzzle: تنظيف حديث - تخطي');
    return;
  }
  
  // 🔒 قفل التنفيذ
  spCleanupLock = true;
  console.log('🧹 Sliding Puzzle: بدء التنظيف...');
  
  try {
    // زيادة النسخة لإبطال العمليات القديمة
    spGameVersion++;
    
    // إيقاف المؤقت الرئيسي
    if (spTimerInterval) {
      clearInterval(spTimerInterval);
      if (window.GameCore && typeof window.GameCore.unregisterInterval === 'function') {
        window.GameCore.unregisterInterval(spTimerInterval);
      }
      spTimerInterval = null;
    }
    
    // تنظيف GameCore للعبة الحالية فقط (بدون cleanupAll)
    if (window.GameCore && typeof window.GameCore.cleanupGame === 'function') {
      window.GameCore.cleanupGame(SP_GAME_ID);
    }
    
    // إعادة تعيين حالة اللعبة
    spIsComplete = false;
    
    // ✅ تحديث علامة التنفيذ
    spCleanupExecuted = Date.now();
    
    console.log('✅ Sliding Puzzle: اكتمل التنظيف');
    
  } catch (e) {
    console.error('❌ خطأ في spCleanup:', e);
  } finally {
    // 🔓 فتح القفل بعد 150 مللي للسماح بتنظيف حقيقي لاحقاً
    setTimeout(function() {
      spCleanupLock = false;
    }, 150);
  }
}

  window.loadSlidingPuzzlePage = function() {
    console.log('🎮 Sliding Puzzle: تحميل اللعبة...');
        spCleanup();
    spGameVersion++;
    
    if (window.GameCore) {
      window.GameCore.registerGame(SP_GAME_ID, spCleanup);
    }
    
    spMoves = 0;
    spSeconds = 0;
    spStats.lives = 3;
    spStats.points = window.GameCore ? window.GameCore.getPoints() : 0;
    spStats.maxGridSolved = parseInt(localStorage.getItem('sp_max_grid') || '3');
    
    var savedProgress = window.GameCore ? window.GameCore.loadProgress(SP_GAME_ID) : null;
    if (savedProgress && savedProgress.maxSize) {
      spSize = savedProgress.maxSize;
    } else {
      spSize = 3;
    }
    
    spRenderUI();
    window.GameCore.registerTimeout(setTimeout(function() { spInitGame(spSize); }, 100));
  };

  function spRenderUI() {
    var mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    var optionsHtml = '';
    for (var n = 3; n <= 9; n++) {
      var selected = n === spSize ? 'selected' : '';
      optionsHtml += '<option value="' + n + '" ' + selected + '>' + n + '×' + n + '</option>';
    }

    var html = '<div class="sp-container">';
    html += '<div class="gc-header">';
    html += '<h2>🧩 الأرقام المنزلقة</h2>';
    html += '<button class="gc-btn gc-btn-secondary" onclick="window.spHandleExit()">🏠 الرئيسية</button>';
    html += '</div>';
    
    html += '<div class="gc-stats-bar">';
    html += '<span>🏆 <span class="gc-points-display">' + spStats.points + '</span></span>';
    html += '<span>❤️ <span id="' + SP_PREFIX + 'lives">' + spStats.lives + '</span></span>';
    html += '<span>⏱️ <span id="' + SP_PREFIX + 'timer">00:00</span></span>';
    html += '<span>👣 <span id="' + SP_PREFIX + 'moves">0</span></span>';
    html += '</div>';
    
    html += '<div class="sp-row">';
    html += '<label style="font-weight:bold; font-size:0.85rem;">حجم الشبكة:</label>';
    html += '<select id="' + SP_PREFIX + 'size" class="sp-select" onchange="window.spOnSizeChange(parseInt(this.value))">';    html += optionsHtml;
    html += '</select>';
    html += '</div>';
    
    html += '<div id="' + SP_PREFIX + 'board" class="sp-board"></div>';
    
    html += '<div class="sp-controls">';
    html += '<div class="sp-row">';
    html += '<button class="gc-btn gc-btn-primary" style="flex:1;" onclick="window.spShuffle()">🔄 خلط جديد</button>';
    html += '<button class="gc-btn gc-btn-danger" style="flex:1;" onclick="window.spConfirmReset()">🔄 من البداية</button>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    
    mainContent.innerHTML = html;
  }

  window.spOnSizeChange = function(newSize) {
    if (newSize && newSize > 0 && newSize !== spSize) {
      spInitGame(newSize);
    }
  };

  window.spInitGame = function(newSize) {
    if (!window.GameCore) return;
    if (!window.GameCore.canExecuteGame(SP_GAME_ID)) return;
    
    if (newSize && newSize > 0) {
      spSize = newSize;
    }
    
    var select = document.getElementById(SP_PREFIX + 'size');
    if (select) select.value = spSize.toString();
    
    spMoves = 0;
    spSeconds = 0;
    spStats.lives = spSize;
    spIsComplete = false;
    
    if (spTimerInterval) clearInterval(spTimerInterval);
    spStartTimer();
    
    spSolution = [];
    for (var i = 0; i < spSize * spSize - 1; i++) {
      spSolution.push(i + 1);
    }
    spSolution.push(null);
    
    spTiles = spSolution.slice();
    spShuffleTiles();    spDrawBoard();
    spUpdateStats();
    
    window.GameCore.toast('لغز ' + spSize + '×' + spSize + ' | ' + spStats.lives + ' محاولات', 'info');
  };

  window.spShuffle = function() {
    if (!window.GameCore) return;
    if (!window.GameCore.canExecuteGame(SP_GAME_ID)) return;
    if (!document.getElementById(SP_PREFIX + 'board')) return;
    
    spMoves = 0;
    spSeconds = 0;
    spStats.lives = spSize;
    spIsComplete = false;
    
    if (spTimerInterval) clearInterval(spTimerInterval);
    spStartTimer();
    spTiles = spSolution.slice();
    spShuffleTiles();
    spDrawBoard();
    spUpdateStats();
    
    window.GameCore.toast('تم الخلط!', 'info');
  };

  function spShuffleTiles() {
    var emptyIdx = spTiles.indexOf(null);
    var previousIdx = -1;
    var shuffleMoves = spSize * 30;
    
    for (var i = 0; i < shuffleMoves; i++) {
      var neighbors = spGetNeighbors(emptyIdx);
      var validNeighbors = [];
      for (var j = 0; j < neighbors.length; j++) {
        if (neighbors[j] !== previousIdx) {
          validNeighbors.push(neighbors[j]);
        }
      }
      var move = validNeighbors.length > 0 
        ? validNeighbors[Math.floor(Math.random() * validNeighbors.length)]
        : neighbors[Math.floor(Math.random() * neighbors.length)];
      
      var temp = spTiles[emptyIdx];
      spTiles[emptyIdx] = spTiles[move];
      spTiles[move] = temp;
      previousIdx = emptyIdx;
      emptyIdx = move;
    }
  }
  function spGetNeighbors(idx) {
    var n = [];
    var r = Math.floor(idx / spSize);
    var c = idx % spSize;
    if (r > 0) n.push(idx - spSize);
    if (r < spSize - 1) n.push(idx + spSize);
    if (c > 0) n.push(idx - 1);
    if (c < spSize - 1) n.push(idx + 1);
    return n;
  }

  function spDrawBoard() {
    var board = document.getElementById(SP_PREFIX + 'board');
    if (!board) return;
    
    board.innerHTML = '';
    board.style.gridTemplateColumns = 'repeat(' + spSize + ', 1fr)';
    
    var fontSize;
    if (spSize <= 3) fontSize = '1.8rem';
    else if (spSize <= 5) fontSize = '1.3rem';
    else if (spSize <= 7) fontSize = '1rem';
    else fontSize = '0.85rem';

    for (var i = 0; i < spTiles.length; i++) {
      var tile = spTiles[i];
      var cell = document.createElement('div');
      cell.className = tile === null ? 'sp-tile sp-tile-empty' : 'sp-tile';
      
      cell.style.fontSize = fontSize;
      cell.innerText = tile !== null ? tile.toString() : '';
      
      if (tile !== null) {
        (function(idx) {
          cell.onclick = function() { spHandleMove(idx); };
        })(i);
        cell.style.cursor = 'pointer';
      } else {
        cell.style.cursor = 'default';
      }
      
      board.appendChild(cell);
    }
  }

  function spHandleMove(idx) {
    if (!window.GameCore) return;
    if (!window.GameCore.canExecuteGame(SP_GAME_ID)) return;
        var emptyIdx = spTiles.indexOf(null);
    var neighbors = spGetNeighbors(emptyIdx);
    
    var isNeighbor = false;
    for (var i = 0; i < neighbors.length; i++) {
      if (neighbors[i] === idx) {
        isNeighbor = true;
        break;
      }
    }
    
    if (isNeighbor) {
      var temp = spTiles[idx];
      spTiles[idx] = spTiles[emptyIdx];
      spTiles[emptyIdx] = temp;
      spMoves++;
      spDrawBoard();
      spUpdateStats();
      spCheckWin();
    } else {
      spStats.lives--;
      
      var cells = document.querySelectorAll('.' + SP_PREFIX + 'tile');
      if (cells[idx]) {
        cells[idx].classList.add('sp-tile-wrong');
        window.GameCore.registerTimeout(setTimeout(function() {
          if (cells[idx]) cells[idx].classList.remove('sp-tile-wrong');
        }, 400));
      }
      
      spUpdateStats();
      
      if (spStats.lives <= 0) {
        window.GameCore.toast('💔 انتهت المحاولات!', 'error');
        window.GameCore.registerTimeout(setTimeout(function() {
          window.spShuffle();
        }, 1500));
      }
    }
  }

  function spCheckWin() {
    if (!window.GameCore) return;
    if (!window.GameCore.canExecuteGame(SP_GAME_ID)) return;
    
    var isWin = true;
    for (var i = 0; i < spTiles.length; i++) {
      if (spTiles[i] !== spSolution[i]) {
        isWin = false;
        break;      }
    }
    
    if (isWin) {
      spIsComplete = true;
      
      if (spTimerInterval) {
        clearInterval(spTimerInterval);
        if (window.GameCore) {
          window.GameCore.unregisterInterval(spTimerInterval);
        }
      }
      
      var winBonus = spSize * 15;
      window.GameCore.addPoints(winBonus, 'فوز باللغز', SP_GAME_ID);
      
      spSaveProgress();
      
      if (spSize > spStats.maxGridSolved) {
        spStats.maxGridSolved = spSize;
        localStorage.setItem('sp_max_grid', spSize.toString());
        window.GameCore.toast('🎉 رقم قياسي! (' + spSize + '×' + spSize + ')', 'success');
      } else {
        window.GameCore.toast('🎉 ربحت ' + winBonus + ' نقطة', 'success');
      }

      spUpdateStats();

      if (spSize < 9) {
        window.GameCore.registerTimeout(setTimeout(function() {
          var nextSize = spSize + 1;
          window.GameCore.toast('🚀 الانتقال إلى ' + nextSize + '×' + nextSize + '...', 'info');
          window.spInitGame(nextSize);
        }, 2000));
      } else {
        window.GameCore.toast('👑 أكملت جميع المستويات!', 'success');
      }
    }
  }

  function spSaveProgress() {
    if (!window.GameCore) return;
    
    window.GameCore.saveProgress(SP_GAME_ID, {
      maxSize: spSize,
      maxGridSolved: spStats.maxGridSolved,
      completed: true,
      lastPlayed: Date.now(),
      gameType: 'sliding-puzzle'
    });    
    console.log('💾 Sliding Puzzle: تم حفظ التقدم - لغز ' + spSize + '×' + spSize + ' مكتمل');
  }

  function spUpdateStats() {
    var p = document.querySelectorAll('.gc-points-display');
    var l = document.getElementById(SP_PREFIX + 'lives');
    var m = document.getElementById(SP_PREFIX + 'moves');
    var t = document.getElementById(SP_PREFIX + 'timer');
    
    if (window.GameCore) {
      var points = window.GameCore.getPoints();
      for (var i = 0; i < p.length; i++) {
        p[i].textContent = points;
      }
    }
    
    if (l) {
      var hearts = '';
      for (var j = 0; j < Math.max(0, spStats.lives); j++) {
        hearts += '❤️';
      }
      l.innerText = hearts;
      
      if (spStats.lives <= 2) {
        l.style.animation = 'sp-shake 0.5s infinite';
        l.style.color = '#e74c3c';
      } else {
        l.style.animation = 'none';
        l.style.color = 'var(--ml-text)';
      }
    }
    
    if (m) m.innerText = spMoves.toString();
    if (t) {
      var mins = Math.floor(spSeconds / 60);
      var secs = spSeconds % 60;
      t.innerText = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
  }

  function spStartTimer() {
    if (spTimerInterval) clearInterval(spTimerInterval);
    
    var currentVersion = spGameVersion;
    spTimerInterval = window.GameCore.registerInterval(setInterval(function() {
      if (currentVersion !== spGameVersion) {
        clearInterval(spTimerInterval);
        return;
      }      if (!window.GameCore.canExecuteGame(SP_GAME_ID)) {
        clearInterval(spTimerInterval);
        return;
      }
      spSeconds++;
      spUpdateStats();
    }, 1000));
  }

  // ⚡ خروج فوري وآمن إلى الرئيسية
  window.spHandleExit = function() {
    console.log('🚪 Sliding Puzzle: خروج فوري...');
    
    // ✅ إيقاف المؤقت فوراً
    if (spTimerInterval) {
      clearInterval(spTimerInterval);
      if (window.GameCore) {
        window.GameCore.unregisterInterval(spTimerInterval);
      }
      spTimerInterval = null;
    }
    
    // ✅ تنظيف متغيرات اللعبة لمنع التداخل
    spIsComplete = false;
    spGameVersion++;
    
    // ✅ مؤشر تحميل فوري لتحسين تجربة المستخدم
    var mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = '<div style="text-align:center; padding:60px; direction:rtl;"><div style="font-size:2.5rem; margin-bottom:15px;">🏠</div><p style="color:var(--text-secondary);">جاري العودة للرئيسية...</p></div>';
    }
    
    // ✅ العودة للرئيسية بعد تأخير بسيط جداً
    setTimeout(function() {
      if (typeof window.loadHomePage === 'function') {
        window.loadHomePage();
      }
    }, 30);
  };

  window.spConfirmReset = function() {
    if (!window.GameCore) return;
    
    window.GameCore.confirmAction(
      'إعادة من البداية',
      'هل أنت متأكد؟ سيتم فقدان التقدم!',
      function() {
        window.GameCore.resetProgress(SP_GAME_ID);
        spSize = 3;
        spMoves = 0;        spSeconds = 0;
        spStats.lives = 3;
        spStats.maxGridSolved = 3;
        localStorage.removeItem('sp_max_grid');
        spInitGame(3);
        window.GameCore.toast('🔄 تم البدء من البداية', 'info');
      },
      function() {
        window.GameCore.toast('تم الإلغاء', 'info');
      }
    );
  };

  // ✅ بعد: تحقق أولاً لمنع التكرار
  if (!window._spBeforeUnloadAttached) {
    window.addEventListener('beforeunload', spCleanup);
    window._spBeforeUnloadAttached = true;
  }

})();