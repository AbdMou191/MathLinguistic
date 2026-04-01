/**
 * 🛡️ نظام منع التداخل المدمج
 */
(function() {
    if (window._ResourceManager) return;
    const resources = new Map(); 
    const styles = new Map();
    window._ResourceManager = {
        register: function(gameId, cleanupFn) {
            if (resources.has(gameId)) { 
                try { resources.get(gameId)(); } catch(e) {} 
            }
            resources.set(gameId, cleanupFn);
        },
        cleanup: function(gameId) {
            if (resources.has(gameId)) { 
                try { resources.get(gameId)(); } catch(e) {} 
                resources.delete(gameId); 
            }
        },
        cleanupAll: function() { 
            for (const [id, fn] of resources) { 
                try { fn(); } catch(e) {} 
            } 
            resources.clear(); 
        },
        addStyle: function(styleId, css) {
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style'); 
            style.id = styleId; 
            style.textContent = css;
            document.head.appendChild(style);
            styles.set(styleId, function() { 
                const el = document.getElementById(styleId); 
                if(el) el.remove(); 
            });
        },
        removeStyle: function(styleId) { 
            const el = document.getElementById(styleId); 
            if(el) el.remove(); 
            styles.delete(styleId); 
        }
    };
    window.addEventListener('beforeunload', function() {
        if (window._ResourceManager) window._ResourceManager.cleanupAll();
    });
})();

// === المتغيرات ===
var MENTAL_GAME_ID = 'mental-math';var MENTAL_PREFIX = 'mental-';
var mentalGameData = null;
var mentalGameVersion = 0;
var mentalTimeouts = [];
var mentalCleanupExecuted = 0;
var mentalCleanupLock = false;

var MENTAL_CONFIGS = {
    1: { name: " : جمع (5-9)", count: 10, min: 5, max: 9, addProb: 1.0 },
    2: { name: " : جمع (5-20)", count: 10, min: 5, max: 20, addProb: 1.0 },
    3: { name: " : مختلط (5-50)", count: 10, min: 5, max: 50, addProb: 0.85 },
    4: { name: " : مختلط (15-75)", count: 20, min: 15, max: 75, addProb: 0.75 },
    5: { name: " : تحدي الطرح (10-99)", count: 25, min: 10, max: 99, addProb: 0.25 }
};

// === تنظيف المؤقتات ===
function mentalClearAllTimeouts() {
    for (var i = 0; i < mentalTimeouts.length; i++) {
        clearTimeout(mentalTimeouts[i]);
    }
    mentalTimeouts = [];
}

function mentalSetTimeout(callback, delay) {
    var timeoutId = setTimeout(callback, delay);
    mentalTimeouts.push(timeoutId);
    return timeoutId;
}

// === التنظيف ===
function mentalCleanup() {
    if (mentalCleanupLock) return;
    var now = Date.now();
    if (mentalCleanupExecuted && (now - mentalCleanupExecuted) < 200) return;
    mentalCleanupLock = true;
    
    mentalGameVersion++;
    mentalClearAllTimeouts();
    
    if (window.GameCore && typeof window.GameCore.cleanupGame === 'function') {
        window.GameCore.cleanupGame(MENTAL_GAME_ID);
    }
    if (window._ResourceManager && typeof window._ResourceManager.cleanup === 'function') {
        window._ResourceManager.cleanup(MENTAL_GAME_ID);
    }
    mentalGameData = null;
    mentalCleanupExecuted = Date.now();
    
    setTimeout(function() { mentalCleanupLock = false; }, 100);
}
// === توليد سؤال ===
function mentalGenerateQuestion(level) {
    var config = MENTAL_CONFIGS[level];
    var sequence = [];
    var currentTotal = 0;
    for (var i = 0; i < config.count; i++) {
        var num = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        var op = (Math.random() < config.addProb) ? '+' : '-';
        if (op === '-' && currentTotal - num < 0) op = '+';
        currentTotal = (op === '+') ? currentTotal + num : currentTotal - num;
        sequence.push({ op: op, num: num });
    }
    return { sequence: sequence, finalAnswer: currentTotal, level: level };
}

