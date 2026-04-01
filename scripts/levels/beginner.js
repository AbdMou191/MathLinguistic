/**
 * 🧩 المستوى المبتدئ (Beginner) - MathLinguistic v8.3
 * ✅ تصميم موحد وبسيط (بدون تداخل)
 * ✅ نظام تلميح مرتبط فعلياً بالنقاط (خصم فوري + تحديث الواجهة)
 * ✅ رسالة تأكيد واضحة بعد كل عملية
 * ✅ دعم MathJax للرياضيات
 * ✅ متغيرات فريدة ببادئة beg_ لمنع التعارض
 * ✅ نظام التحقق الذكي للمسائل النصية والحسابية
 * ✅ دعم الروابط العميقة (Deep Linking) بـ data-idx و id
 */

// @ts-nocheck

// ✅ متغيرات فريدة ببادئة beg_
let begProblems = [];
let begUserAnswers = [];
let begPurchasedHints = {};
let begCurrentPage = 1;
const BEG_PER_PAGE = 10;
const BEG_HINT_COST = 15;
const BEG_POINTS_PER_CORRECT = 5;

const BEG_STORAGE_KEYS = {
    ANSWERS: 'math_beg_answers_v3',
    HINTS: 'math_beg_hints_purchased',
    POINTS: 'math_user_points',
    COMPLETED: 'math_beginner_completed',
    FREE_HINTS: 'math_beg_free_hints'
};

// دالة تحميل آمنة للأرقام
function begSafeLoad(key, defaultVal) {
    try {
        const val = localStorage.getItem(key);
        if (val === null || val === "NaN" || val === "undefined") return defaultVal;
        const num = parseInt(val);
        return (Number.isInteger(num) && num >= 0) ? num : defaultVal;
    } catch (e) { return defaultVal; }
}

// ✅ تعريف الدوال على window مبكراً
window.begTglHint = function(idx) {};
window.begChkOne = function(idx) {};
window.begChkAll = function() {};
window.begRstPg = function() {};
window.begChPg = function(dir) {};

window.loadBeginnerPage = async function(problemData) {
    if (typeof cleanupCurrentPage === 'function') cleanupCurrentPage();
        const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `<div style="text-align:center;padding:50px;color:var(--text-secondary)">جارٍ التحميل... 🧩</div>`;

    try {
        if (problemData) {
            begProblems = problemData.problems || problemData;
        } else {
            const res = await fetch('data/levels/beginner.json');
            if (!res.ok) throw new Error("File not found");
            const data = await res.json();
            begProblems = data.problems || data;
        }

        // تنظيف الأسئلة
        begProblems = begProblems.map(p => {
            if (p.type === 'word-problem' || (p.question && p.question.length > 40)) return p;
            let cleanQ = (p.question || "").replace(/\?/g, '');
            if (cleanQ.includes('=')) cleanQ = cleanQ.split('=')[0].trim();
            p.question = cleanQ + " =";
            return p;
        });

        // تهيئة الإجابات
        const savedAnswers = localStorage.getItem(BEG_STORAGE_KEYS.ANSWERS);
        const saved = savedAnswers ? JSON.parse(savedAnswers) : [];
        begUserAnswers = new Array(begProblems.length).fill(null).map((_, i) => 
            saved[i] || { value: "", status: "pending", attempts: 0 }
        );

        // تهيئة التلميحات المشتراة
        const savedHints = localStorage.getItem(BEG_STORAGE_KEYS.HINTS);
        begPurchasedHints = savedHints ? JSON.parse(savedHints) : {};

        // تهيئة الإحصائيات
        window.begStats = {
            points: begSafeLoad(BEG_STORAGE_KEYS.POINTS, 0),
            completedTotal: begSafeLoad(BEG_STORAGE_KEYS.COMPLETED, 0),
            freeHints: begSafeLoad(BEG_STORAGE_KEYS.FREE_HINTS, 5)
        };

        renderBeginnerLayout();
        renderMath();
        
        if (typeof updatePageMeta === 'function') updatePageMeta('beginner');
        
    } catch (err) {
        console.error('❌ Beginner Error:', err);
        mainContent.innerHTML = `<div style="text-align:center;padding:40px"><h3 style="color:var(--difficulty-hard)">⚠️ تعذر التحميل</h3><button onclick="loadContent('home')" class="gc-btn gc-btn-primary" style="margin-top:20px">🏠 الرئيسية</button></div>`;    }
};

