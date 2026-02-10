// scripts/levels/mental-math.js

// === متغيرات التحكم الصارمة لمنع التداخل ===
window.mentalMathVersion = 0; 
window.mentalMathInterval = null;
window.mentalMathData = null;

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
    window.mentalMathVersion++; // رفع الإصدار يقتل أي حلقة async جارية
    if (window.mentalMathInterval) {
        clearInterval(window.mentalMathInterval);
        window.mentalMathInterval = null;
    }
};

// === توليد المسألة ===
function generateMentalQuestion(level) {
    const config = MENTAL_CONFIGS[level];
    let sequence = [];
    let currentTotal = 0;
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
    window.destroyMentalMath(); // تنظيف المحاولات السابقة أولاً
    const currentAttemptVersion = window.mentalMathVersion;

    window.mentalMathData = {
        currentLevel: 1,
        currentQuestion: generateMentalQuestion(1),
        isShowing: true,
        isProcessing: false,
        version: currentAttemptVersion
    };
    
    startMentalCountdown(currentAttemptVersion);
};

function startMentalCountdown(version) {
    let count = 5;
    const main = document.getElementById('main-content');
    renderBaseStyles(); 

    main.innerHTML = `
        <div class="mental-container">
            <div class="mental-card">
                <div class="lvl-badge">استعداد..</div>
                <h2 class="lvl-title-main">${MENTAL_CONFIGS[window.mentalMathData.currentLevel].name}</h2>
                <div class="countdown-box">
                    <span id="cnt-num">${count}</span>
                </div>
                <p class="prepare-txt">حافظ على تركيزك، الأرقام ستظهر قريباً</p>
                <div class="footer-tools">
                     <button class="reset-ui-btn" onclick="window.loadMentalMathPage()">🔄 إلغاء والبدء من جديد</button>
                </div>
            </div>
        </div>
    `;

    window.mentalMathInterval = setInterval(() => {
        // التحقق من الإصدار: إذا تغير، أوقف المؤقت فوراً
        if (version !== window.mentalMathVersion) {
            clearInterval(window.mentalMathInterval);
            return;
        }

        count--;
        const el = document.getElementById('cnt-num');
        if (el) el.textContent = count;
        
        if (count <= 0) {
            clearInterval(window.mentalMathInterval);
            displayMentalSequence(version);
        }
    }, 1000);
}

async function displayMentalSequence(version) {
    // التأكد من أن هذه المحاولة لا تزال هي النشطة
    if (version !== window.mentalMathVersion) return;

    window.mentalMathData.isShowing = true;
    renderMentalUI();
    
    const displayEl = document.getElementById('math-display');
    const sequence = window.mentalMathData.currentQuestion.sequence;

    for (let item of sequence) {
        // فحص الإصدار قبل كل رقم يظهر
        if (version !== window.mentalMathVersion) return;

        if (displayEl) displayEl.innerHTML = `<span class="fixed-num">${item.op}${item.num}</span>`;
        await new Promise(r => setTimeout(r, 800));
        
        if (version !== window.mentalMathVersion) return;
        if (displayEl) displayEl.innerHTML = "";
        await new Promise(r => setTimeout(r, 200));
    }

    if (version !== window.mentalMathVersion) return;
    if (displayEl) displayEl.textContent = "؟";
    window.mentalMathData.isShowing = false;
    renderMentalUI();
}

window.submitMentalAnswer = function(val) {
    if (window.mentalMathData.isShowing || window.mentalMathData.isProcessing) return;
    window.mentalMathData.isProcessing = true;

    if (val === window.mentalMathData.currentQuestion.finalAnswer) {
    // 👇 إضافة هذين السطرين 👇
    localStorage.setItem('math_mental_beginner_level', window.mentalMathData.currentLevel.toString());
    
    if (typeof window.checkAndUnlockAchievements === 'function') {
        window.checkAndUnlockAchievements();
    }

    showFeedback("✅ إجابة صحيحة!", "success");
    setTimeout(() => {
        if (window.mentalMathData.version === window.mentalMathVersion) {
            nextMentalLevel();
        }
    }, 1500);

    } else {
        showFeedback("❌ حاول مجدداً", "error");
        window.mentalMathData.isProcessing = false;
    }
};

