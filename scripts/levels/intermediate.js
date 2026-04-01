/**
 * 🧩 المستوى المتوسط (Intermediate) - MathLinguistic v8.3
 * ✅ تصميم موحد وبسيط (بدون تداخل)
 * ✅ نظام تلميح مرتبط فعلياً بالنقاط (خصم فوري + تحديث الواجهة)
 * ✅ رسالة تأكيد واضحة بعد كل عملية
 * ✅ دعم MathJax للرياضيات
 * ✅ متغيرات فريدة ببادئة int_ لمنع التعارض
 * ✅ دعم الروابط العميقة (Deep Linking) بـ data-idx و id
 */

// @ts-nocheck

// ✅ متغيرات فريدة ببادئة int_
let intProblems = [];
let intUserAnswers = [];
let intPurchasedHints = {};
let intCurrentPage = 1;
const INT_PER_PAGE = 10;
const INT_HINT_COST = 15;
const INT_POINTS_PER_CORRECT = 5;

const INT_STORAGE_KEYS = {
    ANSWERS: 'math_int_answers_v3',
    HINTS: 'math_int_hints_purchased',
    POINTS: 'math_user_points',
    COMPLETED: 'math_int_completed',
    FREE_HINTS: 'math_int_free_hints'
};

// دالة تحميل آمنة للأرقام
function intSafeLoad(key, defaultVal) {
    try {
        const val = localStorage.getItem(key);
        if (val === null || val === "NaN" || val === "undefined") return defaultVal;
        const num = parseInt(val);
        return (Number.isInteger(num) && num >= 0) ? num : defaultVal;
    } catch (e) { return defaultVal; }
}

// ✅ تعريف الدوال على window مبكراً لمنع أخطاء TypeScript
window.intTglHint = function(idx) {};
window.intChkOne = function(idx) {};
window.intChkAll = function() {};
window.intRstPg = function() {};
window.intChPg = function(dir) {};

window.loadIntermediatePage = async function(problemData) {
    if (typeof cleanupCurrentPage === 'function') cleanupCurrentPage();
    
    const mainContent = document.getElementById('main-content');    if (!mainContent) return;
    
    mainContent.innerHTML = `<div style="text-align:center;padding:50px;color:var(--text-secondary)">جارٍ التحميل... 🧩</div>`;

    try {
        if (problemData) {
            intProblems = problemData.problems || problemData;
        } else {
            const res = await fetch('data/levels/intermediate.json');
            if (!res.ok) throw new Error("File not found");
            const data = await res.json();
            intProblems = data.problems || data;
        }

        // تنظيف الأسئلة
        intProblems = intProblems.map(p => {
            let cleanQ = (p.question || "").replace(/\?\s*/g, '').split('=')[0].trim();
            p.question = cleanQ + " =";
            return p;
        });

        // تهيئة الإجابات
        const savedAnswers = localStorage.getItem(INT_STORAGE_KEYS.ANSWERS);
        const saved = savedAnswers ? JSON.parse(savedAnswers) : [];
        intUserAnswers = new Array(intProblems.length).fill(null).map((_, i) => 
            saved[i] || { value: "", status: "pending", attempts: 0 }
        );

        // تهيئة التلميحات المشتراة
        const savedHints = localStorage.getItem(INT_STORAGE_KEYS.HINTS);
        intPurchasedHints = savedHints ? JSON.parse(savedHints) : {};

        // تهيئة الإحصائيات
        window.intStats = {
            points: intSafeLoad(INT_STORAGE_KEYS.POINTS, 0),
            completedTotal: intSafeLoad(INT_STORAGE_KEYS.COMPLETED, 0),
            freeHints: intSafeLoad(INT_STORAGE_KEYS.FREE_HINTS, 5)
        };

        renderIntermediateLayout();
        renderMath();
        
        if (typeof updatePageMeta === 'function') updatePageMeta('intermediate');
        
    } catch (err) {
        console.error('❌ Intermediate Error:', err);
        mainContent.innerHTML = `<div style="text-align:center;padding:40px"><h3 style="color:var(--difficulty-hard)">⚠️ تعذر التحميل</h3><button onclick="loadContent('home')" class="gc-btn gc-btn-primary" style="margin-top:20px">🏠 الرئيسية</button></div>`;
    }
};
// ✅ مقارنة الإجابات
function intIsAnswerCorrect(userVal, correctVal) {
    if (userVal == null || correctVal == null) return false;
    const u = String(userVal).trim().toLowerCase();
    const c = String(correctVal).trim().toLowerCase();
    const uNum = Number(u), cNum = Number(c);
    if (!isNaN(uNum) && !isNaN(cNum) && u !== '' && c !== '') return uNum === cNum;
    return u === c;
}

