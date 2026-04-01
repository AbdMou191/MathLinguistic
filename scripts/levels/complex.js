/**
 * 🧪 المستوى المعقد (Complex) - MathLinguistic v8.0
 * ✅ تصميم أنيق وبسيط - ألوان محدودة
 * ✅ الهيدر: النقاط + الأوسمة + المنجز فقط
 * ✅ العنوان أسفل الهيدر
 * ✅ شارة المسألة والتلميح على الإطار
 * ✅ textarea محسّن للهاتف
 * ✅ أزرار تنقل مضغوطة
 * ✅ دعم LaTeX للإجابات الرياضية
 */

let complexProblems = [];
let userComplexAnswers = [];
let purchasedHints = {};
let currentComplexPage = 1;
const CMP_PER_PAGE = 5;
const HINT_COST = 15;
const POINTS_PER_CORRECT = 15;

const STORAGE_KEYS = {
    ANSWERS: 'math_complex_answers_v3',
    HINTS: 'math_complex_hints_purchased',
    POINTS: 'math_user_points'
};

window.loadComplexPage = async function(problemData) {
    if (typeof cleanupCurrentPage === 'function') cleanupCurrentPage();
    
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `<div style="text-align:center;padding:50px;color:var(--text-secondary)">جارٍ التحميل... 🧪</div>`;

    try {
        if (problemData) {
            complexProblems = problemData.problems || problemData;
        } else {
            const response = await fetch('data/levels/complex.json');
            if (!response.ok) throw new Error("File not found");
            const data = await response.json();
            complexProblems = data.problems || data;
        }

        const savedAnswers = localStorage.getItem(STORAGE_KEYS.ANSWERS);
        userComplexAnswers = savedAnswers ? JSON.parse(savedAnswers) : [];
        if (userComplexAnswers.length !== complexProblems.length) {
            userComplexAnswers = new Array(complexProblems.length).fill("");
        }

        const savedHints = localStorage.getItem(STORAGE_KEYS.HINTS);        purchasedHints = savedHints ? JSON.parse(savedHints) : {};

        renderComplexLayout();
        renderMath();
        
        if (typeof updatePageMeta === 'function') updatePageMeta('complex');
        
    } catch (error) {
        console.error("❌ Complex Level Error:", error);
        mainContent.innerHTML = `<div style="text-align:center;padding:40px"><h3 style="color:var(--difficulty-hard)">⚠️ تعذر التحميل</h3><button onclick="loadContent('home')" class="gc-btn gc-btn-primary" style="margin-top:20px">🏠 الرئيسية</button></div>`;
    }
};

function isAnswerCorrect(userVal, correctVal) {
    if (userVal == null || correctVal == null) return false;
    const u = String(userVal).trim().toLowerCase();
    const c = String(correctVal).trim().toLowerCase();
    const uNum = Number(u);
    const cNum = Number(c);
    if (!isNaN(uNum) && !isNaN(cNum) && u !== '' && c !== '') return uNum === cNum;
    return u === c;
}

function saveComplexProgress() {
    try {
        localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(userComplexAnswers));
        localStorage.setItem(STORAGE_KEYS.HINTS, JSON.stringify(purchasedHints));
    } catch (e) { console.warn('⚠️ فشل الحفظ:', e); }
}

function renderMath() {
    if (window.MathJax) {
        setTimeout(() => {
            const el = document.getElementById('main-content');
            if (el) MathJax.typesetPromise([el]).catch(err => console.error('MathJax Error:', err));
        }, 100);
    }
}