// ✅ نظام التحقق الذكي
function begCheckSmartAnswer(problem, userAnswer) {
    if (!userAnswer || userAnswer.trim() === "") return false;
    
    const cleanUser = userAnswer.trim();
    const cleanModel = String(problem.answer).trim();
    
    if (cleanUser === cleanModel) return true;
    if (problem.type === 'decomposition') return begCheckDecomposition(problem, cleanUser);
    if (problem.question && problem.question.includes('+')) return begCheckAddition(problem, cleanUser);
    
    return false;
}

function begCheckDecomposition(problem, userAnswer) {
    const targetMatch = problem.question?.match(/\d+/);
    if (!targetMatch) return false;
    const targetNumber = parseInt(targetMatch[0]);
    const numbers = userAnswer.split(/[+,،]/).map(n => parseInt(n)).filter(n => !isNaN(n));
    return (numbers.length === 2) && (numbers[0] + numbers[1] === targetNumber);
}

function begCheckAddition(problem, userAnswer) {
    const numbers = problem.question?.match(/\d+/g);
    if (!numbers || numbers.length < 2) return false;
    const num1 = parseInt(numbers[0]);
    const num2 = parseInt(numbers[1]);
    const correctSum = num1 + num2;
    const userNum = parseInt(userAnswer.replace(/[^0-9]/g, ''));
    return userNum === correctSum;
}

// ✅ دعم MathJax
function renderMath() {
    if (window.MathJax) {
        setTimeout(() => {
            const el = document.getElementById('main-content');
            if (el) MathJax.typesetPromise([el]).catch(err => console.error('MathJax Error:', err));
        }, 100);
    }
}

// ✅ حفظ التقدم
function begSaveProgress() {
    try {
        localStorage.setItem(BEG_STORAGE_KEYS.ANSWERS, JSON.stringify(begUserAnswers));
        localStorage.setItem(BEG_STORAGE_KEYS.HINTS, JSON.stringify(begPurchasedHints));        localStorage.setItem(BEG_STORAGE_KEYS.POINTS, String(begStats.points));
        localStorage.setItem(BEG_STORAGE_KEYS.COMPLETED, String(begStats.completedTotal));
        localStorage.setItem(BEG_STORAGE_KEYS.FREE_HINTS, String(begStats.freeHints));
    } catch (e) { 
        console.warn('⚠️ فشل الحفظ:', e);
        try {
            const simplified = begUserAnswers.map(a => ({
                value: a?.value || "",
                status: a?.status || "pending",
                attempts: a?.attempts || 0
            }));
            localStorage.setItem(BEG_STORAGE_KEYS.ANSWERS, JSON.stringify(simplified));
        } catch(e2) { console.error('❌ فشل الحفظ البديل:', e2); }
    }
}