// ✅ دعم MathJax (تصحيح الاسم)
function renderMath() {
    if (window.MathJax) {
        setTimeout(() => {
            const el = document.getElementById('main-content');
            if (el) MathJax.typesetPromise([el]).catch(err => console.error('MathJax Error:', err));
        }, 100);
    }
}

// ✅ حفظ التقدم
function intSaveProgress() {
    try {
        localStorage.setItem(INT_STORAGE_KEYS.ANSWERS, JSON.stringify(intUserAnswers));
        localStorage.setItem(INT_STORAGE_KEYS.HINTS, JSON.stringify(intPurchasedHints));
        localStorage.setItem(INT_STORAGE_KEYS.POINTS, String(intStats.points));
        localStorage.setItem(INT_STORAGE_KEYS.COMPLETED, String(intStats.completedTotal));
        localStorage.setItem(INT_STORAGE_KEYS.FREE_HINTS, String(intStats.freeHints));
    } catch (e) { console.warn('⚠️ فشل الحفظ:', e); }
}

// ✅ عرض رسالة موحدة
function intToast(msg, type = 'info') {
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
function renderIntermediateLayout() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const totalPages = Math.ceil(intProblems.length / INT_PER_PAGE);    
    if (!document.getElementById('int-styles-v8')) {
        const style = document.createElement('style');
        style.id = 'int-styles-v8';
        style.textContent = `
            .int-wrap { max-width: 850px; margin: 0 auto; padding: 10px; }
            .int-hdr {
                background: var(--card-bg); border: 2px solid var(--border-color);
                border-radius: 10px; padding: 15px 20px; margin-bottom: 15px;
                display: flex; justify-content: space-around; align-items: center;
                flex-wrap: wrap; gap: 10px;
            }
            .int-stat { display: flex; align-items: center; gap: 8px; font-size: 0.95rem; color: var(--text-primary); }
            .int-stat strong { color: var(--accent-color); font-size: 1.1rem; font-weight: 700; }
            .int-title {
                text-align: center; font-size: 1.3rem; font-weight: 700;
                color: var(--accent-color); margin: 10px 0 20px 0;
                padding: 10px; border-bottom: 2px solid var(--border-color);
            }
            .int-box {
                background: var(--card-bg); border: none; border-radius: 10px;
                padding: 0; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                position: relative; overflow: hidden;
            }
            .int-bar {
                background: var(--bg-soft); border-bottom: 2px solid var(--border-color);
                padding: 10px 15px; display: flex; justify-content: space-between; align-items: center;
            }
            .int-num {
                color: var(--accent-color); font-weight: 700; font-size: 0.95rem;
                display: flex; align-items: center; gap: 8px;
            }
            .int-num::before, .int-num::after {
                content: ''; flex: 1; height: 1px; background: var(--border-color); margin: 0 10px;
            }
            .int-hb {
                width: 32px; height: 32px; background: transparent;
                border: 2px solid var(--accent-color); border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; font-size: 1rem; transition: all 0.2s; flex-shrink: 0;
            }
            .int-hb:hover { background: var(--accent-color); color: #fff; }
            .int-hb.done { background: var(--difficulty-easy); border-color: var(--difficulty-easy); color: #fff; }
            .int-q { padding: 15px; font-size: 1.1rem; line-height: 1.7; color: var(--text-primary); }
            .int-ans {
                width: 100%; min-height: 50px; padding: 12px 15px; border: none;
                border-top: 2px solid var(--border-color); background: var(--bg-primary);
                color: var(--text-primary); font-family: 'Cairo', sans-serif;
                font-size: 1rem; text-align: center; box-sizing: border-box;
            }            .int-ans:focus { outline: none; background: var(--bg-soft); }
            .int-ans.done { background: rgba(46,204,113,0.08); color: var(--difficulty-easy); }
            .int-fb { padding: 10px 15px; text-align: center; font-weight: 600; }
            .int-ok { color: var(--difficulty-easy); background: rgba(46,204,113,0.08); }
            .int-err { color: var(--difficulty-hard); background: rgba(231,76,60,0.08); }
            .int-hint {
                max-height: 0; overflow: hidden; transition: max-height 0.3s ease;
                background: var(--bg-soft); border-top: 1px dashed var(--border-color);
            }
            .int-hint.show { max-height: 400px; padding: 15px; }
            .int-ctrl {
                display: flex; justify-content: center; align-items: center;
                gap: 12px; margin: 20px 0; flex-wrap: wrap;
            }
            .int-btn {
                padding: 8px 16px; border: none; border-radius: 20px;
                font-weight: 600; cursor: pointer; font-family: 'Cairo', sans-serif;
                font-size: 0.9rem; transition: all 0.2s;
            }
            .int-btn-nav { background: var(--accent-color); color: #fff; min-width: 70px; }
            .int-btn-nav:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
            .int-btn-nav:disabled { opacity: 0.3; cursor: not-allowed; }
            .int-btn-rst { background: #f39c12; color: #fff; }
            .int-btn-rst:hover { background: #e67e22; }
            .int-vrf {
                background: var(--accent-color); color: #fff; border: none;
                padding: 12px 30px; border-radius: 25px; font-size: 1rem;
                font-weight: 700; cursor: pointer; margin: 15px 0;
                width: 100%; max-width: 350px;
            }
            .int-vrf:hover { background: var(--accent-hover); }
            .int-pg { display: flex; justify-content: center; gap: 6px; margin: 15px 0; flex-wrap: wrap; }
            .int-home {
                display: inline-flex; align-items: center; gap: 6px;
                color: var(--text-muted); text-decoration: none; padding: 8px 16px; margin-top: 10px;
            }
            .int-home:hover { color: var(--accent-color); }
            @media (max-width: 600px) {
                .int-wrap { padding: 5px; }
                .int-hdr { padding: 12px 15px; }
                .int-stat { font-size: 0.85rem; }
                .int-stat strong { font-size: 1rem; }
                .int-title { font-size: 1.1rem; margin: 8px 0 15px 0; }
                .int-q { padding: 12px; font-size: 1rem; }
                .int-ans { min-height: 45px; font-size: 0.95rem; }
                .int-ctrl { gap: 8px; }
                .int-btn { padding: 7px 12px; font-size: 0.85rem; }
                .int-btn-nav { min-width: 60px; }
                .int-vrf { padding: 10px 20px; font-size: 0.95rem; }
            }        `;
        document.head.appendChild(style);
    }
    
    const solved = intUserAnswers.filter(a => a?.status === 'correct').length;
    const stars = Math.floor(intStats.completedTotal / 5);
    
    mainContent.innerHTML = `
    <div class="int-wrap">
        <div class="int-hdr">
            <div class="int-stat">✅ المنجز: <strong id="int-c">${solved}</strong>/${intProblems.length}</div>
            <div class="int-stat">🏆 النقاط: <strong id="int-p">${intStats.points}</strong></div>
            <div class="int-stat">⭐ الأوسمة: <strong id="int-s">${stars}</strong></div>
        </div>
        
        <div class="int-title">🧩 المستوى المتوسط</div>
        
        <div id="int-list"></div>
        
        <div class="int-ctrl">
            <button class="int-btn int-btn-nav" onclick="window.intChPg(-1);return false" ${intCurrentPage===1?'disabled':''}>◀ السابق</button>
            <button class="int-btn int-btn-rst" onclick="window.intRstPg()">🔄 إعادة</button>
            <button class="int-btn int-btn-nav" onclick="window.intChPg(1);return false" ${intCurrentPage===totalPages?'disabled':''}>التالي ▶</button>
        </div>
        
        <div class="int-pg" id="int-pg"></div>
        
        <button class="int-vrf" onclick="window.intChkAll()">🔍 تحليل الإجابات</button>
        
        <div style="text-align:center"><a href="#" class="int-home" onclick="loadHomePage();return false">🏠 الرئيسية</a></div>
    </div>`;
    
    intUpdStats();
    intShowProblems(intCurrentPage);
}

