/**
 * المستوى المبتدئ - النسخة الموحدة (التصميم المحدث)
 */

let beginnerProblems = [];
let userBeginnerAnswers = [];
let currentBeginnerPage = 1;
const BEGINNER_PER_PAGE = 10;

let beginnerStats = {
    points: parseInt(localStorage.getItem('math_user_points') || "0"),
    completedTotal: parseInt(localStorage.getItem('math_beginner_completed') || "0"),
    freeHints: parseInt(localStorage.getItem('math_beg_free_hints') || "5")
};

window.loadBeginnerPage = async function() {
    window.currentLevel = 'beginner';
    try {
        const res = await fetch('data/levels/beginner.json');
        if (!res.ok) throw new Error("File not found");
        const data = await res.json();
        
        // تنظيف النصوص: حذف (?) وإبقاء (=) واحدة
        beginnerProblems = data.problems.map(p => {
            let cleanQ = p.question.replace(/\?/g, ''); 
            cleanQ = cleanQ.split('=')[0].trim(); 
            p.question = cleanQ + " ="; 
            return p;
        });

        if (userBeginnerAnswers.length === 0) {
            const saved = localStorage.getItem('math_beg_answers');
            userBeginnerAnswers = saved ? JSON.parse(saved) : new Array(beginnerProblems.length).fill(null).map(() => ({
                value: "", status: "pending", attempts: 0
            }));
        }
        renderBeginnerUI();
    } catch (err) {
        console.error('Error:', err);
    }
};