// ✅ عرض رسالة موحدة
function begToast(msg, type = 'info') {
    if (window.GameCore?.toast) {
        GameCore.toast(msg, type);
    } else {
        const t = document.createElement('div');
        t.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:${type==='error'?'#e74c3c':'#2ecc71'};color:#fff;padding:12px 25px;border-radius:30px;z-index:9999;font-family:Cairo;animation:fadeInOut 3s forwards;`;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }
}

// ✅ بناء الواجهة
function renderBeginnerLayout() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const totalPages = Math.ceil(begProblems.length / BEG_PER_PAGE);
    
    if (!document.getElementById('beg-styles-v8')) {
        const style = document.createElement('style');
        style.id = 'beg-styles-v8';
        style.textContent = `
            .beg-wrap { max-width: 850px; margin: 0 auto; padding: 10px; }
            .beg-hdr {
                background: var(--card-bg); border: 2px solid var(--border-color);
                border-radius: 10px; padding: 15px 20px; margin-bottom: 15px;
                display: flex; justify-content: space-around; align-items: center;
                flex-wrap: wrap; gap: 10px;
            }
            .beg-stat { display: flex; align-items: center; gap: 8px; font-size: 0.95rem; color: var(--text-primary); }
            .beg-stat strong { color: var(--accent-color); font-size: 1.1rem; font-weight: 700; }
            .beg-title {                text-align: center; font-size: 1.3rem; font-weight: 700;
                color: var(--accent-color); margin: 10px 0 20px 0;
                padding: 10px; border-bottom: 2px solid var(--border-color);
            }
            .beg-box {
                background: var(--card-bg); border: none; border-radius: 10px;
                padding: 0; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                position: relative; overflow: hidden;
            }
            .beg-bar {
                background: var(--bg-soft); border-bottom: 2px solid var(--border-color);
                padding: 10px 15px; display: flex; justify-content: space-between; align-items: center;
            }
            .beg-num {
                color: var(--accent-color); font-weight: 700; font-size: 0.95rem;
                display: flex; align-items: center; gap: 8px;
            }
            .beg-num::before, .beg-num::after {
                content: ''; flex: 1; height: 1px; background: var(--border-color); margin: 0 10px;
            }
            .beg-hb {
                width: 32px; height: 32px; background: transparent;
                border: 2px solid var(--accent-color); border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; font-size: 1rem; transition: all 0.2s; flex-shrink: 0;
            }
            .beg-hb:hover { background: var(--accent-color); color: #fff; }
            .beg-hb.done { background: var(--difficulty-easy); border-color: var(--difficulty-easy); color: #fff; }
            .beg-q { padding: 15px; font-size: 1.1rem; line-height: 1.7; color: var(--text-primary); }
            .beg-ans {
                width: 100%; min-height: 50px; padding: 12px 15px; border: none;
                border-top: 2px solid var(--border-color); background: var(--bg-primary);
                color: var(--text-primary); font-family: 'Cairo', sans-serif;
                font-size: 1rem; text-align: center; box-sizing: border-box;
            }
            .beg-ans:focus { outline: none; background: var(--bg-soft); }
            .beg-ans.done { background: rgba(46,204,113,0.08); color: var(--difficulty-easy); }
            .beg-fb { padding: 10px 15px; text-align: center; font-weight: 600; }
            .beg-ok { color: var(--difficulty-easy); background: rgba(46,204,113,0.08); }
            .beg-err { color: var(--difficulty-hard); background: rgba(231,76,60,0.08); }
            .beg-hint {
                max-height: 0; overflow: hidden; transition: max-height 0.3s ease;
                background: var(--bg-soft); border-top: 1px dashed var(--border-color);
            }
            .beg-hint.show { max-height: 400px; padding: 15px; }
            .beg-ctrl {
                display: flex; justify-content: center; align-items: center;
                gap: 12px; margin: 20px 0; flex-wrap: wrap;
            }
            .beg-btn {                padding: 8px 16px; border: none; border-radius: 20px;
                font-weight: 600; cursor: pointer; font-family: 'Cairo', sans-serif;
                font-size: 0.9rem; transition: all 0.2s;
            }
            .beg-btn-nav { background: var(--accent-color); color: #fff; min-width: 70px; }
            .beg-btn-nav:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
            .beg-btn-nav:disabled { opacity: 0.3; cursor: not-allowed; }
            .beg-btn-rst { background: #f39c12; color: #fff; }
            .beg-btn-rst:hover { background: #e67e22; }
            .beg-vrf {
                background: var(--accent-color); color: #fff; border: none;
                padding: 12px 30px; border-radius: 25px; font-size: 1rem;
                font-weight: 700; cursor: pointer; margin: 15px 0;
                width: 100%; max-width: 350px;
            }
            .beg-vrf:hover { background: var(--accent-hover); }
            .beg-pg { display: flex; justify-content: center; gap: 6px; margin: 15px 0; flex-wrap: wrap; }
            .beg-home {
                display: inline-flex; align-items: center; gap: 6px;
                color: var(--text-muted); text-decoration: none; padding: 8px 16px; margin-top: 10px;
            }
            .beg-home:hover { color: var(--accent-color); }
            @media (max-width: 600px) {
                .beg-wrap { padding: 5px; }
                .beg-hdr { padding: 12px 15px; }
                .beg-stat { font-size: 0.85rem; }
                .beg-stat strong { font-size: 1rem; }
                .beg-title { font-size: 1.1rem; margin: 8px 0 15px 0; }
                .beg-q { padding: 12px; font-size: 1rem; }
                .beg-ans { min-height: 45px; font-size: 0.95rem; }
                .beg-ctrl { gap: 8px; }
                .beg-btn { padding: 7px 12px; font-size: 0.85rem; }
                .beg-btn-nav { min-width: 60px; }
                .beg-vrf { padding: 10px 20px; font-size: 0.95rem; }
            }
        `;
        document.head.appendChild(style);
    }
    
    const solved = begUserAnswers.filter(a => a?.status === 'correct').length;
    const stars = Math.floor(begStats.completedTotal / 5);
    
    mainContent.innerHTML = `
    <div class="beg-wrap">
        <div class="beg-hdr">
            <div class="beg-stat">✅ المنجز: <strong id="beg-c">${solved}</strong>/${begProblems.length}</div>
            <div class="beg-stat">🏆 النقاط: <strong id="beg-p">${begStats.points}</strong></div>
            <div class="beg-stat">⭐ الأوسمة: <strong id="beg-s">${stars}</strong></div>
        </div>
                <div class="beg-title">🧩 المستوى المبتدئ</div>
        
        <div id="beg-list"></div>
        
        <div class="beg-ctrl">
            <button class="beg-btn beg-btn-nav" onclick="window.begChPg(-1);return false" ${begCurrentPage===1?'disabled':''}>◀ السابق</button>
            <button class="beg-btn beg-btn-rst" onclick="window.begRstPg()">🔄 إعادة</button>
            <button class="beg-btn beg-btn-nav" onclick="window.begChPg(1);return false" ${begCurrentPage===totalPages?'disabled':''}>التالي ▶</button>
        </div>
        
        <div class="beg-pg" id="beg-pg"></div>
        
        <button class="beg-vrf" onclick="window.begChkAll()">🔍 تحليل الإجابات</button>
        
        <div style="text-align:center"><a href="#" class="beg-home" onclick="loadHomePage();return false">🏠 الرئيسية</a></div>
    </div>`;
    
    begUpdStats();
    begShowProblems(begCurrentPage);
}

