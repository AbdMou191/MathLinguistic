// scripts/levels/intermediate.js

let intermediateProblems = [];
let userIntermediateAnswers = [];
let currentIntermediatePage = 1;
const INTER_PER_PAGE = 10; 

// نظام إحصائيات ونقاط محسن
let intStats = {
    points: parseInt(localStorage.getItem('math_user_points') || "0"),
    completedTotal: parseInt(localStorage.getItem('math_int_completed') || "0"),
    // يتم حساب التلميحات المجانية بناءً على: 5 تلميحات لكل 25 مسألة
    freeHints: parseInt(localStorage.getItem('math_int_free_hints') || "5")
};

window.loadIntermediatePage = async function() {
    window.currentLevel = 'intermediate';
    try {
        const res = await fetch('data/levels/intermediate.json');
        if (!res.ok) throw new Error("File not found");
        const data = await res.json();
        
        // معالجة البيانات: حذف (?) والإبقاء على (=) واحدة فقط
        intermediateProblems = data.problems.map(p => {
            let cleanQ = p.question.replace(/\? /g, ''); // حذف علامات الاستفاهم
            cleanQ = cleanQ.split('=')[0].trim(); // أخذ ما قبل علامة اليساوي إن وجدت
            p.question = cleanQ + " ="; // إضافة علامة يساوي واحدة فقط
            return p;
        });

        if (userIntermediateAnswers.length === 0) {
            const saved = localStorage.getItem('math_int_answers');
            userIntermediateAnswers = saved ? JSON.parse(saved) : new Array(intermediateProblems.length).fill(null).map(() => ({
                value: "", status: "pending", attempts: 0
            }));
        }
        renderIntermediateUI();
    } catch (err) {
        console.error('Error:', err);
    }
};

// دالة إظهار التلميح العائم (بديلة لـ alert)
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

    // إضافة الأنيميشن برمجياً
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeInOut {
            0% { opacity: 0; top: 0; }
            15% { opacity: 1; top: 20px; }
            85% { opacity: 1; top: 20px; }
            100% { opacity: 0; top: 0; }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => toast.remove(), 3000);
}

window.handleIntHint = function(idx, hintText) {
    if (intStats.freeHints > 0) {
        intStats.freeHints--;
        showToast(`💡 تلميح: ${hintText}`);
    } else if (intStats.points >= 15) {
        intStats.points -= 15;
        showToast(`💰 تلميح مدفوع (-15 نقطة): ${hintText}`);
    } else {
        showToast('⚠️ لا تملك نقاطاً كافية (تحتاج 15 نقطة)', 'error');
    }
    saveIntermediateProgress();
    renderIntermediateUI();
};