// === توليد 6 خيارات ===
function mentalGenerateOptions(correct) {
    var opts = {};
    opts[correct] = true;
    while (Object.keys(opts).length < 6) {
        var offset = Math.floor(Math.random() * 15) + 1;
        var val = Math.random() > 0.5 ? correct + offset : correct - offset;
        if (val >= 0) opts[val] = true;
    }
    var result = [];
    for (var key in opts) { 
        if (opts.hasOwnProperty(key)) result.push(parseInt(key)); 
    }
    return result.sort(function() { return Math.random() - 0.5; });
}

// === عرض الواجهة ===
function mentalRenderUI(showOptions) {
    var main = document.getElementById('main-content');
    if (!main) return;
    
    var points = window.GameCore ? window.GameCore.getPoints() : 0;
    var lives = window.GameCore ? window.GameCore.getLives(MENTAL_GAME_ID) : 2;
    var levelNum = mentalGameData ? mentalGameData.level : 1;
    var config = MENTAL_CONFIGS[levelNum];
    
    var html = '<div class="st-wrapper">';
    html += '<div class="gc-header">';
    html += '<h2>🧠 ' + config.name + '</h2>';
    html += '<button class="gc-btn gc-btn-secondary" onclick="window.mentalHandleExit()">🏠 الرئيسية</button>';
    html += '</div>';
    
    html += '<div class="gc-stats-bar">';
    html += '<span>🏆 <span class="gc-points-display">' + points + '</span></span>';    html += '<span>❤️ <span id="' + MENTAL_PREFIX + 'lives">' + lives + '</span></span>';
    html += '<span>📊 مستوى <span id="' + MENTAL_PREFIX + 'level">' + levelNum + '</span></span>';
    html += '</div>';
    
    html += '<div class="st-card">';
    html += '<div class="st-math-box" id="' + MENTAL_PREFIX + 'q-text" style="height:100px;display:flex;align-items:center;justify-content:center;">';
    if (!showOptions) {
        html += '<span style="font-size:1.5rem;color:var(--ml-text-light);">انتظر...</span>';
    } else {
        html += '<span style="font-size:2rem;">؟ = ؟</span>';
    }
    html += '</div>';
    
    html += '<div id="' + MENTAL_PREFIX + 'timer-box" style="text-align:center;margin:10px 0;height:30px;">';
    if (showOptions) {
        html += '<span style="font-size:1.2rem;color:var(--ml-warning);font-weight:bold;">⏱️ <span id="' + MENTAL_PREFIX + 'countdown">5</span></span>';
    }
    html += '</div>';
    
    html += '<div id="' + MENTAL_PREFIX + 'msg" class="st-msg"></div>';
    
    html += '<div class="st-options-grid" id="' + MENTAL_PREFIX + 'opts" style="grid-template-columns:repeat(3,1fr);gap:10px;">';
    if (showOptions) {
        var options = mentalGameData.options;
        for (var i = 0; i < 6; i++) {
            var opt = options[i] !== undefined ? options[i] : '?';
            html += '<button class="gc-btn gc-btn-primary" onclick="window.mentalSubmitAnswer(' + opt + ')" style="font-size:1.1rem;">' + opt + '</button>';
        }
    } else {
        for (var j = 0; j < 6; j++) {
            html += '<button class="gc-btn" disabled style="background:var(--ml-border);color:var(--ml-text-light);font-size:1.1rem;">-</button>';
        }
    }
    html += '</div>';
    html += '</div>';
    
    html += '<div class="st-footer">';
    html += '<button class="gc-btn gc-btn-danger" onclick="window.mentalRestartGame()">🔄 من البداية</button>';
    html += '</div>';
    html += '</div>';
    
    main.innerHTML = html;
    mentalUpdateStats();
}