// ✅ عرض مسائل الصفحة - مع deep linking attributes
function begShowProblems(page) {
    begCurrentPage = page;
    const list = document.getElementById('beg-list');
    if (!list) return;
    
    const start = (page - 1) * BEG_PER_PAGE;
    const end = Math.min(start + BEG_PER_PAGE, begProblems.length);
    const items = begProblems.slice(start, end);

    list.innerHTML = items.map((prob, i) => {
        const idx = start + i;
        const ans = begUserAnswers[idx] || { value: "", status: "pending" };
        const done = ans.status === 'correct';
        const hintDone = begPurchasedHints[idx] === true;
        const isLong = prob.type === 'word-problem' || (prob.question && prob.question.length > 50);
        
        return `
        <div class="beg-box" data-idx="${idx}" id="problem-${idx}">
            <div class="beg-bar">
                <div class="beg-num">مسألة ${prob.id || idx + 1}</div>
                <div class="beg-hb ${hintDone?'done':''}" onclick="window.begTglHint(${idx});return false" title="${hintDone?'عرض التلميح':'شراء (15 نقطة)'}">
                    ${hintDone?'🔓':'💡'}
                </div>
            </div>
            <div class="beg-q ${isLong?'long':''}">${prob.question}</div>
            <input type="text" class="beg-ans ${isLong?'full':''} ${done?'done':''}" id="beg-a${idx}" 
                value="${ans.value || ''}" placeholder="اكتب الإجابة..."
                ${done?'disabled':''} onkeypress="if(event.key==='Enter'){event.preventDefault();window.begChkOne(${idx});}">            <div class="beg-fb" id="beg-f${idx}"></div>
            <div class="beg-hint ${hintDone?'show':''}" id="beg-h${idx}">
                <strong>💡 التلميح:</strong><br>${prob.hint||prob.explanation||'فكر جيداً في المسألة'}
            </div>
        </div>`;
    }).join('');
    
    begRenderPagination();
    renderMath();
    window.scrollTo({top:0,behavior:'smooth'});
}