function renderComplexLayout() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const totalPages = Math.ceil(complexProblems.length / CMP_PER_PAGE);
    
    if (!document.getElementById('cmp-styles-v8')) {
        const style = document.createElement('style');
        style.id = 'cmp-styles-v8';
        style.textContent = `
            /* الحاوية */            .cmp-wrap { max-width: 850px; margin: 0 auto; padding: 10px; }
            
            /* الهيدر - بسيط وأنيق */
            .cmp-hdr {
                background: var(--card-bg);
                border: 2px solid var(--border-color);
                border-radius: 10px;
                padding: 15px 20px;
                margin-bottom: 15px;
                display: flex;
                justify-content: space-around;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
            }
            .cmp-stat {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.95rem;
                color: var(--text-primary);
            }
            .cmp-stat strong {
                color: var(--accent-color);
                font-size: 1.1rem;
                font-weight: 700;
            }
            
            /* العنوان الرئيسي */
            .cmp-title {
                text-align: center;
                font-size: 1.3rem;
                font-weight: 700;
                color: var(--accent-color);
                margin: 10px 0 20px 0;
                padding: 10px;
                border-bottom: 2px solid var(--border-color);
            }
            
            /* بطاقة المسألة */
            .cmp-box {
                background: var(--card-bg);
                border: none;
                border-radius: 10px;
                padding: 0;
                margin-bottom: 15px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                position: relative;
                overflow: hidden;
            }            
            /* شريط المسألة (الشارة + التلميح) */
            .cmp-bar {
                background: var(--bg-soft);
                border-bottom: 2px solid var(--border-color);
                padding: 10px 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .cmp-num {
                color: var(--accent-color);
                font-weight: 700;
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .cmp-num::before,
            .cmp-num::after {
                content: '';
                flex: 1;
                height: 1px;
                background: var(--border-color);
                margin: 0 10px;
            }
            .cmp-hb {
                width: 32px;
                height: 32px;
                background: transparent;
                border: 2px solid var(--accent-color);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            .cmp-hb:hover { background: var(--accent-color); color: #fff; }
            .cmp-hb.done { background: var(--difficulty-easy); border-color: var(--difficulty-easy); color: #fff; }
            
            /* نص المسألة */
            .cmp-q {
                padding: 15px;
                font-size: 1.1rem;
                line-height: 1.7;
                color: var(--text-primary);
            }            
            /* منطقة الإجابة */
            .cmp-ans {
                width: 100%;
                min-height: 70px;
                padding: 12px 15px;
                border: none;
                border-top: 2px solid var(--border-color);
                background: var(--bg-primary);
                color: var(--text-primary);
                font-family: 'Cairo', sans-serif;
                font-size: 1rem;
                resize: vertical;
                box-sizing: border-box;
            }
            .cmp-ans:focus { outline: none; background: var(--bg-soft); }
            .cmp-ans.done { background: rgba(46,204,113,0.08); color: var(--difficulty-easy); }
            
            /* التغذية الراجعة */
            .cmp-fb { padding: 10px 15px; text-align: center; font-weight: 600; }
            .cmp-ok { color: var(--difficulty-easy); background: rgba(46,204,113,0.08); }
            .cmp-err { color: var(--difficulty-hard); background: rgba(231,76,60,0.08); }
            
            /* التلميح */
            .cmp-hint {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
                background: var(--bg-soft);
                border-top: 1px dashed var(--border-color);
            }
            .cmp-hint.show { max-height: 400px; padding: 15px; }
            
            /* أزرار التحكم */
            .cmp-ctrl {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 12px;
                margin: 20px 0;
                flex-wrap: wrap;
            }
            .cmp-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 20px;
                font-weight: 600;
                cursor: pointer;
                font-family: 'Cairo', sans-serif;
                font-size: 0.9rem;                transition: all 0.2s;
            }
            .cmp-btn-nav {
                background: var(--accent-color);
                color: #fff;
                min-width: 70px;
            }
            .cmp-btn-nav:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
            .cmp-btn-nav:disabled { opacity: 0.3; cursor: not-allowed; }
            .cmp-btn-rst {
                background: #f39c12;
                color: #fff;
            }
            .cmp-btn-rst:hover { background: #e67e22; }
            
            /* زر التحقق */
            .cmp-vrf {
                background: var(--accent-color);
                color: #fff;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                margin: 15px 0;
                width: 100%;
                max-width: 350px;
            }
            .cmp-vrf:hover { background: var(--accent-hover); }
            
            /* الترقيم */
            .cmp-pg {
                display: flex;
                justify-content: center;
                gap: 6px;
                margin: 15px 0;
                flex-wrap: wrap;
            }
            
            /* العودة */
            .cmp-home {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                color: var(--text-muted);
                text-decoration: none;
                padding: 8px 16px;
                margin-top: 10px;
            }            .cmp-home:hover { color: var(--accent-color); }
            
            /* للجوال */
            @media (max-width: 600px) {
                .cmp-wrap { padding: 5px; }
                .cmp-hdr { padding: 12px 15px; }
                .cmp-stat { font-size: 0.85rem; }
                .cmp-stat strong { font-size: 1rem; }
                .cmp-title { font-size: 1.1rem; margin: 8px 0 15px 0; }
                .cmp-q { padding: 12px; font-size: 1rem; }
                .cmp-ans { min-height: 60px; font-size: 0.95rem; }
                .cmp-ctrl { gap: 8px; }
                .cmp-btn { padding: 7px 12px; font-size: 0.85rem; }
                .cmp-btn-nav { min-width: 60px; }
                .cmp-vrf { padding: 10px 20px; font-size: 0.95rem; }
            }
        `;
        document.head.appendChild(style);
    }
    
    mainContent.innerHTML = `
    <div class="cmp-wrap">
        <div class="cmp-hdr">
            <div class="cmp-stat">✅ المنجز: <strong id="cmp-c">0</strong>/${complexProblems.length}</div>
            <div class="cmp-stat">🏆 النقاط: <strong id="cmp-p">0</strong></div>
            <div class="cmp-stat">⭐ الأوسمة: <strong id="cmp-s">0</strong></div>
        </div>
        
        <div class="cmp-title">🧪 المختبر الرياضي (المعقد)</div>
        
        <div id="cmp-list"></div>
        
        <div class="cmp-ctrl">
            <button class="cmp-btn cmp-btn-nav" onclick="chPg(-1);return false" ${currentComplexPage===1?'disabled':''}>◀ السابق</button>
            <button class="cmp-btn cmp-btn-rst" onclick="rstPg()">🔄 إعادة</button>
            <button class="cmp-btn cmp-btn-nav" onclick="chPg(1);return false" ${currentComplexPage===totalPages?'disabled':''}>التالي ▶</button>
        </div>
        
        <div class="cmp-pg" id="cmp-pg"></div>
        
        <button class="cmp-vrf" onclick="chkAll()">🔍 تحليل الإجابات</button>
        
        <div style="text-align:center"><a href="#" class="cmp-home" onclick="loadHomePage();return false">🏠 الرئيسية</a></div>
    </div>`;
    
    updStats();
    showProblems(currentComplexPage);
}