// نظام التنبيه العائم (Toast) الموحد
function showToast(message, type = "info") {
    const existing = document.querySelector('.toast-container');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-container';
    toast.style = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: ${type === 'error' ? '#e74c3c' : '#2ecc71'};
        color: white; padding: 12px 25px; border-radius: 30px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 9999;
        font-family: 'Cairo', sans-serif; direction: rtl;
        animation: fadeInOut 3s forwards;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);

    if (!document.getElementById('toast-animation-style')) {
        const style = document.createElement('style');
        style.id = 'toast-animation-style';
        style.innerHTML = `
            @keyframes fadeInOut {
                0% { opacity: 0; top: 0; }
                15% { opacity: 1; top: 20px; }
                85% { opacity: 1; top: 20px; }
                100% { opacity: 0; top: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    setTimeout(() => toast.remove(), 3000);
}

window.handleBegHint = function(idx, hintText) {
    if (beginnerStats.freeHints > 0) {
        beginnerStats.freeHints--;
        showToast(`💡 تلميح: ${hintText}`);
    } else if (beginnerStats.points >= 15) {
        beginnerStats.points -= 15;
        showToast(`💰 تلميح مدفوع (-15 نقطة): ${hintText}`);
    } else {
        showToast('⚠️ لا تملك نقاطاً كافية (تحتاج 15 نقطة)', 'error');
    }
    saveBeginnerProgress();
    renderBeginnerUI();
};

window.storeBegVal = (idx, val) => {
    userBeginnerAnswers[idx].value = val.trim();
    userBeginnerAnswers[idx].status = 'pending';
};

window.verifyBegBatch = () => {
    const start = (currentBeginnerPage - 1) * BEGINNER_PER_PAGE;
    let correctCount = 0;
    
    for (let i = 0; i < BEGINNER_PER_PAGE; i++) {
        const idx = start + i;
        if (!beginnerProblems[idx]) break;

        const p = beginnerProblems[idx];
        const uAns = userBeginnerAnswers[idx].value;
        if (uAns === String(p.answer).trim()) {
            if (userBeginnerAnswers[idx].status !== 'correct') {
                beginnerStats.points += 5;
                beginnerStats.completedTotal++;
                correctCount++;
                if (beginnerStats.completedTotal % 5 === 0) beginnerStats.freeHints++;
            }
            userBeginnerAnswers[idx].status = 'correct';
        } else if (uAns !== "") {
            userBeginnerAnswers[idx].status = 'incorrect';
        }
    }
    
    if (correctCount > 0) showToast(`أحسنت! ربحت ${correctCount * 5} نقطة`);
    saveBeginnerProgress();
    checkAndUnlockAchievements();
    renderBeginnerUI();
};

function saveBeginnerProgress() {
    localStorage.setItem('math_user_points', beginnerStats.points);
    localStorage.setItem('math_beginner_completed', beginnerStats.completedTotal);
    localStorage.setItem('math_beg_free_hints', beginnerStats.freeHints);
    localStorage.setItem('math_beg_answers', JSON.stringify(userBeginnerAnswers));
}

function renderBeginnerUI() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const start = (currentBeginnerPage - 1) * BEGINNER_PER_PAGE;
    const batch = beginnerProblems.slice(start, start + BEGINNER_PER_PAGE);
    const isDark = document.body.classList.contains('dark-theme') || document.body.getAttribute('data-theme') === 'dark';

    mainContent.innerHTML = `
    <style>
        :root {
            --bg-card: ${isDark ? '#2c3e50' : '#ffffff'};
            --text-main: ${isDark ? '#ecf0f1' : '#2c3e50'};
            --border-color: ${isDark ? '#445a70' : '#eee'};
            --input-bg: ${isDark ? '#1a252f' : '#fff'};
        }
        .level-wrapper { direction: rtl; font-family: 'Cairo', sans-serif; max-width: 850px; margin: auto; padding: 20px; color: var(--text-main); }
        .row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        
        .p-card {
            background: var(--bg-card); padding: 25px 20px 20px;
            border: 1px solid var(--border-color); border-radius: 15px;
            margin-bottom: 20px; position: relative;
        }

        .problem-number-tag {
            position: absolute; top: -12px; right: 20px;
            background: #3498db; color: white; padding: 2px 12px;
            font-size: 0.8rem; font-weight: bold; border-radius: 5px;
        }

        .hint-float {
            position: absolute; top: 10px; left: 10px;
            width: 32px; height: 32px; background: #f39c12; color: white;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            cursor: pointer; font-size: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .problem-layout { display: flex; flex-wrap: wrap; align-items: center; gap: 15px; }
        .q-text { font-size: 1.25rem; flex: 10; min-width: 250px; }

        .math-input {
            height: 48px; border: 2px solid #ddd; border-radius: 10px;
            text-align: center; font-size: 1.3rem; background: var(--input-bg);
            color: var(--text-main); flex: 1; min-width: 120px; outline: none;
        }

        .correct { border-color: #27ae60 !important; background: #e8f5e9 !important; color: #155724 !important; }
        .incorrect { border-color: #e74c3c !important; background: #fdf2f2 !important; color: #721c24 !important; }

        .btn-verify-full { width: 100%; padding: 15px; background: #3498db; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; margin-top: 10px; font-size: 1.1rem; }
        .row-nav-btns { display: flex; justify-content: center; gap: 20px; margin-top: 25px; }
        .nav-arrow { padding: 10px 25px; background: var(--bg-card); border: 2px solid #3498db; color: #3498db; border-radius: 8px; cursor: pointer; font-weight: bold; }
        .nav-arrow:disabled { opacity: 0.5; }
    </style>

    <div class="level-wrapper">
        <div class="row-header">
            <div>
                <h2 style="margin:0; color:#3498db;">المستوى المبتدئ</h2>
                <div style="font-size:0.9rem; margin-top:5px;">🏆 النقاط: ${beginnerStats.points} | 💡 التلميحات المجانية: ${beginnerStats.freeHints}</div>
            </div>
            <button class="nav-arrow" onclick="loadHomePage()">الرئيسية</button>
        </div>

        <div class="problems-list">
            ${batch.map((p, i) => {
                const idx = start + i;
                const ans = userBeginnerAnswers[idx];
                const cls = ans.status === 'correct' ? 'correct' : (ans.status === 'incorrect' ? 'incorrect' : '');
                return `
                    <div class="p-card">
                        <div class="problem-number-tag">تمرين ${p.id}</div>
                        <div class="hint-float" onclick="handleBegHint(${idx}, '${p.hint}')">💡</div>
                        <div class="problem-layout">
                            <div class="q-text">${p.question}</div>
                            <input type="text" class="math-input ${cls}" 
                                   value="${ans.value}" oninput="storeBegVal(${idx}, this.value)" 
                                   ${ans.status === 'correct' ? 'disabled' : ''} placeholder="؟">
                        </div>
                    </div>
                `;
            }).join('')}
        </div>

        <button class="btn-verify-full" onclick="verifyBegBatch()">التحقق من الإجابات</button>

        <div class="row-nav-btns">
            <button class="nav-arrow" onclick="changeBegPage(${currentBeginnerPage - 1})" ${currentBeginnerPage === 1 ? 'disabled' : ''}>السابق</button>
            <span style="align-self:center; font-weight:bold;">صفحة ${currentBeginnerPage}</span>
            <button class="nav-arrow" onclick="changeBegPage(${currentBeginnerPage + 1})" ${ (currentBeginnerPage * BEGINNER_PER_PAGE) >= beginnerProblems.length ? 'disabled' : ''}>التالي</button>
        </div>
    </div>`;
}

window.changeBegPage = (p) => { 
    currentBeginnerPage = p; 
    renderBeginnerUI(); 
    window.scrollTo({top: 0, behavior: 'smooth'}); 
};
