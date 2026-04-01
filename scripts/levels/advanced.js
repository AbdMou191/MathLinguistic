/**
 * 🧩 المستوى المتقدم (Advanced) - MathLinguistic v8.1
 * ✅ متغيرات فريدة ببادئة adv_ لمنع التعارض
 * ✅ تصميم موحد مع complex.js - معزول ببادئة adv-
 * ✅ الهيدر: النقاط + الأوسمة + المنجز فقط
 * ✅ شارة "مسألة #x" مع خط أفقي وأيقونة التلميح على الإطار
 * ✅ textarea محسّن: Shift+Enter لسطر جديد، Enter للتحقق
 * ✅ أزرار تنقل مضغوطة في سطر واحد
 * ✅ دعم LaTeX للإجابات الرياضية
 * ✅ توافق كامل مع main.js و GameCore
 */

// ✅ متغيرات فريدة ببادئة adv_ (لمنع التعارض مع ملفات أخرى)
let advProblems = [];
let advUserAnswers = [];
let advPurchasedHints = {};
let advCurrentPage = 1;
const ADV_PER_PAGE = 5;
const ADV_HINT_COST = 10;
const ADV_POINTS_PER_CORRECT = 10;

const ADV_STORAGE_KEYS = {
    ANSWERS: 'math_advanced_answers_v3',
    HINTS: 'math_advanced_hints_purchased',
    POINTS: 'math_user_points'
};

window.loadAdvancedPage = async function(problemData) {
    if (typeof cleanupCurrentPage === 'function') cleanupCurrentPage();
    
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `<div style="text-align:center;padding:50px;color:var(--text-secondary)">جارٍ التحميل... 🧩</div>`;

    try {
        if (problemData) {
            advProblems = problemData.problems || problemData;
        } else {
            const response = await fetch('data/levels/advanced.json');
            if (!response.ok) throw new Error("File not found");
            const data = await response.json();
            advProblems = data.problems || data;
        }

        const savedAnswers = localStorage.getItem(ADV_STORAGE_KEYS.ANSWERS);
        advUserAnswers = savedAnswers ? JSON.parse(savedAnswers) : [];
        if (advUserAnswers.length !== advProblems.length) {
            advUserAnswers = new Array(advProblems.length).fill("");
        }
        const savedHints = localStorage.getItem(ADV_STORAGE_KEYS.HINTS);
        advPurchasedHints = savedHints ? JSON.parse(savedHints) : {};

        renderAdvancedLayout();
        renderMath();
        
        if (typeof updatePageMeta === 'function') updatePageMeta('advanced');
        
    } catch (error) {
        console.error("❌ Advanced Level Error:", error);
        mainContent.innerHTML = `<div style="text-align:center;padding:40px"><h3 style="color:var(--difficulty-hard)">⚠️ تعذر التحميل</h3><button onclick="loadContent('home')" class="gc-btn gc-btn-primary" style="margin-top:20px">🏠 الرئيسية</button></div>`;
    }
};

function advIsAnswerCorrect(userVal, correctVal) {
    if (userVal == null || correctVal == null) return false;
    const u = String(userVal).trim().toLowerCase();
    const c = String(correctVal).trim().toLowerCase();
    const uNum = Number(u);
    const cNum = Number(c);
    if (!isNaN(uNum) && !isNaN(cNum) && u !== '' && c !== '') return uNum === cNum;
    return u === c;
}