// ✅ شراء/عرض التلميح
window.begTglHint = function(idx) {
    if (begPurchasedHints[idx]) {
        const hintBox = document.getElementById(`beg-h${idx}`);
        if (hintBox) hintBox.classList.toggle('show');
        return;
    }
    
    if (begStats.freeHints > 0) {
        begStats.freeHints--;
        begPurchasedHints[idx] = true;
        
        const hintBox = document.getElementById(`beg-h${idx}`);
        if (hintBox) hintBox.classList.add('show');
        
        const btn = document.querySelector(`.beg-hb[onclick*="begTglHint(${idx})"]`);
        if (btn) { btn.classList.add('done'); btn.innerHTML = '🔓'; btn.title = 'تم الاستخدام'; }
        
        begSaveProgress();
        begUpdStats();
        begToast(`✅ تم استخدام تلميح مجاني (المتبقي: ${begStats.freeHints})`, 'success');
        return;
    }
    
    if (begStats.points < BEG_HINT_COST) {
        begToast(`❌ نقاطك غير كافية! تحتاج ${BEG_HINT_COST} نقطة`, 'error');
        return;
    }
    
    const completePurchase = () => {
        begStats.points -= BEG_HINT_COST;
        begPurchasedHints[idx] = true;
        
        const hintBox = document.getElementById(`beg-h${idx}`);
        if (hintBox) hintBox.classList.add('show');
        
        const btn = document.querySelector(`.beg-hb[onclick*="begTglHint(${idx})"]`);
        if (btn) { btn.classList.add('done'); btn.innerHTML = '🔓'; btn.title = 'تم الشراء'; }        
        begSaveProgress();
        begUpdStats();
        begToast(`✅ تم شراء التلميح (-${BEG_HINT_COST} نقطة)`, 'success');
    };
    
    if (window.GameCore?.confirmAction) {
        GameCore.confirmAction('شراء تلميح', `هل تريد شراء تلميح بـ ${BEG_HINT_COST} نقطة؟`, completePurchase, () => {});
    } else {
        if (confirm(`💡 شراء تلميح بـ ${BEG_HINT_COST} نقطة؟`)) {
            completePurchase();
        }
    }
};

// ✅ إعادة تعيين الصفحة
window.begRstPg = function() {
    const start = (begCurrentPage - 1) * BEG_PER_PAGE;
    const end = Math.min(start + BEG_PER_PAGE, begProblems.length);
    const doRst = () => {
        let cnt = 0;
        for (let i=start; i<end; i++) {
            if (begUserAnswers[i]?.status !== 'pending') {
                begUserAnswers[i] = { value: "", status: "pending", attempts: 0 };
                cnt++;
            }
            const inp = document.getElementById(`beg-a${i}`);
            const fb = document.getElementById(`beg-f${i}`);
            if (inp) { inp.value=""; inp.disabled=false; inp.classList.remove('done'); }
            if (fb) fb.innerHTML = "";
        }
        if (cnt) { begSaveProgress(); begUpdStats(); }
        begToast(cnt?`🔄 تم مسح ${cnt} إجابة`:'📝 لا توجد إجابات', 'info');
    };
    if (window.GameCore?.confirmAction) {
        GameCore.confirmAction('إعادة الصفحة', 'مسح الإجابات؟', doRst, ()=>{});
    } else if (confirm('⚠️ مسح إجابات هذه الصفحة؟')) {
        doRst();
    }
};

// ✅ التحقق من إجابة واحدة
window.begChkOne = function(idx) {
    const inp = document.getElementById(`beg-a${idx}`);
    const fb = document.getElementById(`beg-f${idx}`);
    if (!inp || !fb) return;
    
    const val = inp.value.trim();
    if (!val) { fb.innerHTML=""; return; }
    if (inp.disabled) return;    
    const problem = begProblems[idx];
    if (begCheckSmartAnswer(problem, val)) {
        if (begUserAnswers[idx].status !== 'correct') {
            begStats.points += BEG_POINTS_PER_CORRECT;
            begStats.completedTotal++;
            if (begStats.completedTotal % 5 === 0) begStats.freeHints += 1;
            if (typeof window.checkAndUnlockAchievements === 'function') {
                window.checkAndUnlockAchievements();
            }
        }
        begUserAnswers[idx] = { value: val, status: 'correct', attempts: (begUserAnswers[idx]?.attempts||0)+1 };
        inp.disabled = true; inp.classList.add('done');
        fb.innerHTML = `<span class="beg-ok">✅ صحيح! +${BEG_POINTS_PER_CORRECT}</span>`;
        begSaveProgress(); begUpdStats();
        begToast(`🎯 +${BEG_POINTS_PER_CORRECT} نقطة`, 'success');
    } else {
        begUserAnswers[idx].status = 'incorrect';
        begUserAnswers[idx].attempts = (begUserAnswers[idx]?.attempts||0) + 1;
        fb.innerHTML = `<span class="beg-err">❌ حاول مرة أخرى</span>`;
        begSaveProgress();
    }
};

