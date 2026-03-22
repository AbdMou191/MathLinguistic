/**
 * المستوى المبتدئ - النسخة الموحدة v2.1 (دعم المسائل النصية والحسابية)
 */
console.log('b')
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
    // ✅ 1. تحديث القسم الحالي لضمان عمل الميتا
    window.currentSection = 'beginner';
    
    window.currentLevel = 'beginner';
    
    try {
        const res = await fetch('data/levels/beginner.json');
        if (!res.ok) throw new Error("File not found");
        const data = await res.json();
        
        // 1. تنظيف ومعالجة المسائل
        beginnerProblems = data.problems.map(p => {
            if (p.type === 'word-problem' || p.question.length > 40) return p;
            let cleanQ = p.question.replace(/\?/g, ''); 
            if (cleanQ.includes('=')) cleanQ = cleanQ.split('=')[0].trim(); 
            p.question = cleanQ + " ="; 
            return p;
        });

        // 2. معالجة مصفوفة الإجابات
        const saved = localStorage.getItem('math_beg_answers');
        let tempAnswers = saved ? JSON.parse(saved) : [];

        if (tempAnswers.length < beginnerProblems.length) {
            const diff = beginnerProblems.length - tempAnswers.length;
            for (let i = 0; i < diff; i++) {
                tempAnswers.push({ value: "", status: "pending", attempts: 0 });
            }
            localStorage.setItem('math_beg_answers', JSON.stringify(tempAnswers));
        }
        
        userBeginnerAnswers = tempAnswers;
        
        // 3. عرض الواجهة
        renderBeginnerUI();
        
        // ✅ 4. تحديث الميتا بعد نجاح التحميل والعرض (هذا هو المكان الصحيح!)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('beginner'); // ✅ المفتاح مطابق لما في meta-manager.js
        }
        
    } catch (err) {
        console.error('Error:', err);
        document.getElementById('main-content').innerHTML = "حدث خطأ في تحميل البيانات، تأكد من ملف الـ JSON.";
        
        // ✅ تحديث الميتا حتى في حالة الخطأ (اختياري لكن مفضل)
        if (typeof updatePageMeta === 'function') {
            updatePageMeta('beginner');
        }
    }
};


// ✅ نظام التحقق الذكي (Smart Answer) المحدث
function checkSmartAnswer(problem, userAnswer) {
    if (!userAnswer || userAnswer.trim() === "") return false;
    
    const cleanUser = userAnswer.trim();
    const cleanModel = String(problem.answer).trim();
    
    // 1. المطابقة المباشرة (للإجابات النصية والرقمية البسيطة)
    if (cleanUser === cleanModel) return true;

    // 2. التحقق الحسابي (للمسائل القديمة)
    if (problem.type === 'decomposition') return checkDecomposition(problem, cleanUser);
    if (problem.question.includes('+')) return checkAddition(problem, cleanUser);
    
    return false;
}

// دالة عرض واجهة المستخدم
function renderBeginnerUI() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const start = (currentBeginnerPage - 1) * BEGINNER_PER_PAGE;
    const batch = beginnerProblems.slice(start, start + BEGINNER_PER_PAGE);

    // إضافة الأنماط اللازمة للمسائل النصية الطويلة
    if (!document.getElementById('beg-pagination-styles')) {
        const style = document.createElement('style');
        style.id = 'beg-pagination-styles';
        style.textContent = `
            .adv-pagination { display: flex; justify-content: center; gap: 10px; margin: 25px 0; flex-wrap: wrap; }
            .adv-page-node { 
                width: 35px; height: 35px; border: 1px solid var(--accent-color); border-radius: 50%; 
                display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--accent-color); font-weight: bold; transition: 0.2s;
                background: var(--card-bg);
            }
            .adv-page-node.active { background: var(--accent-color); color: white; }
            .problem-card-long { min-height: 150px; display: flex; flex-direction: column; justify-content: space-between; }
            .problem-statement-long { font-size: 1.05rem; line-height: 1.6; margin-bottom: 15px; color: var(--text-primary); }
            .input-ans-full { width: 100% !important; max-width: none !important; margin-top: 10px; }
        `;
        document.head.appendChild(style);
    }

    mainContent.innerHTML = `
    <div class="level-wrapper">
        <div class="row-header">
            <div>
                <h2 style="margin:0; color:var(--accent-color);">المستوى المبتدئ</h2>
                <div class="stats-bar">🏆 النقاط: ${beginnerStats.points} | 💡 التلميحات: ${beginnerStats.freeHints}</div>
            </div>
            <button class="adv-page-node" onclick="loadHomePage()" style="width:auto; padding:0 15px; border-radius:8px;">الرئيسية</button>
        </div>

        <div class="problems-list">
            ${batch.map((p, i) => {
                const idx = start + i;
                const ans = userBeginnerAnswers[idx];
                const isCorrect = ans.status === 'correct';
                const isIncorrect = ans.status === 'incorrect';
                const cls = isCorrect ? 'correct' : (isIncorrect ? 'incorrect' : '');
                
                // تحديد ما إذا كانت المسألة نصية طويلة
                const isLong = p.type === 'word-problem' || p.question.length > 50;
                
                return `
                    <div class="problem-card ${isLong ? 'problem-card-long' : ''}">
                        <div class="problem-number-tag">تمرين ${p.id}</div>
                        <div class="hint-float" onclick="handleBegHint(${idx}, '${p.hint}')">💡</div>
                        <div class="${isLong ? 'problem-statement-long' : 'problem-statement'}">${p.question}</div>
                        <input type="text" class="${isLong ? 'input-ans-full' : 'input-ans'} ${cls}" 
                               value="${ans.value}" oninput="storeBegVal(${idx}, this.value)" 
                               ${isCorrect ? 'disabled' : ''} placeholder="؟">
                    </div>
                `;
            }).join('')}
        </div>

        <button class="btn-verify-full" onclick="verifyBegBatch()">التحقق من الإجابات</button>
        <div id="beg-pages" class="adv-pagination"></div>
    </div>`;
    
    renderBeginnerPagination();
}