// === عرض التسلسل ===
function mentalShowSequence(version, callback) {
    if (!mentalGameData || mentalGameData.version !== version) return;
    
    mentalGameData.isShowing = true;    var displayEl = document.getElementById(MENTAL_PREFIX + 'q-text');
    var sequence = mentalGameData.currentQuestion.sequence;
    var index = 0;
    
    function showNext() {
        if (!mentalGameData || mentalGameData.version !== version || index >= sequence.length) {
            mentalGameData.isShowing = false;
            if (callback) callback();
            return;
        }
        var item = sequence[index];
        if (displayEl) {
            displayEl.innerHTML = '<span style="font-size:3rem;font-weight:900;color:var(--ml-accent);">' + item.op + item.num + '</span>';
        }
        index++;
        
        mentalSetTimeout(function() {
            if (displayEl) displayEl.innerHTML = '<span style="font-size:2rem;color:var(--ml-text-light);">...</span>';
            mentalSetTimeout(showNext, 200);
        }, 800);
    }
    showNext();
}

// === بدء العد التحضيري ===
function mentalStartPrepCountdown(version) {
    var main = document.getElementById('main-content');
    if (!main) return;
    
    var levelNum = mentalGameData ? mentalGameData.level : 1;
    var config = MENTAL_CONFIGS[levelNum];
    
    var html = '<div class="st-wrapper">';
    html += '<div class="gc-header">';
    html += '<h2>🧠 ' + config.name + '</h2>';
    html += '<button class="gc-btn gc-btn-secondary" onclick="window.mentalHandleExit()">🏠 الرئيسية</button>';
    html += '</div>';
    
    html += '<div class="st-card" style="text-align:center;padding:60px 20px;">';
    html += '<div style="font-size:1.3rem;margin-bottom:30px;color:var(--ml-text);font-weight:bold;">ركز جيداً...</div>';
    html += '<div style="width:150px;height:150px;margin:0 auto 30px auto;border:10px solid var(--ml-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;">';
    html += '<span id="' + MENTAL_PREFIX + 'prep-num" style="font-size:5rem;font-weight:900;color:var(--ml-accent);">5</span>';
    html += '</div>';
    html += '<p style="color:var(--ml-text-light);font-size:1rem;">سيبدأ العرض خلال لحظات</p>';
    html += '</div>';
    html += '<div class="st-footer">';
    html += '<button class="gc-btn gc-btn-danger" onclick="window.mentalRestartGame()">🔄 من البداية</button>';
    html += '</div>';
    html += '</div>';
        main.innerHTML = html;
    
    var count = 5;
    var prepEl = document.getElementById(MENTAL_PREFIX + 'prep-num');
    
    function countdown() {
        if (!mentalGameData || mentalGameData.version !== version) return;
        count--;
        if (prepEl) prepEl.textContent = count.toString();
        if (count <= 0) {
            mentalRenderUI(false);
            mentalSetTimeout(function() {
                mentalShowSequence(version, function() {
                    mentalShowOptionsWithTimer(version);
                });
            }, 500);
        } else {
            mentalSetTimeout(countdown, 1000);
        }
    }
    mentalSetTimeout(countdown, 1000);
}

// === عرض الخيارات مع العد التنازلي ===
function mentalShowOptionsWithTimer(version) {
    if (!mentalGameData || mentalGameData.version !== version) return;
    
    mentalGameData.options = mentalGenerateOptions(mentalGameData.currentQuestion.finalAnswer);
    mentalRenderUI(true);
    
    var timeLeft = 5;
    var timerEl = document.getElementById(MENTAL_PREFIX + 'countdown');
    
    function countdown() {
        if (!mentalGameData || mentalGameData.version !== version) return;
        timeLeft--;
        if (timerEl) timerEl.textContent = timeLeft.toString();
        
        if (timeLeft <= 0) {
            mentalHandleWrongAnswer(true);
        } else {
            mentalSetTimeout(countdown, 1000);
        }
    }
    mentalSetTimeout(countdown, 1000);
}

