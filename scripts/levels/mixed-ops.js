/**
 * 🛡️ نظام منع التداخل المدمج
 */
(function() {
    if (window._ResourceManager) return;
    const resources = new Map(); const styles = new Map();
    window._ResourceManager = {
        register: function(gameId, cleanupFn) {
            if (resources.has(gameId)) { try { resources.get(gameId)(); } catch(e) {} }
            resources.set(gameId, cleanupFn);
        },
        cleanup: function(gameId) {
            if (resources.has(gameId)) { try { resources.get(gameId)(); } catch(e) {} resources.delete(gameId); }
        },
        cleanupAll: function() { for (const [id, fn] of resources) { try { fn(); } catch(e) {} } resources.clear(); },
        addStyle: function(styleId, css) {
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style'); style.id = styleId; style.textContent = css;
            document.head.appendChild(style);
            styles.set(styleId, () => { const el = document.getElementById(styleId); if(el) el.remove(); });
        },
        removeStyle: function(styleId) { const el = document.getElementById(styleId); if(el) el.remove(); styles.delete(styleId); }
    };
    window.addEventListener('beforeunload', () => window._ResourceManager?.cleanupAll());
})();

// === المتغيرات ===
var MIXED_GAME_ID = 'mixed-ops';
var MIXED_PREFIX = 'mixed-';
var mixedGameData = null;
var mixedGameVersion = 0;
var mixedTimeouts = []; // ✅ مصفوفة لتخزين جميع المؤقتات
var mixedCleanupExecuted = 0;
var mixedCleanupLock = false;

const MIXED_ADV_CONFIGS = {
    1: { name: ": أعشار", count: 5, min: 1, max: 9, decimals: 1, ops: ['+', '-'] },
    2: { name: " : ضرب بسيط", count: 4, min: 2, max: 12, decimals: 0, ops: ['+', '-', '×'] },
    3: { name: " : تحدي المئة", count: 6, min: 10, max: 99, decimals: 1, ops: ['+', '-'] },
    4: { name: " : مختلط", count: 7, min: 5, max: 50, decimals: 1, ops: ['+', '-', '×'] },
    5: { name: " : الاعشار لذهني", count: 8, min: 10, max: 150, decimals: 1, ops: ['+', '-', '×', '÷'] }
};

// === تنظيف جميع المؤقتات ===
function mixedClearAllTimeouts() {
    for (var i = 0; i < mixedTimeouts.length; i++) {
        clearTimeout(mixedTimeouts[i]);
    }
    mixedTimeouts = [];
}
// === تسجيل مؤقت جديد ===
function mixedSetTimeout(callback, delay) {
    var timeoutId = setTimeout(callback, delay);
    mixedTimeouts.push(timeoutId);
    return timeoutId;
}

// === التنظيف ===
function mixedCleanup() {
    if (mixedCleanupLock) return;
    var now = Date.now();
    if (mixedCleanupExecuted && (now - mixedCleanupExecuted) < 200) return;
    mixedCleanupLock = true;
    
    mixedGameVersion++;
    mixedClearAllTimeouts(); // ✅ تنظيف جميع المؤقتات
    
    if (window.GameCore && typeof window.GameCore.cleanupGame === 'function') {
        window.GameCore.cleanupGame(MIXED_GAME_ID);
    }
    if (window._ResourceManager && typeof window._ResourceManager.cleanup === 'function') {
        window._ResourceManager.cleanup(MIXED_GAME_ID);
    }
    mixedGameData = null;
    mixedCleanupExecuted = Date.now();
    
    setTimeout(function() { mixedCleanupLock = false; }, 100);
}