// --- الدوال المساعدة المتبقية (لا تتغير) ---

window.changeBegPage = (p) => { 
    const total = Math.ceil(beginnerProblems.length / BEGINNER_PER_PAGE);
    if (p < 1 || p > total) return;
    currentBeginnerPage = p; 
    renderBeginnerUI();     
    window.scrollTo({top: 0, behavior: 'smooth'}); 
};

function renderBeginnerPagination() {
    const total = Math.ceil(beginnerProblems.length / BEGINNER_PER_PAGE);
    const container = document.getElementById('beg-pages');
    if (!container) return;
    
    let html = '';
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= currentBeginnerPage - 2 && i <= currentBeginnerPage + 2)) {
            html += `<div class="adv-page-node ${i === currentBeginnerPage ? 'active' : ''}" onclick="changeBegPage(${i})">${i}</div>`;
        } else if (i === currentBeginnerPage - 3 || i === currentBeginnerPage + 3) {
            html += `<span style="color:var(--text-primary); margin:0 5px;">...</span>`;
        }
    }
    container.innerHTML = html;
}

window.verifyBegBatch = () => {
    const start = (currentBeginnerPage - 1) * BEGINNER_PER_PAGE;
    let correctCount = 0;
    
    for (let i = 0; i < BEGINNER_PER_PAGE; i++) {
        const idx = start + i;
        if (!beginnerProblems[idx]) break;
        
        const p = beginnerProblems[idx];
        const uAns = userBeginnerAnswers[idx].value;
        const isCorrect = checkSmartAnswer(p, uAns);
        
        if (isCorrect) {
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
    if (typeof checkAndUnlockAchievements === 'function') checkAndUnlockAchievements();
    renderBeginnerUI();
};

window.storeBegVal = (idx, val) => {
    userBeginnerAnswers[idx].value = val.trim();
    userBeginnerAnswers[idx].status = 'pending';
};

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

function saveBeginnerProgress() {
    localStorage.setItem('math_user_points', beginnerStats.points);
    localStorage.setItem('math_beginner_completed', beginnerStats.completedTotal);
    localStorage.setItem('math_beg_free_hints', beginnerStats.freeHints);
    localStorage.setItem('math_beg_answers', JSON.stringify(userBeginnerAnswers));
}

function checkDecomposition(problem, userAnswer) {
    const targetMatch = problem.question.match(/\d+/);
    if (!targetMatch) return false;
    const targetNumber = parseInt(targetMatch[0]);
    const numbers = userAnswer.split(/[+,،]/).map(n => parseInt(n)).filter(n => !isNaN(n));
    return (numbers.length === 2) && (numbers[0] + numbers[1] === targetNumber);
}

function checkAddition(problem, userAnswer) {
    const numbers = problem.question.match(/\d+/g);
    if (!numbers || numbers.length < 2) return false;
    const num1 = parseInt(numbers[0]);
    const num2 = parseInt(numbers[1]);
    const correctSum = num1 + num2;
    const userNum = parseInt(userAnswer.replace(/[^0-9]/g, ''));
    return userNum === correctSum;
}

// دالة Toast البسيطة (إذا لم تكن موجودة في مكان آخر)
function showToast(message, type = "info") {
    const toast = document.createElement('div');
    toast.style = `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: ${type === 'error' ? '#e74c3c' : '#2ecc71'}; color: white; padding: 10px 20px; border-radius: 20px; z-index: 10000; font-family: Cairo;`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