function showProblems(page) {    currentComplexPage = page;
    const list = document.getElementById('cmp-list');
    if (!list) return;
    
    const start = (page - 1) * CMP_PER_PAGE;
    const end = Math.min(start + CMP_PER_PAGE, complexProblems.length);
    const items = complexProblems.slice(start, end);

    list.innerHTML = items.map((prob, i) => {
        const idx = start + i;
        const ans = userComplexAnswers[idx] || "";
        const done = ans !== "";
        const hintDone = purchasedHints[idx] === true;
        
        return `
        <div class="cmp-box">
            <div class="cmp-bar">
                <div class="cmp-num">مسألة ${idx + 1}</div>
                <div class="cmp-hb ${hintDone?'done':''}" onclick="tglHint(${idx});return false" title="${hintDone?'عرض التلميح':'شراء (15 نقطة)'}">
                    ${hintDone?'🔓':'💡'}
                </div>
            </div>
            <div class="cmp-q">${prob.question}</div>
            <textarea class="cmp-ans ${done?'done':''}" id="cmp-a${idx}" 
                placeholder="اكتب إجابتك... (Shift+Enter لسطر جديد)"
                ${done?'disabled':''} onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();chkOne(${idx});}">${ans}</textarea>
            <div class="cmp-fb" id="cmp-f${idx}"></div>
            <div class="cmp-hint ${hintDone?'show':''}" id="cmp-h${idx}">
                <strong>💡 التلميح:</strong><br>${prob.hint||prob.explanation||'فكر جيداً في المسألة'}
            </div>
        </div>`;
    }).join('');
    
    renderPagination();
    renderMath();
    window.scrollTo({top:0,behavior:'smooth'});
}

