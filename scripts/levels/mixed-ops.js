// === متغيرات التحكم الصارمة ===
window.mixedOpsVersion = 0; // رقم الإصدار لمنع التداخل
window.mixedOpsInterval = null;
window.mixedOpsData = null;

const MIXED_ADV_CONFIGS = {
    1: { name: "مستوى 1: أعشار (جمع وطرح)", count: 8, min: 1, max: 9, decimals: 1, ops: ['+', '-'] },
    2: { name: "مستوى 2: ضرب بسيط (أعداد صحيحة)", count: 6, min: 2, max: 12, decimals: 0, ops: ['+', '-', '×'] },
    3: { name: "مستوى 3: تحدي المئة (عشري)", count: 10, min: 10, max: 99, decimals: 1, ops: ['+', '-'] },
    4: { name: "مستوى 4: مختلط (صحيح وعشري)", count: 12, min: 5, max: 50, decimals: 1, ops: ['+', '-', '×'] },
    5: { name: "مستوى 5: الإعصار الذهني المتقدم", count: 15, min: 10, max: 150, decimals: 1, ops: ['+', '-', '×', '÷'] }
};

// === وظيفة التنظيف الكاملة ===
window.destroyMixedOps = function() {
    window.mixedOpsVersion++; // تغيير الإصدار يقتل أي عملية async جارية فوراً
    if (window.mixedOpsInterval) {
        clearInterval(window.mixedOpsInterval);
        window.mixedOpsInterval = null;
    }
};

// === منطق التوليد والحفظ ===
function generateMixedAdvQuestion(level) {
    const config = MIXED_ADV_CONFIGS[level];
    let sequence = [];
    let currentTotal = 0;
    const factor = Math.pow(10, config.decimals);

    for (let i = 0; i < config.count; i++) {
        let rawNum = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        let num = config.decimals > 0 ? parseFloat((rawNum / factor).toFixed(config.decimals)) : rawNum;
        let op = config.ops[Math.floor(Math.random() * config.ops.length)];
        
        if (i === 0) { currentTotal = num; op = ""; } 
        else {
            if (op === '+') currentTotal += num;
            else if (op === '-') {
                if (currentTotal - num < 0) { op = '+'; currentTotal += num; }
                else currentTotal -= num;
            }
            else if (op === '×') { num = (Math.floor(Math.random() * 3) + 2); currentTotal *= num; }
            else if (op === '÷') { num = 2; currentTotal /= num; }
        }
        currentTotal = parseFloat(currentTotal.toFixed(2));
        sequence.push({ op, num });
    }
    return { sequence, finalAnswer: currentTotal };
}

function saveMixedOpsAnswer(isCorrect) {
    const key = 'mathlinguistic_mixed_ops_answers';
    let answers = JSON.parse(localStorage.getItem(key) || '{}');
    const id = `lvl_${window.mixedOpsData.currentLevel}_${Date.now()}`;
    answers[id] = { correct: isCorrect, timestamp: Date.now(), level: window.mixedOpsData.currentLevel };
    localStorage.setItem(key, JSON.stringify(answers));
}

// === تشغيل اللعبة ===
window.loadMixedOpsPage = function() {
    window.destroyMixedOps(); // تنظيف ما قبل البدء
    const currentAttempt = window.mixedOpsVersion; // تثبيت رقم المحاولة الحالية

    window.mixedOpsData = {
        currentLevel: 1,
        currentQuestion: generateMixedAdvQuestion(1),
        isShowing: true,
        isProcessing: false,
        version: currentAttempt
    };
    
    renderMixedStyles();
    startMixedCountdown(currentAttempt);
};

function startMixedCountdown(version) {
    let count = 5;
    const main = document.getElementById('main-content');
    
    // واجهة العد التنازلي
    main.innerHTML = `
        <div class="mental-container">
            <div class="mental-card mixed-adv-theme">
                <div class="lvl-badge">تحدي العمليات المتقدمة</div>
                <h2 class="lvl-title-main">${MIXED_ADV_CONFIGS[window.mixedOpsData.currentLevel].name}</h2>
                <div class="countdown-box"><span id="cnt-num">${count}</span></div>
                <p class="prepare-txt">ركز جيداً على العمليات</p>
                <div class="footer-tools">
                     <button class="reset-ui-btn" onclick="window.loadMixedOpsPage()">🔄 إلغاء والبدء من جديد</button>
                </div>
            </div>
        </div>`;

    window.mixedOpsInterval = setInterval(() => {
        // إذا تغير الإصدار، توقف فوراً
        if (version !== window.mixedOpsVersion) {
            clearInterval(window.mixedOpsInterval);
            return;
        }

        count--;
        const el = document.getElementById('cnt-num');
        if (el) el.textContent = count;
        
        if (count <= 0) {
            clearInterval(window.mixedOpsInterval);
            displayMixedSequence(version);
        }
    }, 1000);
}