// === توليد سؤال ===
function mixedGenerateQuestion(level) {
    var config = MIXED_ADV_CONFIGS[level];
    var sequence = [], currentTotal = 0;
    var factor = Math.pow(10, config.decimals);
    for (var i = 0; i < config.count; i++) {
        var rawNum = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        var num = config.decimals > 0 ? parseFloat((rawNum / factor).toFixed(config.decimals)) : rawNum;
        var op = config.ops[Math.floor(Math.random() * config.ops.length)];
        if (i === 0) { currentTotal = num; op = ""; }
        else {
            if (op === '+') currentTotal += num;
            else if (op === '-') {
                if (currentTotal - num < 0) { op = '+'; currentTotal += num; }
                else { currentTotal -= num; }
            }
            else if (op === '×') { num = (Math.floor(Math.random() * 3) + 2); currentTotal *= num; }
            else if (op === '÷') { num = 2; currentTotal /= num; }
        }
        currentTotal = parseFloat(currentTotal.toFixed(2));        sequence.push({ op: op, num: num });
    }
    return { sequence: sequence, finalAnswer: currentTotal, level: level };
}

// === توليد 6 خيارات ===
function mixedGenerateOptions(correct, decimals) {
    var opts = {};
    opts[correct] = true;
    var step = decimals > 0 ? 0.1 : 1;
    while (Object.keys(opts).length < 6) {
        var dev = (Math.floor(Math.random() * 8) + 1) * step;
        var val = Math.random() > 0.5 ? correct + dev : correct - dev;
        if (val >= 0) opts[parseFloat(val.toFixed(2))] = true;
    }
    var result = [];
    for (var key in opts) { if (opts.hasOwnProperty(key)) result.push(parseFloat(key)); }
    return result.sort(function() { return Math.random() - 0.5; });
}

// === عرض الواجهة ===
function mixedRenderUI(showOptions) {
    var main = document.getElementById('main-content');
    if (!main) return;
    
    var points = window.GameCore ? window.GameCore.getPoints() : 0;
    var lives = window.GameCore ? window.GameCore.getLives(MIXED_GAME_ID) : 2;
    var levelNum = mixedGameData ? mixedGameData.level : 1;
    var config = MIXED_ADV_CONFIGS[levelNum];
    
    var html = '<div class="st-wrapper">';
    html += '<div class="gc-header">';
    html += '<h2>⚡ ' + config.name + '</h2>';
    html += '<button class="gc-btn gc-btn-secondary" onclick="window.mixedHandleExit()">🏠 الرئيسية</button>';
    html += '</div>';
    
    html += '<div class="gc-stats-bar">';
    html += '<span>🏆 <span class="gc-points-display">' + points + '</span></span>';
    html += '<span>❤️ <span id="' + MIXED_PREFIX + 'lives">' + lives + '</span></span>';
    html += '<span>📊 مستوى <span id="' + MIXED_PREFIX + 'level">' + levelNum + '</span></span>';
    html += '</div>';
    
    html += '<div class="st-card">';
    html += '<div class="st-math-box" id="' + MIXED_PREFIX + 'q-text" style="height:100px;display:flex;align-items:center;justify-content:center;">';
    if (!showOptions) {
        html += '<span style="font-size:1.5rem;color:var(--ml-text-light);">انتظر...</span>';
    } else {
        html += '<span style="font-size:2rem;">؟ = ؟</span>';
    }
    html += '</div>';    
    html += '<div id="' + MIXED_PREFIX + 'timer-box" style="text-align:center;margin:10px 0;height:30px;">';
    if (showOptions) {
        html += '<span style="font-size:1.2rem;color:var(--ml-warning);font-weight:bold;">⏱️ <span id="' + MIXED_PREFIX + 'countdown">5</span></span>';
    }
    html += '</div>';
    
    html += '<div id="' + MIXED_PREFIX + 'msg" class="st-msg"></div>';
    
    html += '<div class="st-options-grid" id="' + MIXED_PREFIX + 'opts" style="grid-template-columns:repeat(3,1fr);gap:10px;">';
    if (showOptions) {
        var options = mixedGameData.options;
        for (var i = 0; i < 6; i++) {
            var opt = options[i] !== undefined ? options[i] : '?';
            html += '<button class="gc-btn gc-btn-primary" onclick="window.mixedSubmitAnswer(' + opt + ')" style="font-size:1.1rem;">' + opt + '</button>';
        }
    } else {
        for (var j = 0; j < 6; j++) {
            html += '<button class="gc-btn" disabled style="background:var(--ml-border);color:var(--ml-text-light);font-size:1.1rem;">-</button>';
        }
    }
    html += '</div>';
    html += '</div>';
    
    html += '<div class="st-footer">';
    html += '<button class="gc-btn gc-btn-danger" onclick="window.mixedRestartGame()">🔄 من البداية</button>';
    html += '</div>';
    html += '</div>';
    
    main.innerHTML = html;
    mixedUpdateStats();
}

