/**
 * 🛡️ نظام منع التداخل المدمج - لا تحذف هذا الجزء
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
    window.safeNavigate = function(loaderFn, gameId) {
        window._ResourceManager?.cleanupAll();
        setTimeout(() => { window.scrollTo(0,0); if(typeof loaderFn === 'function') loaderFn(); }, 50);
    };
})();

// === متغيرات التحكم الصارمة ===
window.mixedOpsVersion = 0;
window.mixedOpsInterval = null;
window.mixedOpsData = null;

// === معرفات فريدة للعناصر ===
const MIXED_IDS = {
    cntNum: 'mixed-cnt-num',
    mathDisplay: 'mixed-math-display',
    gameMsg: 'mixed-game-msg',
    optionsArea: 'mixed-options-area',
    container: 'mixed-container'
};

const MIXED_ADV_CONFIGS = {
    1: { name: "مستوى 1: أعشار (جمع وطرح)", count: 8, min: 1, max: 9, decimals: 1, ops: ['+', '-'] },
    2: { name: "مستوى 2: ضرب بسيط (أعداد صحيحة)", count: 6, min: 2, max: 12, decimals: 0, ops: ['+', '-', '×'] },
    3: { name: "مستوى 3: تحدي المئة (عشري)", count: 10, min: 10, max: 99, decimals: 1, ops: ['+', '-'] },
    4: { name: "مستوى 4: مختلط (صحيح وعشري)", count: 12, min: 5, max: 50, decimals: 1, ops: ['+', '-', '×'] },
    5: { name: "مستوى 5: الإعصار الذهني المتقدم", count: 15, min: 10, max: 150, decimals: 1, ops: ['+', '-', '×', '÷'] }
};

// === وظيفة التنظيف الكاملة ===
window.destroyMixedOps = function() {
    window.mixedOpsVersion++;
    
    // إيقاف المؤقت
    if (window.mixedOpsInterval) { 
        clearInterval(window.mixedOpsInterval); 
        window.mixedOpsInterval = null; 
    }
    
    // تنظيف الموارد المسجلة
    window._ResourceManager?.cleanup('mixed-ops');
    
    // مسح محتوى main-content بشكل صريح
    const main = document.getElementById('main-content');
    if (main) {
        main.innerHTML = '';
    }
    
    // تعيين البيانات على null
    window.mixedOpsData = null;
};

// === منطق التوليد والحفظ ===
function generateMixedAdvQuestion(level) {
    const config = MIXED_ADV_CONFIGS[level];
    let sequence = [], currentTotal = 0;
    const factor = Math.pow(10, config.decimals);

    for (let i = 0; i < config.count; i++) {
        let rawNum = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        let num = config.decimals > 0 ? parseFloat((rawNum / factor).toFixed(config.decimals)) : rawNum;
        let op = config.ops[Math.floor(Math.random() * config.ops.length)];
        
        if (i === 0) { 
            currentTotal = num; 
            op = ""; 
        } else {
            if (op === '+') currentTotal += num;
            else if (op === '-') {
                if (currentTotal - num < 0) { 
                    op = '+'; 
                    currentTotal += num; 
                } else {
                    currentTotal -= num;
                }
            }
            else if (op === '×') { 
                num = (Math.floor(Math.random() * 3) + 2); 
                currentTotal *= num; 
            }
            else if (op === '÷') { 
                num = 2; 
                currentTotal /= num; 
            }
        }
        currentTotal = parseFloat(currentTotal.toFixed(2));
        sequence.push({ op, num });
    }
    return { sequence, finalAnswer: currentTotal };
}

function saveMixedOpsAnswer(isCorrect) {
    if (!window.mixedOpsData) return;
    
    const key = 'mathlinguistic_mixed_ops_answers';
    let answers = JSON.parse(localStorage.getItem(key) || '{}');
    const id = `lvl_${window.mixedOpsData.currentLevel}_${Date.now()}`;
    answers[id] = { correct: isCorrect, timestamp: Date.now(), level: window.mixedOpsData.currentLevel };
    localStorage.setItem(key, JSON.stringify(answers));
}

// === تشغيل اللعبة ===
window.loadMixedOpsPage = function() {
    // تنظيف أي لعبة سابقة أولاً
    window.destroyMixedOps();
    
    const currentAttempt = ++window.mixedOpsVersion;
    
    // تسجيل دالة التنظيف
    window._ResourceManager?.register('mixed-ops', () => {
        window.mixedOpsVersion++;
        if (window.mixedOpsInterval) { 
            clearInterval(window.mixedOpsInterval); 
            window.mixedOpsInterval = null; 
        }
        window._ResourceManager?.removeStyle('mixed-ops-styles');
    });
    
    // إنشاء بيانات جديدة
    window.mixedOpsData = {
        currentLevel: 1,
        currentQuestion: generateMixedAdvQuestion(1),
        isShowing: true,
        isProcessing: false,
        version: currentAttempt
    };
    
    // تطبيق الأنماط
    renderMixedStyles();
    
    // بدء العد التنازلي
    startMixedCountdown(currentAttempt);
};

function startMixedCountdown(version) {
    let count = 5;
    const main = document.getElementById('main-content');
    
    // بناء واجهة العد التنازلي
    main.innerHTML = `
        <div class="mental-container" id="${MIXED_IDS.container}">
            <div class="mental-card mixed-adv-theme">
                <div class="lvl-badge">تحدي العمليات المتقدمة</div>
                <h2 class="lvl-title-main">${MIXED_ADV_CONFIGS[window.mixedOpsData.currentLevel].name}</h2>
                <div class="countdown-box"><span id="${MIXED_IDS.cntNum}">${count}</span></div>
                <p class="prepare-txt">ركز جيداً على العمليات</p>
                <div class="footer-tools">
                     <button class="reset-ui-btn" onclick="window.loadMixedOpsPage()">🔄 إلغاء والبدء من جديد</button>
                </div>
            </div>
        </div>`;

    // التأكد من عدم وجود مؤقت سابق
    if (window.mixedOpsInterval) {
        clearInterval(window.mixedOpsInterval);
    }

    // بدء مؤقت جديد
    window.mixedOpsInterval = setInterval(() => {
        if (version !== window.mixedOpsVersion) { 
            clearInterval(window.mixedOpsInterval); 
            window.mixedOpsInterval = null;
            return; 
        }
        
        count--;
        const el = document.getElementById(MIXED_IDS.cntNum);
        if (el) el.textContent = count;
        
        if (count <= 0) { 
            clearInterval(window.mixedOpsInterval); 
            window.mixedOpsInterval = null;
            
            // التحقق مرة أخرى قبل عرض التسلسل
            if (version === window.mixedOpsVersion && window.mixedOpsData) {
                displayMixedSequence(version); 
            }
        }
    }, 1000);
}

async function displayMixedSequence(version) {
    if (version !== window.mixedOpsVersion || !window.mixedOpsData) return;
    
    window.mixedOpsData.isShowing = true;
    renderMixedGameUI();
    
    const displayEl = document.getElementById(MIXED_IDS.mathDisplay);
    const sequence = window.mixedOpsData.currentQuestion.sequence;

    for (let item of sequence) {
        if (version !== window.mixedOpsVersion || !window.mixedOpsData) return;
        if (displayEl) displayEl.innerHTML = `<span class="fixed-num">${item.op}${item.num}</span>`;
        await new Promise(r => setTimeout(r, 1000));
        
        if (version !== window.mixedOpsVersion || !window.mixedOpsData) return;
        if (displayEl) displayEl.innerHTML = "";
        await new Promise(r => setTimeout(r, 250));
    }

    if (version !== window.mixedOpsVersion || !window.mixedOpsData) return;
    if (displayEl) displayEl.textContent = "؟";
    window.mixedOpsData.isShowing = false;
    renderMixedGameUI();
}

// === التحقق من الإجابة ===
window.submitMixedAnswer = function(val) {
    if (!window.mixedOpsData || window.mixedOpsData.isShowing || window.mixedOpsData.isProcessing) return;
    window.mixedOpsData.isProcessing = true;

    const isCorrect = (parseFloat(val) === window.mixedOpsData.currentQuestion.finalAnswer);
    saveMixedOpsAnswer(isCorrect);

    if (isCorrect) {
        let currentPoints = parseInt(localStorage.getItem('math_user_points') || '0');
        localStorage.setItem('math_user_points', (currentPoints + 10).toString());
        showMixedFeedback("✅ عبقري!", "success");
        
        if (typeof window.checkAndUnlockAchievements === 'function') { 
            window.checkAndUnlockAchievements(); 
        }
        
        setTimeout(() => {
            if (window.mixedOpsData && window.mixedOpsData.version === window.mixedOpsVersion) {
                nextMixedLevel();
            }
        }, 1500);
    } else {
        showMixedFeedback(`❌ خطأ! الجواب: ${window.mixedOpsData.currentQuestion.finalAnswer}`, "error");
        window.mixedOpsData.isProcessing = false;
    }
};

function nextMixedLevel() {
    if (!window.mixedOpsData) return;
    
    if (window.mixedOpsData.currentLevel < 5) {
        window.mixedOpsData.currentLevel++;
        window.mixedOpsData.currentQuestion = generateMixedAdvQuestion(window.mixedOpsData.currentLevel);
        window.mixedOpsData.isProcessing = false;
        startMixedCountdown(window.mixedOpsVersion);
    } else {
        document.getElementById('main-content').innerHTML = `
            <div class="mental-container">
                <div class="mental-card">
                    <h2>🏆 مذهل!</h2>
                    <p>أنهيت جميع المستويات</p>
                    <button class="ans-btn" onclick="window.loadMixedOpsPage()">إعادة التحدي</button>
                </div>
            </div>`;
    }
}

function showMixedFeedback(text, type) {
    const el = document.getElementById(MIXED_IDS.gameMsg);
    if (el && window.mixedOpsData) {
        el.textContent = text; 
        el.className = `msg-box-mental ${type}`;
        el.style.opacity = '1';
        setTimeout(() => { 
            const currentEl = document.getElementById(MIXED_IDS.gameMsg);
            if(currentEl && window.mixedOpsData) {
                currentEl.style.opacity = '0'; 
            }
        }, 2000);
    }
}

function renderMixedGameUI() {
    const main = document.getElementById('main-content');
    if (!main || !window.mixedOpsData || window.mixedOpsData.version !== window.mixedOpsVersion) return;

    const config = MIXED_ADV_CONFIGS[window.mixedOpsData.currentLevel];
    
    main.innerHTML = `
        <div class="mental-container">
            <div class="mental-card mixed-adv-theme">
                <div class="lvl-badge">${config.name}</div>
                <div id="${MIXED_IDS.mathDisplay}" class="display-screen">...</div>
                <div id="${MIXED_IDS.gameMsg}" class="msg-box-mental"></div>
                <div class="options-layout" id="${MIXED_IDS.optionsArea}"></div>
                <div class="footer-tools">
                    <button class="reset-ui-btn" onclick="window.loadMixedOpsPage()">🔄 إعادة التحدي</button>
                </div>
            </div>
        </div>`;

    if (!window.mixedOpsData.isShowing) {
        const corr = window.mixedOpsData.currentQuestion.finalAnswer;
        let s = new Set([corr]);
        const step = config.decimals > 0 ? 0.1 : 1;
        
        while(s.size < 4) {
            let offset = (Math.floor(Math.random() * 5) + 1) * step;
            let val = Math.random() > 0.5 ? corr + offset : corr - offset;
            s.add(parseFloat(val.toFixed(2)));
        }
        
        const opts = [...s].sort(() => Math.random() - 0.5);
        const optionsArea = document.getElementById(MIXED_IDS.optionsArea);
        if (optionsArea) {
            optionsArea.innerHTML = opts.map(o => 
                `<button class="ans-btn" onclick="window.submitMixedAnswer('${o}')">${o}</button>`
            ).join('');
        }
    }
}

function renderMixedStyles() {
    const STYLE_ID = 'mixed-ops-styles';
    if (document.getElementById(STYLE_ID)) return;
    
    const css = `
        .mental-container { padding: 15px; max-width: 450px; margin: 20px auto; direction: rtl; }
        .mental-card { background: #fff; border-radius: 30px; padding: 40px 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); text-align: center; min-height: 520px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
        .mixed-adv-theme { border: 2px solid #6c5ce7; }
        .countdown-box { width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 8px solid #6c5ce7; margin: 20px; }
        #${MIXED_IDS.cntNum} { font-size: 4rem; font-weight: 900; color: #6c5ce7; }
        #${MIXED_IDS.mathDisplay} { font-size: 3.5rem; font-weight: 900; height: 120px; display: flex; align-items: center; }
        .options-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; }
        .ans-btn { padding: 15px; border: none; background: #6c5ce7; color: #fff; border-radius: 15px; font-size: 1.2rem; cursor: pointer; }
        .reset-ui-btn { background: #eee; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; margin-top: 10px; }
        .msg-box-mental { height: 30px; transition: 0.3s; opacity: 0; font-weight: bold; margin: 10px 0; }
        .success { color: #2ecc71; } .error { color: #e74c3c; }
        [data-theme="dark"] .mental-card { background: #2d3436; color: #fff; }
    `;
    
    window._ResourceManager?.addStyle(STYLE_ID, css);
}