// ✅ عرض مسائل الصفحة - مع deep linking attributes
function intShowProblems(page) {
    intCurrentPage = page;
    const list = document.getElementById('int-list');
    if (!list) return;
    
    const start = (page - 1) * INT_PER_PAGE;
    const end = Math.min(start + INT_PER_PAGE, intProblems.length);
    const items = intProblems.slice(start, end);

    list.innerHTML = items.map((prob, i) => {
        const idx = start + i;
        const ans = intUserAnswers[idx] || { value: "", status: "pending" };
        const done = ans.status === 'correct';        const hintDone = intPurchasedHints[idx] === true;
        
        return `
        <div class="int-box" data-idx="${idx}" id="problem-${idx}">
            <div class="int-bar">
                <div class="int-num">مسألة ${prob.id || idx + 1}</div>
                <div class="int-hb ${hintDone?'done':''}" onclick="window.intTglHint(${idx});return false" title="${hintDone?'عرض التلميح':'شراء (15 نقطة)'}">
                    ${hintDone?'🔓':'💡'}
                </div>
            </div>
            <div class="int-q">${prob.question}</div>
            <input type="text" class="int-ans ${done?'done':''}" id="int-a${idx}" 
                value="${ans.value || ''}" placeholder="اكتب الإجابة..."
                ${done?'disabled':''} onkeypress="if(event.key==='Enter'){event.preventDefault();window.intChkOne(${idx});}">
            <div class="int-fb" id="int-f${idx}"></div>
            <div class="int-hint ${hintDone?'show':''}" id="int-h${idx}">
                <strong>💡 التلميح:</strong><br>${prob.hint||prob.explanation||'فكر جيداً في المسألة'}
            </div>
        </div>`;
    }).join('');
    
    intRenderPagination();
    renderMath();
    window.scrollTo({top:0,behavior:'smooth'});
}