async function displayMixedSequence(version) {
    if (version !== window.mixedOpsVersion) return;
    
    window.mixedOpsData.isShowing = true;
    renderMixedGameUI();
    
    const displayEl = document.getElementById('math-display');
    const sequence = window.mixedOpsData.currentQuestion.sequence;

    for (let item of sequence) {
        // أهم فحص: هل هذه المحاولة لا تزال صالحة؟
        if (version !== window.mixedOpsVersion) return;

        if (displayEl) displayEl.innerHTML = `<span class="fixed-num">${item.op}${item.num}</span>`;
        await new Promise(r => setTimeout(r, 1000));
        
        if (version !== window.mixedOpsVersion) return;
        if (displayEl) displayEl.innerHTML = "";
        await new Promise(r => setTimeout(r, 250));
    }

    if (version !== window.mixedOpsVersion) return;
    if (displayEl) displayEl.textContent = "؟";
    window.mixedOpsData.isShowing = false;
    renderMixedGameUI();
}

// === التحقق من الإجابة ===
window.submitMixedAnswer = function(val) {
    if (window.mixedOpsData.isShowing || window.mixedOpsData.isProcessing) return;
    window.mixedOpsData.isProcessing = true;

    const isCorrect = (parseFloat(val) === window.mixedOpsData.currentQuestion.finalAnswer);
    saveMixedOpsAnswer(isCorrect);

    if (isCorrect) {
    // 👇 إضافة هذه الأسطر الثلاثة 👇
    let currentPoints = parseInt(localStorage.getItem('math_user_points') || '0');
    localStorage.setItem('math_user_points', (currentPoints + 10).toString());
    saveMixedOpsAnswer(isCorrect);

    showMixedFeedback("✅ عبقري!", "success");

    // 👇 إضافة استدعاء نظام الإنجازات 👇
    if (typeof window.checkAndUnlockAchievements === 'function') {
        window.checkAndUnlockAchievements();
    }

    setTimeout(() => {
        if (window.mixedOpsData.version === window.mixedOpsVersion) nextMixedLevel();
    }, 1500);

    } else {
        showMixedFeedback(`❌ خطأ! الجواب: ${window.mixedOpsData.currentQuestion.finalAnswer}`, "error");
        window.mixedOpsData.isProcessing = false;
    }
};

function nextMixedLevel() {
    if (window.mixedOpsData.currentLevel < 5) {
        window.mixedOpsData.currentLevel++;
        window.mixedOpsData.currentQuestion = generateMixedAdvQuestion(window.mixedOpsData.currentLevel);
        window.mixedOpsData.isProcessing = false;
        startMixedCountdown(window.mixedOpsVersion);
    } else {
        document.getElementById('main-content').innerHTML = `
            <div class="mental-container"><div class="mental-card">
                <h2>🏆 مذهل!</h2><p>أنهيت جميع المستويات</p>
                <button class="ans-btn" onclick="window.loadMixedOpsPage()">إعادة التحدي</button>
            </div></div>`;
    }
}

function showMixedFeedback(text, type) {
    const el = document.getElementById('game-msg');
    if (el) {
        el.textContent = text;
        el.className = `msg-box-mental ${type}`;
        el.style.opacity = '1';
        setTimeout(() => { if(el) el.style.opacity = '0'; }, 2000);
    }
}

function renderMixedGameUI() {
    const main = document.getElementById('main-content');
    if (!main || window.mixedOpsData.version !== window.mixedOpsVersion) return;

    const config = MIXED_ADV_CONFIGS[window.mixedOpsData.currentLevel];
    main.innerHTML = `
        <div class="mental-container">
            <div class="mental-card mixed-adv-theme">
                <div class="lvl-badge">${config.name}</div>
                <div id="math-display" class="display-screen">...</div>
                <div id="game-msg" class="msg-box-mental"></div>
                <div class="options-layout" id="options-area"></div>
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
        document.getElementById('options-area').innerHTML = opts.map(o => 
            `<button class="ans-btn" onclick="window.submitMixedAnswer('${o}')">${o}</button>`
        ).join('');
    }
}

function renderMixedStyles() {
    if (document.getElementById('mixed-ops-styles')) return;
    const style = document.createElement('style');
    style.id = 'mixed-ops-styles';
    style.innerHTML = `
        .mental-container { max-width: 450px; margin: 20px auto; direction: rtl; }
        .mental-card { background: #fff; border-radius: 30px; padding: 40px 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); text-align: center; min-height: 520px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
        .mixed-adv-theme { border: 2px solid #6c5ce7; }
        .countdown-box { width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 8px solid #6c5ce7; margin: 20px; }
        #cnt-num { font-size: 4rem; font-weight: 900; color: #6c5ce7; }
        .display-screen { font-size: 3.5rem; font-weight: 900; height: 120px; display: flex; align-items: center; }
        .options-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; }
        .ans-btn { padding: 15px; border: none; background: #6c5ce7; color: #fff; border-radius: 15px; font-size: 1.2rem; cursor: pointer; }
        .reset-ui-btn { background: #eee; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; margin-top: 10px; }
        .msg-box-mental { height: 30px; transition: 0.3s; opacity: 0; font-weight: bold; }
        .success { color: #2ecc71; } .error { color: #e74c3c; }
        [data-theme="dark"] .mental-card { background: #2d3436; color: #fff; }
    `;
    document.head.appendChild(style);
}