function renderIntermediateUI() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const start = (currentIntermediatePage - 1) * INTER_PER_PAGE;
    const pageProblems = intermediateProblems.slice(start, start + INTER_PER_PAGE);
    
    // دعم الثيم المباشر
    const isDark = document.body.classList.contains('dark-theme') || document.body.getAttribute('data-theme') === 'dark';

    mainContent.innerHTML = `
    <style>
        :root {}
        .level-wrapper { : rtl; font-family: 'Cairo', sans-serif; max-width: 850px; margin: auto; padding: 20px; color: var(--text-main); }
        .row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 3px solid #5dade2; padding-bottom: 10px; }
        
        .row-item, .row-item-long {
            background: var(--bg-card); padding: 20px;
            border: 1px solid var(--border-color); border-radius: 15px;
            margin-bottom: 20px; position: relative; display: flex; 
            justify-content: space-between; align-items: center; gap: 15px;
            transition: all 0.3s ease;
        }

        .row-item-long { display: block; padding-top: 30px; }

        .problem-number-tag {
            position: absolute; top: -12px; right: 20px;
            background: #5dade2; color: white; padding: 2px 12px;
            font-size: 0.8rem; font-weight: bold; border-radius: 5px;
        }

        .hint-float {
            position: absolute; top: 10px; left: 10px;
            width: 32px; height: 32px; background: #f39c12;
            color: white; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; font-size: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .problem-statement { font-size: 1.2rem; flex: 1; }
        .problem-statement-long { font-size: 1.15rem; margin-bottom: 15px; line-height: 1.6; }

        .input-ans, .input-ans-full {
            width: 140px; height: 45px; text-align: center; font-size: 1.2rem;
            border: 2px solid #ddd; border-radius: 10px; background: var(--input-bg);
            color: var(--text-main); outline: none;
        }
        .input-ans-full { width: 100%; }
        
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
                <h2 style="margin:0; color:#3498db;">المستوى المتوسط</h2>
                <div style="font-size:0.9rem; margin-top:5px;">🏆 النقاط: ${intStats.points} | 💡 التلميحات المجانية: ${intStats.freeHints}</div>
            </div>
            <button class="nav-arrow" onclick="loadHomePage()">الرئيسية</button>
        </div>

        <div class="problems-list">
            ${pageProblems.map((p, i) => {
                const idx = start + i;
                const ans = userIntermediateAnswers[idx];
                const cls = ans.status === 'correct' ? 'correct' : (ans.status === 'incorrect' ? 'incorrect' : '');
                const isLong = p.question.length > 30;

                return `
                    <div class="${isLong ? 'row-item-long' : 'row-item'}">
                        <div class="problem-number-tag">تمرين ${p.id}</div>
                        <div class="hint-float" onclick="handleIntHint(${idx}, '${p.hint}')">💡</div>
                        <div class="${isLong ? 'problem-statement-long' : 'problem-statement'}">${p.question}</div>
                        <input type="text" class="${isLong ? 'input-ans-full' : 'input-ans'} ${cls}" 
                               value="${ans.value}" 
                               oninput="storeIntVal(${idx}, this.value)" 
                               ${ans.status === 'correct' ? 'disabled' : ''}>
                    </div>
                `;
            }).join('')}
        </div>

        <button class="btn-verify-full" onclick="verifyIntBatch()">التحقق من الإجابات</button>

        <div class="row-nav-btns">
            <button class="nav-arrow" onclick="changeIntPage(${currentIntermediatePage - 1})" ${currentIntermediatePage === 1 ? 'disabled' : ''}>السابق</button>
            <span style="align-self:center; font-weight:bold;">صفحة ${currentIntermediatePage}</span>
            <button class="nav-arrow" onclick="changeIntPage(${currentIntermediatePage + 1})" ${ (currentIntermediatePage * INTER_PER_PAGE) >= intermediateProblems.length ? 'disabled' : ''}>التالي</button>
        </div>
    </div>`;
}

window.storeIntVal = (idx, val) => {
    userIntermediateAnswers[idx].value = val.trim();
    userIntermediateAnswers[idx].status = 'pending';
};

window.verifyIntBatch = () => {
    const start = (currentIntermediatePage - 1) * INTER_PER_PAGE;
    let correctCount = 0;
    
    for (let i = 0; i < INTER_PER_PAGE; i++) {
        const idx = start + i;
        if (!intermediateProblems[idx]) break;

        const p = intermediateProblems[idx];
        const uAns = userIntermediateAnswers[idx].value;
        const correct = String(p.answer).trim();
        
        if (uAns === correct) {
            if (userIntermediateAnswers[idx].status !== 'correct') {
                intStats.points += 5;
                intStats.completedTotal++;
                correctCount++;
                
                // إضافة تلميحات مجانية: 5 تلميحات لكل 25 حل صحيح (أي 1 تلميح لكل 5 حلول)
                if (intStats.completedTotal % 5 === 0) {
                    intStats.freeHints += 1;
                }
            }
            userIntermediateAnswers[idx].status = 'correct';
        } else if (uAns !== "") {
            userIntermediateAnswers[idx].status = 'incorrect';
        }
    }
    
    if (correctCount > 0) showToast(`أحسنت! حصلت على ${correctCount * 5} نقطة`);
    saveIntermediateProgress();
    checkAndUnlockAchievements();
    renderIntermediateUI();
};

function saveIntermediateProgress() {
    localStorage.setItem('math_user_points', intStats.points);
    localStorage.setItem('math_int_completed', intStats.completedTotal);
    localStorage.setItem('math_int_free_hints', intStats.freeHints);
    localStorage.setItem('math_int_answers', JSON.stringify(userIntermediateAnswers));
}

window.changeIntPage = (p) => { 
    currentIntermediatePage = p; 
    renderIntermediateUI(); 
    window.scrollTo({top: 0, behavior: 'smooth'}); 
};