// === معالجة الإجابة الخاطئة ===
function mentalHandleWrongAnswer(isTimeout) {
    if (!window.GameCore) return;    
    var msgEl = document.getElementById(MENTAL_PREFIX + 'msg');
    if (msgEl) {
        msgEl.textContent = isTimeout ? '⏱️ انتهى الوقت!' : '❌ إجابة خاطئة!';
        msgEl.className = 'st-msg error show';
    }
    
    var newLives = window.GameCore.deductLife(MENTAL_GAME_ID);
    if (mentalGameData) mentalGameData.lives = newLives;
    mentalUpdateStats();
    
    if (newLives <= 0) {
        window.GameCore.toast('💔 انتهت المحاولات! إعادة المستوى', 'error');
        mentalSetTimeout(function() {
            window.GameCore.resetLives(MENTAL_GAME_ID, 2);
            if (mentalGameData) {
                mentalGameData.lives = 2;
                mentalGameData.currentQuestion = mentalGenerateQuestion(mentalGameData.level);
            }
            mentalStartLevel();
        }, 1500);
    } else {
        window.GameCore.toast('لديك محاولة أخرى', 'warning');
        mentalSetTimeout(function() {
            mentalStartLevel();
        }, 1500);
    }
}

// === تقديم الإجابة ===
window.mentalSubmitAnswer = function(val) {
    if (!window.GameCore) return;
    if (!window.GameCore.canExecuteGame(MENTAL_GAME_ID)) return;
    if (!mentalGameData || mentalGameData.isShowing || mentalGameData.isProcessing) return;
    
    mentalGameData.isProcessing = true;
    mentalClearAllTimeouts();
    
    var q = mentalGameData.currentQuestion;
    var isCorrect = (parseInt(val) === q.finalAnswer);
    var msgEl = document.getElementById(MENTAL_PREFIX + 'msg');
    
    if (isCorrect) {
        var earned = 10;
        window.GameCore.addPoints(earned, 'إجابة صحيحة', MENTAL_GAME_ID);
        window.GameCore.toast('+' + earned + ' نقطة', 'success');
        if (msgEl) { 
            msgEl.textContent = '✅ عبقري!'; 
            msgEl.className = 'st-msg success show'; 
        }        
        mentalSaveProgress();
        
        mentalSetTimeout(function() {
            mentalNextQuestion();
        }, 1000);
    } else {
        mentalHandleWrongAnswer(false);
    }
};

// === حفظ التقدم ===
function mentalSaveProgress() {
    if (!window.GameCore || !mentalGameData) return;
    window.GameCore.saveProgress(MENTAL_GAME_ID, {
        completedLevel: mentalGameData.level,
        lastPlayed: Date.now(),
        gameType: 'mental-math'
    });
}

// === السؤال التالي ===
function mentalNextQuestion() {
    if (!window.GameCore) return;
    if (!window.GameCore.canExecuteGame(MENTAL_GAME_ID)) return;
    if (!mentalGameData) return;
    
    if (mentalGameData.level >= 5) {
        mentalEndGame();
    } else {
        window.GameCore.resetLives(MENTAL_GAME_ID, 2);
        mentalGameData.level++;
        mentalGameData.currentQuestion = mentalGenerateQuestion(mentalGameData.level);
        mentalGameData.isProcessing = false;
        mentalGameData.isShowing = false;
        mentalGameData.lives = 2;
        mentalStartLevel();
        window.GameCore.toast('🎉 مستوى جديد!', 'success');
    }
}

// === انتهاء اللعبة ===
function mentalEndGame() {
    var main = document.getElementById('main-content');
    if (main) {
        var points = window.GameCore ? window.GameCore.getPoints() : 0;
        var html = '<div class="st-wrapper" style="text-align:center;padding:50px;">';
        html += '<h2 style="font-size:3rem;">🏆</h2>';
        html += '<h3>أحسنت! أكملت التحدي</h3>';
        html += '<p>النقاط الكلية: ' + points + '</p>';        html += '<div class="st-footer">';
        html += '<button class="gc-btn gc-btn-primary" onclick="window.mentalRestartGame()">🔄 إعادة</button>';
        html += '<button class="gc-btn gc-btn-secondary" onclick="window.mentalHandleExit()">🏠 الرئيسية</button>';
        html += '</div>';
        html += '</div>';
        main.innerHTML = html;
    }
}