// ✅ شراء/عرض التلميح
window.intTglHint = function(idx) {
    if (intPurchasedHints[idx]) {
        const hintBox = document.getElementById(`int-h${idx}`);
        if (hintBox) hintBox.classList.toggle('show');
        return;
    }
    
    if (intStats.freeHints > 0) {
        intStats.freeHints--;
        intPurchasedHints[idx] = true;
        
        const hintBox = document.getElementById(`int-h${idx}`);
        if (hintBox) hintBox.classList.add('show');
        
        const btn = document.querySelector(`.int-hb[onclick*="intTglHint(${idx})"]`);
        if (btn) { btn.classList.add('done'); btn.innerHTML = '🔓'; btn.title = 'تم الاستخدام'; }
        
        intSaveProgress();
        intUpdStats();
        intToast(`✅ تم استخدام تلميح مجاني (المتبقي: ${intStats.freeHints})`, 'success');
        return;
    }
        if (intStats.points < INT_HINT_COST) {
        intToast(`❌ نقاطك غير كافية! تحتاج ${INT_HINT_COST} نقطة`, 'error');
        return;
    }
    
    const completePurchase = () => {
        intStats.points -= INT_HINT_COST;
        intPurchasedHints[idx] = true;
        
        const hintBox = document.getElementById(`int-h${idx}`);
        if (hintBox) hintBox.classList.add('show');
        
        const btn = document.querySelector(`.int-hb[onclick*="intTglHint(${idx})"]`);
        if (btn) { btn.classList.add('done'); btn.innerHTML = '🔓'; btn.title = 'تم الشراء'; }
        
        intSaveProgress();
        intUpdStats();
        intToast(`✅ تم شراء التلميح (-${INT_HINT_COST} نقطة)`, 'success');
    };
    
    if (window.GameCore?.confirmAction) {
        GameCore.confirmAction('شراء تلميح', `هل تريد شراء تلميح بـ ${INT_HINT_COST} نقطة؟`, completePurchase, () => {});
    } else {
        if (confirm(`💡 شراء تلميح بـ ${INT_HINT_COST} نقطة؟`)) {
            completePurchase();
        }
    }
};

