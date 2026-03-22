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

// === متغيرات التحكم الصارمة لمنع التداخل ===
window.mentalMathVersion = 0; 
window.mentalMathInterval = null;
window.mentalMathData = null;

// === معرفات فريدة للعناصر ===
const MENTAL_IDS = {
    cntNum: 'mental-cnt-num',
    mathDisplay: 'mental-math-display',
    gameMsg: 'mental-game-msg',
    optionsArea: 'mental-options-area',
    container: 'mental-container'
};

// === إعدادات المستويات ===
const MENTAL_CONFIGS = {
    1: { name: "المستوى 1: جمع (5-9)", count: 10, min: 5, max: 9, addProb: 1.0 },
    2: { name: "المستوى 2: جمع (5-20)", count: 10, min: 5, max: 20, addProb: 1.0 },
    3: { name: "المستوى 3: مختلط (5-50)", count: 10, min: 5, max: 50, addProb: 0.85 },
    4: { name: "المستوى 4: مختلط (15-75)", count: 20, min: 15, max: 75, addProb: 0.75 },
    5: { name: "المستوى 5: تحدي الطرح (10-99)", count: 25, min: 10, max: 99, addProb: 0.25 }
};

/**
 * وظيفة تنظيف الموارد الخاصة بالحساب الذهني
 */
window.destroyMentalMath = function() {
    window.mentalMathVersion++;
    
    // إيقاف المؤقت
    if (window.mentalMathInterval) { 
        clearInterval(window.mentalMathInterval); 
        window.mentalMathInterval = null; 
    }
    
    // تنظيف الموارد المسجلة
    window._ResourceManager?.cleanup('mental-math');
    
    // مسح محتوى main-content بشكل صريح
    const main = document.getElementById('main-content');
    if (main) {
        main.innerHTML = '';
    }
    
    // تعيين البيانات على null
    window.mentalMathData = null;
};

// === توليد المسألة ===
function generateMentalQuestion(level) {
    const config = MENTAL_CONFIGS[level];
    let sequence = [], currentTotal = 0;
    for (let i = 0; i < config.count; i++) {
        let num = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        let op = (Math.random() < config.addProb) ? '+' : '-';
        if (op === '-' && currentTotal - num < 0) op = '+';
        currentTotal = (op === '+') ? currentTotal + num : currentTotal - num;
        sequence.push({ op, num });
    }
    return { sequence, finalAnswer: currentTotal };
}

// === تشغيل اللعبة ===
window.loadMentalMathPage = function() {
    // تنظيف أي لعبة سابقة أولاً
    window.destroyMentalMath();
    
    const currentAttemptVersion = ++window.mentalMathVersion;
    
    // تسجيل دالة التنظيف
    window._ResourceManager?.register('mental-math', () => {
        window.mentalMathVersion++;
        if (window.mentalMathInterval) { 
            clearInterval(window.mentalMathInterval); 
            window.mentalMathInterval = null; 
        }
        window._ResourceManager?.removeStyle('mental-styles');
    });
    
    // إنشاء بيانات جديدة
    window.mentalMathData = {
        currentLevel: 1,
        currentQuestion: generateMentalQuestion(1),
        isShowing: true,
        isProcessing: false,
        version: currentAttemptVersion
    };
    
    // تطبيق الأنماط
    renderBaseStyles();
    
    // بدء العد التنازلي
    startMentalCountdown(currentAttemptVersion);
};