function tglHint(idx) {
    if (purchasedHints[idx]) {
        document.getElementById(`cmp-h${idx}`)?.classList.toggle('show');
        return;
    }
    const pts = parseInt(localStorage.getItem(STORAGE_KEYS.POINTS)||"0");
    if (pts < HINT_COST) {
        if (window.GameCore?.toast) GameCore.toast(`❌ تحتاج ${HINT_COST} نقطة`, 'error');
        else alert(`⚠️ تحتاج ${HINT_COST} نقطة`);
        return;
    }
    const buy = () => {        localStorage.setItem(STORAGE_KEYS.POINTS, String(pts - HINT_COST));
        purchasedHints[idx] = true;
        saveComplexProgress();
        document.getElementById(`cmp-h${idx}`)?.classList.add('show');
        const btn = document.querySelector(`.cmp-hb[onclick*="tglHint(${idx})"]`);
        if (btn) { btn.classList.add('done'); btn.innerHTML = '🔓'; }
        updStats();
        if (window.GameCore?.toast) GameCore.toast('✅ تم الشراء', 'success');
    };
    if (window.GameCore?.confirmAction) GameCore.confirmAction('شراء تلميح', `بـ ${HINT_COST} نقطة؟`, buy, ()=>{});
    else if (confirm(`💡 شراء بـ ${HINT_COST} نقطة؟`)) buy();
}

function rstPg() {
    const start = (currentComplexPage - 1) * CMP_PER_PAGE;
    const end = Math.min(start + CMP_PER_PAGE, complexProblems.length);
    const doRst = () => {
        let cnt = 0;
        for (let i=start; i<end; i++) {
            if (userComplexAnswers[i]) { userComplexAnswers[i]=""; cnt++; }
            const inp = document.getElementById(`cmp-a${i}`);
            const fb = document.getElementById(`cmp-f${i}`);
            if (inp) { inp.value=""; inp.disabled=false; inp.classList.remove('done'); }
            if (fb) fb.innerHTML = "";
        }
        if (cnt) { saveComplexProgress(); updStats(); }
        if (window.GameCore?.toast) GameCore.toast(cnt?`🔄 تم المسح (${cnt})`:'📝 فارغ', 'info');
    };
    if (window.GameCore?.confirmAction) GameCore.confirmAction('إعادة', 'مسح الإجابات؟', doRst, ()=>{});
    else if (confirm('⚠️ مسح الإجابات؟')) doRst();
}

function chkOne(idx) {
    const inp = document.getElementById(`cmp-a${idx}`);
    const fb = document.getElementById(`cmp-f${idx}`);
    if (!inp || !fb) return;
    const val = inp.value.trim();
    if (!val) { fb.innerHTML=""; return; }
    if (inp.disabled) return;
    
    const correct = complexProblems[idx].correct_answer || complexProblems[idx].answer;
    if (isAnswerCorrect(val, correct)) {
        if (!userComplexAnswers[idx]) {
            const cur = parseInt(localStorage.getItem(STORAGE_KEYS.POINTS)||"0");
            localStorage.setItem(STORAGE_KEYS.POINTS, String(cur + POINTS_PER_CORRECT));
            window.checkAndUnlockAchievements?.();
        }
        userComplexAnswers[idx] = val;
        inp.disabled = true; inp.classList.add('done');
        fb.innerHTML = `<span class="cmp-ok">✅ صحيح! +${POINTS_PER_CORRECT}</span>`;        saveComplexProgress(); updStats();
        if (window.GameCore?.toast) GameCore.toast(`🎯 +${POINTS_PER_CORRECT}`, 'success');
    } else {
        fb.innerHTML = `<span class="cmp-err">❌ خطأ</span>`;
    }
}