// ✅ التحقق من جميع الإجابات
window.begChkAll = function() {
    const start = (begCurrentPage - 1) * BEG_PER_PAGE;
    const end = Math.min(start + BEG_PER_PAGE, begProblems.length);
    let ok=0, pts=0;
    
    for (let i=start; i<end; i++) {
        const inp = document.getElementById(`beg-a${i}`);
        const fb = document.getElementById(`beg-f${i}`);
        if (!inp || inp.disabled) continue;
        
        const val = inp.value.trim();
        if (!val) { fb.innerHTML=""; continue; }
        
        const problem = begProblems[i];
        if (begCheckSmartAnswer(problem, val)) {
            if (begUserAnswers[i].status !== 'correct') {
                ok++; pts+=BEG_POINTS_PER_CORRECT;
                begStats.points += BEG_POINTS_PER_CORRECT;
                begStats.completedTotal++;
                if (begStats.completedTotal % 5 === 0) begStats.freeHints += 1;
            }
            begUserAnswers[i] = { value: val, status: 'correct', attempts: (begUserAnswers[i]?.attempts||0)+1 };
            inp.disabled = true; inp.classList.add('done');
            fb.innerHTML = `<span class="beg-ok">✅ صحيح</span>`;
        } else {            begUserAnswers[i].status = 'incorrect';
            fb.innerHTML = `<span class="beg-err">❌</span>`;
        }
    }
    
    if (ok || pts) {
        begSaveProgress(); begUpdStats();
        if (typeof window.checkAndUnlockAchievements === 'function') {
            window.checkAndUnlockAchievements();
        }
        begToast(`🎉 ${ok} إجابات صحيحة (+${pts} نقطة)`, 'success');
    } else {
        begToast('📝 لا توجد إجابات جديدة', 'info');
    }
};

// ✅ تحديث الإحصائيات
function begUpdStats() {
    const solved = begUserAnswers.filter(a => a?.status === 'correct').length;
    const stars = Math.floor(begStats.completedTotal / 5);
    
    const c = document.getElementById('beg-c');
    if (c) c.textContent = String(solved);
    
    const p = document.getElementById('beg-p');
    if (p) p.textContent = String(begStats.points);
    
    const s = document.getElementById('beg-s');
    if (s) s.textContent = String(stars);
}

// ✅ بناء الترقيم
function begRenderPagination() {
    const total = Math.ceil(begProblems.length / BEG_PER_PAGE);
    const container = document.getElementById('beg-pg');
    if (!container || total <= 1) { if(container) container.innerHTML=''; return; }
    
    let pages = [];
    if (total <= 5) {
        for (let i = 1; i <= total; i++) pages.push(i);
    } else {
        if (begCurrentPage <= 3) pages = [1, 2, 3, '...', total];
        else if (begCurrentPage >= total - 2) pages = [1, '...', total-2, total-1, total];
        else pages = [1, '...', begCurrentPage-1, begCurrentPage, begCurrentPage+1, '...', total];
    }
    
    container.innerHTML = pages.map(item => {
        if (item === '...' || typeof item !== 'number') return `<span style="color:var(--text-muted);padding:0 5px;font-size:1.2rem">…</span>`;
        const n = Number(item);
        const act = n === begCurrentPage ? 'active' : '';        return `<button class="beg-btn ${act}" style="background:${act?'var(--accent-color)':'var(--card-bg)'};color:${act?'#fff':'var(--text-primary)'};border:1px solid var(--border-color);padding:5px 12px;min-width:35px;border-radius:18px;font-weight:600" onclick="window.begShowProblems(${n});return false">${n}</button>`;
    }).join('');
}

// ✅ تغيير الصفحة
window.begChPg = function(dir) {
    const total = Math.ceil(begProblems.length / BEG_PER_PAGE);
    const np = begCurrentPage + dir;
    if (np < 1 || np > total) return;
    begShowProblems(np);
};

// ✅ دوال عامة
window.cleanupBeginnerLevel = () => { begProblems = []; };
window.beginnerLevel = { 
    resetPage: begRstPg, 
    checkAnswer: begChkOne, 
    checkAll: begChkAll, 
    buyHint: begTglHint 
};

console.log('✅ Beginner v8.3 loaded - جميع الأخطاء مُصلَحة!');