// === عرض التسلسل ===
function mixedShowSequence(version, callback) {
    if (!mixedGameData || mixedGameData.version !== version) return;
    
    mixedGameData.isShowing = true;
    var displayEl = document.getElementById(MIXED_PREFIX + 'q-text');
    var sequence = mixedGameData.currentQuestion.sequence;
    var index = 0;
    
    function showNext() {
        if (!mixedGameData || mixedGameData.version !== version || index >= sequence.length) {
            mixedGameData.isShowing = false;
            if (callback) callback();
            return;
        }
        var item = sequence[index];
        if (displayEl) {            displayEl.innerHTML = '<span style="font-size:3rem;font-weight:900;color:var(--ml-accent);">' + (item.op || '') + item.num + '</span>';
        }
        index++;
        
        mixedSetTimeout(function() {
            if (displayEl) displayEl.innerHTML = '<span style="font-size:2rem;color:var(--ml-text-light);">...</span>';
            mixedSetTimeout(showNext, 300);
        }, 1200);
    }
    showNext();
}

// === بدء العد التحضيري ===
function mixedStartPrepCountdown(version) {
    var main = document.getElementById('main-content');
    if (!main) return;
    
    var levelNum = mixedGameData ? mixedGameData.level : 1;
    var config = MIXED_ADV_CONFIGS[levelNum];
    
    var html = '<div class="st-wrapper">';
    html += '<div class="gc-header">';
    html += '<h2>⚡ ' + config.name + '</h2>';
    html += '<button class="gc-btn gc-btn-secondary" onclick="window.mixedHandleExit()">🏠 الرئيسية</button>';
    html += '</div>';
    
    html += '<div class="st-card" style="text-align:center;padding:60px 20px;">';
    html += '<div style="font-size:1.3rem;margin-bottom:30px;color:var(--ml-text);font-weight:bold;">ركز جيداً...</div>';
    html += '<div style="width:150px;height:150px;margin:0 auto 30px auto;border:10px solid var(--ml-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;">';
    html += '<span id="' + MIXED_PREFIX + 'prep-num" style="font-size:5rem;font-weight:900;color:var(--ml-accent);">5</span>';
    html += '</div>';
    html += '<p style="color:var(--ml-text-light);font-size:1rem;">سيبدأ العرض خلال لحظات</p>';
    html += '</div>';
    html += '<div class="st-footer">';
    html += '<button class="gc-btn gc-btn-danger" onclick="window.mixedRestartGame()">🔄 من البداية</button>';
    html += '</div>';
    html += '</div>';
    
    main.innerHTML = html;
    
    var count = 5;
    var prepEl = document.getElementById(MIXED_PREFIX + 'prep-num');
    
    function countdown() {
        if (!mixedGameData || mixedGameData.version !== version) return;
        count--;
        if (prepEl) prepEl.textContent = count.toString();
        if (count <= 0) {
            mixedRenderUI(false);
            mixedSetTimeout(function() {                mixedShowSequence(version, function() {
                    mixedShowOptionsWithTimer(version);
                });
            }, 500);
        } else {
            mixedSetTimeout(countdown, 1000);
        }
    }
    mixedSetTimeout(countdown, 1000);
}

// === عرض الخيارات مع العد التنازلي ===
function mixedShowOptionsWithTimer(version) {
    if (!mixedGameData || mixedGameData.version !== version) return;
    
    mixedGameData.options = mixedGenerateOptions(mixedGameData.currentQuestion.finalAnswer, MIXED_ADV_CONFIGS[mixedGameData.level].decimals);
    mixedRenderUI(true);
    
    var timeLeft = 5;
    var timerEl = document.getElementById(MIXED_PREFIX + 'countdown');
    
    function countdown() {
        if (!mixedGameData || mixedGameData.version !== version) return;
        timeLeft--;
        if (timerEl) timerEl.textContent = timeLeft.toString();
        
        if (timeLeft <= 0) {
            mixedHandleWrongAnswer(true);
        } else {
            mixedSetTimeout(countdown, 1000);
        }
    }
    mixedSetTimeout(countdown, 1000);
}