// ✅ إعادة تعيين الصفحة
window.intRstPg = function() {
    const start = (intCurrentPage - 1) * INT_PER_PAGE;
    const end = Math.min(start + INT_PER_PAGE, intProblems.length);
    const doRst = () => {
        let cnt = 0;
        for (let i=start; i<end; i++) {
            if (intUserAnswers[i]?.status !== 'pending') {
                intUserAnswers[i] = { value: "", status: "pending", attempts: 0 };
                cnt++;
            }
            const inp = document.getElementById(`int-a${i}`);
            const fb = document.getElementById(`int-f${i}`);
            if (inp) { inp.value=""; inp.disabled=false; inp.classList.remove('done'); }
            if (fb) fb.innerHTML = "";
        }
        if (cnt) { intSaveProgress(); intUpdStats(); }
        intToast(cnt?`🔄 تم مسح ${cnt} إجابة`:'📝 لا توجد إجابات', 'info');
    };
    if (window.GameCore?.confirmAction) {
        GameCore.confirmAction('إعادة الصفحة', 'مسح الإجابات؟', doRst, ()=>{});    } else if (confirm('⚠️ مسح إجابات هذه الصفحة؟')) {
        doRst();
    }
};

// ✅ التحقق من إجابة واحدة
window.intChkOne = function(idx) {
    const inp = document.getElementById(`int-a${idx}`);
    const fb = document.getElementById(`int-f${idx}`);
    if (!inp || !fb) return;
    
    const val = inp.value.trim();
    if (!val) { fb.innerHTML=""; return; }
    if (inp.disabled) return;
    
    const correct = intProblems[idx].answer;
    if (intIsAnswerCorrect(val, correct)) {
        if (intUserAnswers[idx].status !== 'correct') {
            intStats.points += INT_POINTS_PER_CORRECT;
            intStats.completedTotal++;
            if (intStats.completedTotal % 5 === 0) intStats.freeHints += 1;
            if (typeof window.checkAndUnlockAchievements === 'function') {
                window.checkAndUnlockAchievements();
            }
        }
        intUserAnswers[idx] = { value: val, status: 'correct', attempts: (intUserAnswers[idx]?.attempts||0)+1 };
        inp.disabled = true; inp.classList.add('done');
        fb.innerHTML = `<span class="int-ok">✅ صحيح! +${INT_POINTS_PER_CORRECT}</span>`;
        intSaveProgress(); intUpdStats();
        intToast(`🎯 +${INT_POINTS_PER_CORRECT} نقطة`, 'success');
    } else {
        intUserAnswers[idx].status = 'incorrect';
        intUserAnswers[idx].attempts = (intUserAnswers[idx]?.attempts||0) + 1;
        fb.innerHTML = `<span class="int-err">❌ حاول مرة أخرى</span>`;
        intSaveProgress();
    }
};

