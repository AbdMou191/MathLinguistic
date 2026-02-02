/**
 * المستوى المبتدئ - نسخة نهائية مع تحسين تخطيط المسائل الطويلة
 */
var beginnerProblems = [];
var userBeginnerAnswers = [];
var currentBeginnerPage = 1;
var begPerPage = 5;

// أنواع العمليات
var operations = ['add', 'subtract', 'half', 'double', 'decompose'];

function generateRandomProblem(id) {
    const op = operations[Math.floor(Math.random() * operations.length)];
    let question, correct;

    switch(op) {
        case 'add':
            const a = Math.floor(Math.random() * 20) + 1;
            const b = Math.floor(Math.random() * 20) + 1;
            question = `${a} + ${b}`;
            correct = a + b;
            break;
            
        case 'subtract':
            const x = Math.floor(Math.random() * 30) + 10;
            const y = Math.floor(Math.random() * x) + 1;
            question = `${x} - ${y}`;
            correct = x - y;
            break;
            
        case 'half':
            const even = (Math.floor(Math.random() * 20) + 1) * 2;
            question = `نصف العدد ${even}`;
            correct = even / 2;
            break;
            
        case 'double':
            const num = Math.floor(Math.random() * 20) + 1;
            question = `ضعف العدد ${num}`;
            correct = num * 2;
            break;
            
        case 'decompose':
            const total = Math.floor(Math.random() * 19) + 2;
            const part1 = Math.floor(Math.random() * (total - 1)) + 1;
            const part2 = total - part1;
            question = `فكّك العدد ${total} إلى ${part1} وَ ___`;
            correct = part2;
            break;            
        default:            question = "1 + 1";
            correct = 2;
    }

    return { id, question, correct };
}

function generateBeginnerProblems() {
    const problems = [];
    const seen = new Set();
    
    while (problems.length < 500) {
        const prob = generateRandomProblem(problems.length + 1);
        const key = `${prob.question}|${prob.correct}`;
        
        if (!seen.has(key)) {
            seen.add(key);
            problems.push(prob);
        }
    }
    
    return problems;
}

window.loadBeginnerLevel = async function() {
    window.currentLevel = 'beginner';
    if (beginnerProblems.length === 0) {
        beginnerProblems = generateBeginnerProblems();
        
        const saved = localStorage.getItem('mathlinguistic_beginner_progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.answers && data.answers.length === beginnerProblems.length) {
                    userBeginnerAnswers = data.answers;
                } else {
                    throw new Error('Mismatched problem count');
                }
            } catch (e) {
                userBeginnerAnswers = new Array(500).fill(null).map(() => ({ value: "", status: "pending" }));
            }
        } else {
            userBeginnerAnswers = new Array(500).fill(null).map(() => ({ value: "", status: "pending" }));
        }
    }
    renderBeginnerUI();
};