// === إعادة بدء اللعبة ===
window.mentalRestartGame = function() {
    if (!window.GameCore) return;
    window.GameCore.resetProgress(MENTAL_GAME_ID);
    window.GameCore.resetLives(MENTAL_GAME_ID, 2);
    mentalClearAllTimeouts();
    mentalGameVersion++;
    mentalGameData = {
        level: 1,
        currentQuestion: mentalGenerateQuestion(1),
        lives: 2,
        version: mentalGameVersion,
        isShowing: false,
        isProcessing: false,
        options: []
    };
    mentalStartLevel();
    window.GameCore.toast('🔄 تم البدء من البداية', 'info');
};

// === بدء المستوى ===
function mentalStartLevel() {
    if (!mentalGameData || !window.GameCore) return;
    if (!window.GameCore.canExecuteGame(MENTAL_GAME_ID)) return;
    
    mentalClearAllTimeouts();
    mentalGameData.isProcessing = false;
    mentalGameData.isShowing = false;
    mentalGameData.options = [];
    mentalStartPrepCountdown(mentalGameData.version);
}

// === تحديث الإحصائيات ===
function mentalUpdateStats() {
    var lvs = document.getElementById(MENTAL_PREFIX + 'lives');
    var lvl = document.getElementById(MENTAL_PREFIX + 'level');
    var pts = document.querySelectorAll('.gc-points-display');
    
    if (lvs && mentalGameData) lvs.textContent = mentalGameData.lives || 2;
    if (lvl && mentalGameData) lvl.textContent = mentalGameData.level || 1;
    if (window.GameCore) {        var points = window.GameCore.getPoints();
        for (var i = 0; i < pts.length; i++) { 
            pts[i].textContent = points; 
        }
    }
}

// === خروج فوري ===
window.mentalHandleExit = function() {
    console.log('🚪 Mental Math: خروج فوري...');
    mentalClearAllTimeouts();
    mentalGameData = null;
    mentalGameVersion++;
    var main = document.getElementById('main-content');
    if (main) {
        main.innerHTML = '<div style="text-align:center; padding:60px; direction:rtl;"><div style="font-size:2.5rem; margin-bottom:15px;">🏠</div><p style="color:var(--text-secondary);">جاري العودة للرئيسية...</p></div>';
    }
    setTimeout(function() {
        if (typeof window.loadHomePage === 'function') { 
            window.loadHomePage(); 
        }
    }, 30);
};

// === تحميل صفحة اللعبة ===
window.loadMentalMathPage = function() {
    console.log('🎮 Mental Math: تحميل اللعبة...');
    mentalCleanupExecuted = 0;
    mentalCleanupLock = false;
    mentalCleanup();
    mentalGameVersion++;
    if (window.GameCore) { 
        window.GameCore.registerGame(MENTAL_GAME_ID, mentalCleanup); 
    }
    
    var savedProgress = window.GameCore ? window.GameCore.loadProgress(MENTAL_GAME_ID) : null;
    var startLevel = 1;
    
    if (savedProgress && savedProgress.completedLevel) {
        startLevel = savedProgress.completedLevel;
    }
    
    window.GameCore.resetLives(MENTAL_GAME_ID, 2);
    
    mentalGameData = {
        level: startLevel,
        currentQuestion: mentalGenerateQuestion(startLevel),
        lives: 2,
        version: mentalGameVersion,
        isShowing: false,        isProcessing: false,
        options: []
    };
    mentalStartLevel();
};

// ✅ حماية beforeunload
if (!window._mentalBeforeUnloadAttached) {
    window.addEventListener('beforeunload', mentalCleanup);
    window._mentalBeforeUnloadAttached = true;
}