// ✅ التحقق من جميع الإجابات
window.intChkAll = function() {
    const start = (intCurrentPage - 1) * INT_PER_PAGE;
    const end = Math.min(start + INT_PER_PAGE, intProblems.length);
    let ok=0, pts=0;
    
    for (let i=start; i<end; i++) {
        const inp = document.getElementById(`int-a${i}`);
        const fb = document.getElementById(`int-f${i}`);
        if (!inp || inp.disabled) continue;
        
        const val = inp.value.trim();        if (!val) { fb.innerHTML=""; continue; }
        
        const correct = intProblems[i].answer;
        if (intIsAnswerCorrect(val, correct)) {
            if (intUserAnswers[i].status !== 'correct') {
                ok++; pts+=INT_POINTS_PER_CORRECT;
                intStats.points += INT_POINTS_PER_CORRECT;
                intStats.completedTotal++;
                if (intStats.completedTotal % 5 === 0) intStats.freeHints += 1;
            }
            intUserAnswers[i] = { value: val, status: 'correct', attempts: (intUserAnswers[i]?.attempts||0)+1 };
            inp.disabled = true; inp.classList.add('done');
            fb.innerHTML = `<span class="int-ok">✅ صحيح</span>`;
        } else {
            intUserAnswers[i].status = 'incorrect';
            fb.innerHTML = `<span class="int-err">❌</span>`;
        }
    }
    
    if (ok || pts) {
        intSaveProgress(); intUpdStats();
        if (typeof window.checkAndUnlockAchievements === 'function') {
            window.checkAndUnlockAchievements();
        }
        intToast(`🎉 ${ok} إجابات صحيحة (+${pts} نقطة)`, 'success');
    } else {
        intToast('📝 لا توجد إجابات جديدة', 'info');
    }
};

// ✅ تحديث الإحصائيات
function intUpdStats() {
    const solved = intUserAnswers.filter(a => a?.status === 'correct').length;
    const stars = Math.floor(intStats.completedTotal / 5);
    
    const c = document.getElementById('int-c');
    if (c) c.textContent = String(solved);
    
    const p = document.getElementById('int-p');
    if (p) p.textContent = String(intStats.points);
    
    const s = document.getElementById('int-s');
    if (s) s.textContent = String(stars);
}

// ✅ بناء الترقيم
function intRenderPagination() {
    const total = Math.ceil(intProblems.length / INT_PER_PAGE);
    const container = document.getElementById('int-pg');
    if (!container || total <= 1) { if(container) container.innerHTML=''; return; }    
    let pages = [];
    if (total <= 5) {
        for (let i = 1; i <= total; i++) pages.push(i);
    } else {
        if (intCurrentPage <= 3) pages = [1, 2, 3, '...', total];
        else if (intCurrentPage >= total - 2) pages = [1, '...', total-2, total-1, total];
        else pages = [1, '...', intCurrentPage-1, intCurrentPage, intCurrentPage+1, '...', total];
    }
    
    container.innerHTML = pages.map(item => {
        if (item === '...' || typeof item !== 'number') return `<span style="color:var(--text-muted);padding:0 5px;font-size:1.2rem">…</span>`;
        const n = Number(item);
        const act = n === intCurrentPage ? 'active' : '';
        return `<button class="int-btn ${act}" style="background:${act?'var(--accent-color)':'var(--card-bg)'};color:${act?'#fff':'var(--text-primary)'};border:1px solid var(--border-color);padding:5px 12px;min-width:35px;border-radius:18px;font-weight:600" onclick="window.intShowProblems(${n});return false">${n}</button>`;
    }).join('');
}

// ✅ تغيير الصفحة
window.intChPg = function(dir) {
    const total = Math.ceil(intProblems.length / INT_PER_PAGE);
    const np = intCurrentPage + dir;
    if (np < 1 || np > total) return;
    intShowProblems(np);
};

// ✅ دوال عامة
window.cleanupIntermediateLevel = () => { intProblems = []; };
window.intermediateLevel = { 
    resetPage: intRstPg, 
    checkAnswer: intChkOne, 
    checkAll: intChkAll, 
    buyHint: intTglHint 
};

console.log('✅ Intermediate v8.3 loaded - جميع الأخطاء مُصلَحة!');