function startMentalCountdown(version) {
    let count = 5;
    const main = document.getElementById('main-content');
    
    // بناء واجهة العد التنازلي
    main.innerHTML = `
        <div class="mental-container" id="${MENTAL_IDS.container}">
            <div class="mental-card">
                <div class="lvl-badge">استعداد..</div>
                <h2 class="lvl-title-main">${MENTAL_CONFIGS[window.mentalMathData.currentLevel].name}</h2>
                <div class="countdown-box"><span id="${MENTAL_IDS.cntNum}">${count}</span></div>
                <p class="prepare-txt">حافظ على تركيزك، الأرقام ستظهر قريباً</p>
                <div class="footer-tools">
                     <button class="reset-ui-btn" onclick="window.loadMentalMathPage()">🔄 إلغاء والبدء من جديد</button>
                </div>
            </div>
        </div>`;

    // التأكد من عدم وجود مؤقت سابق
    if (window.mentalMathInterval) {
        clearInterval(window.mentalMathInterval);
    }

    // بدء مؤقت جديد
    window.mentalMathInterval = setInterval(() => {
        if (version !== window.mentalMathVersion) { 
            clearInterval(window.mentalMathInterval); 
            window.mentalMathInterval = null;
            return; 
        }
        
        count--;
        const el = document.getElementById(MENTAL_IDS.cntNum);
        if (el) el.textContent = count;
        
        if (count <= 0) { 
            clearInterval(window.mentalMathInterval); 
            window.mentalMathInterval = null;
            
            // التحقق مرة أخرى قبل عرض التسلسل
            if (version === window.mentalMathVersion && window.mentalMathData) {
                displayMentalSequence(version); 
            }
        }
    }, 1000);
}

async function displayMentalSequence(version) {
    // تحقق متعدد المستويات
    if (version !== window.mentalMathVersion || !window.mentalMathData) return;
    
    window.mentalMathData.isShowing = true;
    renderMentalUI();
    
    const displayEl = document.getElementById(MENTAL_IDS.mathDisplay);
    const sequence = window.mentalMathData.currentQuestion.sequence;

    for (let item of sequence) {
        if (version !== window.mentalMathVersion || !window.mentalMathData) return;
        if (displayEl) displayEl.innerHTML = `<span class="fixed-num">${item.op}${item.num}</span>`;
        await new Promise(r => setTimeout(r, 800));
        
        if (version !== window.mentalMathVersion || !window.mentalMathData) return;
        if (displayEl) displayEl.innerHTML = "";
        await new Promise(r => setTimeout(r, 200));
    }
    
    if (version !== window.mentalMathVersion || !window.mentalMathData) return;
    if (displayEl) displayEl.textContent = "؟";
    window.mentalMathData.isShowing = false;
    renderMentalUI();
}

window.submitMentalAnswer = function(val) {
    if (!window.mentalMathData || window.mentalMathData.isShowing || window.mentalMathData.isProcessing) return;
    window.mentalMathData.isProcessing = true;

    if (val === window.mentalMathData.currentQuestion.finalAnswer) {
        localStorage.setItem('math_mental_beginner_level', window.mentalMathData.currentLevel.toString());
        if (typeof window.checkAndUnlockAchievements === 'function') { 
            window.checkAndUnlockAchievements(); 
        }
        showFeedback("✅ إجابة صحيحة!", "success");
        setTimeout(() => {
            if (window.mentalMathData && window.mentalMathData.version === window.mentalMathVersion) { 
                nextMentalLevel(); 
            }
        }, 1500);
    } else {        
        showFeedback("❌ حاول مجدداً", "error");
        window.mentalMathData.isProcessing = false;
    }
};

function nextMentalLevel() {
    if (!window.mentalMathData) return;
    
    if (window.mentalMathData.currentLevel < 5) {
        window.mentalMathData.currentLevel++;
        window.mentalMathData.currentQuestion = generateMentalQuestion(window.mentalMathData.currentLevel);
        window.mentalMathData.isProcessing = false;
        startMentalCountdown(window.mentalMathVersion);
    } else {
        document.getElementById('main-content').innerHTML = `
            <div class="mental-container">
                <div class="mental-card">
                    <h2 style="font-size: 3rem;">🏆</h2>
                    <h3>تهانينا!</h3>
                    <p>لقد أكملت جميع المستويات بنجاح.</p>
                    <button class="ans-btn" onclick="window.loadMentalMathPage()" style="width:200px; margin-top:20px;">ابدأ من جديد</button>
                </div>
            </div>`;
    }
}