function nextMentalLevel() {
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
    const el = document.getElementById('game-msg');
    if (el) {
        el.textContent = text;
        el.className = `msg-box-mental ${type}`;
        el.style.opacity = '1';
        setTimeout(() => { 
            if(el && window.mentalMathData && window.mentalMathData.version === window.mentalMathVersion) {
                el.style.opacity = '0'; 
            }
        }, 2000);
    }
}

function renderBaseStyles() {
    if (document.getElementById('mental-styles')) return;
    const style = document.createElement('style');
    style.id = 'mental-styles';
    style.innerHTML = `
        .mental-container { max-width: 450px; margin: 20px auto; direction: rtl; padding: 0 15px; font-family: sans-serif; }
        .mental-card { 
            background: #fff; border-radius: 30px; padding: 40px 20px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; 
            min-height: 540px; display: flex; flex-direction: column; 
            align-items: center; justify-content: space-between; border: 1px solid #eee;
        }
        .lvl-badge { background: #f1f2f6; padding: 6px 15px; border-radius: 50px; font-weight: bold; color: #57606f; font-size: 0.8rem; }
        .lvl-title-main { color: #2f3542; margin: 15px 0; font-size: 1.4rem; }
        .countdown-box { width: 140px; height: 140px; border: 10px solid #3498db; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 20px 0; background: #f9f9f9; }
        #cnt-num { font-size: 5rem; font-weight: 900; color: #3498db; }
        .display-screen { font-size: 4.5rem; font-weight: 900; height: 140px; display: flex; align-items: center; justify-content: center; color: #2f3542; width: 100%; }
        .options-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; }
        .ans-btn { padding: 18px; border: none; background: #3498db; color: white; border-radius: 20px; font-size: 1.4rem; font-weight: bold; cursor: pointer; }
        .reset-ui-btn { background: #f1f2f6; border: none; color: #57606f; padding: 12px 25px; border-radius: 15px; cursor: pointer; font-weight: bold; }
        [data-theme="dark"] .mental-card { background: #2f3542; border-color: #3f4a5a; }
        [data-theme="dark"] .lvl-title-main, [data-theme="dark"] .display-screen { color: #f1f2f6; }
    `;
    document.head.appendChild(style);
}

function renderMentalUI() {
    const main = document.getElementById('main-content');
    if (!main || !window.mentalMathData || window.mentalMathData.version !== window.mentalMathVersion) return;

    const config = MENTAL_CONFIGS[window.mentalMathData.currentLevel];
    main.innerHTML = `
        <div class="mental-container">
            <div class="mental-card">
                <div class="lvl-badge">${config.name}</div>
                <div id="math-display" class="display-screen">...</div>
                <div id="game-msg" class="msg-box-mental"></div>
                <div class="options-layout" id="options-area"></div>
                <div class="footer-tools">
                    <button class="reset-ui-btn" onclick="window.loadMentalMathPage()">🔄 إعادة المستوى</button>
                </div>
            </div>
        </div>
    `;

    if (!window.mentalMathData.isShowing) {
        const corr = window.mentalMathData.currentQuestion.finalAnswer;
        let s = new Set([corr]);
        while(s.size < 4) {
            let offset = Math.floor(Math.random() * 10) + 1;
            s.add(Math.random() > 0.5 ? corr + offset : corr - offset);
        }
        const opts = [...s].sort(() => Math.random() - 0.5);
        const optionsArea = document.getElementById('options-area');
        if (optionsArea) {
            optionsArea.innerHTML = opts.map(o => 
                `<button class="ans-btn" onclick="window.submitMentalAnswer(${o})">${o}</button>`
            ).join('');
        }
    }
}