function chkAll() {
    const start = (currentComplexPage - 1) * CMP_PER_PAGE;
    const end = Math.min(start + CMP_PER_PAGE, complexProblems.length);
    let ok=0, pts=0;
    
    for (let i=start; i<end; i++) {
        const inp = document.getElementById(`cmp-a${i}`);
        const fb = document.getElementById(`cmp-f${i}`);
        if (!inp || inp.disabled) continue;
        const val = inp.value.trim();
        if (!val) { fb.innerHTML=""; continue; }
        
        const correct = complexProblems[i].correct_answer || complexProblems[i].answer;
        if (isAnswerCorrect(val, correct)) {
            if (!userComplexAnswers[i]) { ok++; pts+=POINTS_PER_CORRECT;
                const cur = parseInt(localStorage.getItem(STORAGE_KEYS.POINTS)||"0");
                localStorage.setItem(STORAGE_KEYS.POINTS, String(cur + POINTS_PER_CORRECT));
            }
            userComplexAnswers[i] = val; inp.disabled=true; inp.classList.add('done');
            fb.innerHTML = `<span class="cmp-ok">✅ صحيح</span>`;
        } else fb.innerHTML = `<span class="cmp-err">❌</span>`;
    }
    
    if (ok) {
        saveComplexProgress(); updStats();
        window.checkAndUnlockAchievements?.();
        if (window.GameCore?.toast) GameCore.toast(`🎉 ${ok} صحيحة (+${pts})`, 'success');
    } else if (window.GameCore?.toast) GameCore.toast('📝 لا جديد', 'info');
}

function updStats() {
    if (!Array.isArray(userComplexAnswers)) return;
    const done = userComplexAnswers.filter(a=>a&&a.trim()!=="").length;
    const pts = localStorage.getItem(STORAGE_KEYS.POINTS)||"0";
    const stars = Math.floor(done/5);
    const c=document.getElementById('cmp-c'), p=document.getElementById('cmp-p'), s=document.getElementById('cmp-s');
    if(c) c.textContent=String(done);
    if(p) p.textContent=String(pts);
    if(s) s.textContent=String(stars);
}

/**
 * 🔢 بناء أزرار الترقيم - النسخة المصححة والموثوقة
 */
function renderPagination() {
    const total = Math.ceil(complexProblems.length / CMP_PER_PAGE);
    const container = document.getElementById('cmp-pg');
    
    // إذا لم يكن هناك حاوية أو صفحة واحدة، اخفِ الترقيم
    if (!container || total <= 1) {
        if (container) container.innerHTML = '';
        return;
    }
    
    // ✅ خوارزمية الترقيم الذكي البسيطة
    let pages = [];
    
    if (total <= 5) {
        // إذا كانت الصفحات 5 أو أقل، اعرض الكل
        for (let i = 1; i <= total; i++) pages.push(i);
    } else {
        // إذا كانت أكثر من 5، نستخدم النقاط
        if (currentComplexPage <= 3) {
            // في البداية: 1 2 3 ... الأخير
            pages = [1, 2, 3, '...', total];
        } else if (currentComplexPage >= total - 2) {
            // في النهاية: 1 ... الأخير-2 الأخير-1 الأخير
            pages = [1, '...', total-2, total-1, total];
        } else {
            // في الوسط: 1 ... الحالي-1 الحالي الحالي+1 ... الأخير
            pages = [1, '...', currentComplexPage-1, currentComplexPage, currentComplexPage+1, '...', total];
        }
    }
    
    // ✅ بناء الـ HTML
    container.innerHTML = pages.map(item => {
        // حالة النقاط (...)
        if (item === '...') {
            return `<span style="color:var(--text-muted); padding:0 5px; display:flex; align-items:center; font-size:1.2rem;">…</span>`;
        }
        
        // حالة الأرقام
        const n = Number(item);
        const isActive = n === currentComplexPage;
        
        return `
          <button class="cmp-btn ${isActive ? 'cmp-active' : ''}" 
                  style="background:${isActive ? 'var(--accent-color)' : 'var(--card-bg)'};
                         color:${isActive ? '#fff' : 'var(--text-primary)'};
                         border:1px solid var(--border-color);
                         padding:5px 12px; min-width:35px; border-radius:18px; font-weight:600;" 
                  onclick="showProblems(${n}); return false;">
            ${n}
          </button>`;
    }).join('');
}

function chPg(dir) {
    const total = Math.ceil(complexProblems.length / CMP_PER_PAGE);
    const np = currentComplexPage + dir;
    if (np < 1 || np > total) return;
    showProblems(np);
}

window.chPg = chPg;
window.rstPg = rstPg;
window.chkAll = chkAll;
window.chkOne = chkOne;
window.tglHint = tglHint;

window.cleanupComplexLevel = () => { complexProblems = []; };
window.complexLevel = { resetPage:rstPg, checkAnswer:chkOne, checkAll:chkAll, buyHint:tglHint };

console.log('✅ Complex v8.0 loaded');