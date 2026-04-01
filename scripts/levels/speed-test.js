// ==========================================
// ⚡ Speed Test Game - نسخة مستقلة v5.3 (سريعة)
// MathLinguistic - تصميم متجاوب
// ==========================================

(function() {
  'use strict';

  var ST_GAME_ID = 'speed-test';
  var ST_PREFIX = 'st-';
  
  var stGameData = null;
  var stGameVersion = 0;
  var stTimer = null;

  // ✅ علامة لمنع تكرار التنظيف
let stCleanupExecuted = 0;
var stCleanupLock = false;

function stCleanup() {
  // ✅ منع التكرار: إذا نُفّذت مؤخراً، اخرج فوراً
  if (stCleanupLock) {
    console.log('⚡ Speed Test: تنظيف قيد التنفيذ - تخطي');
    return;
  }
  
  // ✅ منع التكرار: إذا نُفّذت خلال آخر 200 مللي، اخرج
  var now = Date.now();
  if (stCleanupExecuted && (now - stCleanupExecuted) < 200) {
    console.log('⚡ Speed Test: تنظيف حديث - تخطي');
    return;
  }
  
  // ✅ قفل التنفيذ
  stCleanupLock = true;
  console.log('🧹 Speed Test: بدء التنظيف...');
  
  try {
    // زيادة النسخة لمنع تداخل العمليات القديمة
    stGameVersion++;
    
    // إيقاف المؤقت الرئيسي
    if (stTimer) {
      clearInterval(stTimer);
      if (window.GameCore && typeof window.GameCore.unregisterInterval === 'function') {
        window.GameCore.unregisterInterval(stTimer);
      }
      stTimer = null;
    }
    
    // تنظيف GameCore للعبة الحالية فقط (بدون cleanupAll)
    if (window.GameCore && typeof window.GameCore.cleanupGame === 'function') {
      window.GameCore.cleanupGame(ST_GAME_ID);
    }
    
    // تنظيف _ResourceManager
    if (window._ResourceManager && typeof window._ResourceManager.cleanup === 'function') {
      window._ResourceManager.cleanup(ST_GAME_ID);
    }
    
    // إعادة تعيين البيانات
    stGameData = null;
    
    // ✅ تحديث علامة التنفيذ
    stCleanupExecuted = Date.now();
    
    console.log('✅ Speed Test: اكتمل التنظيف');
    
  } catch (e) {
    console.error('❌ خطأ في stCleanup:', e);
  } finally {
    // ✅ فتح القفل بعد 100 مللي للسماح بتنظيف حقيقي لاحقاً إذا لزم
    setTimeout(function() {
      stCleanupLock = false;
    }, 100);
  }
}

  function stGenerateQuestion(level) {
    var ops = ['+', '-', '×', '÷'];
    var maxNum = Math.min(10 + level * 2, 100);
    var a = Math.floor(Math.random() * maxNum) + 1;
    var b = Math.floor(Math.random() * maxNum) + 1;
    var op = ops[Math.floor(Math.random() * ops.length)];
    
    var text, answer;
    if (op === '+') { 
      text = a + ' + ' + b; 
      answer = a + b; 
    }
    else if (op === '-') {
      var big = a >= b ? a : b;      var small = a >= b ? b : a;
      text = big + ' - ' + small; 
      answer = big - small;
    }
    else if (op === '×') {
      var ma = Math.floor(Math.random() * 12) + 2;
      var mb = Math.floor(Math.random() * 10) + 2;
      text = ma + ' × ' + mb; 
      answer = ma * mb;
    }
    else {
      var div = Math.floor(Math.random() * 10) + 1;
      var target = (Math.floor(Math.random() * 10) + 1) * div;
      text = target + ' ÷ ' + div; 
      answer = target / div;
    }
    
    return { 
      id: 'st_q_' + level + '_' + Date.now(), 
      text: text, 
      answer: answer,
      level: level 
    };
  }

  function stGenerateOptions(correct, count) {
    if (!count) count = 4;
    var opts = {};
    opts[correct] = true;
    
    while (Object.keys(opts).length < count) {
      var dev = Math.floor(Math.random() * 15) + 1;
      var val = Math.random() > 0.5 ? correct + dev : correct - dev;
      if (val >= 0) opts[Math.round(val * 10) / 10] = true;
    }
    
    var result = [];
    for (var key in opts) {
      if (opts.hasOwnProperty(key)) {
        result.push(parseFloat(key));
      }
    }
    
    return result.sort(function() { return Math.random() - 0.5; });
  }

  function stRenderUI() {
    var main = document.getElementById('main-content');
    if (!main) return;
        var q = stGetCurrentQuestion();
    var options = stGenerateOptions(q ? q.answer : 0, 4);
    var points = window.GameCore ? window.GameCore.getPoints() : 0;
    var lives = window.GameCore ? window.GameCore.getLives(ST_GAME_ID) : 3;
    var levelNum = stGameData ? stGameData.level : 1;
    
    var html = '<div class="st-wrapper">';
    html += '<div class="gc-header">';
    html += '<h2>⚡ تحدي السرعة</h2>';
    html += '<button class="gc-btn gc-btn-secondary" onclick="window.stHandleExit()">🏠 الرئيسية</button>';
    html += '</div>';
    
    html += '<div class="gc-stats-bar">';
    html += '<span>🏆 <span class="gc-points-display">' + points + '</span></span>';
    html += '<span>❤️ <span id="' + ST_PREFIX + 'lives">' + lives + '</span></span>';
    html += '<span>⏱️ <span id="' + ST_PREFIX + 'timer">15</span>ث</span>';
    html += '<span>📊 مستوى <span id="' + ST_PREFIX + 'level">' + levelNum + '</span></span>';
    html += '</div>';
    
    html += '<div class="st-card">';
    html += '<div class="st-math-box" id="' + ST_PREFIX + 'q-text">؟ = ؟</div>';
    html += '<div id="' + ST_PREFIX + 'msg" class="st-msg"></div>';
    html += '<div class="st-options-grid" id="' + ST_PREFIX + 'opts"></div>';
    html += '</div>';
    
    html += '<div class="st-footer">';
    html += '<button class="gc-btn gc-btn-danger" onclick="window.stConfirmReset()">🔄 من البداية</button>';
    html += '</div>';
    html += '</div>';
    
    main.innerHTML = html;
    
    var optsArea = document.getElementById(ST_PREFIX + 'opts');
    if (optsArea && q) {
      var optsHtml = '';
      for (var i = 0; i < options.length; i++) {
        optsHtml += '<button class="gc-btn gc-btn-primary" onclick="window.stSubmitAnswer(' + options[i] + ')">' + options[i].toString() + '</button>';
      }
      optsArea.innerHTML = optsHtml;
    }
    
    var qText = document.getElementById(ST_PREFIX + 'q-text');
    if (qText && q) {
      qText.textContent = q.text + ' = ؟';
    }
    
    stUpdateStats();
  }

  function stStartLevel() {    if (!stGameData || !window.GameCore) return;
    if (!window.GameCore.canExecuteGame(ST_GAME_ID)) return;
    
    stGameData.timeLeft = 15;
    stGameData.attempts = 0;
    stGameData.isProcessing = false;
    
    stUpdateTimerDisplay();
    
    if (stTimer) clearInterval(stTimer);
    
    var currentVer = stGameVersion;
    stTimer = window.GameCore.registerInterval(setInterval(function() {
      if (currentVer !== stGameVersion) {
        clearInterval(stTimer);
        return;
      }
      if (!window.GameCore.canExecuteGame(ST_GAME_ID)) {
        clearInterval(stTimer);
        return;
      }
      if (stGameData) {
        stGameData.timeLeft--;
        stUpdateTimerDisplay();
        if (stGameData.timeLeft <= 0) {
          clearInterval(stTimer);
          stHandleTimeUp();
        }
      }
    }, 1000));
  }

  function stUpdateTimerDisplay() {
    var el = document.getElementById(ST_PREFIX + 'timer');
    if (el && stGameData) {
      el.textContent = stGameData.timeLeft.toString();
      el.style.color = stGameData.timeLeft <= 5 ? '#e74c3c' : '#f39c12';
    }
  }

  function stGetCurrentQuestion() {
    if (!stGameData || !stGameData.questions) {
      var count = 5 + Math.floor((stGameData.level - 1) * 1.5);
      stGameData.questions = [];
      for (var i = 0; i < count; i++) {
        stGameData.questions.push(stGenerateQuestion(stGameData.level));
      }
    }
    return stGameData.questions[stGameData.qIndex];
  }
  window.stSubmitAnswer = function(val) {
    if (!window.GameCore) return;
    if (!window.GameCore.canExecuteGame(ST_GAME_ID)) return;
    if (!stGameData || stGameData.isProcessing) return;
    
    var q = stGetCurrentQuestion();
    if (!q) return;
    
    stGameData.isProcessing = true;
    if (stTimer) clearInterval(stTimer);
    
    var isCorrect = Math.abs(parseFloat(val) - q.answer) < 0.01;
    var msgEl = document.getElementById(ST_PREFIX + 'msg');
    
    if (isCorrect) {
      var earned = stGameData.attempts === 0 ? 10 : 5;
      window.GameCore.addPoints(earned, 'إجابة صحيحة', ST_GAME_ID);
      window.GameCore.toast('+' + earned + ' نقطة', 'success');
      
      if (msgEl) {
        msgEl.textContent = '✅ إجابة صحيحة!';
        msgEl.className = 'st-msg success show';
      }
      
      stGameData.correctCount = (stGameData.correctCount || 0) + 1;
      stUpdateStats();
      
      window.GameCore.registerTimeout(setTimeout(function() {
        stNextQuestion();
      }, 1000));
    } else {
      stGameData.attempts++;
      if (stGameData.attempts >= 2) {
        if (msgEl) {
          msgEl.textContent = '❌ الإجابة: ' + q.answer;
          msgEl.className = 'st-msg error show';
        }
        window.GameCore.registerTimeout(setTimeout(function() {
          stNextQuestion();
        }, 1500));
      } else {
        if (msgEl) {
          msgEl.textContent = '❌ حاول مجدداً';
          msgEl.className = 'st-msg error show';
        }
        stGameData.isProcessing = false;
        stStartLevel();
      }
    }  };

  function stNextQuestion() {
    if (!window.GameCore) return;
    if (!window.GameCore.canExecuteGame(ST_GAME_ID)) return;
    if (!stGameData) return;
    
    stGameData.qIndex++;
    stGameData.isProcessing = false;
    
    if (stGameData.qIndex >= (stGameData.questions ? stGameData.questions.length : 0)) {
      window.GameCore.addPoints(20, 'إكمال المستوى', ST_GAME_ID);
      stSaveProgress();
      
      if (stGameData.level >= 50) {
        stEndGame();
      } else {
        stGameData.level++;
        stGameData.qIndex = 0;
        stGameData.questions = null;
        stGameData.correctCount = 0;
        window.GameCore.resetLives(ST_GAME_ID, 3);
        stRenderUI();
        stStartLevel();
        window.GameCore.toast('🎉 مستوى جديد!', 'success');
      }
    } else {
      stRenderUI();
      stStartLevel();
    }
  }

  function stHandleTimeUp() {
    if (!window.GameCore) return;
    if (!window.GameCore.canExecuteGame(ST_GAME_ID)) return;
    
    var msgEl = document.getElementById(ST_PREFIX + 'msg');
    if (msgEl) {
      msgEl.textContent = '⏳ انتهى الوقت!';
      msgEl.className = 'st-msg error show';
    }
    
    var newLives = window.GameCore.deductLife(ST_GAME_ID);
    if (stGameData) {
      stGameData.lives = newLives;
    }
    stUpdateStats();
    
    if (newLives <= 0) {
      window.GameCore.toast('💔 انتهت المحاولات!', 'error');      window.GameCore.registerTimeout(setTimeout(function() {
        window.GameCore.resetLives(ST_GAME_ID, 3);
        stRestartGame();
      }, 1500));
    } else {
      window.GameCore.registerTimeout(setTimeout(stNextQuestion, 1000));
    }
  }

  function stEndGame() {
    var main = document.getElementById('main-content');
    if (main) {
      var points = window.GameCore ? window.GameCore.getPoints() : 0;
      var levelNum = stGameData ? stGameData.level : 0;
      
      var html = '<div class="st-wrapper" style="text-align:center;padding:50px;">';
      html += '<h2 style="font-size:3rem;">🏁</h2>';
      html += '<h3>انتهى التحدي!</h3>';
      html += '<p>المستوى النهائي: ' + levelNum + '</p>';
      html += '<p>النقاط الكلية: ' + points + '</p>';
      html += '<div class="st-footer">';
      html += '<button class="gc-btn gc-btn-primary" onclick="window.stRestartGame()">🔄 إعادة</button>';
      html += '<button class="gc-btn gc-btn-secondary" onclick="window.stHandleExit()">🏠 الرئيسية</button>';
      html += '</div>';
      html += '</div>';
      main.innerHTML = html;
    }
  }

  window.stRestartGame = function() {
    if (!window.GameCore) return;
    
    window.GameCore.resetLives(ST_GAME_ID, 3);
    stGameVersion++;
    
    var savedProgress = window.GameCore.loadProgress(ST_GAME_ID);
    
    if (savedProgress && savedProgress.completedLevel) {
      stGameData = {
        level: savedProgress.completedLevel + 1,
        qIndex: 0,
        lives: 3,
        version: stGameVersion,
        questions: null,
        timeLeft: 15,
        attempts: 0,
        isProcessing: false,
        correctCount: 0
      };
      window.GameCore.toast('📌 تم استئناف من المستوى ' + stGameData.level, 'info');    } else {
      stGameData = {
        level: 1,
        qIndex: 0,
        lives: 3,
        version: stGameVersion,
        questions: null,
        timeLeft: 15,
        attempts: 0,
        isProcessing: false,
        correctCount: 0
      };
    }
    
    stRenderUI();
    stStartLevel();
  };

  function stSaveProgress() {
    if (!window.GameCore || !stGameData) return;
    
    window.GameCore.saveProgress(ST_GAME_ID, {
      completedLevel: stGameData.level,
      lastPlayed: Date.now(),
      gameType: 'speed-test'
    });
    
    console.log('💾 Speed Test: تم حفظ التقدم - المستوى ' + stGameData.level + ' مكتمل');
  }

  function stUpdateStats() {
    var lvs = document.getElementById(ST_PREFIX + 'lives');
    var lvl = document.getElementById(ST_PREFIX + 'level');
    var pts = document.querySelectorAll('.gc-points-display');
    
    if (lvs && stGameData) lvs.textContent = stGameData.lives || 3;
    if (lvl && stGameData) lvl.textContent = stGameData.level || 1;
    if (window.GameCore) {
      var points = window.GameCore.getPoints();
      for (var i = 0; i < pts.length; i++) {
        pts[i].textContent = points;
      }
    }
  }

  // ⚡ خروج فوري (بدون تنظيف مزدوج)
  // ⚡ خروج فوري وآمن إلى الرئيسية
window.stHandleExit = function() {
  console.log('🚪 Speed Test: خروج فوري...');
  
  // ✅ تنظيف مباشر بدون استدعاء دوال خارجية قد تسبب تكرار
  if (stTimer) {
    clearInterval(stTimer);
    stTimer = null;
  }
  stGameData = null;
  stGameVersion++;
  
  // مؤشر تحميل فوري
  var main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = '<div style="text-align:center; padding:60px; direction:rtl;"><div style="font-size:2.5rem; margin-bottom:15px;">🏠</div><p style="color:var(--text-secondary);">جاري العودة للرئيسية...</p></div>';
  }
  
  // العودة للرئيسية بعد تأخير بسيط
  setTimeout(function() {
    if (typeof window.loadHomePage === 'function') {
      window.loadHomePage();
    }
  }, 30);
};

  window.stConfirmReset = function() {
    if (!window.GameCore) return;
    
    window.GameCore.confirmAction(
      'إعادة من البداية',
      'هل أنت متأكد؟ سيتم فقدان التقدم في المستوى الحالي!',
      function() {
        window.GameCore.resetProgress(ST_GAME_ID);
        window.GameCore.resetLives(ST_GAME_ID, 3);
        stGameVersion++;
        
        stGameData = {
          level: 1,
          qIndex: 0,
          lives: 3,
          version: stGameVersion,
          questions: null,
          timeLeft: 15,
          attempts: 0,
          isProcessing: false,
          correctCount: 0
        };
        
        stRenderUI();
        stStartLevel();
        window.GameCore.toast('🔄 تم البدء من البداية', 'info');
      },
      function() {
        window.GameCore.toast('تم الإلغاء', 'info');
      }
    );
  };

  window.loadSpeedTestPage = function() {
  console.log('🎮 Speed Test: تحميل اللعبة...');
  
  // ✅ إعادة تعيين علامة التنظيف للسماح بتنظيف حقيقي عند الخروج لاحقاً
  stCleanupExecuted = 0;
  stCleanupLock = false;
  
  stCleanup(); // تنظيف أي نسخة سابقة
  stGameVersion++;
  
  if (window.GameCore) {
    window.GameCore.registerGame(ST_GAME_ID, stCleanup);
  }
  
  window.stRestartGame();
};
  

// ✅ بعد: تحقق أولاً لمنع التكرار
if (!window._stBeforeUnloadAttached) {
  window.addEventListener('beforeunload', stCleanup);
  window._stBeforeUnloadAttached = true;
}
})();