function advSaveProgress() {
    try {
        localStorage.setItem(ADV_STORAGE_KEYS.ANSWERS, JSON.stringify(advUserAnswers));
        localStorage.setItem(ADV_STORAGE_KEYS.HINTS, JSON.stringify(advPurchasedHints));
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

function renderAdvancedLayout() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const totalPages = Math.ceil(advProblems.length / ADV_PER_PAGE);
    
    if (!document.getElementById('adv-styles-v8')) {
        const style = document.createElement('style');
        style.id = 'adv-styles-v8';        style.textContent = `
            .adv-wrap { max-width: 850px; margin: 0 auto; padding: 10px; }
            .adv-hdr {
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
            .adv-stat {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.95rem;
                color: var(--text-primary);
            }
            .adv-stat strong {
                color: var(--accent-color);
                font-size: 1.1rem;
                font-weight: 700;
            }
            .adv-title {
                text-align: center;
                font-size: 1.3rem;
                font-weight: 700;
                color: var(--accent-color);
                margin: 10px 0 20px 0;
                padding: 10px;
                border-bottom: 2px solid var(--border-color);
            }
            .adv-box {
                background: var(--card-bg);
                border: none;
                border-radius: 10px;
                padding: 0;
                margin-bottom: 15px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                position: relative;
                overflow: hidden;
            }
            .adv-bar {
                background: var(--bg-soft);
                border-bottom: 2px solid var(--border-color);
                padding: 10px 15px;
                display: flex;                justify-content: space-between;
                align-items: center;
            }
            .adv-num {
                color: var(--accent-color);
                font-weight: 700;
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .adv-num::before,
            .adv-num::after {
                content: '';
                flex: 1;
                height: 1px;
                background: var(--border-color);
                margin: 0 10px;
            }
            .adv-hb {
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
            .adv-hb:hover { background: var(--accent-color); color: #fff; }
            .adv-hb.done { background: var(--difficulty-easy); border-color: var(--difficulty-easy); color: #fff; }
            .adv-q {
                padding: 15px;
                font-size: 1.1rem;
                line-height: 1.7;
                color: var(--text-primary);
            }
            .adv-ans {
                width: 100%;
                min-height: 70px;
                padding: 12px 15px;
                border: none;
                border-top: 2px solid var(--border-color);
                background: var(--bg-primary);
                color: var(--text-primary);
                font-family: 'Cairo', sans-serif;                font-size: 1rem;
                resize: vertical;
                box-sizing: border-box;
            }
            .adv-ans:focus { outline: none; background: var(--bg-soft); }
            .adv-ans.done { background: rgba(46,204,113,0.08); color: var(--difficulty-easy); }
            .adv-fb { padding: 10px 15px; text-align: center; font-weight: 600; }
            .adv-ok { color: var(--difficulty-easy); background: rgba(46,204,113,0.08); }
            .adv-err { color: var(--difficulty-hard); background: rgba(231,76,60,0.08); }
            .adv-hint {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
                background: var(--bg-soft);
                border-top: 1px dashed var(--border-color);
            }
            .adv-hint.show { max-height: 400px; padding: 15px; }
            .adv-ctrl {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 12px;
                margin: 20px 0;
                flex-wrap: wrap;
            }
            .adv-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 20px;
                font-weight: 600;
                cursor: pointer;
                font-family: 'Cairo', sans-serif;
                font-size: 0.9rem;
                transition: all 0.2s;
            }
            .adv-btn-nav {
                background: var(--accent-color);
                color: #fff;
                min-width: 70px;
            }
            .adv-btn-nav:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
            .adv-btn-nav:disabled { opacity: 0.3; cursor: not-allowed; }
            .adv-btn-rst {
                background: #f39c12;
                color: #fff;
            }
            .adv-btn-rst:hover { background: #e67e22; }
            .adv-vrf {
                background: var(--accent-color);
                color: #fff;                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                margin: 15px 0;
                width: 100%;
                max-width: 350px;
            }
            .adv-vrf:hover { background: var(--accent-hover); }
            .adv-pg {
                display: flex;
                justify-content: center;
                gap: 6px;
                margin: 15px 0;
                flex-wrap: wrap;
            }
            .adv-home {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                color: var(--text-muted);
                text-decoration: none;
                padding: 8px 16px;
                margin-top: 10px;
            }
            .adv-home:hover { color: var(--accent-color); }
            @media (max-width: 600px) {
                .adv-wrap { padding: 5px; }
                .adv-hdr { padding: 12px 15px; }
                .adv-stat { font-size: 0.85rem; }
                .adv-stat strong { font-size: 1rem; }
                .adv-title { font-size: 1.1rem; margin: 8px 0 15px 0; }
                .adv-q { padding: 12px; font-size: 1rem; }
                .adv-ans { min-height: 60px; font-size: 0.95rem; }
                .adv-ctrl { gap: 8px; }
                .adv-btn { padding: 7px 12px; font-size: 0.85rem; }
                .adv-btn-nav { min-width: 60px; }
                .adv-vrf { padding: 10px 20px; font-size: 0.95rem; }
            }
        `;
        document.head.appendChild(style);
    }
    
    mainContent.innerHTML = `
    <div class="adv-wrap">
        <div class="adv-hdr">
            <div class="adv-stat">✅ المنجز: <strong id="adv-c">0</strong>/${advProblems.length}</div>
            <div class="adv-stat">🏆 النقاط: <strong id="adv-p">0</strong></div>            <div class="adv-stat">⭐ الأوسمة: <strong id="adv-s">0</strong></div>
        </div>
        
        <div class="adv-title">🧩 التحدي المتقدم</div>
        
        <div id="adv-list"></div>
        
        <div class="adv-ctrl">
            <button class="adv-btn adv-btn-nav" onclick="advChPg(-1);return false" ${advCurrentPage===1?'disabled':''}>◀ السابق</button>
            <button class="adv-btn adv-btn-rst" onclick="advRstPg()">🔄 إعادة</button>
            <button class="adv-btn adv-btn-nav" onclick="advChPg(1);return false" ${advCurrentPage===Math.ceil(advProblems.length/ADV_PER_PAGE)?'disabled':''}>التالي ▶</button>
        </div>
        
        <div class="adv-pg" id="adv-pg"></div>
        
        <button class="adv-vrf" onclick="advChkAll()">🔍 تحليل الإجابات</button>
        
        <div style="text-align:center"><a href="#" class="adv-home" onclick="loadHomePage();return false">🏠 الرئيسية</a></div>
    </div>`;
    
    advUpdStats();
    advShowProblems(advCurrentPage);
}

function advShowProblems(page) {
    advCurrentPage = page;
    const list = document.getElementById('adv-list');
    if (!list) return;
    
    const start = (page - 1) * ADV_PER_PAGE;
    const end = Math.min(start + ADV_PER_PAGE, advProblems.length);
    const items = advProblems.slice(start, end);

    list.innerHTML = items.map((prob, i) => {
        const idx = start + i;
        const ans = advUserAnswers[idx] || "";
        const done = ans !== "";
        const hintDone = advPurchasedHints[idx] === true;
        
        return `
        <div class="adv-box">
            <div class="adv-bar">
                <div class="adv-num">مسألة ${idx + 1}</div>
                <div class="adv-hb ${hintDone?'done':''}" onclick="advTglHint(${idx});return false" title="${hintDone?'عرض التلميح':'شراء (10 نقاط)'}">
                    ${hintDone?'🔓':'💡'}
                </div>
            </div>
            <div class="adv-q">${prob.question}</div>
            <textarea class="adv-ans ${done?'done':''}" id="adv-a${idx}" 
                placeholder="اكتب إجابتك... (Shift+Enter لسطر جديد)"                ${done?'disabled':''} onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();advChkOne(${idx});}">${ans}</textarea>
            <div class="adv-fb" id="adv-f${idx}"></div>
            <div class="adv-hint ${hintDone?'show':''}" id="adv-h${idx}">
                <strong>💡 التلميح:</strong><br>${prob.hint||prob.explanation||'فكر جيداً في المسألة'}
            </div>
        </div>`;
    }).join('');
    
    advRenderPagination();
    renderMath();
    window.scrollTo({top:0,behavior:'smooth'});
}

function advTglHint(idx) {
    if (advPurchasedHints[idx]) {
        document.getElementById(`adv-h${idx}`)?.classList.toggle('show');
        return;
    }
    const pts = parseInt(localStorage.getItem(ADV_STORAGE_KEYS.POINTS)||"0");
    if (pts < ADV_HINT_COST) {
        if (window.GameCore?.toast) GameCore.toast(`❌ تحتاج ${ADV_HINT_COST} نقطة`, 'error');
        else alert(`⚠️ تحتاج ${ADV_HINT_COST} نقطة`);
        return;
    }
    const buy = () => {
        localStorage.setItem(ADV_STORAGE_KEYS.POINTS, String(pts - ADV_HINT_COST));
        advPurchasedHints[idx] = true;
        advSaveProgress();
        document.getElementById(`adv-h${idx}`)?.classList.add('show');
        const btn = document.querySelector(`.adv-hb[onclick*="advTglHint(${idx})"]`);
        if (btn) { btn.classList.add('done'); btn.innerHTML = '🔓'; }
        advUpdStats();
        if (window.GameCore?.toast) GameCore.toast('✅ تم الشراء', 'success');
    };
    if (window.GameCore?.confirmAction) GameCore.confirmAction('شراء تلميح', `بـ ${ADV_HINT_COST} نقطة؟`, buy, ()=>{});
    else if (confirm(`💡 شراء بـ ${ADV_HINT_COST} نقطة؟`)) buy();
}

function advRstPg() {
    const start = (advCurrentPage - 1) * ADV_PER_PAGE;
    const end = Math.min(start + ADV_PER_PAGE, advProblems.length);
    const doRst = () => {
        let cnt = 0;
        for (let i=start; i<end; i++) {
            if (advUserAnswers[i]) { advUserAnswers[i]=""; cnt++; }
            const inp = document.getElementById(`adv-a${i}`);
            const fb = document.getElementById(`adv-f${i}`);
            if (inp) { inp.value=""; inp.disabled=false; inp.classList.remove('done'); }
            if (fb) fb.innerHTML = "";
        }        if (cnt) { advSaveProgress(); advUpdStats(); }
        if (window.GameCore?.toast) GameCore.toast(cnt?`🔄 تم المسح (${cnt})`:'📝 فارغ', 'info');
    };
    if (window.GameCore?.confirmAction) GameCore.confirmAction('إعادة', 'مسح الإجابات؟', doRst, ()=>{});
    else if (confirm('⚠️ مسح إجابات هذه الصفحة؟')) doRst();
}

function advChkOne(idx) {
    const inp = document.getElementById(`adv-a${idx}`);
    const fb = document.getElementById(`adv-f${idx}`);
    if (!inp || !fb) return;
    const val = inp.value.trim();
    if (!val) { fb.innerHTML=""; return; }
    if (inp.disabled) return;
    
    const correct = advProblems[idx].correct_answer || advProblems[idx].answer;
    if (advIsAnswerCorrect(val, correct)) {
        if (!advUserAnswers[idx]) {
            const cur = parseInt(localStorage.getItem(ADV_STORAGE_KEYS.POINTS)||"0");
            localStorage.setItem(ADV_STORAGE_KEYS.POINTS, String(cur + ADV_POINTS_PER_CORRECT));
            window.checkAndUnlockAchievements?.();
        }
        advUserAnswers[idx] = val;
        inp.disabled = true; inp.classList.add('done');
        fb.innerHTML = `<span class="adv-ok">✅ صحيح! +${ADV_POINTS_PER_CORRECT}</span>`;
        advSaveProgress(); advUpdStats();
        if (window.GameCore?.toast) GameCore.toast(`🎯 +${ADV_POINTS_PER_CORRECT}`, 'success');
    } else {
        fb.innerHTML = `<span class="adv-err">❌ خطأ</span>`;
    }
}

function advChkAll() {
    const start = (advCurrentPage - 1) * ADV_PER_PAGE;
    const end = Math.min(start + ADV_PER_PAGE, advProblems.length);
    let ok=0, pts=0;
    
    for (let i=start; i<end; i++) {
        const inp = document.getElementById(`adv-a${i}`);
        const fb = document.getElementById(`adv-f${i}`);
        if (!inp || inp.disabled) continue;
        const val = inp.value.trim();
        if (!val) { fb.innerHTML=""; continue; }
        
        const correct = advProblems[i].correct_answer || advProblems[i].answer;
        if (advIsAnswerCorrect(val, correct)) {
            if (!advUserAnswers[i]) { ok++; pts+=ADV_POINTS_PER_CORRECT;
                const cur = parseInt(localStorage.getItem(ADV_STORAGE_KEYS.POINTS)||"0");
                localStorage.setItem(ADV_STORAGE_KEYS.POINTS, String(cur + ADV_POINTS_PER_CORRECT));
            }            advUserAnswers[i] = val; inp.disabled=true; inp.classList.add('done');
            fb.innerHTML = `<span class="adv-ok">✅ صحيح</span>`;
        } else fb.innerHTML = `<span class="adv-err">❌</span>`;
    }
    
    if (ok) {
        advSaveProgress(); advUpdStats();
        window.checkAndUnlockAchievements?.();
        if (window.GameCore?.toast) GameCore.toast(`🎉 ${ok} صحيحة (+${pts})`, 'success');
    } else if (window.GameCore?.toast) GameCore.toast('📝 لا جديد', 'info');
}

function advUpdStats() {
    if (!Array.isArray(advUserAnswers)) return;
    const done = advUserAnswers.filter(a=>a&&a.trim()!=="").length;
    const pts = localStorage.getItem(ADV_STORAGE_KEYS.POINTS)||"0";
    const stars = Math.floor(done/10);
    const c=document.getElementById('adv-c'), p=document.getElementById('adv-p'), s=document.getElementById('adv-s');
    if(c) c.textContent=String(done);
    if(p) p.textContent=String(pts);
    if(s) s.textContent=String(stars);
}

function advRenderPagination() {
    const total = Math.ceil(advProblems.length / ADV_PER_PAGE);
    const container = document.getElementById('adv-pg');
    if (!container || total <= 1) { if(container) container.innerHTML=''; return; }
    
    let pages = [];
    if (total <= 5) {
        for (let i = 1; i <= total; i++) pages.push(i);
    } else {
        if (advCurrentPage <= 3) pages = [1, 2, 3, '...', total];
        else if (advCurrentPage >= total - 2) pages = [1, '...', total-2, total-1, total];
        else pages = [1, '...', advCurrentPage-1, advCurrentPage, advCurrentPage+1, '...', total];
    }
    
    container.innerHTML = pages.map(item => {
        if (item === '...' || typeof item !== 'number') return `<span style="color:var(--text-muted);padding:0 5px;font-size:1.2rem">…</span>`;
        const n = Number(item);
        const act = n === advCurrentPage ? 'active' : '';
        return `<button class="adv-btn ${act}" style="background:${act?'var(--accent-color)':'var(--card-bg)'};color:${act?'#fff':'var(--text-primary)'};border:1px solid var(--border-color);padding:5px 12px;min-width:35px;border-radius:18px;font-weight:600" onclick="advShowProblems(${n});return false">${n}</button>`;
    }).join('');
}

function advChPg(dir) {
    const total = Math.ceil(advProblems.length / ADV_PER_PAGE);
    const np = advCurrentPage + dir;
    if (np < 1 || np > total) return;
    advShowProblems(np);}

// ✅ دوال عامة للوصول من الخارج
window.advChPg = advChPg;
window.advRstPg = advRstPg;
window.advChkAll = advChkAll;
window.advChkOne = advChkOne;
window.advTglHint = advTglHint;

window.cleanupAdvancedLevel = () => { advProblems = []; };
window.advancedLevel = { resetPage:advRstPg, checkAnswer:advChkOne, checkAll:advChkAll, buyHint:advTglHint };

console.log('✅ Advanced v8.1 loaded - متغيرات فريدة - لا تعارض');