function renderBeginnerUI() {
    const mainContent = document.getElementById('main-content');    if (!mainContent) return;

    const totalPages = Math.ceil(beginnerProblems.length / begPerPage);
    const start = (currentBeginnerPage - 1) * begPerPage;
    const pageProblems = beginnerProblems.slice(start, start + begPerPage);

    const totalSolved = userBeginnerAnswers.filter(a => a.status === 'correct').length;
    const overallProgress = Math.round((totalSolved / beginnerProblems.length) * 100);

    mainContent.innerHTML = `
    <style>
        .level-wrapper { direction: rtl; font-family: 'Cairo', sans-serif; max-width: 800px; margin: auto; padding: 20px; }
        .row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 3px solid #2ecc71; padding-bottom: 10px; }
        .progress-bar-container { margin-top: 10px; width: 200px; }
        .progress-label { font-size: 0.9rem; color: #27ae60; text-align: center; margin-top: 5px; }
        .progress-bar-bg { height: 8px; background: #ecf0f1; border-radius: 4px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: #2ecc71; border-radius: 4px; width: ${overallProgress}%; transition: width 0.4s ease; }
        
        /* تصميم المسألة المحسن */
        .row-item {
            display: block;
            background: #fff;
            padding: 15px;
            border: 1px solid #eee;
            border-radius: 10px;
            margin-bottom: 15px;
            position: relative;
        }
        
        .problem-number-tag {
            position: absolute;
            top: -12px;
            right: 15px;
            background: white;
            padding: 2px 10px;
            font-size: 0.85rem;
            font-weight: bold;
            color: #2c3e50;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            z-index: 2;
        }
        
        .problem-content {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: flex-start;
            margin-top: 8px;        }
        
        .problem-statement {
            font-size: 1.1rem;
            color: #2c3e50;
            flex: 1;
            min-width: 200px;
            line-height: 1.4;
        }
        
        .input-ans {
            width: auto;
            min-width: 100px;
            max-width: 140px;
            height: 40px;
            text-align: center;
            font-size: 20px;
            border: 2px solid #ddd;
            border-radius: 5px;
            padding: 0 8px;
            align-self: flex-end;
        }
        .input-ans.correct { border-color: #27ae60; background: #e8f5e9; }
        .input-ans.incorrect { border-color: #e74c3c; background: #fdf2f2; }
        
        /* للشاشات الصغيرة */
        @media (max-width: 600px) {
            .input-ans {
                width: 100%;
                max-width: none;
            }
        }
        
        .btn-verify-full { 
            width: 100%; 
            padding: 15px; 
            background: #2ecc71; 
            color: white; 
            border: none; 
            border-radius: 8px; 
            font-size: 1.1rem; 
            font-weight: bold; 
            cursor: pointer; 
            margin-top: 10px; 
        }
        .verification-result { 
            padding: 12px; 
            margin: 15px 0; 
            border-radius: 8px; 
            text-align: center;             font-weight: bold; 
            display: none;
        }
        .result-success { background: #d4edda; color: #155724; }
        .result-error { background: #f8d7da; color: #721c24; }
        
        .row-nav-btns { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            margin: 25px 0; 
        }
        .nav-arrow { 
            padding: 10px 40px; 
            background: white; 
            border: 2px solid #2ecc71; 
            color: #2ecc71; 
            border-radius: 8px; 
            font-weight: bold; 
            cursor: pointer; 
        }
        .row-pagination { 
            display: flex; 
            justify-content: center; 
            border-top: 1px solid #eee; 
            padding-top: 20px; 
            flex-wrap: wrap; 
            gap: 5px; 
        }
        .page-node { 
            width: 35px; 
            height: 35px; 
            border: 1px solid #2ecc71; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            cursor: pointer; 
            font-size: 13px; 
        }
        .page-node.active { 
            background: #2ecc71; 
            color: white; 
        }
        .btn-home { 
            padding: 10px 20px; 
            background: white; 
            border: 2px solid #2ecc71; 
            color: #2ecc71; 
            border-radius: 8px;             font-weight: bold; 
            cursor: pointer; 
        }
        @media print {
            .print-hide { display: none !important; }
            .row-item { border: 1px solid #000; }
            .input-ans { 
                width: 100% !important; 
                max-width: none !important; 
                border: none; 
                background: transparent; 
                font-weight: bold; 
                height: auto;
                padding: 5px 0;
            }
            .problem-number-tag { display: none; }
        }
    </style>

    <div class="level-wrapper">
        <div class="row-header">
            <div>
                <h2>المستوى المبتدئ</h2>
                <div class="progress-bar-container">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill"></div>
                    </div>
                    <div class="progress-label">التقدم: ${overallProgress}%</div>
                </div>
            </div>
            <button class="btn-home" onclick="navigateToPage('home')">الرئيسية</button>
        </div>

        <div class="problems-list">
            ${pageProblems.map((p, i) => {
                const idx = start + i;
                const ans = userBeginnerAnswers[idx] || { value: "", status: "pending" };
                const cls = ans.status === 'correct' ? 'correct' : 
                           ans.status === 'incorrect' ? 'incorrect' : '';
                return `
                    <div class="row-item">
                        <div class="problem-number-tag">تمرين ${p.id}</div>
                        <div class="problem-content">
                            <span class="problem-statement">${p.question} =</span>
                            <input type="text" class="input-ans ${cls}" 
                                   value="${ans.value}" 
                                   oninput="beginnerAnswersStore(${idx}, this.value)">
                        </div>
                    </div>
                `;            }).join('')}
        </div>

        <div id="verification-message" class="verification-result"></div>

        <button class="btn-verify-full print-hide" onclick="verifyBeginnerAnswers()">التحقق من الإجابة</button>

        <div class="row-nav-btns print-hide">
            <button class="nav-arrow" onclick="changeBegPage(${currentBeginnerPage - 1})">السابق</button>
            <button class="nav-arrow" onclick="changeBegPage(${currentBeginnerPage + 1})">التالي</button>
        </div>

        <div class="row-pagination print-hide">
            ${renderBegPagination(currentBeginnerPage, totalPages)}
        </div>
    </div>`;
}

function beginnerAnswersStore(idx, val) {
    if (idx >= 0 && idx < userBeginnerAnswers.length) {
        userBeginnerAnswers[idx].value = val.trim();
        if (userBeginnerAnswers[idx].status !== 'pending') {
            userBeginnerAnswers[idx].status = 'pending';
        }
    }
}

function verifyBeginnerAnswers() {
    const start = (currentBeginnerPage - 1) * begPerPage;
    const pageProblems = beginnerProblems.slice(start, start + begPerPage);
    let correctCount = 0;

    pageProblems.forEach((p, i) => {
        const idx = start + i;
        const ansObj = userBeginnerAnswers[idx];
        const userAns = ansObj.value.trim();
        const correctAns = String(p.correct);

        if (userAns === correctAns) {
            ansObj.status = 'correct';
            correctCount++;
        } else {
            ansObj.status = 'incorrect';
        }
    });

    saveBeginnerProgress();
    renderBeginnerUI();

    const msgEl = document.getElementById('verification-message');    const total = pageProblems.length;
    const msg = `أجبت عن ${correctCount} من أصل ${total} بشكل صحيح.`;
    if (msgEl) {
        msgEl.textContent = msg;
        msgEl.className = 'verification-result ' + (correctCount === total ? 'result-success' : 'result-error');
        msgEl.style.display = 'block';
        setTimeout(() => { if (msgEl) msgEl.style.display = 'none'; }, 4000);
    }
}

function saveBeginnerProgress() {
    try {
        const data = {
            answers: userBeginnerAnswers,
            timestamp: Date.now()
        };
        localStorage.setItem('mathlinguistic_beginner_progress', JSON.stringify(data));
    } catch (e) {
        console.warn('فشل حفظ تقدم المستوى المبتدئ:', e);
    }
}

function renderBegPagination(current, total) {
    let html = "";
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 2 && i <= current + 2)) {
            html += `<span class="page-node ${i === current ? 'active' : ''}" onclick="changeBegPage(${i})">${i}</span>`;
        } else if (i === current - 3 || i === current + 3) {
            html += `<span style="color:#999">...</span>`;
        }
    }
    return html;
}

function changeBegPage(p) {
    const total = Math.ceil(beginnerProblems.length / begPerPage);
    if (p >= 1 && p <= total) {
        currentBeginnerPage = p;
        renderBeginnerUI();
        window.scrollTo(0, 0);
    }
}