// === معالجة الإجابة الخاطئة ===
function mixedHandleWrongAnswer(isTimeout) {
    if (!window.GameCore) return;
    
    var msgEl = document.getElementById(MIXED_PREFIX + 'msg');
    if (msgEl) {
        msgEl.textContent = isTimeout ? '⏱️ انتهى الوقت!' : '❌ إجابة خاطئة!';
        msgEl.className = 'st-msg error show';
    }
    
    var newLives = window.GameCore.deductLife(MIXED_GAME_ID);
    if (mixedGameData) mixedGameData.lives = newLives;
    mixedUpdateStats();
    
    if (newLives <= 0) {        window.GameCore.toast('💔 انتهت المحاولات! إعادة المستوى', 'error');
        mixedSetTimeout(function() {
            window.GameCore.resetLives(MIXED_GAME_ID, 2);
            if (mixedGameData) {
                mixedGameData.lives = 2;
                mixedGameData.currentQuestion = mixedGenerateQuestion(mixedGameData.level);
            }
            mixedStartLevel();
        }, 1500);
    } else {
        window.GameCore.toast('لديك محاولة أخرى', 'warning');
        mixedSetTimeout(function() {
            mixedStartLevel();
        }, 1500);
    }
}

// === تقديم الإجابة ===
window.mixedSubmitAnswer = function(val) {
    if (!window.GameCore) return;
    if (!window.GameCore.canExecuteGame(MIXED_GAME_ID)) return;
    if (!mixedGameData || mixedGameData.isShowing || mixedGameData.isProcessing) return;
    
    mixedGameData.isProcessing = true;
    mixedClearAllTimeouts(); // ✅ إيقاف جميع العدادات
    
    var q = mixedGameData.currentQuestion;
    var isCorrect = Math.abs(parseFloat(val) - q.finalAnswer) < 0.01;
    var msgEl = document.getElementById(MIXED_PREFIX + 'msg');
    
    if (isCorrect) {
        var earned = 10;
        window.GameCore.addPoints(earned, 'إجابة صحيحة', MIXED_GAME_ID);
        window.GameCore.toast('+' + earned + ' نقطة', 'success');
        if (msgEl) { msgEl.textContent = '✅ عبقري!'; msgEl.className = 'st-msg success show'; }
        
        mixedSaveProgress();
        
        mixedSetTimeout(function() {
            mixedNextQuestion();
        }, 1000);
    } else {
        mixedHandleWrongAnswer(false);
    }
};

// === حفظ التقدم ===
function mixedSaveProgress() {
    if (!window.GameCore || !mixedGameData) return;
    window.GameCore.saveProgress(MIXED_GAME_ID, {        completedLevel: mixedGameData.level,
        lastPlayed: Date.now(),
        gameType: 'mixed-ops'
    });
}

// === السؤال التالي ===
function mixedNextQuestion() {
    if (!window.GameCore) return;
    if (!window.GameCore.canExecuteGame(MIXED_GAME_ID)) return;
    if (!mixedGameData) return;
    
    if (mixedGameData.level >= 5) {
        mixedEndGame();
    } else {
        window.GameCore.resetLives(MIXED_GAME_ID, 2);
        mixedGameData.level++;
        mixedGameData.currentQuestion = mixedGenerateQuestion(mixedGameData.level);
        mixedGameData.isProcessing = false;
        mixedGameData.isShowing = false;
        mixedGameData.lives = 2;
        mixedStartLevel();
        window.GameCore.toast('🎉 مستوى جديد!', 'success');
    }
}