function showFeedback(text, type) {
    const el = document.getElementById(MENTAL_IDS.gameMsg);
    if (el && window.mentalMathData) {
        el.textContent = text; 
        el.className = `msg-box-mental ${type}`; 
        el.style.opacity = '1';
        setTimeout(() => { 
            const currentEl = document.getElementById(MENTAL_IDS.gameMsg);
            if(currentEl && window.mentalMathData && window.mentalMathData.version === window.mentalMathVersion) { 
                currentEl.style.opacity = '0'; 
            } 
        }, 2000);
    }
}

function renderBaseStyles() {
    const STYLE_ID = 'mental-styles';
    if (document.getElementById(STYLE_ID)) return;
    
    const css = `
        .mental-container { max-width: 450px; margin: 20px auto; direction: rtl; padding: 0 15px; font-family: sans-serif; }
        .mental-card { background: #fff; border-radius: 30px; padding: 40px 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; min-height: 540px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; border: 1px solid #eee; }
        .lvl-badge { background: #f1f2f6; padding: 6px 15px; border-radius: 50px; font-weight: bold; color: #57606f; font-size: 0.8rem; }
        .lvl-title-main { color: #2f3542; margin: 15px 0; font-size: 1.4rem; }
        .countdown-box { width: 140px; height: 140px; border: 10px solid #3498db; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 20px 0; background: #f9f9f9; }
        #${MENTAL_IDS.cntNum} { font-size: 5rem; font-weight: 900; color: #3498db; }
        #${MENTAL_IDS.mathDisplay} { font-size: 4.5rem; font-weight: 900; height: 140px; display: flex; align-items: center; justify-content: center; color: #2f3542; width: 100%; }
        .options-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; }
        .ans-btn { padding: 18px; border: none; background: #3498db; color: white; border-radius: 20px; font-size: 1.4rem; font-weight: bold; cursor: pointer; }
        .reset-ui-btn { background: #f1f2f6; border: none; color: #57606f; padding: 12px 25px; border-radius: 15px; cursor: pointer; font-weight: bold; }
        .msg-box-mental { height: 30px; transition: 0.3s; opacity: 0; font-weight: bold; margin: 10px 0; }
        .success { color: #2ecc71; } .error { color: #e74c3c; }
        [data-theme="dark"] .mental-card { background: #2f3542; border-color: #3f4a5a; }
        [data-theme="dark"] .lvl-title-main, [data-theme="dark"] #${MENTAL_IDS.mathDisplay} { color: #f1f2f6; }
    `;
    
    window._ResourceManager?.addStyle(STYLE_ID, css);
}

function renderMentalUI() {
    const main = document.getElementById('main-content');
    if (!main || !window.mentalMathData || window.mentalMathData.version !== window.mentalMathVersion) return;
    
    const config = MENTAL_CONFIGS[window.mentalMathData.currentLevel];
    
    main.innerHTML = `
        <div class="mental-container">
            <div class="mental-card">
                <div class="lvl-badge">${config.name}</div>
                <div id="${MENTAL_IDS.mathDisplay}" class="display-screen">...</div>
                <div id="${MENTAL_IDS.gameMsg}" class="msg-box-mental"></div>
                <div class="options-layout" id="${MENTAL_IDS.optionsArea}"></div>
                <div class="footer-tools">
                    <button class="reset-ui-btn" onclick="window.loadMentalMathPage()">🔄 إعادة المستوى</button>
                </div>
            </div>
        </div>`;

    if (!window.mentalMathData.isShowing) {
        const corr = window.mentalMathData.currentQuestion.finalAnswer;
        let s = new Set([corr]);
        while(s.size < 4) {
            let offset = Math.floor(Math.random() * 10) + 1;
            s.add(Math.random() > 0.5 ? corr + offset : corr - offset);
        }
        const opts = [...s].sort(() => Math.random() - 0.5);
        const optionsArea = document.getElementById(MENTAL_IDS.optionsArea);
        if (optionsArea) {
            optionsArea.innerHTML = opts.map(o => 
                `<button class="ans-btn" onclick="window.submitMentalAnswer(${o})">${o}</button>`
            ).join('');
        }
    }
}