// === انتهاء اللعبة ===
function mixedEndGame() {
    var main = document.getElementById('main-content');
    if (main) {
        var points = window.GameCore ? window.GameCore.getPoints() : 0;
        var html = '<div class="st-wrapper" style="text-align:center;padding:50px;">';
        html += '<h2 style="font-size:3rem;">🏆</h2>';
        html += '<h3>أحسنت! أكملت التحدي</h3>';
        html += '<p>النقاط الكلية: ' + points + '</p>';
        html += '<div class="st-footer">';
        html += '<button class="gc-btn gc-btn-primary" onclick="window.mixedRestartGame()">🔄 إعادة</button>';
        html += '<button class="gc-btn gc-btn-secondary" onclick="window.mixedHandleExit()">🏠 الرئيسية</button>';
        html += '</div>';
        html += '</div>';
        main.innerHTML = html;
    }
}

// === إعادة بدء اللعبة ===
window.mixedRestartGame = function() {
    if (!window.GameCore) return;
    window.GameCore.resetProgress(MIXED_GAME_ID);
    window.GameCore.resetLives(MIXED_GAME_ID, 2);
    mixedClearAllTimeouts();    mixedGameVersion++;
    mixedGameData = {
        level: 1,
        currentQuestion: mixedGenerateQuestion(1),
        lives: 2,
        version: mixedGameVersion,
        isShowing: false,
        isProcessing: false,
        options: []
    };
    mixedStartLevel();
    window.GameCore.toast('🔄 تم البدء من البداية', 'info');
};

// === بدء المستوى ===
function mixedStartLevel() {
    if (!mixedGameData || !window.GameCore) return;
    if (!window.GameCore.canExecuteGame(MIXED_GAME_ID)) return;
    
    mixedClearAllTimeouts(); // ✅ تنظيف المؤقتات القديمة
    mixedGameData.isProcessing = false;
    mixedGameData.isShowing = false;
    mixedGameData.options = [];
    mixedStartPrepCountdown(mixedGameData.version);
}

// === تحديث الإحصائيات ===
function mixedUpdateStats() {
    var lvs = document.getElementById(MIXED_PREFIX + 'lives');
    var lvl = document.getElementById(MIXED_PREFIX + 'level');
    var pts = document.querySelectorAll('.gc-points-display');
    
    if (lvs && mixedGameData) lvs.textContent = mixedGameData.lives || 2;
    if (lvl && mixedGameData) lvl.textContent = mixedGameData.level || 1;
    if (window.GameCore) {
        var points = window.GameCore.getPoints();
        for (var i = 0; i < pts.length; i++) { pts[i].textContent = points; }
    }
}

// === خروج فوري ===
window.mixedHandleExit = function() {
    console.log('🚪 Mixed Ops: خروج فوري...');
    mixedClearAllTimeouts();
    mixedGameData = null;
    mixedGameVersion++;
    var main = document.getElementById('main-content');
    if (main) {
        main.innerHTML = '<div style="text-align:center; padding:60px; direction:rtl;"><div style="font-size:2.5rem; margin-bottom:15px;">🏠</div><p style="color:var(--text-secondary);">جاري العودة للرئيسية...</p></div>';
    }    setTimeout(function() {
        if (typeof window.loadHomePage === 'function') { window.loadHomePage(); }
    }, 30);
};

// === تحميل صفحة اللعبة ===
window.loadMixedOpsPage = function() {
    console.log('🎮 Mixed Ops: تحميل اللعبة...');
    mixedCleanupExecuted = 0;
    mixedCleanupLock = false;
    mixedCleanup();
    mixedGameVersion++;
    if (window.GameCore) { window.GameCore.registerGame(MIXED_GAME_ID, mixedCleanup); }
    
    var savedProgress = window.GameCore ? window.GameCore.loadProgress(MIXED_GAME_ID) : null;
    var startLevel = 1;
    
    if (savedProgress && savedProgress.completedLevel) {
        startLevel = savedProgress.completedLevel;
    }
    
    window.GameCore.resetLives(MIXED_GAME_ID, 2);
    
    mixedGameData = {
        level: startLevel,
        currentQuestion: mixedGenerateQuestion(startLevel),
        lives: 2,
        version: mixedGameVersion,
        isShowing: false,
        isProcessing: false,
        options: []
    };
    mixedStartLevel();
};

// ✅ حماية beforeunload
if (!window._mixedBeforeUnloadAttached) {
    window.addEventListener('beforeunload', mixedCleanup);
    window._mixedBeforeUnloadAttached = true;
}